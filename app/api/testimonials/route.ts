import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { clientTestimonialSchema } from "@/lib/schemas/client-testimonial";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = clientTestimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const quoteEn = parsed.data.quoteEn?.trim() ?? "";
  const quoteEs = parsed.data.quoteEs?.trim() ?? "";

  if (!quoteEn && !quoteEs) {
    return NextResponse.json({ error: "At least one quote is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName?.trim() || null,
      company_role: parsed.data.companyRole?.trim() || null,
      quote_en: quoteEn || null,
      quote_es: quoteEs || null,
      is_featured: false,
      active: false,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
