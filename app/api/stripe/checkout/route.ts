import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
import { createCheckoutSchema } from "@/lib/schemas/quote";
import { analyticsEvents } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeServer } from "@/lib/stripe";

const checkoutPayloadSchema = createCheckoutSchema.extend({
  email: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  quantity: z.number().int().positive().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stripe = getStripeServer();
  const supabase = getSupabaseAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = parsed.data.successUrl ?? `${appUrl}/dashboard/client?checkout=success`;
  const cancelUrl = parsed.data.cancelUrl ?? `${appUrl}/pricing?checkout=cancelled`;
  const quantity = parsed.data.quantity ?? 1;

  let lineItem: Stripe.Checkout.SessionCreateParams.LineItem | null = null;
  let mode: Stripe.Checkout.SessionCreateParams.Mode = parsed.data.mode === "subscription" ? "subscription" : "payment";
  const metadata: Record<string, string> = {
    kind: parsed.data.kind
  };

  if (parsed.data.kind === "plan" && parsed.data.planId) {
    const { data: plan, error } = await supabase.from("plans").select("*").eq("id", parsed.data.planId).maybeSingle();
    if (error || !plan) {
      return NextResponse.json({ error: error?.message ?? "Plan not found" }, { status: 404 });
    }

    mode = plan.billing_type === "subscription" ? "subscription" : "payment";
    metadata.plan_id = plan.id;
    metadata.plan_slug = plan.slug;

    lineItem = plan.stripe_price_id
      ? {
          price: plan.stripe_price_id,
          quantity
        }
      : {
          quantity,
          price_data: {
            currency: plan.currency.toLowerCase(),
            unit_amount: Math.round(plan.price_min * 100),
            product_data: {
              name: plan.name,
              description: plan.description ?? undefined
            },
            recurring: mode === "subscription" ? { interval: "month" } : undefined
          }
        };
  }

  if (parsed.data.kind === "addon" && parsed.data.addonId) {
    const { data: addon, error } = await supabase.from("addons").select("*").eq("id", parsed.data.addonId).maybeSingle();
    if (error || !addon) {
      return NextResponse.json({ error: error?.message ?? "Add-on not found" }, { status: 404 });
    }

    mode = addon.billing_type === "subscription" ? "subscription" : "payment";
    metadata.addon_id = addon.id;
    metadata.addon_slug = addon.slug;

    lineItem = addon.stripe_price_id
      ? {
          price: addon.stripe_price_id,
          quantity
        }
      : {
          quantity,
          price_data: {
            currency: addon.currency.toLowerCase(),
            unit_amount: Math.round(addon.price_min * 100),
            product_data: {
              name: addon.name,
              description: addon.description ?? undefined
            },
            recurring: mode === "subscription" ? { interval: "month" } : undefined
          }
        };
  }

  if (parsed.data.kind === "quote" && parsed.data.quoteId) {
    const { data: quote, error } = await supabase.from("quotes").select("*").eq("id", parsed.data.quoteId).maybeSingle();
    if (error || !quote) {
      return NextResponse.json({ error: error?.message ?? "Quote not found" }, { status: 404 });
    }

    if (!quote.payment_unlocked) {
      return NextResponse.json({ error: "Quote is not accepted yet" }, { status: 403 });
    }

    mode = "payment";
    metadata.quote_id = quote.id;

    lineItem = {
      quantity: 1,
      price_data: {
        currency: quote.currency.toLowerCase(),
        unit_amount: Math.round(Number(quote.deposit_required) * 100),
        product_data: {
          name: `Deposit - ${quote.recommended_plan}`,
          description: `Quote ${quote.id}`
        }
      }
    };
  }

  if (!lineItem) {
    return NextResponse.json({ error: "Invalid checkout item" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [lineItem],
    allow_promotion_codes: true,
    metadata,
    customer_email: parsed.data.email
  });

  return NextResponse.json({
    event: analyticsEvents.START_CHECKOUT,
    checkoutUrl: session.url,
    sessionId: session.id
  });
}
