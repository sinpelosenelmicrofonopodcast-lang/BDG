import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getFacebookConnectionForAdmin } from "@/lib/social/facebook/repository";
import { validateFacebookAccountConnection } from "@/lib/social/facebook/jobs";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const connection = await getFacebookConnectionForAdmin(context.user.id);

  if (!connection.account) {
    return NextResponse.json({ error: "No Facebook connection found." }, { status: 404 });
  }

  try {
    const validation = await validateFacebookAccountConnection(connection.account.id);
    const supabase = getSupabaseAdminClient();

    await supabase.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "validate_facebook_connection",
      entity_type: "social_account",
      entity_id: connection.account.id,
      metadata: {
        is_valid: validation.isValid,
        scopes: validation.scopes
      }
    });

    return NextResponse.json({ ok: true, validation });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to validate Facebook connection.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
