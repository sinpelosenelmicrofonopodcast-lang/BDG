import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { automationEngineSettingsSchema } from "@/lib/schemas/automation-engine";
import { updateAutomationEngineSettings } from "@/lib/automation-engine/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = automationEngineSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  try {
    const settings = await updateAutomationEngineSettings(context.user.id, parsed.data);
    const supabase = getSupabaseAdminClient();

    await supabase.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "update_automation_engine_settings",
      entity_type: "automation_settings",
      entity_id: settings.id,
      metadata: {
        auto_post_enabled: settings.auto_post_enabled,
        auto_dm_enabled: settings.auto_dm_enabled,
        auto_reply_enabled: settings.auto_reply_enabled,
        preferred_platforms: settings.preferred_platforms
      }
    });

    return NextResponse.json({ ok: true, settings });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to save automation settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
