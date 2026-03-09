import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminTicketUpdateSchema } from "@/lib/schemas/admin-ticket-update";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminTicketUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: parsed.data.status,
      priority: parsed.data.priority,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "update_ticket",
    entity_type: "ticket",
    entity_id: id,
    metadata: parsed.data
  });

  return NextResponse.json({ ok: true });
}
