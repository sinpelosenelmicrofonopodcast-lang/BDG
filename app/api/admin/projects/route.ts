import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminProjectCreateSchema } from "@/lib/schemas/admin-project-create";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminProjectCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: clientProfile } = await supabase.from("profiles").select("id").eq("id", parsed.data.clientId).maybeSingle();

  if (!clientProfile) {
    return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
  }

  if (parsed.data.planId) {
    const { data: plan } = await supabase.from("plans").select("id").eq("id", parsed.data.planId).maybeSingle();
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
  }

  const timeline = parsed.data.timeline ?? {};
  const serviceStatus = parsed.data.serviceStatus;
  const suspensionReason = serviceStatus === "suspended" ? parsed.data.suspensionReason ?? "Suspended manually by admin" : null;

  const { data: project, error: createError } = await supabase
    .from("projects")
    .insert({
      client_id: parsed.data.clientId,
      plan_id: parsed.data.planId ?? null,
      name: parsed.data.name,
      status: parsed.data.status,
      service_status: parsed.data.serviceStatus,
      billing_status: parsed.data.billingStatus,
      start_date: parsed.data.startDate ?? null,
      due_date: parsed.data.dueDate ?? null,
      next_billing_date: parsed.data.nextBillingDate ?? null,
      expiration_date: parsed.data.expirationDate ?? null,
      total_price: parsed.data.totalPrice ?? null,
      stripe_customer_id: parsed.data.stripeCustomerId ?? null,
      stripe_subscription_id: parsed.data.stripeSubscriptionId ?? null,
      timeline,
      suspended_at: parsed.data.serviceStatus === "suspended" ? new Date().toISOString() : null,
      suspension_reason: suspensionReason
    })
    .select("id")
    .single();

  if (createError || !project) {
    return NextResponse.json({ error: createError?.message ?? "Failed to create project" }, { status: 500 });
  }

  if (parsed.data.billingStatus === "past_due" || parsed.data.serviceStatus === "suspended") {
    await supabase.from("admin_alerts").insert({
      client_id: parsed.data.clientId,
      project_id: project.id,
      alert_type: parsed.data.serviceStatus === "suspended" ? "service_suspended" : "billing_past_due",
      severity: parsed.data.serviceStatus === "suspended" ? "critical" : "high",
      status: "open",
      title: parsed.data.serviceStatus === "suspended" ? "Service suspended" : "Billing past due",
      message:
        parsed.data.serviceStatus === "suspended"
          ? `Project ${parsed.data.name} created as suspended. ${suspensionReason ?? ""}`
          : `Project ${parsed.data.name} created with past due billing status.`,
      visible_to_client: parsed.data.serviceStatus === "suspended",
      metadata: {
        service_status: parsed.data.serviceStatus,
        billing_status: parsed.data.billingStatus
      },
      created_by: context.user.id
    });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "create_project_manual",
    entity_type: "project",
    entity_id: project.id,
    metadata: {
      client_id: parsed.data.clientId,
      plan_id: parsed.data.planId,
      service_status: parsed.data.serviceStatus,
      billing_status: parsed.data.billingStatus
    }
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
