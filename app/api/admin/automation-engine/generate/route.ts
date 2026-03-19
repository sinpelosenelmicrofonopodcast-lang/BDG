import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { generateTodayAutomationContentForUser } from "@/lib/automation-engine/jobs";
import { automationEngineGenerateSchema } from "@/lib/schemas/automation-engine";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = automationEngineGenerateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  try {
    const result = await generateTodayAutomationContentForUser(context.user.id, { force: parsed.data.force });
    const supabase = getSupabaseAdminClient();

    await supabase.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "generate_automation_engine_content",
      entity_type: "auto_post_batch",
      metadata: {
        created: result.created,
        source: result.source
      }
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to generate automation content.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
