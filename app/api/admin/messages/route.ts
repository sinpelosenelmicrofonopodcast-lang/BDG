import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const adminMessageSchema = z.object({
  recipientId: z.string().uuid(),
  body: z.string().min(1).max(2000)
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = adminMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      recipient_id: parsed.data.recipientId,
      body: parsed.data.body,
      is_admin_message: true
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "send_admin_message",
    entity_type: "message",
    entity_id: data.id,
    metadata: {}
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
