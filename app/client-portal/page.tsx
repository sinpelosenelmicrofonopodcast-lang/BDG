import { redirect } from "next/navigation";

export default function ClientPortalEntryPage() {
  redirect("/auth/sign-in");
}
