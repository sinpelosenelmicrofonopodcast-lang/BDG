import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { runDailyAutomation, runScheduledFacebookPosts } from "@/lib/social/facebook/jobs";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const [automation, scheduled] = await Promise.all([runDailyAutomation(), runScheduledFacebookPosts()]);
  const supabase = getSupabaseAdminClient();

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "run_facebook_automation",
    entity_type: "social_job",
    metadata: {
      automation_created: automation.created,
      scheduled_published: scheduled.published,
      scheduled_failed: scheduled.failed
    }
  });

  return NextResponse.json({
    ok: true,
    automation,
    scheduled
  });
}
