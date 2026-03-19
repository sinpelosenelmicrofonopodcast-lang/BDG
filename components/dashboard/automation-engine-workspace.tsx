"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Instagram,
  Loader2,
  MessageCircleMore,
  PlayCircle,
  Rocket,
  Send,
  Sparkles,
  TrendingUp,
  Video,
  Workflow
} from "lucide-react";
import type { AutoPostRecord, AutomationEngineSettingsRecord } from "@/lib/automation-engine/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";

type AutomationEngineWorkspaceProps = {
  settings: AutomationEngineSettingsRecord;
  posts: AutoPostRecord[];
};

const platformMeta = {
  instagram: { label: "Instagram", icon: Instagram },
  facebook: { label: "Facebook", icon: Workflow },
  tiktok: { label: "TikTok", icon: Video },
  x: { label: "X", icon: Send }
} as const;

function statusTone(status: AutoPostRecord["status"]) {
  if (status === "posted") return "success";
  if (status === "simulated") return "warning";
  return "secondary";
}

export function AutomationEngineWorkspace({ settings, posts }: AutomationEngineWorkspaceProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [localPosts, setLocalPosts] = useState(posts);
  const [form, setForm] = useState({
    autoPostEnabled: settings.auto_post_enabled,
    autoDmEnabled: settings.auto_dm_enabled,
    autoReplyEnabled: settings.auto_reply_enabled,
    platforms: {
      instagram: settings.preferred_platforms.includes("instagram"),
      facebook: settings.preferred_platforms.includes("facebook"),
      tiktok: settings.preferred_platforms.includes("tiktok"),
      x: settings.preferred_platforms.includes("x")
    },
    preferredScheduleTimes: settings.preferred_schedule_times.join(", "),
    timezone: settings.timezone,
    autoReplyMessage: settings.auto_reply_message,
    autoDmMessage: settings.auto_dm_message,
    simulatePosting: settings.simulate_posting
  });

  const scheduledPosts = localPosts.filter((post) => post.status === "scheduled");
  const performancePosts = localPosts.slice().sort((left, right) => (right.performance_score ?? 0) - (left.performance_score ?? 0));

  function refreshPage() {
    startTransition(() => {
      router.refresh();
    });
  }

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

  async function saveSettings() {
    setIsSaving(true);

    try {
      await handleJsonRequest("/api/admin/automation-engine/settings", "PATCH", {
        autoPostEnabled: form.autoPostEnabled,
        autoDmEnabled: form.autoDmEnabled,
        autoReplyEnabled: form.autoReplyEnabled,
        platforms: form.platforms,
        preferredScheduleTimes: form.preferredScheduleTimes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        timezone: form.timezone,
        autoReplyMessage: form.autoReplyMessage,
        autoDmMessage: form.autoDmMessage,
        simulatePosting: form.simulatePosting
      });
      setStatus({ tone: "success", message: "Automation settings saved." });
      refreshPage();
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not save settings." });
    } finally {
      setIsSaving(false);
    }
  }

  async function generateTodayContent() {
    setIsGenerating(true);

    try {
      const payload = await handleJsonRequest("/api/admin/automation-engine/generate", "POST", {
        force: false
      });
      setLocalPosts((payload.posts as AutoPostRecord[]) ?? []);
      setStatus({
        tone: "success",
        message:
          payload.source === "existing"
            ? "Today's content was already available."
            : `Generated ${payload.created ?? 0} automation posts using ${payload.source ?? "the current"} pipeline.`
      });
      refreshPage();
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not generate content." });
    } finally {
      setIsGenerating(false);
    }
  }

  async function runAutomationEngine() {
    setIsRunning(true);

    try {
      const payload = await handleJsonRequest("/api/admin/automation-engine/run", "POST");
      setStatus({
        tone: "success",
        message: `Automation run completed. ${payload.generated?.created ?? 0} created, ${payload.posting?.published ?? 0} pushed through the posting loop.`
      });
      refreshPage();
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not run automation." });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      {status ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm shadow-sm",
            status.tone === "success"
              ? "border-status-success-soft bg-status-success-soft text-status-success"
              : "border-status-warning-soft bg-status-warning-soft text-status-warning"
          )}
        >
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="automation-glow h-full overflow-hidden border-primary/20">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-foreground px-3 py-1 text-background">AUTOMATIC</Badge>
                <Badge variant="secondary" className="rounded-full">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Autonomous daily engine
                </Badge>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Auto Content Generator</CardTitle>
                  <CardDescription>
                    Generate today&apos;s 2 educational posts, 1 sales post, and 1 short-form video script. OpenAI is used when configured, with a safe fallback when it is not.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={generateTodayContent} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate Today&apos;s Content
                  </Button>
                  <Button variant="outline" onClick={runAutomationEngine} disabled={isRunning}>
                    {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                    Run Loop Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {localPosts.length === 0 ? (
                <EmptyState
                  title="No automation posts yet"
                  description="Generate today&apos;s content to populate the scheduler, posting system, and performance tracker."
                  icon={Bot}
                />
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {localPosts.slice(0, 4).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="rounded-2xl border border-border bg-secondary/35 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{post.title}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{post.content_type.replace("_", " ")}</p>
                      </div>
                      <Badge variant={statusTone(post.status)}>{post.status}</Badge>
                    </div>
                    <p className="mt-3 line-clamp-5 text-sm leading-6 text-muted-foreground">{post.content}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">
                        {post.platform}
                      </Badge>
                      <span>{post.scheduled_at ? formatDate(post.scheduled_at) : "Not scheduled yet"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
          <Card className="h-full border-border/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  <Rocket className="mr-1 h-3.5 w-3.5" />
                  Self-running mode
                </Badge>
              </div>
              <CardTitle className="text-2xl">Auto Posting System</CardTitle>
              <CardDescription>Enable posting, choose channels, and decide whether BDG should simulate publishing while APIs are still being connected.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, autoPostEnabled: !current.autoPostEnabled }))}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                    form.autoPostEnabled ? "border-primary bg-primary/5" : "border-border bg-background"
                  )}
                >
                  <div>
                    <p className="font-semibold">Auto-post</p>
                    <p className="text-sm text-muted-foreground">Daily content moves into the scheduler and posting loop automatically.</p>
                  </div>
                  <Badge variant={form.autoPostEnabled ? "success" : "secondary"}>{form.autoPostEnabled ? "ON" : "OFF"}</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, simulatePosting: !current.simulatePosting }))}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                    form.simulatePosting ? "border-primary bg-primary/5" : "border-border bg-background"
                  )}
                >
                  <div>
                    <p className="font-semibold">Simulation mode</p>
                    <p className="text-sm text-muted-foreground">Keep the full experience working before live APIs are switched on.</p>
                  </div>
                  <Badge variant={form.simulatePosting ? "warning" : "secondary"}>{form.simulatePosting ? "SIMULATED" : "LIVE"}</Badge>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(platformMeta).map(([key, meta]) => {
                  const enabled = form.platforms[key as keyof typeof form.platforms];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          platforms: {
                            ...current.platforms,
                            [key]: !enabled
                          }
                        }))
                      }
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors",
                        enabled ? "border-primary bg-primary/5" : "border-border bg-background"
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Icon className="h-4 w-4" />
                        {meta.label}
                      </span>
                      <Badge variant={enabled ? "success" : "secondary"}>{enabled ? "Ready" : "Off"}</Badge>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Optimal posting times</label>
                <Input
                  value={form.preferredScheduleTimes}
                  onChange={(event) => setForm((current) => ({ ...current, preferredScheduleTimes: event.target.value }))}
                  placeholder="08:30, 11:45, 15:15, 18:30"
                />
              </div>

              <Button variant="outline" onClick={saveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save Posting Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Content Scheduler</CardTitle>
              <CardDescription>Today&apos;s calendar auto-fills with generated content and the next best send times.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledPosts.length === 0 ? (
                <EmptyState title="Nothing scheduled yet" description="Turn on auto-posting or generate content to populate the calendar." icon={CalendarClock} compact />
              ) : null}

              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/25 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{post.title}</p>
                      <Badge variant="outline">{post.platform}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Pending schedule"}
                    </p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Engagement Automation</CardTitle>
              <CardDescription>Set the default replies and DMs that keep prospects moving while BDG handles daily activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, autoReplyEnabled: !current.autoReplyEnabled }))}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                    form.autoReplyEnabled ? "border-primary bg-primary/5" : "border-border bg-background"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <MessageCircleMore className="h-4 w-4" />
                    Auto-reply
                  </span>
                  <Badge variant={form.autoReplyEnabled ? "success" : "secondary"}>{form.autoReplyEnabled ? "ON" : "OFF"}</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, autoDmEnabled: !current.autoDmEnabled }))}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                    form.autoDmEnabled ? "border-primary bg-primary/5" : "border-border bg-background"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Send className="h-4 w-4" />
                    Auto-DM
                  </span>
                  <Badge variant={form.autoDmEnabled ? "success" : "secondary"}>{form.autoDmEnabled ? "ON" : "OFF"}</Badge>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-reply message</label>
                <Textarea
                  rows={4}
                  value={form.autoReplyMessage}
                  onChange={(event) => setForm((current) => ({ ...current, autoReplyMessage: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-DM message</label>
                <Textarea rows={4} value={form.autoDmMessage} onChange={(event) => setForm((current) => ({ ...current, autoDmMessage: event.target.value }))} />
              </div>

              <Button variant="outline" onClick={saveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save Engagement Rules
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">Performance Tracker</CardTitle>
                <CardDescription>Monitor projected engagement, clicks, and lead lift from the automation engine.</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
                AUTOMATIC revenue signal
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {performancePosts.length === 0 ? (
              <div className="lg:col-span-3">
                <EmptyState title="No performance data yet" description="Generated posts will show projected engagement, clicks, and leads here." icon={TrendingUp} compact />
              </div>
            ) : null}

            {performancePosts.slice(0, 6).map((post) => {
              const metrics = post.metadata ?? {};

              return (
                <div key={post.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{post.title}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{post.content_type.replace("_", " ")}</p>
                    </div>
                    <Badge variant={statusTone(post.status)}>{post.performance_score ?? 0}</Badge>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-muted-foreground">Engagement</span>
                        <span className="font-medium">{metrics.engagement ?? 0}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Number(metrics.engagement ?? 0) / 2)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Clicks</span>
                      <span className="font-medium">{metrics.clicks ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads generated</span>
                      <span className="font-medium">{metrics.leads ?? 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
