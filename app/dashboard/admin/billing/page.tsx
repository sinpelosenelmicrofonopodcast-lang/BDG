import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const copy = {
  en: {
    summary: "Billing summary",
    totalOutstanding: "Outstanding",
    pastDueInvoices: "Past due invoices",
    failedInvoices: "Failed invoices",
    projectBilling: "Project billing status",
    invoiceTimeline: "Invoice timeline",
    client: "Client",
    total: "Total",
    subscription: "Subscription",
    status: "Status",
    nextBilling: "Next billing",
    expiration: "Expiration",
    amount: "Amount",
    dueDate: "Due date",
    paidAt: "Paid at"
  },
  es: {
    summary: "Resumen de cobro",
    totalOutstanding: "Pendiente",
    pastDueInvoices: "Facturas vencidas",
    failedInvoices: "Facturas fallidas",
    projectBilling: "Estado de cobro por proyecto",
    invoiceTimeline: "Timeline de facturas",
    client: "Cliente",
    total: "Total",
    subscription: "Suscripcion",
    status: "Estado",
    nextBilling: "Proximo cobro",
    expiration: "Expiracion",
    amount: "Monto",
    dueDate: "Vence",
    paidAt: "Pagado"
  }
} as const;

export default async function AdminBillingPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const [{ data: projects }, { data: billingEvents }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,name,client_id,total_price,billing_status,service_status,next_billing_date,expiration_date,stripe_customer_id,stripe_subscription_id"
      )
      .order("updated_at", { ascending: false })
      .limit(120),
    supabase
      .from("billing_events")
      .select("id,client_id,project_id,status,amount,currency,due_date,paid_at,created_at")
      .order("created_at", { ascending: false })
      .limit(200)
  ]);

  const outstanding = (billingEvents ?? [])
    .filter((item) => item.status === "open" || item.status === "past_due" || item.status === "failed")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const pastDueCount = (billingEvents ?? []).filter((item) => item.status === "past_due").length;
  const failedCount = (billingEvents ?? []).filter((item) => item.status === "failed").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.totalOutstanding}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${outstanding.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.pastDueInvoices}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pastDueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.failedInvoices}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.projectBilling}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(projects ?? []).map((project) => (
              <div key={project.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.client}: {project.client_id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.total}: ${project.total_price ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.subscription}: {project.stripe_subscription_id ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.nextBilling}: {project.next_billing_date ? formatDate(project.next_billing_date) : "-"} • {c.expiration}: {project.expiration_date ? formatDate(project.expiration_date) : "-"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={project.billing_status === "current" ? "success" : "warning"}>{project.billing_status ?? "current"}</Badge>
                  <Badge variant={project.service_status === "active" ? "secondary" : "warning"}>{project.service_status ?? "active"}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.invoiceTimeline}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(billingEvents ?? []).map((event) => (
              <div key={event.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{event.status}</p>
                <p className="text-xs text-muted-foreground">
                  {c.amount}: ${Number(event.amount).toFixed(0)} {event.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.dueDate}: {event.due_date ? formatDate(event.due_date) : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.paidAt}: {event.paid_at ? formatDate(event.paid_at) : "-"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
