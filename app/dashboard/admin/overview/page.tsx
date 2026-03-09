import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const copy = {
  en: {
    clients: "Clients",
    projects: "Projects",
    openTickets: "Open tickets",
    pendingQuotes: "Pending quotes",
    pastDueProjects: "Past due projects",
    suspendedProjects: "Suspended projects",
    openAlerts: "Open alerts",
    expirations: "Upcoming expirations",
    recentTickets: "Recent tickets"
  },
  es: {
    clients: "Clientes",
    projects: "Proyectos",
    openTickets: "Tickets abiertos",
    pendingQuotes: "Cotizaciones pendientes",
    pastDueProjects: "Proyectos vencidos",
    suspendedProjects: "Proyectos suspendidos",
    openAlerts: "Alertas abiertas",
    expirations: "Proximas expiraciones",
    recentTickets: "Tickets recientes"
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
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.clients}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clientsCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.projects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projectsCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.openTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openTickets ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.pendingQuotes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingQuotes ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.pastDueProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pastDueProjects ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.suspendedProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{suspendedProjects ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.openAlerts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openAlerts ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.expirations}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(expirations ?? []).map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
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
          <CardContent className="space-y-2 text-sm">
            {(recentTickets ?? []).map((ticket) => (
              <div key={ticket.id} className="rounded-md border border-border p-3">
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
