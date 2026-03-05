import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { getCurrentUserRole, requireUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

const copy = {
  en: {
    dashboard: "Dashboard",
    openAdmin: "Open Admin",
    openClient: "Open Client Portal"
  },
  es: {
    dashboard: "Dashboard",
    openAdmin: "Abrir Admin",
    openClient: "Abrir Portal Cliente"
  }
} as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const role = (await getCurrentUserRole()) ?? "client";
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.dashboard}</p>
          <p className="font-semibold">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {role === "admin" ? (
            <Link href="/dashboard/admin/overview" className="text-sm font-medium text-primary">
              {c.openAdmin}
            </Link>
          ) : (
            <Link href="/dashboard/client" className="text-sm font-medium text-primary">
              {c.openClient}
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <DashboardNav role={role} />
        <div>{children}</div>
      </div>
    </div>
  );
}
