import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth";

export default async function DashboardPage() {
  const role = await getCurrentUserRole();

  if (role === "admin") {
    redirect("/dashboard/admin/overview");
  }

  redirect("/dashboard/client");
}
