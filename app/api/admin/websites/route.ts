import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminWebsiteCreateSchema } from "@/lib/schemas/admin-website";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminWebsiteCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const payload = {
    project_id: parsed.data.projectId,
    client_id: parsed.data.clientId,
    label: parsed.data.label,
    domain: parsed.data.domain,
    website_url: parsed.data.websiteUrl || null,
    platform: parsed.data.platform || null,
    status: parsed.data.status,
    ssl_expires_at: parsed.data.sslExpiresAt || null,
    notes: parsed.data.notes || null
  };

  const { data, error: insertError } = await supabase.from("project_websites").insert(payload).select("id").single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "create_project_website",
    entity_type: "project_website",
    entity_id: data.id,
    metadata: payload
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
