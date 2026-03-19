import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { selectFacebookPageSchema } from "@/lib/schemas/facebook-automation";
import { createSocialPostLog, getFacebookConnectionForAdmin, selectFacebookPage } from "@/lib/social/facebook/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const connection = await getFacebookConnectionForAdmin(context.user.id);

  if (!connection.account) {
    return NextResponse.json({ error: "Connect a Facebook account first." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = selectFacebookPageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  try {
    const page = await selectFacebookPage({
      socialAccountId: connection.account.id,
      pageId: parsed.data.pageId,
      pageName: parsed.data.pageName
    });
    const supabase = getSupabaseAdminClient();

    await Promise.all([
      supabase.from("admin_audit_log").insert({
        admin_id: context.user.id,
        action: "select_facebook_page",
        entity_type: "social_page",
        entity_id: page.id,
        metadata: {
          page_id: parsed.data.pageId,
          page_name: parsed.data.pageName
        }
      }),
      createSocialPostLog({
        socialAccountId: connection.account.id,
        action: "select_facebook_page",
        status: "success",
        message: `Selected Facebook page ${parsed.data.pageName}.`
      })
    ]);

    return NextResponse.json({
      ok: true,
      page: {
        id: page.id,
        facebookPageId: page.facebook_page_id,
        pageName: page.page_name
      }
    });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to select page.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
