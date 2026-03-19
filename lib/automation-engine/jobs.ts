import "server-only";

import { generateAutomationContent } from "@/lib/automation-engine/openai";
import {
  ensureAutomationEngineSettings,
  insertAutomationPosts,
  listAutomationEngineAccounts,
  listPostsForDay,
  markDuePostsAsPublished
} from "@/lib/automation-engine/repository";
import { formatDateKeyInZone, zonedDateTimeToUtc } from "@/lib/timezone";

async function getBusinessName(userId: string) {
  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("company_name,full_name").eq("id", userId).maybeSingle<{ company_name: string | null; full_name: string | null }>();

  return data?.company_name?.trim() || data?.full_name?.trim() || "BDG";
}

function startAndEndOfToday(timezone: string) {
  const dateKey = formatDateKeyInZone(new Date(), timezone);

  return {
    start: zonedDateTimeToUtc(dateKey, "00:00", timezone).toISOString(),
    end: zonedDateTimeToUtc(dateKey, "23:59", timezone).toISOString()
  };
}

export async function generateTodayAutomationContentForUser(userId: string, options?: { force?: boolean }) {
  const settings = await ensureAutomationEngineSettings(userId);
  const today = startAndEndOfToday(settings.timezone);

  if (!options?.force) {
    const existing = await listPostsForDay(userId, today.start, today.end);

    if (existing.length > 0) {
      return {
        created: 0,
        source: "existing" as const,
        posts: existing
      };
    }
  }

  const businessName = await getBusinessName(userId);
  const generation = await generateAutomationContent({
    businessName,
    platforms: settings.preferred_platforms,
    timezone: settings.timezone
  });

  const posts = await insertAutomationPosts({
    userId,
    posts: generation.posts,
    platforms: settings.preferred_platforms,
    scheduledTimes: settings.preferred_schedule_times,
    timezone: settings.timezone,
    source: generation.source,
    autoPostEnabled: settings.auto_post_enabled
  });

  return {
    created: posts.length,
    source: generation.source,
    posts
  };
}

export async function runAutomationEngineDaily() {
  const accounts = await listAutomationEngineAccounts();
  let created = 0;

  for (const account of accounts) {
    const result = await generateTodayAutomationContentForUser(account.user_id, { force: false });
    created += result.created;
  }

  return { created };
}

export async function runAutomationEnginePostingSweep() {
  const accounts = await listAutomationEngineAccounts();
  let published = 0;

  for (const account of accounts) {
    if (!account.auto_post_enabled) {
      continue;
    }

    const updated = await markDuePostsAsPublished(account.user_id, account.simulate_posting);
    published += updated.length;
  }

  return { published };
}

export async function runAutomationEnginePostingSweepForUser(userId: string) {
  const settings = await ensureAutomationEngineSettings(userId);

  if (!settings.auto_post_enabled) {
    return { published: 0 };
  }

  const updated = await markDuePostsAsPublished(userId, settings.simulate_posting);

  return { published: updated.length };
}
