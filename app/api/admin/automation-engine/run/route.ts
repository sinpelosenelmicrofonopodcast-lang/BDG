import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { generateTodayAutomationContentForUser, runAutomationEnginePostingSweepForUser } from "@/lib/automation-engine/jobs";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  try {
    const [generated, posting] = await Promise.all([
      generateTodayAutomationContentForUser(context.user.id, { force: false }),
      runAutomationEnginePostingSweepForUser(context.user.id)
    ]);
    const supabase = getSupabaseAdminClient();

    await supabase.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "run_automation_engine",
      entity_type: "auto_post_batch",
      metadata: {
        created: generated.created,
        source: generated.source,
        published: posting.published
      }
    });

    return NextResponse.json({
      ok: true,
      generated,
      posting
    });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to run automation engine.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
