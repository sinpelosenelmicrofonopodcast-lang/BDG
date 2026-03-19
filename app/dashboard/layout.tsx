import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { getCurrentUserRole, requireUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { Badge } from "@/components/ui/badge";

const copy = {
  en: {
    dashboard: "Dashboard",
    workspace: "Workspace",
    workspaceDescription: "Operational control for delivery, billing, support and client communication.",
    openAdmin: "Open Admin",
    openClient: "Open Client Portal",
    adminRole: "Admin access",
    clientRole: "Client access"
  },
  es: {
    dashboard: "Dashboard",
    workspace: "Workspace",
    workspaceDescription: "Control operativo para entrega, cobro, soporte y comunicacion con clientes.",
    openAdmin: "Abrir Admin",
    openClient: "Abrir Portal Cliente",
    adminRole: "Acceso admin",
    clientRole: "Acceso cliente"
  }
} as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const role = (await getCurrentUserRole()) ?? "client";
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-6 py-8 md:py-10">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{c.dashboard}</p>
              <Badge variant="secondary">{role === "admin" ? c.adminRole : c.clientRole}</Badge>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{c.workspace}</h1>
              <p className="text-sm leading-6 text-muted-foreground">{c.workspaceDescription}</p>
            </div>
            <p className="text-sm font-medium">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {role === "admin" ? (
              <Link href="/dashboard/admin/overview" className="inline-flex rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                {c.openAdmin}
              </Link>
            ) : (
              <Link href="/dashboard/client" className="inline-flex rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                {c.openClient}
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <DashboardNav role={role} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
