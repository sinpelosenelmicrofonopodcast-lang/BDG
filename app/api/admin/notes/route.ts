import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalNoteSchema } from "@/lib/schemas/internal-note";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = internalNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const payload = {
    client_id: parsed.data.clientId || null,
    project_id: parsed.data.projectId || null,
    admin_id: context.user.id,
    visibility: parsed.data.visibility,
    note: parsed.data.note
  };

  const { data, error: insertError } = await supabase.from("internal_notes").insert(payload).select("id").single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "create_internal_note",
    entity_type: "internal_note",
    entity_id: data.id,
    metadata: payload
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
