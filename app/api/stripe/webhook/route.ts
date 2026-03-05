import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdminClient();
  const metadata = session.metadata ?? {};

  if (metadata.kind === "quote" && metadata.quote_id) {
    await supabase
      .from("quotes")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString()
      })
      .eq("id", metadata.quote_id);
  }

  if ((metadata.kind === "plan" || metadata.kind === "addon") && session.customer) {
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (adminRole?.user_id) {
      await supabase.from("admin_audit_log").insert({
        admin_id: adminRole.user_id,
        action: "purchase_completed",
        entity_type: metadata.kind,
        entity_id: metadata.plan_id ?? metadata.addon_id ?? null,
        metadata: {
          session_id: session.id,
          customer_id: session.customer,
          amount_total: session.amount_total
        }
      });
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdminClient();

  await supabase
    .from("projects")
    .update({
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_customer_id", String(subscription.customer));
}

export async function POST(request: Request) {
  const stripe = getStripeServer();
  const rawBody = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}
