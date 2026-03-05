import { NextResponse } from "next/server";
import { z } from "zod";
import { analyticsEvents } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const addonRequestSchema = z.object({
  projectId: z.string().uuid(),
  addonId: z.string().uuid(),
  notes: z.string().max(1000).optional()
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addonRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("addon_requests")
    .insert({
      project_id: parsed.data.projectId,
      client_id: user.id,
      addon_id: parsed.data.addonId,
      notes: parsed.data.notes ?? null,
      status: "pending"
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, event: analyticsEvents.REQUEST_ADDON }, { status: 201 });
}
