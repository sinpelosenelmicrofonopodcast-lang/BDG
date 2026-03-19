import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminAlertActions } from "@/components/dashboard/admin-alert-actions";
import { EmptyState } from "@/components/ui/empty-state";

const copy = {
  en: {
    eyebrow: "Monitoring",
    title: "Internal alerts",
    description: "Track urgent internal issues and close the ones that are already resolved.",
    open: "Open",
    resolved: "Resolved",
    empty: "No alerts",
    emptyBody: "When the system creates internal warnings, they will appear here."
  },
  es: {
    eyebrow: "Monitoreo",
    title: "Alertas internas",
    description: "Sigue incidencias internas urgentes y cierra las que ya quedaron resueltas.",
    open: "Abiertas",
    resolved: "Resueltas",
    empty: "Sin alertas",
    emptyBody: "Cuando el sistema genere alertas internas, apareceran aqui."
  }
} as const;

export default async function AdminAlertsPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const { data: alerts } = await supabase
    .from("admin_alerts")
    .select("id,title,message,severity,status,alert_type,created_at")
    .order("created_at", { ascending: false })
    .limit(150);

  const openAlerts = (alerts ?? []).filter((alert) => alert.status === "open");
  const resolvedAlerts = (alerts ?? []).filter((alert) => alert.status === "resolved");

  return (
    <div className="space-y-6">
      <DashboardPageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.open}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {openAlerts.length === 0 ? <EmptyState title={c.empty} description={c.emptyBody} compact /> : null}
            {openAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant={alert.severity === "critical" || alert.severity === "high" ? "warning" : "secondary"}>{alert.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.alert_type} • {formatDate(alert.created_at)}
                </p>
                {alert.message ? <p className="mt-2 leading-6">{alert.message}</p> : null}
                <div className="mt-3">
                  <AdminAlertActions alertId={alert.id} currentStatus="open" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.resolved}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {resolvedAlerts.length === 0 ? <EmptyState title={c.empty} description={c.emptyBody} compact /> : null}
            {resolvedAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant="secondary">{alert.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.alert_type} • {formatDate(alert.created_at)}
                </p>
                {alert.message ? <p className="mt-2 leading-6">{alert.message}</p> : null}
                <div className="mt-3">
                  <AdminAlertActions alertId={alert.id} currentStatus="resolved" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
