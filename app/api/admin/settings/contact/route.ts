import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { CONTACT_SETTINGS_KEY, sanitizeContactSettings } from "@/lib/site-settings";
import { parseContactSettings } from "@/lib/schemas/site-settings";

function getMissingTableErrorMessage(message: string) {
  if (!/site_settings/i.test(message) || !/does not exist/i.test(message)) {
    return null;
  }

  return "Missing site_settings table. Run migration 20260309000100_site_settings.sql.";
}

export async function GET() {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error: queryError } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", CONTACT_SETTINGS_KEY)
    .maybeSingle();

  if (queryError) {
    const missingTableError = getMissingTableErrorMessage(queryError.message);
    if (missingTableError) {
      return NextResponse.json({ error: missingTableError }, { status: 500 });
    }

    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  const settings = parseContactSettings(data?.value);

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const supabase = getSupabaseAdminClient();
  const body = await request.json().catch(() => null);
  const parsed = sanitizeContactSettings(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error: upsertError } = await supabase
    .from("site_settings")
    .upsert({ key: CONTACT_SETTINGS_KEY, value: parsed.data }, { onConflict: "key" });

  if (upsertError) {
    const missingTableError = getMissingTableErrorMessage(upsertError.message);
    if (missingTableError) {
      return NextResponse.json({ error: missingTableError }, { status: 500 });
    }

    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "update_contact_settings",
    entity_type: "site_settings",
    entity_id: CONTACT_SETTINGS_KEY,
    metadata: parsed.data
  });

  return NextResponse.json({ ok: true, settings: parsed.data });
}
