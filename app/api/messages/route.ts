import { NextResponse } from "next/server";
import { messageSchema } from "@/lib/schemas/message";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      recipient_id: parsed.data.recipientId ?? null,
      ticket_id: parsed.data.ticketId ?? null,
      project_id: parsed.data.projectId ?? null,
      body: parsed.data.body,
      is_admin_message: false
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
