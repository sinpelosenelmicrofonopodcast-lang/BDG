import { redirect } from "next/navigation";

export default function AdminDashboardRootPage() {
  redirect("/dashboard/admin/overview");
}
