import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminClientCreateSchema } from "@/lib/schemas/admin-client-create";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminClientCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const createResult = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: parsed.data.emailConfirmed,
    user_metadata: {
      full_name: parsed.data.fullName ?? null,
      company_name: parsed.data.companyName ?? null,
      phone: parsed.data.phone ?? null
    }
  });

  if (createResult.error || !createResult.data.user) {
    return NextResponse.json({ error: createResult.error?.message ?? "Failed to create client user" }, { status: 500 });
  }

  const userId = createResult.data.user.id;

  await supabase.from("profiles").upsert(
    {
      id: userId,
      email: parsed.data.email,
      full_name: parsed.data.fullName ?? null,
      company_name: parsed.data.companyName ?? null,
      phone: parsed.data.phone ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  await supabase.from("user_roles").upsert({ user_id: userId, role: "client" }, { onConflict: "user_id,role" });

  await supabase.from("admin_audit_log").insert({
    admin_id: context.user.id,
    action: "create_client",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: parsed.data.email,
      company_name: parsed.data.companyName ?? null
    }
  });

  return NextResponse.json({ id: userId }, { status: 201 });
}
