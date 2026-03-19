import {
  AlertTriangle,
  Clock3,
  FileText,
  FolderKanban,
  Ticket,
  Users
} from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const copy = {
  en: {
    eyebrow: "Admin overview",
    title: "Operational health snapshot",
    description: "Quick visibility into client volume, delivery risk, unresolved support and pending sales work.",
    clients: "Clients",
    projects: "Projects",
    openTickets: "Open tickets",
    pendingQuotes: "Pending quotes",
    pastDueProjects: "Past due projects",
    suspendedProjects: "Suspended projects",
    openAlerts: "Open alerts",
    expirations: "Upcoming expirations",
    recentTickets: "Recent tickets",
    noExpirations: "No upcoming expirations.",
    noExpirationsBody: "Projects with expiration windows will appear here when they get close.",
    noTickets: "No recent tickets.",
    noTicketsBody: "Support activity will appear here as soon as new tickets come in."
  },
  es: {
    eyebrow: "Resumen admin",
    title: "Snapshot de salud operativa",
    description: "Visibilidad rapida sobre volumen de clientes, riesgo de entrega, soporte sin resolver y trabajo comercial pendiente.",
    clients: "Clientes",
    projects: "Proyectos",
    openTickets: "Tickets abiertos",
    pendingQuotes: "Cotizaciones pendientes",
    pastDueProjects: "Proyectos vencidos",
    suspendedProjects: "Proyectos suspendidos",
    openAlerts: "Alertas abiertas",
    expirations: "Proximas expiraciones",
    recentTickets: "Tickets recientes",
    noExpirations: "No hay expiraciones proximas.",
    noExpirationsBody: "Los proyectos con fecha de expiracion apareceran aqui cuando esten cerca.",
    noTickets: "No hay tickets recientes.",
    noTicketsBody: "La actividad de soporte aparecera aqui cuando entren nuevos tickets."
  }
} as const;

export default async function AdminOverviewPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: openTickets },
    { count: pendingQuotes },
    { count: pastDueProjects },
    { count: suspendedProjects },
    { count: openAlerts },
    { data: expirations },
    { data: recentTickets }
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabase.from("quotes").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase.from("projects").select("id", { count: "exact", head: true }).in("billing_status", ["past_due", "unpaid"]),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("service_status", "suspended"),
    supabase.from("admin_alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("projects")
      .select("id,name,expiration_date,service_status,billing_status")
      .not("expiration_date", "is", null)
      .order("expiration_date", { ascending: true })
      .limit(10),
    supabase.from("tickets").select("id,subject,status,type,created_at").order("created_at", { ascending: false }).limit(10)
  ]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label={c.clients} value={clientsCount ?? 0} icon={Users} />
        <DashboardStatCard label={c.projects} value={projectsCount ?? 0} icon={FolderKanban} />
        <DashboardStatCard label={c.openTickets} value={openTickets ?? 0} icon={Ticket} tone="warning" />
        <DashboardStatCard label={c.pendingQuotes} value={pendingQuotes ?? 0} icon={FileText} />
        <DashboardStatCard label={c.pastDueProjects} value={pastDueProjects ?? 0} icon={Clock3} tone="warning" />
        <DashboardStatCard label={c.suspendedProjects} value={suspendedProjects ?? 0} icon={AlertTriangle} tone="warning" />
        <DashboardStatCard label={c.openAlerts} value={openAlerts ?? 0} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.expirations}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(expirations ?? []).length === 0 ? <EmptyState title={c.noExpirations} description={c.noExpirationsBody} compact icon={Clock3} /> : null}
            {(expirations ?? []).map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.service_status} • {project.billing_status}
                  </p>
                </div>
                <Badge variant="warning">{project.expiration_date ? formatDate(project.expiration_date) : "N/A"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.recentTickets}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(recentTickets ?? []).length === 0 ? <EmptyState title={c.noTickets} description={c.noTicketsBody} compact icon={Ticket} /> : null}
            {(recentTickets ?? []).map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-border p-4">
                <p className="font-medium">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {ticket.type} • {ticket.status} • {formatDate(ticket.created_at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
