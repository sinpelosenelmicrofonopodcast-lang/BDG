import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { facebookPostCreateSchema } from "@/lib/schemas/facebook-automation";
import { zonedDateTimeToUtc } from "@/lib/timezone";
import { publishFacebookPost } from "@/lib/social/facebook/jobs";
import { createSocialPost, createSocialPostLog, getFacebookConnectionForAdmin, getSocialPostById } from "@/lib/social/facebook/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const connection = await getFacebookConnectionForAdmin(context.user.id);

  if (!connection.account || !connection.selectedPage) {
    return NextResponse.json({ error: "Connect Facebook and select a page first." }, { status: 400 });
  }

  if (connection.account.reconnect_required) {
    return NextResponse.json({ error: "Reconnect Facebook before publishing or scheduling posts." }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = facebookPostCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  const scheduledFor =
    parsed.data.intent === "schedule" && parsed.data.scheduledDate && parsed.data.scheduledTime
      ? zonedDateTimeToUtc(parsed.data.scheduledDate, parsed.data.scheduledTime, parsed.data.timezone).toISOString()
      : null;

  try {
    const post = await createSocialPost(connection.account.id, connection.selectedPage.id, context.user.id, parsed.data, scheduledFor);
    const supabase = getSupabaseAdminClient();

    await Promise.all([
      createSocialPostLog({
        postId: post.id,
        socialAccountId: connection.account.id,
        action: "create_post",
        status: "success",
        message: parsed.data.intent === "schedule" ? "Facebook post scheduled." : parsed.data.intent === "draft" ? "Facebook draft saved." : "Facebook post queued for publishing."
      }),
      supabase.from("admin_audit_log").insert({
        admin_id: context.user.id,
        action: "create_facebook_post",
        entity_type: "social_post",
        entity_id: post.id,
        metadata: {
          intent: parsed.data.intent,
          scheduled_for: scheduledFor,
          has_image: Boolean(parsed.data.mediaAssetId),
          is_automated: parsed.data.isAutomated
        }
      })
    ]);

    if (parsed.data.intent === "publish_now") {
      await publishFacebookPost(post.id);
    }

    const freshPost = await getSocialPostById(post.id);

    return NextResponse.json({ ok: true, post: freshPost ?? post });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to create post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
