import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeServer } from "@/lib/stripe";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("stripe_customer_id")
    .eq("client_id", user.id)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer associated with your account" }, { status: 404 });
  }

  const stripe = getStripeServer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: project.stripe_customer_id,
    return_url: `${appUrl}/dashboard/client`
  });

  return NextResponse.json({ url: session.url });
}
