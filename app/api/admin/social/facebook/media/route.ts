import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { createMediaAssetRecord, listFacebookMediaAssets } from "@/lib/social/facebook/repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const assets = await listFacebookMediaAssets(48);

  return NextResponse.json({ ok: true, assets });
}

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = formData.get("title")?.toString() ?? null;
  const altText = formData.get("altText")?.toString() ?? null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "-");
  const path = `${context.user.id}/${Date.now()}-${safeName}`;
  const admin = getSupabaseAdminClient();
  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage.from("social-media").upload(path, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  try {
    const asset = await createMediaAssetRecord({
      owner_id: context.user.id,
      bucket: "social-media",
      path,
      mime_type: file.type || null,
      file_size: file.size,
      title,
      alt_text: altText,
      width: null,
      height: null
    });

    await admin.from("admin_audit_log").insert({
      admin_id: context.user.id,
      action: "upload_social_media_asset",
      entity_type: "media_asset",
      entity_id: asset.id,
      metadata: {
        bucket: asset.bucket,
        path: asset.path,
        size: asset.file_size
      }
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : "Failed to save media asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
