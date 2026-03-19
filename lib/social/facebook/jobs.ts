import "server-only";

import { formatDateKeyInZone, zonedDateTimeToUtc } from "@/lib/timezone";
import { renderTemplateCopy } from "@/lib/social/facebook/copy";
import {
  countAutomatedPostsForDate,
  createSocialPost,
  createSocialPostLog,
  getAutomationSettings,
  getDecryptedUserToken,
  getFacebookAccountById,
  getFacebookConnectionForAdmin,
  getMediaAssetById,
  getSelectedFacebookPageToken,
  getSocialPostById,
  listAutomationAccounts,
  listDueScheduledPosts,
  listFacebookMediaAssets,
  listFacebookTemplates,
  listRecentAutomatedTemplateIds,
  markConnectionValidated,
  markPostPublishResult,
  markReconnectRequired,
  updateAutomationRunState,
  updateSocialPost
} from "@/lib/social/facebook/repository";
import { createFacebookPost, validateStoredToken, FacebookServiceError } from "@/lib/social/facebook/service";

function startOfDayUtc(dateKey: string, timeZone: string) {
  return zonedDateTimeToUtc(dateKey, "00:00", timeZone).toISOString();
}

function endOfDayUtc(dateKey: string, timeZone: string) {
  return zonedDateTimeToUtc(dateKey, "23:59", timeZone).toISOString();
}

async function loadPublishImage(postId: string) {
  const post = await getSocialPostById(postId);

  if (!post?.media_asset_id) {
    return null;
  }

  const asset = await getMediaAssetById(post.media_asset_id);

  if (!asset) {
    return null;
  }

  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(asset.bucket).download(asset.path);

  if (error || !data) {
    return null;
  }

  return {
    data,
    filename: asset.path.split("/").pop() ?? "social-image.jpg",
    mimeType: asset.mime_type ?? "image/jpeg"
  };
}

export async function publishFacebookPost(postId: string) {
  const post = await getSocialPostById(postId);

  if (!post) {
    throw new Error("Post not found.");
  }

  const { page, accessToken } = (await getSelectedFacebookPageToken(post.social_account_id)) ?? {};

  if (!page || !accessToken) {
    await markPostPublishResult({
      postId,
      status: "failed",
      errorMessage: "Facebook page connection is missing."
    });
    await createSocialPostLog({
      postId,
      socialAccountId: post.social_account_id,
      action: "publish_post",
      status: "error",
      message: "Missing page token or selected page."
    });
    throw new Error("Missing Facebook page connection.");
  }

  await updateSocialPost(postId, { status: "publishing" });
  await createSocialPostLog({
    postId,
    socialAccountId: post.social_account_id,
    action: "publish_post",
    status: "info",
    message: "Publishing post to Facebook."
  });

  try {
    const image = await loadPublishImage(postId);
    const payload = await createFacebookPost({
      pageId: page.facebook_page_id,
      pageAccessToken: accessToken,
      caption: post.caption,
      image
    });

    await markPostPublishResult({
      postId,
      status: "published",
      facebookPostId: payload.post_id ?? payload.id ?? null,
      errorMessage: null,
      publishedAt: new Date().toISOString()
    });
    await updateAutomationRunState(post.social_account_id, { lastSuccessfulPostAt: new Date().toISOString() });
    await createSocialPostLog({
      postId,
      socialAccountId: post.social_account_id,
      action: "publish_post",
      status: "success",
      message: "Facebook post published successfully.",
      providerResponse: {
        postId: payload.post_id ?? payload.id ?? null
      }
    });

    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish Facebook post.";

    await markPostPublishResult({
      postId,
      status: "failed",
      errorMessage: message,
      publishedAt: null
    });

    await createSocialPostLog({
      postId,
      socialAccountId: post.social_account_id,
      action: "publish_post",
      status: "error",
      message
    });

    if (error instanceof FacebookServiceError && error.isAuthError) {
      await markReconnectRequired({
        socialAccountId: post.social_account_id,
        message
      });
    }

    throw error;
  }
}

function chooseTemplateCategory(settingsCategories: string[], index: number) {
  return settingsCategories[index % settingsCategories.length] ?? settingsCategories[0] ?? "automation";
}

export async function runDailyAutomation() {
  const accounts = await listAutomationAccounts();
  const templates = await listFacebookTemplates();
  const mediaAssets = await listFacebookMediaAssets(12);
  let created = 0;

  for (const settings of accounts) {
    const connection = await getFacebookConnectionForAdmin(settings.social_accounts.admin_user_id);
    const account = connection.account;
    const selectedPage = connection.selectedPage;
    const automationSettings = await getAutomationSettings(settings.social_account_id);

    if (!account || !selectedPage || !automationSettings || account.reconnect_required || account.connection_status !== "connected") {
      continue;
    }

    const dayKey = formatDateKeyInZone(new Date(), automationSettings.timezone);
    const dayStart = startOfDayUtc(dayKey, automationSettings.timezone);
    const dayEnd = endOfDayUtc(dayKey, automationSettings.timezone);
    const existingCount = await countAutomatedPostsForDate(account.id, dayStart, dayEnd);

    if (existingCount >= automationSettings.daily_posts_count) {
      await updateAutomationRunState(account.id, { lastAutomationRunAt: new Date().toISOString(), pauseReason: null });
      continue;
    }

    const recentTemplateIds = automationSettings.avoid_repeat_template ? await listRecentAutomatedTemplateIds(account.id) : [];
    const missingCount = automationSettings.daily_posts_count - existingCount;

    for (let index = 0; index < missingCount; index += 1) {
      const category = chooseTemplateCategory(automationSettings.content_categories, existingCount + index);
      const templatePool = templates.filter((template) => template.category === category && !recentTemplateIds.includes(template.id));
      const fallbackPool = templates.filter((template) => template.category === category);
      const template = templatePool[0] ?? fallbackPool[0] ?? templates[0];

      if (!template) {
        break;
      }

      const scheduledTime = automationSettings.scheduled_times[(existingCount + index) % automationSettings.scheduled_times.length] ?? "09:00";
      const scheduledFor = zonedDateTimeToUtc(dayKey, scheduledTime, automationSettings.timezone).toISOString();
      const mediaAssetId = automationSettings.use_images ? mediaAssets[index % mediaAssets.length]?.id ?? null : null;
      const caption = renderTemplateCopy(template, "medium", automationSettings);
      const ctaUsed = automationSettings.cta_label;

      await createSocialPost(account.id, selectedPage.id, account.admin_user_id, {
        caption,
        mediaAssetId,
        templateId: template.id,
        ctaUsed,
        timezone: automationSettings.timezone,
        scheduledDate: dayKey,
        scheduledTime,
        intent: "schedule",
        isAutomated: true
      }, scheduledFor);

      await createSocialPostLog({
        socialAccountId: account.id,
        action: "automation_schedule",
        status: "success",
        message: `Automated Facebook post scheduled for ${scheduledTime}.`
      });
      created += 1;
    }

    await updateAutomationRunState(account.id, { lastAutomationRunAt: new Date().toISOString(), pauseReason: null });
  }

  return { created };
}

export async function runScheduledFacebookPosts() {
  const duePosts = await listDueScheduledPosts();
  let published = 0;
  let failed = 0;

  for (const post of duePosts) {
    try {
      await publishFacebookPost(post.id);
      published += 1;
    } catch {
      failed += 1;
    }
  }

  return { published, failed };
}

export async function validateFacebookAccountConnection(accountId: string) {
  const account = await getFacebookAccountById(accountId);

  if (!account) {
    throw new Error("Facebook account not found.");
  }

  if (!account.access_token_encrypted) {
    throw new Error("Stored Facebook token is missing.");
  }

  const userToken = await getDecryptedUserToken(account);
  const validation = await validateStoredToken(userToken ?? "");

  if (!validation.isValid) {
    await markReconnectRequired({
      socialAccountId: account.id,
      message: "Stored Facebook token is invalid."
    });
    await createSocialPostLog({
      socialAccountId: account.id,
      action: "validate_connection",
      status: "error",
      message: "Stored Facebook token is invalid."
    });

    return validation;
  }

  await markConnectionValidated({
    socialAccountId: account.id,
    scopes: validation.scopes,
    expiresAt: validation.expiresAt
  });
  await createSocialPostLog({
    socialAccountId: account.id,
    action: "validate_connection",
    status: "success",
    message: "Facebook connection validated successfully."
  });

  return validation;
}
