import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { facebookPostUpdateSchema } from "@/lib/schemas/facebook-automation";
import { zonedDateTimeToUtc } from "@/lib/timezone";
import { publishFacebookPost } from "@/lib/social/facebook/jobs";
import {
  createSocialPost,
  createSocialPostLog,
  deleteSocialPost,
  getFacebookConnectionForAdmin,
  getSocialPostById,
  updateSocialPost
} from "@/lib/social/facebook/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const connection = await getFacebookConnectionForAdmin(context.user.id);

  if (!connection.account || !connection.selectedPage) {
    return NextResponse.json({ error: "Connect Facebook and select a page first." }, { status: 400 });
  }

  const post = await getSocialPostById(id);

  if (!post || post.social_account_id !== connection.account.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = facebookPostUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    if (parsed.data.intent === "duplicate") {
      const duplicated = await createSocialPost(connection.account.id, connection.selectedPage.id, context.user.id, {
        caption: parsed.data.caption ?? post.caption,
        mediaAssetId: parsed.data.mediaAssetId ?? post.media_asset_id,
        templateId: parsed.data.templateId ?? post.template_id,
        ctaUsed: parsed.data.ctaUsed ?? post.cta_used ?? undefined,
        timezone: parsed.data.timezone ?? post.timezone,
        scheduledDate: undefined,
        scheduledTime: undefined,
        intent: "draft",
        isAutomated: false
      }, null);

      await Promise.all([
        createSocialPostLog({
          postId: duplicated.id,
          socialAccountId: connection.account.id,
          action: "duplicate_post",
          status: "success",
          message: "Facebook post duplicated."
        }),
        supabase.from("admin_audit_log").insert({
          admin_id: context.user.id,
          action: "duplicate_facebook_post",
          entity_type: "social_post",
          entity_id: duplicated.id,
          metadata: {
            source_post_id: post.id
          }
        })
      ]);

      return NextResponse.json({ ok: true, post: duplicated });
    }

    if (parsed.data.intent === "cancel") {
      const canceled = await updateSocialPost(post.id, {
        status: "canceled"
      });

      await createSocialPostLog({
        postId: canceled.id,
        socialAccountId: connection.account.id,
        action: "cancel_post",
        status: "warning",
        message: "Facebook post canceled."
      });

      return NextResponse.json({ ok: true, post: canceled });
    }

    const scheduledFor =
      parsed.data.scheduledDate && parsed.data.scheduledTime
        ? zonedDateTimeToUtc(parsed.data.scheduledDate, parsed.data.scheduledTime, parsed.data.timezone ?? post.timezone).toISOString()
        : null;

    const nextStatus =
      parsed.data.intent === "publish_now" ? "publishing" : scheduledFor ? "scheduled" : post.status === "published" ? "draft" : post.status;

    const updated = await updateSocialPost(post.id, {
      caption: parsed.data.caption,
      mediaAssetId: parsed.data.mediaAssetId,
      templateId: parsed.data.templateId,
      ctaUsed: parsed.data.ctaUsed,
      timezone: parsed.data.timezone,
      status: nextStatus,
      scheduledFor
    });

    await supabase.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "update_facebook_post",
      entity_type: "social_post",
      entity_id: updated.id,
      metadata: {
        intent: parsed.data.intent,
        scheduled_for: scheduledFor
      }
    });

    await createSocialPostLog({
      postId: updated.id,
      socialAccountId: connection.account.id,
      action: "update_post",
      status: "success",
      message: parsed.data.intent === "publish_now" ? "Facebook post updated and queued for publishing." : "Facebook post updated."
    });

    if (parsed.data.intent === "publish_now") {
      await publishFacebookPost(updated.id);
    }

    const freshPost = await getSocialPostById(updated.id);

    return NextResponse.json({ ok: true, post: freshPost ?? updated });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to update post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const connection = await getFacebookConnectionForAdmin(context.user.id);

  if (!connection.account) {
    return NextResponse.json({ error: "Facebook connection not found." }, { status: 404 });
  }

  const post = await getSocialPostById(id);

  if (!post || post.social_account_id !== connection.account.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  await deleteSocialPost(id);
  await createSocialPostLog({
    socialAccountId: connection.account.id,
    action: "delete_post",
    status: "warning",
    message: "Facebook post deleted."
  });

  return NextResponse.json({ ok: true });
}
