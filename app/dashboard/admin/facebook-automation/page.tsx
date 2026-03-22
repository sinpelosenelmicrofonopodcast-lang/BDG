import { redirect } from "next/navigation";
import { Bot, CalendarClock, FileText, History, LineChart, PlugZap, Wand2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getFacebookPublicConfig, getFacebookSystemPostingConfig, hasSocialCronSecret } from "@/lib/social/facebook/config";
import {
  ensureFacebookSystemAutomationContext,
  listFacebookMediaAssets,
  listFacebookTemplates,
  listRecentSocialLogs,
  listRecentSocialPosts,
  getFacebookConnectionForAdmin
} from "@/lib/social/facebook/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MediaAssetRecord, SocialPostRecord } from "@/lib/social/facebook/types";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { FacebookAutomationWorkspace } from "@/components/dashboard/facebook-automation-workspace";

type MediaAssetWithPreview = MediaAssetRecord & {
  previewUrl: string | null;
};

async function withPreviewUrls(assets: MediaAssetRecord[]) {
  const supabase = getSupabaseAdminClient();

  return Promise.all(
    assets.map(async (asset) => {
      const { data } = await supabase.storage.from(asset.bucket).createSignedUrl(asset.path, 60 * 60);

      return {
        ...asset,
        previewUrl: data?.signedUrl ?? null
      };
    })
  );
}

function buildMetrics(posts: SocialPostRecord[]) {
  const published = posts.filter((post) => post.status === "published").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const failed = posts.filter((post) => post.status === "failed").length;
  const weeklyFrequency = posts.filter((post) => {
    const createdAt = new Date(post.created_at).getTime();
    return createdAt >= Date.now() - 1000 * 60 * 60 * 24 * 7;
  }).length;

  const templateCounter = new Map<string, number>();
  const ctaCounter = new Map<string, number>();

  posts.forEach((post) => {
    const templateName = post.social_post_templates?.title;

    if (templateName) {
      templateCounter.set(templateName, (templateCounter.get(templateName) ?? 0) + 1);
    }

    if (post.cta_used) {
      ctaCounter.set(post.cta_used, (ctaCounter.get(post.cta_used) ?? 0) + 1);
    }
  });

  const topTemplate = [...templateCounter.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "No data yet";
  const topCta = [...ctaCounter.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "No CTA data yet";

  return {
    published,
    scheduled,
    failed,
    weeklyFrequency,
    topTemplate,
    topCta
  };
}

export default async function FacebookAutomationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const systemPostingConfig = getFacebookSystemPostingConfig();

  if (systemPostingConfig.configured) {
    await ensureFacebookSystemAutomationContext(user.id);
  }

  const [connection, templates, mediaAssets] = await Promise.all([
    getFacebookConnectionForAdmin(user.id),
    listFacebookTemplates(),
    listFacebookMediaAssets(24)
  ]);

  const [posts, logs, mediaWithPreview] = await Promise.all([
    connection.account ? listRecentSocialPosts(connection.account.id, 60) : Promise.resolve([]),
    connection.account ? listRecentSocialLogs(connection.account.id, 40) : Promise.resolve([]),
    withPreviewUrls(mediaAssets)
  ]);

  const metrics = buildMetrics(posts);
  const categories = [...new Set(templates.map((template) => template.category))];
  const envStatus = {
    appId: Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID),
    appSecret: Boolean(process.env.FACEBOOK_APP_SECRET),
    encryption: Boolean(process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY),
    cron: hasSocialCronSecret(),
    metaSystemUserAccessToken: Boolean(systemPostingConfig.accessToken),
    metaPageId: Boolean(systemPostingConfig.pageId)
  };
  const publicConfig = getFacebookPublicConfig();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Facebook automation"
        title="Operate BDG Facebook publishing from one admin module"
        description="Connect the page with the correct Meta flow, create posts, schedule campaigns, run daily automation and keep clear logs when anything needs reconnection."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <DashboardStatCard label="Published posts" value={metrics.published} icon={LineChart} />
        <DashboardStatCard label="Scheduled posts" value={metrics.scheduled} icon={CalendarClock} />
        <DashboardStatCard label="Failed posts" value={metrics.failed} icon={History} tone={metrics.failed > 0 ? "warning" : "default"} />
        <DashboardStatCard label="Last 7 days" value={metrics.weeklyFrequency} icon={Bot} />
        <DashboardStatCard label="Templates" value={templates.length} icon={Wand2} />
        <DashboardStatCard label="Connection state" value={connection.account?.connection_status === "connected" ? "Live" : "Setup"} icon={PlugZap} tone={connection.account?.reconnect_required ? "warning" : "success"} />
      </div>

      <FacebookAutomationWorkspace
        publicFacebookAppId={publicConfig.appId}
        connection={connection}
        templates={templates}
        categories={categories}
        posts={posts}
        logs={logs}
        mediaAssets={mediaWithPreview as MediaAssetWithPreview[]}
        metrics={metrics}
        envStatus={envStatus}
      />
    </div>
  );
}
