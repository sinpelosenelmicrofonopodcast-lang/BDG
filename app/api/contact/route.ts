import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas/contact";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("leads").insert({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      source: "contact",
      notes: parsed.data.message,
      status: "new"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (process.env.RESEND_API_KEY) {
      const resend = getResendClient();
      await resend.emails.send({
        from: `${process.env.AGENCY_NAME ?? "BDG Agency"} <onboarding@resend.dev>`,
        to: [process.env.AGENCY_EMAIL ?? "sales@youragency.com"],
        subject: `New contact lead: ${parsed.data.fullName}`,
        text: `Name: ${parsed.data.fullName}\nEmail: ${parsed.data.email}\nPhone: ${parsed.data.phone || "N/A"}\nMessage: ${parsed.data.message}`
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}
