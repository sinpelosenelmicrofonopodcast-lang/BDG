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
    const { data: adminRole } = await supabase.from("user_roles").select("user_id").eq("role", "admin").limit(1).maybeSingle();

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

async function findProjectByStripeIdentifiers(customerId: string, subscriptionId?: string | null) {
  const supabase = getSupabaseAdminClient();

  if (subscriptionId) {
    const { data: bySubscription } = await supabase
      .from("projects")
      .select("id,client_id,service_status,billing_status")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (bySubscription) {
      return bySubscription;
    }
  }

  const { data: byCustomer } = await supabase
    .from("projects")
    .select("id,client_id,service_status,billing_status")
    .eq("stripe_customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return byCustomer;
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdminClient();
  const nextBillingDate = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10) : null;

  const nextBillingStatus = subscription.status === "past_due" || subscription.status === "unpaid" ? "past_due" : subscription.status === "canceled" ? "canceled" : "current";
  const nextServiceStatus = subscription.status === "canceled" ? "canceled" : subscription.status === "past_due" || subscription.status === "unpaid" ? "past_due" : "active";

  await supabase
    .from("projects")
    .update({
      stripe_subscription_id: subscription.id,
      billing_status: nextBillingStatus,
      service_status: nextServiceStatus,
      next_billing_date: nextBillingDate,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_customer_id", String(subscription.customer));
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = String(invoice.customer ?? "");
  if (!customerId) return;

  const supabase = getSupabaseAdminClient();
  const subscriptionId = invoice.subscription ? String(invoice.subscription) : null;
  const project = await findProjectByStripeIdentifiers(customerId, subscriptionId);

  if (!project) {
    return;
  }

  const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : null;
  const paidAt = invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : new Date().toISOString();

  await supabase
    .from("billing_events")
    .upsert(
      {
        project_id: project.id,
        client_id: project.client_id,
        stripe_invoice_id: invoice.id,
        amount: Number((invoice.amount_paid ?? invoice.amount_due ?? 0) / 100),
        currency: (invoice.currency ?? "usd").toUpperCase(),
        status: "paid",
        due_date: dueDate,
        paid_at: paidAt,
        metadata: {
          stripe_status: invoice.status,
          customer_id: customerId,
          subscription_id: subscriptionId
        }
      },
      { onConflict: "stripe_invoice_id" }
    );

  const periodEnd = invoice.lines.data[0]?.period?.end;

  await supabase
    .from("projects")
    .update({
      billing_status: "current",
      service_status: project.service_status === "canceled" ? "canceled" : "active",
      last_payment_at: paidAt,
      next_billing_date: periodEnd ? new Date(periodEnd * 1000).toISOString().slice(0, 10) : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", project.id);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const customerId = String(invoice.customer ?? "");
  if (!customerId) return;

  const supabase = getSupabaseAdminClient();
  const subscriptionId = invoice.subscription ? String(invoice.subscription) : null;
  const project = await findProjectByStripeIdentifiers(customerId, subscriptionId);

  if (!project) {
    return;
  }

  const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : null;

  await supabase
    .from("billing_events")
    .upsert(
      {
        project_id: project.id,
        client_id: project.client_id,
        stripe_invoice_id: invoice.id,
        amount: Number((invoice.amount_due ?? invoice.amount_paid ?? 0) / 100),
        currency: (invoice.currency ?? "usd").toUpperCase(),
        status: "past_due",
        due_date: dueDate,
        metadata: {
          stripe_status: invoice.status,
          customer_id: customerId,
          subscription_id: subscriptionId
        }
      },
      { onConflict: "stripe_invoice_id" }
    );

  await supabase
    .from("projects")
    .update({
      billing_status: "past_due",
      service_status: project.service_status === "canceled" ? "canceled" : "past_due",
      updated_at: new Date().toISOString()
    })
    .eq("id", project.id);

  await supabase.from("admin_alerts").insert({
    client_id: project.client_id,
    project_id: project.id,
    alert_type: "billing_past_due",
    severity: "high",
    status: "open",
    title: "Stripe payment failed",
    message: "Invoice " + invoice.id + " failed and is now past due.",
    visible_to_client: false,
    metadata: {
      invoice_id: invoice.id,
      amount_due: Number((invoice.amount_due ?? 0) / 100)
    }
  });
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

  if (event.type === "invoice.paid") {
    await handleInvoicePaid(event.data.object as Stripe.Invoice);
  }

  if (event.type === "invoice.payment_failed") {
    await handleInvoiceFailed(event.data.object as Stripe.Invoice);
  }

  return NextResponse.json({ received: true });
}
