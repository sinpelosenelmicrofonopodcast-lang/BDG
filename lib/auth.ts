import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ADMIN_EMAILS = ["hectorgabrielmartinez@gmail.com"] as const;

function getConfiguredAdminEmails() {
  const raw = process.env.ADMIN_EMAILS;

  if (!raw || !raw.trim()) {
    return new Set(DEFAULT_ADMIN_EMAILS.map((email) => email.toLowerCase()));
  }

  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function ensureAdminRole(userId: string) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  } catch {
    // Fail silently and fallback to DB role checks.
  }
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

export async function getCurrentUserRole() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const userEmail = user.email?.toLowerCase();
  const adminEmails = getConfiguredAdminEmails();

  if (userEmail && adminEmails.has(userEmail)) {
    await ensureAdminRole(user.id);
    return "admin";
  }

  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (adminRole?.role === "admin") {
    return "admin";
  }

  return "client";
}

export async function requireAdmin() {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/dashboard/client");
  }
}
