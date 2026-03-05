import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  quoteId: z.string().uuid()
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
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id,client_id,plan_id,recommended_plan,timeline,total")
    .eq("id", parsed.data.quoteId)
    .maybeSingle();

  if (quoteError || !quote) {
    return NextResponse.json({ error: quoteError?.message ?? "Quote not found" }, { status: 404 });
  }

  if (!quote.client_id) {
    return NextResponse.json({ error: "Quote has no linked client yet" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      client_id: quote.client_id,
      plan_id: quote.plan_id,
      name: quote.recommended_plan,
      status: "active",
      timeline: { summary: quote.timeline },
      total_price: quote.total,
      start_date: new Date().toISOString().slice(0, 10)
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message ?? "Could not create project" }, { status: 500 });
  }

  await supabase
    .from("quotes")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString()
    })
    .eq("id", quote.id);

  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "convert_quote_to_project",
    entity_type: "project",
    entity_id: project.id,
    metadata: {
      quote_id: quote.id
    }
  });

  return NextResponse.json({ projectId: project.id }, { status: 201 });
}
