import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import { getFacebookSystemPostingConfig } from "@/lib/social/facebook/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FacebookAutomationSettingsInput, FacebookPostCreateInput } from "@/lib/schemas/facebook-automation";
import type {
  AutomationSettingsRecord,
  FacebookPageOption,
  MediaAssetRecord,
  SocialAccountRecord,
  SocialPageRecord,
  SocialPostLogRecord,
  SocialPostRecord,
  SocialTemplateRecord
} from "@/lib/social/facebook/types";

const SYSTEM_PAGE_NAME = "Meta system page";
const SYSTEM_PAGE_TOKEN_SENTINEL = "__META_SYSTEM_PAGE__";

export async function getFacebookConnectionForAdmin(adminUserId: string) {
  const supabase = getSupabaseAdminClient();
  const { data: account } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("provider", "facebook")
    .eq("admin_user_id", adminUserId)
    .maybeSingle<SocialAccountRecord>();

  if (!account) {
    return { account: null, selectedPage: null, pages: [], settings: null };
  }

  const [{ data: pages }, { data: settings }] = await Promise.all([
    supabase.from("social_pages").select("*").eq("social_account_id", account.id).order("page_name", { ascending: true }),
    supabase.from("automation_settings").select("*").eq("social_account_id", account.id).maybeSingle<AutomationSettingsRecord>()
  ]);

  const typedPages = (pages ?? []) as SocialPageRecord[];
  const selectedPage = typedPages.find((page) => page.is_selected) ?? null;

  return {
    account,
    selectedPage,
    pages: typedPages,
    settings: settings ?? null
  };
}

export async function getFacebookAccountById(accountId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("social_accounts").select("*").eq("id", accountId).maybeSingle<SocialAccountRecord>();

  return data ?? null;
}

export async function ensureFacebookSystemAutomationContext(adminUserId: string) {
  const systemPostingConfig = getFacebookSystemPostingConfig();

  if (!systemPostingConfig.configured) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  let { data: account } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("provider", "facebook")
    .eq("admin_user_id", adminUserId)
    .maybeSingle<SocialAccountRecord>();

  if (!account) {
    const { data, error } = await supabase
      .from("social_accounts")
      .insert({
        provider: "facebook",
        admin_user_id: adminUserId,
        facebook_page_id: systemPostingConfig.pageId,
        page_name: SYSTEM_PAGE_NAME,
        connection_status: "connected",
        reconnect_required: false,
        last_error_message: null,
        token_last_validated_at: now
      })
      .select("*")
      .single<SocialAccountRecord>();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create Facebook automation account.");
    }

    account = data;
  } else if (account.facebook_page_id !== systemPostingConfig.pageId || account.page_name !== SYSTEM_PAGE_NAME) {
    const { data, error } = await supabase
      .from("social_accounts")
      .update({
        facebook_page_id: systemPostingConfig.pageId,
        page_name: SYSTEM_PAGE_NAME,
        connection_status: "connected",
        reconnect_required: false,
        last_error_message: null,
        token_last_validated_at: now
      })
      .eq("id", account.id)
      .select("*")
      .single<SocialAccountRecord>();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to sync Facebook automation account.");
    }

    account = data;
  }

  const { data: existingPages } = await supabase.from("social_pages").select("*").eq("social_account_id", account.id);
  const typedPages = (existingPages ?? []) as SocialPageRecord[];
  const existingSystemPage = typedPages.find((page) => page.facebook_page_id === systemPostingConfig.pageId) ?? null;
  const hasSelectedPage = typedPages.some((page) => page.is_selected);

  if (!existingSystemPage) {
    const { data, error } = await supabase
      .from("social_pages")
      .insert({
        social_account_id: account.id,
        provider: "facebook",
        facebook_page_id: systemPostingConfig.pageId,
        page_name: SYSTEM_PAGE_NAME,
        access_token_encrypted: SYSTEM_PAGE_TOKEN_SENTINEL,
        token_type: "system",
        scopes: [],
        tasks: ["MANAGE", "CREATE_CONTENT"],
        is_selected: !hasSelectedPage,
        connection_status: "connected",
        reconnect_required: false,
        token_last_validated_at: now
      })
      .select("*")
      .single<SocialPageRecord>();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create Facebook automation page.");
    }

    return {
      account,
      page: data
    };
  }

  const { data: page, error: pageError } = await supabase
    .from("social_pages")
    .update({
      page_name: SYSTEM_PAGE_NAME,
      token_type: "system",
      tasks: ["MANAGE", "CREATE_CONTENT"],
      connection_status: "connected",
      reconnect_required: false,
      token_last_validated_at: now
    })
    .eq("id", existingSystemPage.id)
    .select("*")
    .single<SocialPageRecord>();

  if (pageError || !page) {
    throw new Error(pageError?.message ?? "Failed to sync Facebook automation page.");
  }

  return {
    account,
    page
  };
}

export async function upsertFacebookConnection(params: {
  adminUserId: string;
  facebookUserId: string;
  longLivedUserToken: string;
  tokenType: string | null;
  expiresAt: string | null;
  scopes: string[];
  pages: FacebookPageOption[];
}) {
  const supabase = getSupabaseAdminClient();
  const encryptedUserToken = encryptSecret(params.longLivedUserToken);

  const { data: account, error } = await supabase
    .from("social_accounts")
    .upsert(
      {
        provider: "facebook",
        admin_user_id: params.adminUserId,
        facebook_user_id: params.facebookUserId,
        access_token_encrypted: encryptedUserToken,
        token_type: params.tokenType,
        scopes: params.scopes,
        token_expires_at: params.expiresAt,
        connection_status: "connected",
        reconnect_required: false,
        last_error_message: null,
        token_last_validated_at: new Date().toISOString()
      },
      { onConflict: "provider,admin_user_id" }
    )
    .select("*")
    .single<SocialAccountRecord>();

  if (error || !account) {
    throw new Error(error?.message ?? "Failed to save Facebook account.");
  }

  const selectedPageId = account.facebook_page_id;
  const pageRows = params.pages.map((page) => ({
    social_account_id: account.id,
    provider: "facebook",
    facebook_page_id: page.id,
    page_name: page.name,
    access_token_encrypted: encryptSecret(page.accessToken),
    token_type: "page",
    scopes: params.scopes,
    tasks: page.tasks,
    is_selected: selectedPageId ? selectedPageId === page.id : false,
    connection_status: "connected",
    reconnect_required: false,
    token_last_validated_at: new Date().toISOString()
  }));

  if (pageRows.length > 0) {
    const { error: pagesError } = await supabase.from("social_pages").upsert(pageRows, { onConflict: "social_account_id,facebook_page_id" });

    if (pagesError) {
      throw new Error(pagesError.message);
    }
  }

  return account;
}

export async function selectFacebookPage(params: { socialAccountId: string; pageId: string; pageName: string }) {
  const supabase = getSupabaseAdminClient();

  await supabase.from("social_pages").update({ is_selected: false }).eq("social_account_id", params.socialAccountId);

  const { data: page, error: pageError } = await supabase
    .from("social_pages")
    .update({
      is_selected: true,
      reconnect_required: false,
      connection_status: "connected"
    })
    .eq("social_account_id", params.socialAccountId)
    .eq("facebook_page_id", params.pageId)
    .select("*")
    .single<SocialPageRecord>();

  if (pageError || !page) {
    throw new Error(pageError?.message ?? "Failed to select Facebook page.");
  }

  const { error: accountError } = await supabase
    .from("social_accounts")
    .update({
      facebook_page_id: params.pageId,
      page_name: params.pageName,
      connection_status: "connected",
      reconnect_required: false,
      last_error_message: null,
      token_last_validated_at: new Date().toISOString()
    })
    .eq("id", params.socialAccountId);

  if (accountError) {
    throw new Error(accountError.message);
  }

  const { data: existingSettings } = await supabase
    .from("automation_settings")
    .select("id")
    .eq("social_account_id", params.socialAccountId)
    .maybeSingle();

  if (!existingSettings) {
    await supabase.from("automation_settings").insert({
      social_account_id: params.socialAccountId,
      provider: "facebook"
    });
  }

  return page;
}

export async function getSelectedFacebookPage(accountId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("social_pages").select("*").eq("social_account_id", accountId).eq("is_selected", true).maybeSingle<SocialPageRecord>();

  return data ?? null;
}

export async function getSelectedFacebookPageToken(accountId: string) {
  const page = await getSelectedFacebookPage(accountId);

  if (!page) {
    return null;
  }

  return {
    page,
    accessToken: decryptSecret(page.access_token_encrypted)
  };
}

export async function getDecryptedUserToken(account: SocialAccountRecord) {
  if (!account.access_token_encrypted) {
    return null;
  }

  return decryptSecret(account.access_token_encrypted);
}

export async function markReconnectRequired(params: {
  socialAccountId: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("social_accounts")
      .update({
        connection_status: "reconnect_required",
        reconnect_required: true,
        last_error_message: params.message,
        token_last_validated_at: now
      })
      .eq("id", params.socialAccountId),
    supabase
      .from("social_pages")
      .update({
        connection_status: "reconnect_required",
        reconnect_required: true,
        token_last_validated_at: now
      })
      .eq("social_account_id", params.socialAccountId),
    supabase
      .from("automation_settings")
      .update({
        enabled: false,
        pause_reason: "Facebook reconnection required."
      })
      .eq("social_account_id", params.socialAccountId)
  ]);
}

export async function markConnectionValidated(params: {
  socialAccountId: string;
  scopes: string[];
  expiresAt: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("social_accounts")
      .update({
        scopes: params.scopes,
        token_expires_at: params.expiresAt,
        token_last_validated_at: now,
        reconnect_required: false,
        connection_status: "connected",
        last_error_message: null
      })
      .eq("id", params.socialAccountId),
    supabase
      .from("social_pages")
      .update({
        scopes: params.scopes,
        token_last_validated_at: now,
        reconnect_required: false,
        connection_status: "connected"
      })
      .eq("social_account_id", params.socialAccountId)
  ]);
}

export async function upsertAutomationSettings(accountId: string, input: FacebookAutomationSettingsInput) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("automation_settings")
    .upsert(
      {
        social_account_id: accountId,
        provider: "facebook",
        enabled: input.enabled,
        daily_posts_count: input.dailyPostsCount,
        timezone: input.timezone,
        scheduled_times: input.scheduledTimes,
        use_images: input.useImages,
        content_categories: input.contentCategories,
        rotate_templates: input.rotateTemplates,
        avoid_repeat_template: input.avoidRepeatTemplate,
        aggressive_cta_enabled: input.aggressiveCtaEnabled,
        cta_label: input.ctaLabel,
        cta_url: input.ctaUrl,
        tone: input.tone,
        offer: input.offer || null,
        market: input.market || null,
        urgency_level: input.urgencyLevel,
        includes_demo: input.includesDemo,
        active_services: input.activeServices,
        pause_reason: null
      },
      { onConflict: "social_account_id" }
    )
    .select("*")
    .single<AutomationSettingsRecord>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save automation settings.");
  }

  return data;
}

export async function listFacebookTemplates() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("social_post_templates")
    .select("*")
    .eq("provider", "facebook")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  return (data ?? []) as SocialTemplateRecord[];
}

export async function getTemplateById(templateId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("social_post_templates").select("*").eq("id", templateId).maybeSingle<SocialTemplateRecord>();

  return data ?? null;
}

export async function listFacebookMediaAssets(limit = 24) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(limit);

  return (data ?? []) as MediaAssetRecord[];
}

export async function createMediaAssetRecord(input: Omit<MediaAssetRecord, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("media_assets").insert(input).select("*").single<MediaAssetRecord>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save media asset.");
  }

  return data;
}

export async function getMediaAssetById(assetId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("media_assets").select("*").eq("id", assetId).maybeSingle<MediaAssetRecord>();

  return data ?? null;
}

export async function createSocialPost(accountId: string, pageId: string, adminId: string, input: FacebookPostCreateInput, scheduledFor: string | null) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("social_posts")
    .insert({
      provider: "facebook",
      social_account_id: accountId,
      social_page_id: pageId,
      template_id: input.templateId ?? null,
      media_asset_id: input.mediaAssetId ?? null,
      created_by: adminId,
      caption: input.caption,
      status: input.intent === "draft" ? "draft" : input.intent === "schedule" ? "scheduled" : "publishing",
      scheduled_for: scheduledFor,
      cta_used: input.ctaUsed ?? null,
      timezone: input.timezone,
      is_automated: input.isAutomated,
      metadata: {
        intent: input.intent
      }
    })
    .select("*, media_assets(*), social_post_templates(*)")
    .single<SocialPostRecord>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create post.");
  }

  return data;
}

export async function getSocialPostById(postId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("social_posts")
    .select("*, media_assets(*), social_post_templates(*)")
    .eq("id", postId)
    .maybeSingle<SocialPostRecord>();

  return data ?? null;
}

export async function updateSocialPost(postId: string, input: Partial<FacebookPostCreateInput> & { status?: SocialPostRecord["status"]; scheduledFor?: string | null }) {
  const supabase = getSupabaseAdminClient();
  const payload: Record<string, unknown> = {};

  if (typeof input.caption === "string") payload.caption = input.caption;
  if ("mediaAssetId" in input) payload.media_asset_id = input.mediaAssetId ?? null;
  if ("templateId" in input) payload.template_id = input.templateId ?? null;
  if ("ctaUsed" in input) payload.cta_used = input.ctaUsed ?? null;
  if ("timezone" in input && input.timezone) payload.timezone = input.timezone;
  if ("status" in input && input.status) payload.status = input.status;
  if ("scheduledFor" in input) payload.scheduled_for = input.scheduledFor ?? null;

  const { data, error } = await supabase
    .from("social_posts")
    .update(payload)
    .eq("id", postId)
    .select("*, media_assets(*), social_post_templates(*)")
    .single<SocialPostRecord>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update post.");
  }

  return data;
}

export async function deleteSocialPost(postId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("social_posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markPostPublishResult(params: {
  postId: string;
  status: SocialPostRecord["status"];
  facebookPostId?: string | null;
  errorMessage?: string | null;
  publishedAt?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("social_posts")
    .update({
      status: params.status,
      facebook_post_id: params.facebookPostId ?? null,
      error_message: params.errorMessage ?? null,
      published_at: params.publishedAt ?? null
    })
    .eq("id", params.postId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createSocialPostLog(input: {
  postId?: string | null;
  socialAccountId?: string | null;
  action: string;
  status: SocialPostLogRecord["status"];
  message: string;
  providerResponse?: Record<string, unknown>;
  retryCount?: number;
}) {
  const supabase = getSupabaseAdminClient();

  await supabase.from("social_post_logs").insert({
    post_id: input.postId ?? null,
    social_account_id: input.socialAccountId ?? null,
    action: input.action,
    status: input.status,
    message: input.message,
    provider_response: input.providerResponse ?? {},
    retry_count: input.retryCount ?? 0
  });
}

export async function listRecentSocialPosts(accountId: string, limit = 24) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("social_posts")
    .select("*, media_assets(*), social_post_templates(*)")
    .eq("social_account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as SocialPostRecord[];
}

export async function listRecentSocialLogs(accountId: string, limit = 30) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("social_post_logs")
    .select("*")
    .eq("social_account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as SocialPostLogRecord[];
}

export async function listDueScheduledPosts() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("social_posts")
    .select("*, media_assets(*), social_post_templates(*)")
    .eq("provider", "facebook")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(50);

  return (data ?? []) as SocialPostRecord[];
}

export async function listAutomationAccounts() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("automation_settings")
    .select("*, social_accounts(*)")
    .eq("provider", "facebook")
    .eq("enabled", true);

  return (data ?? []) as Array<AutomationSettingsRecord & { social_accounts: SocialAccountRecord }>;
}

export async function getAutomationSettings(accountId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("automation_settings").select("*").eq("social_account_id", accountId).maybeSingle<AutomationSettingsRecord>();

  return data ?? null;
}

export async function updateAutomationRunState(accountId: string, input: { lastAutomationRunAt?: string; lastSuccessfulPostAt?: string; pauseReason?: string | null }) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("automation_settings")
    .update({
      last_automation_run_at: input.lastAutomationRunAt,
      last_successful_post_at: input.lastSuccessfulPostAt,
      pause_reason: input.pauseReason ?? null
    })
    .eq("social_account_id", accountId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countAutomatedPostsForDate(accountId: string, dayStartIso: string, dayEndIso: string) {
  const supabase = getSupabaseAdminClient();
  const { count } = await supabase
    .from("social_posts")
    .select("id", { count: "exact", head: true })
    .eq("social_account_id", accountId)
    .eq("is_automated", true)
    .gte("scheduled_for", dayStartIso)
    .lte("scheduled_for", dayEndIso);

  return count ?? 0;
}

export async function listRecentAutomatedTemplateIds(accountId: string, limit = 6) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("social_posts")
    .select("template_id")
    .eq("social_account_id", accountId)
    .eq("is_automated", true)
    .not("template_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => row.template_id as string).filter(Boolean);
}
