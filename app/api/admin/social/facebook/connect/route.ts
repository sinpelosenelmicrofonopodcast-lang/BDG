import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { hasEncryptionSecret } from "@/lib/security/encryption";
import { facebookConnectSchema } from "@/lib/schemas/facebook-automation";
import { createSocialPostLog, upsertFacebookConnection } from "@/lib/social/facebook/repository";
import { exchangeUserToken, fetchFacebookUser, fetchUserPages, FacebookServiceError } from "@/lib/social/facebook/service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  if (!hasEncryptionSecret()) {
    return NextResponse.json({ error: "Missing FACEBOOK_TOKEN_ENCRYPTION_KEY." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = facebookConnectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  try {
    const exchanged = await exchangeUserToken(parsed.data.userAccessToken);
    const [facebookUser, pages] = await Promise.all([fetchFacebookUser(exchanged.accessToken), fetchUserPages(exchanged.accessToken)]);

    if (pages.length === 0) {
      return NextResponse.json({ error: "No Facebook pages available for this account." }, { status: 400 });
    }

    const account = await upsertFacebookConnection({
      adminUserId: context.user.id,
      facebookUserId: facebookUser.id,
      longLivedUserToken: exchanged.accessToken,
      tokenType: exchanged.tokenType,
      expiresAt: exchanged.expiresAt,
      scopes: parsed.data.scopes,
      pages
    });

    const supabase = getSupabaseAdminClient();
    await Promise.all([
      supabase.from("admin_audit_log").insert({
        admin_id: context.user.id,
        action: "connect_facebook_account",
        entity_type: "social_account",
        entity_id: account.id,
        metadata: {
          provider: "facebook",
          facebook_user_id: facebookUser.id,
          pages_available: pages.length
        }
      }),
      createSocialPostLog({
        socialAccountId: account.id,
        action: "connect_facebook_account",
        status: "success",
        message: `Facebook account connected with ${pages.length} available page(s).`
      })
    ]);

    return NextResponse.json({
      ok: true,
      accountId: account.id,
      pages: pages.map((page) => ({
        id: page.id,
        name: page.name,
        tasks: page.tasks
      }))
    });
  } catch (routeError) {
    const message =
      routeError instanceof FacebookServiceError
        ? routeError.message
        : routeError instanceof Error
          ? routeError.message
          : "Failed to connect Facebook account.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
