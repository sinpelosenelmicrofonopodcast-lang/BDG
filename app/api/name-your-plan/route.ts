import { NextResponse } from "next/server";
import { nameYourPlanSchema } from "@/lib/schemas/name-your-plan";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = nameYourPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        budget: parsed.data.budget,
        industry: parsed.data.industry,
        needs: parsed.data.needs,
        business_name: parsed.data.businessName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        notes: parsed.data.notes || null,
        status: "new"
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Failed to create quote request" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}
