import { Bot, CalendarClock, MessageCircleMore, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getAutomationEngineSettings, listAutomationEnginePosts } from "@/lib/automation-engine/repository";
import type { AutomationEngineSettingsRecord } from "@/lib/automation-engine/types";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { AutomationEngineWorkspace } from "@/components/dashboard/automation-engine-workspace";

function getMetrics(posts: Awaited<ReturnType<typeof listAutomationEnginePosts>>, autoPostEnabled: boolean) {
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const automated = posts.filter((post) => post.status === "posted" || post.status === "simulated").length;
  const leads = posts.reduce((total, post) => total + Number(post.metadata?.leads ?? 0), 0);

  return {
    generated: posts.length,
    scheduled,
    automated,
    leads,
    status: autoPostEnabled ? "Armed" : "Standby"
  };
}

function getDefaultAutomationEngineSettings(userId: string): AutomationEngineSettingsRecord {
  return {
    id: "automation-engine-default",
    provider: "automation_engine",
    user_id: userId,
    enabled: true,
    timezone: "America/Chicago",
    auto_post_enabled: false,
    auto_dm_enabled: false,
    auto_reply_enabled: false,
    preferred_platforms: ["instagram", "facebook", "tiktok", "x"],
    preferred_schedule_times: ["08:30", "11:45", "15:15", "18:30"],
    auto_reply_message: "Hey there. BDG can automate your business, check this out: https://bdg.lat",
    auto_dm_message: "Hey there. BDG can automate your business, check this out: https://bdg.lat",
    simulate_posting: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString()
  };
}

export default async function AutomationEnginePage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [settings, posts] = await Promise.all([
    getAutomationEngineSettings(user.id).catch(() => null),
    listAutomationEnginePosts(user.id, 18).catch(() => [])
  ]);
  const safeSettings = settings ?? getDefaultAutomationEngineSettings(user.id);
  const metrics = getMetrics(posts, safeSettings.auto_post_enabled);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Automation Engine"
        title="Operate BDG like a self-running content and lead machine"
        description="This module generates daily content, schedules posting, simulates engagement automation, and tracks the business outcomes without touching the existing dashboard workflows."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DashboardStatCard label="Generated posts" value={metrics.generated} icon={Bot} />
        <DashboardStatCard label="Scheduled" value={metrics.scheduled} icon={CalendarClock} />
        <DashboardStatCard label="Auto mode" value={metrics.status} icon={Bot} tone={safeSettings.auto_post_enabled ? "success" : "default"} />
        <DashboardStatCard label="Engagement automation" value={safeSettings.auto_reply_enabled || safeSettings.auto_dm_enabled ? "Live" : "Idle"} icon={MessageCircleMore} tone={safeSettings.auto_reply_enabled || safeSettings.auto_dm_enabled ? "success" : "default"} />
        <DashboardStatCard label="Lead signal" value={metrics.leads} icon={TrendingUp} tone={metrics.leads > 0 ? "success" : "default"} />
      </div>

      <AutomationEngineWorkspace settings={safeSettings} posts={posts} />
    </div>
  );
}
