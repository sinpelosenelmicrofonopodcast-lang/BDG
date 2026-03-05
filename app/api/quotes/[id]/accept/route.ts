import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { quoteAcceptanceSchema } from "@/lib/schemas/quote";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = quoteAcceptanceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const forwardedFor = headersList.get("x-forwarded-for");

  const admin = getSupabaseAdminClient();
  const { data: quote, error: quoteError } = await admin.from("quotes").select("id,status").eq("id", id).maybeSingle();

  if (quoteError || !quote) {
    return NextResponse.json({ error: quoteError?.message ?? "Quote not found" }, { status: 404 });
  }

  if (quote.status === "accepted") {
    return NextResponse.json({ ok: true, alreadyAccepted: true });
  }

  const { error: acceptanceError } = await admin.from("quote_acceptances").insert({
    quote_id: id,
    typed_name: parsed.data.typedName,
    ip_address: forwardedFor,
    user_agent: userAgent
  });

  if (acceptanceError) {
    return NextResponse.json({ error: acceptanceError.message }, { status: 500 });
  }

  const { error: quoteUpdateError } = await admin
    .from("quotes")
    .update({
      status: "accepted",
      payment_unlocked: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (quoteUpdateError) {
    return NextResponse.json({ error: quoteUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
