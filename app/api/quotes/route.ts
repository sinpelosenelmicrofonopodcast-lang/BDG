import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const createQuoteSchema = z.object({
  quoteRequestId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  planId: z.string().uuid().optional(),
  recommendedPlan: z.string().min(2),
  timeline: z.string().min(2),
  addons: z.array(z.object({ name: z.string(), amount: z.number().nonnegative() })).default([]),
  subtotal: z.number().nonnegative(),
  addonsTotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  depositRequired: z.number().nonnegative(),
  expiresAt: z.string().datetime().optional()
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createQuoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .insert({
      quote_request_id: parsed.data.quoteRequestId ?? null,
      client_id: parsed.data.clientId ?? null,
      plan_id: parsed.data.planId ?? null,
      status: "draft",
      recommended_plan: parsed.data.recommendedPlan,
      timeline: parsed.data.timeline,
      addons: parsed.data.addons,
      subtotal: parsed.data.subtotal,
      addons_total: parsed.data.addonsTotal,
      total: parsed.data.total,
      deposit_required: parsed.data.depositRequired,
      expires_at: parsed.data.expiresAt ?? null,
      payment_unlocked: false
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Quote creation failed" }, { status: 500 });
  }

  await admin.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "create_quote",
    entity_type: "quote",
    entity_id: data.id,
    metadata: {
      subtotal: parsed.data.subtotal,
      total: parsed.data.total
    }
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (role?.role === "admin") {
    const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await supabase.from("quotes").select("*").eq("client_id", user.id).order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
