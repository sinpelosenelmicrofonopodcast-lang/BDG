import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const projectId = formData.get("projectId")?.toString() ?? null;
  const ticketId = formData.get("ticketId")?.toString() ?? null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "-");
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const admin = getSupabaseAdminClient();

  const uploadBuffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage.from("client-assets").upload(path, uploadBuffer, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data, error } = await admin
    .from("files")
    .insert({
      owner_id: user.id,
      project_id: projectId,
      ticket_id: ticketId,
      bucket: "client-assets",
      path,
      mime_type: file.type || null,
      file_size: file.size
    })
    .select("id,path")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, path: data.path }, { status: 201 });
}
