import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminAlertUpdateSchema } from "@/lib/schemas/admin-alert";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminAlertUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error: updateError } = await supabase
    .from("admin_alerts")
    .update({
      status: parsed.data.status,
      resolved_at: parsed.data.status === "resolved" ? new Date().toISOString() : null,
      resolved_by: parsed.data.status === "resolved" ? context.user.id : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "update_admin_alert",
    entity_type: "admin_alert",
    entity_id: id,
    metadata: parsed.data
  });

  return NextResponse.json({ ok: true });
}
