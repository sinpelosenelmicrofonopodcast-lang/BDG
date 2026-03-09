import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminAlertActions } from "@/components/dashboard/admin-alert-actions";

const copy = {
  en: {
    title: "Internal alerts",
    open: "Open",
    resolved: "Resolved",
    empty: "No alerts"
  },
  es: {
    title: "Alertas internas",
    open: "Abiertas",
    resolved: "Resueltas",
    empty: "Sin alertas"
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
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{c.open}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {openAlerts.map((alert) => (
            <div key={alert.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{alert.title}</p>
                <Badge variant={alert.severity === "critical" || alert.severity === "high" ? "warning" : "secondary"}>{alert.severity}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {alert.alert_type} • {formatDate(alert.created_at)}
              </p>
              {alert.message ? <p className="mt-2">{alert.message}</p> : null}
              <div className="mt-2">
                <AdminAlertActions alertId={alert.id} currentStatus="open" />
              </div>
            </div>
          ))}
          {openAlerts.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{c.resolved}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {resolvedAlerts.map((alert) => (
            <div key={alert.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{alert.title}</p>
                <Badge variant="secondary">{alert.severity}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {alert.alert_type} • {formatDate(alert.created_at)}
              </p>
              {alert.message ? <p className="mt-2">{alert.message}</p> : null}
              <div className="mt-2">
                <AdminAlertActions alertId={alert.id} currentStatus="resolved" />
              </div>
            </div>
          ))}
          {resolvedAlerts.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
