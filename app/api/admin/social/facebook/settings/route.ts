import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { facebookAutomationSettingsSchema } from "@/lib/schemas/facebook-automation";
import { ensureFacebookSystemAutomationContext, upsertAutomationSettings } from "@/lib/social/facebook/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const automationContext = await ensureFacebookSystemAutomationContext(context.user.id);

  if (!automationContext) {
    return NextResponse.json({ error: "Missing META_SYSTEM_USER_ACCESS_TOKEN or META_PAGE_ID." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = facebookAutomationSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  try {
    const settings = await upsertAutomationSettings(automationContext.account.id, parsed.data);
    const supabase = getSupabaseAdminClient();

    await supabase.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "update_facebook_automation_settings",
      entity_type: "automation_settings",
      entity_id: settings.id,
      metadata: {
        enabled: settings.enabled,
        daily_posts_count: settings.daily_posts_count,
        timezone: settings.timezone
      }
    });

    return NextResponse.json({ ok: true, settings });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
