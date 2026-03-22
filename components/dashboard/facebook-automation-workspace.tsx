"use client";

import Script from "next/script";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Facebook,
  FileText,
  ImagePlus,
  Loader2,
  Megaphone,
  PlayCircle,
  RefreshCcw,
  Save,
  Send,
  Trash2,
  Upload,
  Wand2
} from "lucide-react";
import { renderTemplateCopy } from "@/lib/social/facebook/copy";
import type {
  AutomationSettingsRecord,
  MediaAssetRecord,
  SocialAccountRecord,
  SocialPageRecord,
  SocialPostLogRecord,
  SocialPostRecord,
  SocialTemplateRecord
} from "@/lib/social/facebook/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (
        callback: (response: { authResponse?: { accessToken?: string; grantedScopes?: string } } | null) => void,
        options?: Record<string, unknown>
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

type ConnectionSnapshot = {
  account: SocialAccountRecord | null;
  selectedPage: SocialPageRecord | null;
  pages: SocialPageRecord[];
  settings: AutomationSettingsRecord | null;
};

type MediaAssetWithPreview = MediaAssetRecord & {
  previewUrl: string | null;
};

type WorkspaceProps = {
  publicFacebookAppId: string;
  connection: ConnectionSnapshot;
  templates: SocialTemplateRecord[];
  categories: string[];
  posts: SocialPostRecord[];
  logs: SocialPostLogRecord[];
  mediaAssets: MediaAssetWithPreview[];
  metrics: {
    published: number;
    scheduled: number;
    failed: number;
    weeklyFrequency: number;
    topTemplate: string;
    topCta: string;
  };
  envStatus: {
    appId: boolean;
    appSecret: boolean;
    encryption: boolean;
    cron: boolean;
    metaSystemUserAccessToken: boolean;
    metaPageId: boolean;
  };
};

const FACEBOOK_SCOPES = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_show_list",
  "public_profile",
  "business_management"
];

function statusTone(status: SocialPostRecord["status"]) {
  if (status === "published") return "success";
  if (status === "failed" || status === "canceled") return "warning";
  return "secondary";
}

function connectionVariant(connection: ConnectionSnapshot["account"]) {
  if (!connection) return "secondary";
  if (connection.reconnect_required) return "warning";
  return connection.connection_status === "connected" ? "success" : "secondary";
}

function defaultDateTime() {
  const date = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const dateValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return {
    date: dateValue,
    time: "09:00"
  };
}

export function FacebookAutomationWorkspace({
  publicFacebookAppId,
  connection,
  templates,
  categories,
  posts,
  logs,
  mediaAssets,
  metrics,
  envStatus
}: WorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [availablePages, setAvailablePages] = useState(
    connection.pages.map((page) => ({
      id: page.facebook_page_id,
      name: page.page_name,
      tasks: page.tasks
    }))
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(posts[0]?.template_id ?? templates[0]?.id ?? "");
  const [caption, setCaption] = useState(posts[0]?.caption ?? "");
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(posts[0]?.media_asset_id ?? null);
  const [editorPostId, setEditorPostId] = useState<string | null>(null);
  const nextDateTime = defaultDateTime();
  const [scheduledDate, setScheduledDate] = useState(nextDateTime.date);
  const [scheduledTime, setScheduledTime] = useState(nextDateTime.time);
  const [timezone, setTimezone] = useState(connection.settings?.timezone ?? "America/Chicago");
  const [suggestions, setSuggestions] = useState<Array<{ title: string; copy: string; templateId?: string }>>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localMediaPreview, setLocalMediaPreview] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    enabled: connection.settings?.enabled ?? false,
    dailyPostsCount: connection.settings?.daily_posts_count ?? 1,
    scheduledTimes: connection.settings?.scheduled_times?.join(", ") ?? "09:00",
    useImages: connection.settings?.use_images ?? true,
    contentCategories: connection.settings?.content_categories?.length ? connection.settings.content_categories : categories.slice(0, 3),
    rotateTemplates: connection.settings?.rotate_templates ?? true,
    avoidRepeatTemplate: connection.settings?.avoid_repeat_template ?? true,
    aggressiveCtaEnabled: connection.settings?.aggressive_cta_enabled ?? true,
    ctaLabel: connection.settings?.cta_label ?? "Request a demo",
    ctaUrl: connection.settings?.cta_url ?? "/contact",
    tone: connection.settings?.tone ?? "premium",
    offer: connection.settings?.offer ?? "",
    market: connection.settings?.market ?? "",
    urgencyLevel: connection.settings?.urgency_level ?? "high",
    includesDemo: connection.settings?.includes_demo ?? true,
    activeServices: connection.settings?.active_services?.join(", ") ?? "Automation, Dashboards, Websites",
    timezone: connection.settings?.timezone ?? "America/Chicago"
  });

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;
  const selectedMedia = mediaAssets.find((asset) => asset.id === selectedMediaId) ?? null;
  const previewImage = localMediaPreview ?? selectedMedia?.previewUrl ?? null;
  const automaticModeReady = envStatus.metaSystemUserAccessToken && envStatus.metaPageId;
  const manualConnectionReady = Boolean(connection.account?.access_token_encrypted && connection.selectedPage && connection.selectedPage.access_token_encrypted !== "__META_SYSTEM_PAGE__");
  const manualPublishReady = manualConnectionReady || automaticModeReady;

  const previewCaption = useMemo(() => {
    if (caption.trim()) {
      return caption.trim();
    }

    if (selectedTemplate) {
      return renderTemplateCopy(selectedTemplate, "medium", connection.settings);
    }

    return "Your Facebook preview will show here.";
  }, [caption, selectedTemplate, connection.settings]);

  async function handleJsonRequest(url: string, method: "POST" | "PATCH", body?: Record<string, unknown>) {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error ?? "Request failed.");
    }

    return payload;
  }

  function setFeedback(tone: "success" | "error", message: string) {
    setStatus({ tone, message });
  }

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function connectFacebook() {
    if (!sdkReady || !window.FB) {
      setFeedback("error", "Facebook Login SDK is not ready yet.");
      return;
    }

    window.FB.login(
      async (response) => {
        const accessToken = response?.authResponse?.accessToken;

        if (!accessToken) {
          setFeedback("error", "Facebook Login was canceled or did not return a token.");
          return;
        }

        try {
          const grantedScopes = response?.authResponse?.grantedScopes?.split(",").filter(Boolean) ?? FACEBOOK_SCOPES;
          const payload = await handleJsonRequest("/api/admin/social/facebook/connect", "POST", {
            userAccessToken: accessToken,
            scopes: grantedScopes
          });

          setAvailablePages(payload.pages ?? []);
          setFeedback("success", "Facebook account connected. Select the BDG page to finish setup.");
          refresh();
        } catch (error) {
          setFeedback("error", error instanceof Error ? error.message : "Facebook connection failed.");
        }
      },
      {
        scope: FACEBOOK_SCOPES.join(","),
        return_scopes: true
      }
    );
  }

  async function choosePage(pageId: string, pageName: string) {
    try {
      await handleJsonRequest("/api/admin/social/facebook/select-page", "POST", { pageId, pageName });
      setFeedback("success", `Connected page: ${pageName}.`);
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Failed to select page.");
    }
  }

  async function validateConnection() {
    try {
      await handleJsonRequest("/api/admin/social/facebook/connection/validate", "POST");
      setFeedback("success", "Facebook connection validated successfully.");
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Validation failed.");
    }
  }

  async function runAutomationNow() {
    try {
      const payload = await handleJsonRequest("/api/admin/social/facebook/run", "POST");
      setFeedback(
        "success",
        `Automation run completed. ${payload.automation?.created ?? 0} generated, ${payload.scheduled?.published ?? 0} published.`
      );
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Failed to run automation.");
    }
  }

  function applyTemplate(length: "short" | "medium" | "long") {
    if (!selectedTemplate) {
      return;
    }

    setCaption(renderTemplateCopy(selectedTemplate, length, connection.settings));
  }

  async function generateSuggestion(mode: "generate_more" | "rewrite" | "shorter" | "aggressive" | "premium") {
    try {
      const payload = await handleJsonRequest("/api/admin/social/facebook/generator", "POST", {
        mode,
        templateId: selectedTemplateId || undefined,
        currentCopy: caption || undefined,
        category: selectedTemplate?.category
      });

      setSuggestions(payload.options ?? []);
      if ((payload.options ?? []).length === 0) {
        setFeedback("error", "No copy suggestions were generated for this request.");
      }
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Failed to generate copy.");
    }
  }

  async function submitPost(intent: "draft" | "schedule" | "publish_now") {
    if (!caption.trim()) {
      setFeedback("error", "Write a caption before saving or publishing.");
      return;
    }

    const payload = {
      caption,
      mediaAssetId: selectedMediaId,
      templateId: selectedTemplateId || null,
      ctaUsed: settingsForm.ctaLabel,
      timezone,
      scheduledDate,
      scheduledTime,
      intent,
      isAutomated: false
    };

    try {
      if (editorPostId) {
        await handleJsonRequest(`/api/admin/social/facebook/posts/${editorPostId}`, "PATCH", {
          ...payload,
          intent: intent === "publish_now" ? "publish_now" : "update"
        });
      } else {
        await handleJsonRequest("/api/admin/social/facebook/posts", "POST", payload);
      }

      setFeedback("success", intent === "publish_now" ? "Facebook post sent for publishing." : intent === "schedule" ? "Facebook post scheduled." : "Draft saved.");
      setEditorPostId(null);
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Failed to save Facebook post.");
    }
  }

  async function mutatePost(postId: string, intent: "duplicate" | "publish_now" | "cancel" | "delete") {
    try {
      if (intent === "delete") {
        const response = await fetch(`/api/admin/social/facebook/posts/${postId}`, { method: "DELETE" });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Delete failed.");
        }
      } else {
        await handleJsonRequest(`/api/admin/social/facebook/posts/${postId}`, "PATCH", { intent });
      }

      setFeedback("success", "Post action completed.");
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Post action failed.");
    }
  }

  function loadPostIntoEditor(post: SocialPostRecord) {
    setEditorPostId(post.id);
    setCaption(post.caption);
    setSelectedTemplateId(post.template_id ?? "");
    setSelectedMediaId(post.media_asset_id ?? null);
    setTimezone(post.timezone);

    if (post.scheduled_for) {
      const when = new Date(post.scheduled_for);
      setScheduledDate(`${when.getUTCFullYear()}-${String(when.getUTCMonth() + 1).padStart(2, "0")}-${String(when.getUTCDate()).padStart(2, "0")}`);
      setScheduledTime(`${String(when.getUTCHours()).padStart(2, "0")}:${String(when.getUTCMinutes()).padStart(2, "0")}`);
    }
  }

  async function saveAutomationSettings() {
    setSavingSettings(true);

    try {
      await handleJsonRequest("/api/admin/social/facebook/settings", "PATCH", {
        enabled: settingsForm.enabled,
        dailyPostsCount: settingsForm.dailyPostsCount,
        timezone: settingsForm.timezone,
        scheduledTimes: settingsForm.scheduledTimes
          .split(",")
          .map((time) => time.trim())
          .filter(Boolean),
        useImages: settingsForm.useImages,
        contentCategories: settingsForm.contentCategories,
        rotateTemplates: settingsForm.rotateTemplates,
        avoidRepeatTemplate: settingsForm.avoidRepeatTemplate,
        aggressiveCtaEnabled: settingsForm.aggressiveCtaEnabled,
        ctaLabel: settingsForm.ctaLabel,
        ctaUrl: settingsForm.ctaUrl,
        tone: settingsForm.tone,
        offer: settingsForm.offer,
        market: settingsForm.market,
        urgencyLevel: settingsForm.urgencyLevel,
        includesDemo: settingsForm.includesDemo,
        activeServices: settingsForm.activeServices
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      });

      setFeedback("success", "Automation settings updated.");
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Failed to save automation settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function uploadMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalMediaPreview(previewUrl);
    setUploadingImage(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("title", file.name);
      body.append("altText", "Facebook automation media asset");

      const response = await fetch("/api/admin/social/facebook/media", {
        method: "POST",
        body
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Image upload failed.");
      }

      setSelectedMediaId(payload.asset.id);
      setFeedback("success", "Image uploaded to media library.");
      refresh();
    } catch (error) {
      setFeedback("error", error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="space-y-6">
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (!publicFacebookAppId || !window.FB) {
            return;
          }

          window.FB.init({
            appId: publicFacebookAppId,
            cookie: true,
            xfbml: false,
            version: "v22.0"
          });
          setSdkReady(true);
        }}
      />

      {status ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            status.tone === "success" ? "border-status-success-soft bg-status-success-soft text-status-success" : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Facebook className="h-5 w-5 text-primary" />
                  Facebook connection
                </CardTitle>
                <CardDescription>
                  Use Facebook Login, store long-lived tokens server-side, select the BDG page and keep reconnect state visible.
                </CardDescription>
              </div>
              <Badge variant={connectionVariant(connection.account)}>{connection.account?.reconnect_required ? "Reconnect required" : connection.account?.connection_status ?? "Disconnected"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Connected page</p>
                <p className="mt-2 text-lg font-semibold">{connection.selectedPage?.page_name ?? "No page selected"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{connection.selectedPage?.facebook_page_id ?? "Select the BDG Facebook page after login."}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Connection health</p>
                <p className="mt-2 text-lg font-semibold">{connection.account?.reconnect_required ? "Needs attention" : "Healthy"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {connection.account?.last_error_message ??
                    "Automatic posts run directly from META_SYSTEM_USER_ACCESS_TOKEN and META_PAGE_ID. Facebook Login is only needed for the manual composer."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: "Facebook App ID", ok: envStatus.appId },
                { label: "Facebook App Secret", ok: envStatus.appSecret },
                { label: "Token encryption key", ok: envStatus.encryption },
                { label: "Cron secret", ok: envStatus.cron },
                { label: "META_SYSTEM_USER_ACCESS_TOKEN", ok: envStatus.metaSystemUserAccessToken },
                { label: "META_PAGE_ID", ok: envStatus.metaPageId }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
                  <span>{item.label}</span>
                  <span className={item.ok ? "text-status-success" : "text-destructive"}>{item.ok ? "Ready" : "Missing"}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={connectFacebook} disabled={!publicFacebookAppId || !envStatus.appSecret || !envStatus.encryption || isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Facebook className="mr-2 h-4 w-4" />}
                Connect with Facebook
              </Button>
              <Button variant="outline" onClick={validateConnection} disabled={!connection.account?.access_token_encrypted || isPending}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Validate connection
              </Button>
              <Button variant="outline" onClick={runAutomationNow} disabled={!automaticModeReady || isPending}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run now
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Available Facebook pages</p>
                <Badge variant="secondary">{availablePages.length}</Badge>
              </div>

              {availablePages.length === 0 ? (
                <EmptyState
                  icon={Facebook}
                  compact
                  title="No pages loaded yet"
                  description="Connect the Facebook account first. The backend will exchange the short-lived token, fetch pages and store the page token securely."
                />
              ) : (
                <div className="space-y-3">
                  {availablePages.map((page) => (
                    <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-4">
                      <div>
                        <p className="font-medium">{page.name}</p>
                        <p className="text-xs text-muted-foreground">{page.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{page.tasks?.join(", ") || "page"}</Badge>
                        <Button size="sm" onClick={() => choosePage(page.id, page.name)}>
                          Use this page
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/40">
            <CardTitle className="text-xl">Metrics snapshot</CardTitle>
            <CardDescription>Only internal publishing data is shown here. No external Facebook reach metrics are invented.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Top template</p>
              <p className="mt-2 text-lg font-semibold">{metrics.topTemplate}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Top CTA</p>
              <p className="mt-2 text-lg font-semibold">{metrics.topCta}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Automation cadence</p>
              <p className="mt-2 text-lg font-semibold">{connection.settings?.daily_posts_count ?? 0} posts / day</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timezone</p>
              <p className="mt-2 text-lg font-semibold">{connection.settings?.timezone ?? "America/Chicago"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Manual post composer</CardTitle>
                <CardDescription>Create drafts, publish now, or schedule posts with optional image and strong CTA.</CardDescription>
              </div>
              {editorPostId ? <Badge variant="warning">Editing existing post</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="template">Template library</Label>
              <div className="flex flex-wrap gap-3">
                <select
                  id="template"
                  className="h-10 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedTemplateId}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                >
                  <option value="">No template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title} / {template.category}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={() => applyTemplate("short")} disabled={!selectedTemplate}>
                  Short
                </Button>
                <Button variant="outline" onClick={() => applyTemplate("medium")} disabled={!selectedTemplate}>
                  Medium
                </Button>
                <Button variant="outline" onClick={() => applyTemplate("long")} disabled={!selectedTemplate}>
                  Long
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} className="min-h-[220px]" placeholder="Write the Facebook caption here." />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => generateSuggestion("generate_more")}>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate more
              </Button>
              <Button variant="outline" onClick={() => generateSuggestion("rewrite")}>
                Rewrite
              </Button>
              <Button variant="outline" onClick={() => generateSuggestion("shorter")}>
                Make shorter
              </Button>
              <Button variant="outline" onClick={() => generateSuggestion("aggressive")}>
                More aggressive
              </Button>
              <Button variant="outline" onClick={() => generateSuggestion("premium")}>
                More premium
              </Button>
            </div>

            {suggestions.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {suggestions.map((option, index) => (
                  <button
                    key={`${option.title}-${index}`}
                    type="button"
                    onClick={() => {
                      setCaption(option.copy);
                      if (option.templateId) {
                        setSelectedTemplateId(option.templateId);
                      }
                    }}
                    className="rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/30 hover:bg-secondary/40"
                  >
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className="mt-2 line-clamp-5 text-sm text-muted-foreground">{option.copy}</p>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Scheduled date</Label>
                <Input id="scheduled-date" type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Scheduled time</Label>
                <Input id="scheduled-time" type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="America/Chicago" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">Media library</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload image
                  <input type="file" accept="image/*" className="hidden" onChange={uploadMedia} />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mediaAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setSelectedMediaId(asset.id);
                      setLocalMediaPreview(null);
                    }}
                    className={cn(
                      "overflow-hidden rounded-2xl border p-2 text-left transition-colors",
                      selectedMediaId === asset.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-secondary/50">
                      {asset.previewUrl ? <img src={asset.previewUrl} alt={asset.alt_text ?? asset.title ?? "Media asset"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImagePlus className="h-6 w-6" /></div>}
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{asset.title ?? asset.path.split("/").pop()}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => submitPost("draft")} disabled={!manualConnectionReady || isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save draft
              </Button>
              <Button variant="outline" onClick={() => submitPost("schedule")} disabled={!manualConnectionReady || isPending}>
                <Clock3 className="mr-2 h-4 w-4" />
                Schedule post
              </Button>
              <Button onClick={() => submitPost("publish_now")} disabled={!manualPublishReady || isPending}>
                <Send className="mr-2 h-4 w-4" />
                Publish now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/40">
            <CardTitle className="text-xl">Live preview</CardTitle>
            <CardDescription>Preview the caption, CTA direction and optional image before publishing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Facebook className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{connection.selectedPage?.page_name ?? "BDG Agency"}</p>
                  <p className="text-xs text-muted-foreground">Sponsored by systems, automation and conversion logic</p>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{previewCaption}</p>

              {previewImage ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-secondary/40">
                  <img src={previewImage} alt="Selected post preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground">
                  Add an image if you want a media post. Text-only publishing also works.
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Primary CTA</p>
                <p className="mt-2 text-lg font-semibold">{settingsForm.ctaLabel}</p>
                <p className="text-sm text-muted-foreground">{settingsForm.ctaUrl}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-semibold">Publishing rules</p>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-status-success" />
                  <p>Automatic publishing uses only META_SYSTEM_USER_ACCESS_TOKEN and META_PAGE_ID on the server.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-status-success" />
                  <p>Facebook Login and stored page tokens are only required if you want to use the manual composer.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-status-warning" />
                  <p>If META_SYSTEM_USER_ACCESS_TOKEN or META_PAGE_ID is missing, automation pauses instead of failing silently.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border bg-secondary/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Daily automation and CTA settings</CardTitle>
              <CardDescription>Control daily volume, posting windows, content categories, CTA aggressiveness and market framing.</CardDescription>
            </div>
            <Badge variant={settingsForm.enabled ? "success" : "secondary"}>{settingsForm.enabled ? "Automation ON" : "Automation OFF"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
              <span>Enable daily automation</span>
              <input type="checkbox" checked={settingsForm.enabled} onChange={(event) => setSettingsForm((current) => ({ ...current, enabled: event.target.checked }))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
              <span>Use images when available</span>
              <input type="checkbox" checked={settingsForm.useImages} onChange={(event) => setSettingsForm((current) => ({ ...current, useImages: event.target.checked }))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
              <span>Rotate templates</span>
              <input type="checkbox" checked={settingsForm.rotateTemplates} onChange={(event) => setSettingsForm((current) => ({ ...current, rotateTemplates: event.target.checked }))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
              <span>Avoid repeats</span>
              <input type="checkbox" checked={settingsForm.avoidRepeatTemplate} onChange={(event) => setSettingsForm((current) => ({ ...current, avoidRepeatTemplate: event.target.checked }))} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>Posts per day</Label>
              <Input type="number" min={1} max={10} value={settingsForm.dailyPostsCount} onChange={(event) => setSettingsForm((current) => ({ ...current, dailyPostsCount: Number(event.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Suggested times</Label>
              <Input value={settingsForm.scheduledTimes} onChange={(event) => setSettingsForm((current) => ({ ...current, scheduledTimes: event.target.value }))} placeholder="09:00, 13:30, 18:00" />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={settingsForm.timezone} onChange={(event) => setSettingsForm((current) => ({ ...current, timezone: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={settingsForm.tone} onChange={(event) => setSettingsForm((current) => ({ ...current, tone: event.target.value as typeof current.tone }))}>
                <option value="premium">Premium</option>
                <option value="direct">Direct</option>
                <option value="aggressive">Aggressive</option>
                <option value="modern">Modern</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>Primary CTA label</Label>
              <Input value={settingsForm.ctaLabel} onChange={(event) => setSettingsForm((current) => ({ ...current, ctaLabel: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CTA destination</Label>
              <Input value={settingsForm.ctaUrl} onChange={(event) => setSettingsForm((current) => ({ ...current, ctaUrl: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Urgency</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={settingsForm.urgencyLevel} onChange={(event) => setSettingsForm((current) => ({ ...current, urgencyLevel: event.target.value as typeof current.urgencyLevel }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Offer</Label>
              <Input value={settingsForm.offer} onChange={(event) => setSettingsForm((current) => ({ ...current, offer: event.target.value }))} placeholder="Free demo, onboarding bonus, growth audit" />
            </div>
            <div className="space-y-2">
              <Label>City / market</Label>
              <Input value={settingsForm.market} onChange={(event) => setSettingsForm((current) => ({ ...current, market: event.target.value }))} placeholder="Dallas, Austin, Central Texas" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Active services</Label>
              <Input value={settingsForm.activeServices} onChange={(event) => setSettingsForm((current) => ({ ...current, activeServices: event.target.value }))} placeholder="Automation, Websites, Dashboards" />
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
              <span>Include live demo in CTA direction</span>
              <input type="checkbox" checked={settingsForm.includesDemo} onChange={(event) => setSettingsForm((current) => ({ ...current, includesDemo: event.target.checked }))} />
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Content categories for automation</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = settingsForm.contentCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setSettingsForm((current) => ({
                        ...current,
                        contentCategories: active ? current.contentCategories.filter((item) => item !== category) : [...current.contentCategories, category]
                      }))
                    }
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-secondary"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={saveAutomationSettings} disabled={savingSettings || !automaticModeReady}>
              {savingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
              Save automation settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader className="border-b border-border bg-secondary/40">
            <CardTitle className="text-xl">Template library</CardTitle>
            <CardDescription>30 conversion-focused BDG starter templates across automation, websites, dashboards, authority, urgency and direct sale.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            {templates.slice(0, 12).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setSelectedTemplateId(template.id);
                  setCaption(renderTemplateCopy(template, "medium", connection.settings));
                }}
                className="rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/30 hover:bg-secondary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{template.title}</p>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{template.hook}</p>
                <p className="mt-3 line-clamp-5 text-sm">{renderTemplateCopy(template, "short", connection.settings)}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border bg-secondary/40">
            <CardTitle className="text-xl">History and logs</CardTitle>
            <CardDescription>Edit, duplicate, delete or republish posts while keeping technical logs of attempts and failures.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Recent posts</p>
                <Badge variant="secondary">{posts.length}</Badge>
              </div>

              {posts.length === 0 ? (
                <EmptyState compact icon={FileText} title="No posts yet" description="Drafts, scheduled posts and publication history will appear here as soon as the module is used." />
              ) : (
                posts.slice(0, 10).map((post) => (
                  <div key={post.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusTone(post.status)}>{post.status}</Badge>
                          {post.is_automated ? <Badge variant="secondary">Automated</Badge> : null}
                        </div>
                        <p className="line-clamp-3 text-sm">{post.caption}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.scheduled_for ? `Scheduled: ${new Date(post.scheduled_for).toLocaleString()}` : `Created: ${new Date(post.created_at).toLocaleString()}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => loadPostIntoEditor(post)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => mutatePost(post.id, "duplicate")}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </Button>
                        {post.status !== "published" ? (
                          <Button size="sm" variant="outline" onClick={() => mutatePost(post.id, "publish_now")}>
                            Publish
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => mutatePost(post.id, "publish_now")}>
                            Republish
                          </Button>
                        )}
                        {post.status === "scheduled" ? (
                          <Button size="sm" variant="outline" onClick={() => mutatePost(post.id, "cancel")}>
                            Cancel
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => mutatePost(post.id, "delete")}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Technical logs</p>
                <Badge variant="secondary">{logs.length}</Badge>
              </div>

              {logs.length === 0 ? (
                <EmptyState compact icon={AlertTriangle} title="No logs yet" description="Publish attempts, Meta errors, token validation and retry events will appear here." />
              ) : (
                logs.slice(0, 12).map((log) => (
                  <div key={log.id} className="rounded-2xl border border-border bg-background p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === "success" ? "success" : log.status === "error" ? "warning" : "secondary"}>{log.status}</Badge>
                        <span className="font-medium">{log.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
