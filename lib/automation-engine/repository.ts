import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AutomationEngineSettingsInput } from "@/lib/schemas/automation-engine";
import type { AutoPostRecord, AutomationEnginePlatform, AutomationEngineSettingsRecord, GeneratedAutomationPost } from "@/lib/automation-engine/types";

const DEFAULT_REPLY_MESSAGE = "Hey there. BDG can automate your business, check this out: https://bdg.lat";
const DEFAULT_DM_MESSAGE = "Hey there. BDG can automate your business, check this out: https://bdg.lat";
const DEFAULT_PLATFORMS: AutomationEnginePlatform[] = ["instagram", "facebook", "tiktok", "x"];
const DEFAULT_SCHEDULE_TIMES = ["08:30", "11:45", "15:15", "18:30"];

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : fallback;
}

function mapSettingsRow(row: Record<string, unknown>): AutomationEngineSettingsRecord {
  return {
    id: String(row.id),
    provider: "automation_engine",
    user_id: String(row.user_id),
    enabled: Boolean(row.enabled),
    timezone: typeof row.timezone === "string" ? row.timezone : "America/Chicago",
    auto_post_enabled: Boolean(row.auto_post_enabled),
    auto_dm_enabled: Boolean(row.auto_dm_enabled),
    auto_reply_enabled: Boolean(row.auto_reply_enabled),
    preferred_platforms: asStringArray(row.preferred_platforms, DEFAULT_PLATFORMS) as AutomationEnginePlatform[],
    preferred_schedule_times: asStringArray(row.preferred_schedule_times, DEFAULT_SCHEDULE_TIMES),
    auto_reply_message: typeof row.auto_reply_message === "string" ? row.auto_reply_message : DEFAULT_REPLY_MESSAGE,
    auto_dm_message: typeof row.auto_dm_message === "string" ? row.auto_dm_message : DEFAULT_DM_MESSAGE,
    simulate_posting: row.simulate_posting !== false,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export async function getAutomationEngineSettings(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("automation_settings")
    .select("*")
    .eq("provider", "automation_engine")
    .eq("user_id", userId)
    .maybeSingle<Record<string, unknown>>();

  return data ? mapSettingsRow(data) : null;
}

export async function ensureAutomationEngineSettings(userId: string) {
  const existing = await getAutomationEngineSettings(userId);

  if (existing) {
    return existing;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("automation_settings")
    .insert({
      provider: "automation_engine",
      user_id: userId,
      enabled: true,
      timezone: "America/Chicago",
      daily_posts_count: 4,
      scheduled_times: DEFAULT_SCHEDULE_TIMES,
      content_categories: ["education", "sales", "video"],
      rotate_templates: true,
      avoid_repeat_template: false,
      aggressive_cta_enabled: true,
      cta_label: "Activate BDG",
      cta_url: "/pricing",
      tone: "modern",
      includes_demo: true,
      active_services: ["AI automation", "Daily content", "Lead generation"],
      auto_post_enabled: false,
      auto_dm_enabled: false,
      auto_reply_enabled: false,
      preferred_platforms: DEFAULT_PLATFORMS,
      preferred_schedule_times: DEFAULT_SCHEDULE_TIMES,
      auto_reply_message: DEFAULT_REPLY_MESSAGE,
      auto_dm_message: DEFAULT_DM_MESSAGE,
      simulate_posting: true
    })
    .select("*")
    .single<Record<string, unknown>>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create automation engine settings.");
  }

  return mapSettingsRow(data);
}

export async function updateAutomationEngineSettings(userId: string, input: AutomationEngineSettingsInput) {
  const supabase = getSupabaseAdminClient();
  const existing = await getAutomationEngineSettings(userId);
  const platforms = Object.entries(input.platforms)
    .filter(([, enabled]) => enabled)
    .map(([platform]) => platform as AutomationEnginePlatform);

  const payload = {
    provider: "automation_engine",
    user_id: userId,
    enabled: true,
    timezone: input.timezone,
    daily_posts_count: 4,
    scheduled_times: input.preferredScheduleTimes,
    auto_post_enabled: input.autoPostEnabled,
    auto_dm_enabled: input.autoDmEnabled,
    auto_reply_enabled: input.autoReplyEnabled,
    preferred_platforms: platforms.length > 0 ? platforms : DEFAULT_PLATFORMS,
    preferred_schedule_times: input.preferredScheduleTimes,
    auto_reply_message: input.autoReplyMessage,
    auto_dm_message: input.autoDmMessage,
    simulate_posting: input.simulatePosting,
    content_categories: ["education", "sales", "video"],
    rotate_templates: true,
    avoid_repeat_template: false,
    aggressive_cta_enabled: true,
    cta_label: "Activate BDG",
    cta_url: "/pricing",
    tone: "modern",
    includes_demo: true,
    active_services: ["AI automation", "Daily content", "Lead generation"]
  };

  const query = existing
    ? supabase.from("automation_settings").update(payload).eq("id", existing.id)
    : supabase.from("automation_settings").insert(payload);

  const { data, error } = await query.select("*").single<Record<string, unknown>>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update automation engine settings.");
  }

  return mapSettingsRow(data);
}

export async function listAutomationEnginePosts(userId: string, limit = 24) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("auto_posts")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as AutoPostRecord[]).map((post) => ({
    ...post,
    metadata: post.metadata ?? null
  }));
}

export async function listPostsForDay(userId: string, dayStartIso: string, dayEndIso: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("auto_posts")
    .select("*")
    .eq("user_id", userId)
    .gte("scheduled_at", dayStartIso)
    .lte("scheduled_at", dayEndIso)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AutoPostRecord[];
}

export async function insertAutomationPosts(params: {
  userId: string;
  posts: GeneratedAutomationPost[];
  platforms: AutomationEnginePlatform[];
  scheduledTimes: string[];
  timezone: string;
  source: "openai" | "fallback";
  autoPostEnabled: boolean;
}) {
  const { zonedDateTimeToUtc, formatDateKeyInZone } = await import("@/lib/timezone");
  const supabase = getSupabaseAdminClient();
  const dateKey = formatDateKeyInZone(new Date(), params.timezone);

  const rows = params.posts.map((post, index) => {
    const scheduledTime = params.scheduledTimes[index % params.scheduledTimes.length] ?? DEFAULT_SCHEDULE_TIMES[index] ?? "09:00";
    const scheduledAt = zonedDateTimeToUtc(dateKey, scheduledTime, params.timezone).toISOString();

    return {
      user_id: params.userId,
      title: post.title,
      content: post.content,
      content_type: post.contentType,
      platform: post.platform,
      status: params.autoPostEnabled ? "scheduled" : "draft",
      scheduled_at: scheduledAt,
      performance_score: post.performanceScore,
      metadata: {
        platforms: post.platform === "multi-platform" ? params.platforms : [post.platform],
        engagement: post.metrics.engagement,
        clicks: post.metrics.clicks,
        leads: post.metrics.leads,
        source: params.source,
        demoState: index === 0 ? "generating" : index === 1 ? "scheduled" : "engaging"
      }
    };
  });

  const { data, error } = await supabase.from("auto_posts").insert(rows).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AutoPostRecord[];
}

export async function markDuePostsAsPublished(userId: string, simulatePosting: boolean) {
  const supabase = getSupabaseAdminClient();
  const nextStatus = simulatePosting ? "simulated" : "posted";
  const { data, error } = await supabase
    .from("auto_posts")
    .update({ status: nextStatus })
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AutoPostRecord[];
}

export async function listAutomationEngineAccounts() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("automation_settings")
    .select("*")
    .eq("provider", "automation_engine")
    .eq("enabled", true)
    .not("user_id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Record<string, unknown>[]).map(mapSettingsRow);
}
