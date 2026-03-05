import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const testimonialSchema = z.object({
  fullName: z.string().trim().min(2),
  companyName: z.string().trim().max(120).optional(),
  companyRole: z.string().trim().max(120).optional(),
  quoteEn: z.string().trim().max(700).optional(),
  quoteEs: z.string().trim().max(700).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isFeatured: z.boolean().optional(),
  active: z.boolean().optional()
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
  const parsed = testimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const quoteEn = parsed.data.quoteEn?.trim() ?? "";
  const quoteEs = parsed.data.quoteEs?.trim() ?? "";

  if (!quoteEn && !quoteEs) {
    return NextResponse.json({ error: "At least one quote is required." }, { status: 400 });
  }

  const payload = {
    full_name: parsed.data.fullName,
    company_name: parsed.data.companyName?.trim() || null,
    company_role: parsed.data.companyRole?.trim() || null,
    quote_en: quoteEn || null,
    quote_es: quoteEs || null,
    sort_order: parsed.data.sortOrder ?? 100,
    is_featured: parsed.data.isFeatured ?? true,
    active: parsed.data.active ?? true,
    created_by: user.id
  };

  const { error } = await supabase.from("testimonials").insert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "create_testimonial",
    entity_type: "testimonial",
    metadata: {
      full_name: payload.full_name,
      is_featured: payload.is_featured
    }
  });

  return NextResponse.json({ ok: true });
}
