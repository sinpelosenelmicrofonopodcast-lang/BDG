import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminProjectServiceSchema } from "@/lib/schemas/admin-project-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminProjectServiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const suspensionReason = parsed.data.serviceStatus === "suspended" ? parsed.data.suspensionReason ?? "Suspended by admin" : null;

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      service_status: parsed.data.serviceStatus,
      billing_status: parsed.data.billingStatus,
      next_billing_date: parsed.data.nextBillingDate ?? null,
      expiration_date: parsed.data.expirationDate ?? null,
      suspended_at: parsed.data.serviceStatus === "suspended" ? new Date().toISOString() : null,
      suspension_reason: suspensionReason,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: project } = await supabase.from("projects").select("id,client_id,name").eq("id", id).maybeSingle();

  if (project && (parsed.data.billingStatus === "past_due" || parsed.data.serviceStatus === "suspended")) {
    const alertType = parsed.data.serviceStatus === "suspended" ? "service_suspended" : "billing_past_due";
    const title = parsed.data.serviceStatus === "suspended" ? "Service suspended" : "Billing past due";
    const message =
      parsed.data.serviceStatus === "suspended"
        ? `Project ${project.name} was suspended. ${suspensionReason ?? ""}`
        : `Project ${project.name} is marked as past due.`;

    await supabase.from("admin_alerts").insert({
      client_id: project.client_id,
      project_id: project.id,
      alert_type: alertType,
      severity: parsed.data.serviceStatus === "suspended" ? "critical" : "high",
      status: "open",
      title,
      message,
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
    action: "update_project_service_status",
    entity_type: "project",
    entity_id: id,
    metadata: parsed.data
  });

  return NextResponse.json({ ok: true });
}
