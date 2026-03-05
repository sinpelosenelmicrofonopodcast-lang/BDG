import { NextResponse } from "next/server";
import { analyticsEvents } from "@/lib/constants";
import { ticketSchema } from "@/lib/schemas/ticket";
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
  const parsed = ticketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      project_id: parsed.data.projectId,
      client_id: user.id,
      type: parsed.data.type,
      priority: parsed.data.priority,
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "open"
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, event: analyticsEvents.OPEN_TICKET }, { status: 201 });
}
