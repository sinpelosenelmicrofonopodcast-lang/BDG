import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth";

export type AdminApiContext = {
  user: User;
};

export async function getAdminApiContext(): Promise<{ context: AdminApiContext | null; error: NextResponse | null }> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      context: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const role = await getCurrentUserRole();

  if (role !== "admin") {
    return {
      context: null,
      error: NextResponse.json({ error: "Admin only" }, { status: 403 })
    };
  }

  return {
    context: { user },
    error: null
  };
}
