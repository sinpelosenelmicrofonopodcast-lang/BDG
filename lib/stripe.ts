import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeServer() {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    stripeInstance = new Stripe(key, {
      apiVersion: "2025-02-24.acacia"
    });
  }

  return stripeInstance;
}
