import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminWebsiteUpdateSchema } from "@/lib/schemas/admin-website";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminWebsiteUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error: updateError } = await supabase
    .from("project_websites")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      ssl_expires_at: parsed.data.sslExpiresAt || null,
      last_checked_at: parsed.data.lastCheckedAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "update_project_website",
    entity_type: "project_website",
    entity_id: id,
    metadata: parsed.data
  });

  return NextResponse.json({ ok: true });
}
