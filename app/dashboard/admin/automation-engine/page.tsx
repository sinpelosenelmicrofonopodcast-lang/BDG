import { Bot, CalendarClock, MessageCircleMore, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ensureAutomationEngineSettings, listAutomationEnginePosts } from "@/lib/automation-engine/repository";
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

export default async function AutomationEnginePage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [settings, posts] = await Promise.all([ensureAutomationEngineSettings(user.id), listAutomationEnginePosts(user.id, 18)]);
  const metrics = getMetrics(posts, settings.auto_post_enabled);

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
        <DashboardStatCard label="Auto mode" value={metrics.status} icon={Bot} tone={settings.auto_post_enabled ? "success" : "default"} />
        <DashboardStatCard label="Engagement automation" value={settings.auto_reply_enabled || settings.auto_dm_enabled ? "Live" : "Idle"} icon={MessageCircleMore} tone={settings.auto_reply_enabled || settings.auto_dm_enabled ? "success" : "default"} />
        <DashboardStatCard label="Lead signal" value={metrics.leads} icon={TrendingUp} tone={metrics.leads > 0 ? "success" : "default"} />
      </div>

      <AutomationEngineWorkspace settings={settings} posts={posts} />
    </div>
  );
}
