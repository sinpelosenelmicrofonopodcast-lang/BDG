import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: {
    projectBilling: "Project billing",
    quoteReadiness: "Quote billing readiness",
    client: "Client",
    total: "Total",
    customer: "Customer",
    subscription: "Subscription",
    expiration: "Expiration",
    status: "Status",
    deposit: "Deposit",
    paymentUnlocked: "Payment unlocked"
  },
  es: {
    projectBilling: "Facturación de proyectos",
    quoteReadiness: "Estado de cobro en cotizaciones",
    client: "Cliente",
    total: "Total",
    customer: "Customer",
    subscription: "Suscripción",
    expiration: "Expira",
    status: "Estado",
    deposit: "Depósito",
    paymentUnlocked: "Pago habilitado"
  }
} as const;

export default async function AdminBillingPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();
  const [{ data: projects }, { data: quotes }] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,client_id,stripe_customer_id,stripe_subscription_id,total_price,expiration_date,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase.from("quotes").select("id,status,total,deposit_required,payment_unlocked,updated_at").order("updated_at", { ascending: false }).limit(50)
  ]);

  return (
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
                {c.customer}: {project.stripe_customer_id ?? "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.subscription}: {project.stripe_subscription_id ?? "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.expiration}: {project.expiration_date ? formatDate(project.expiration_date) : "-"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{c.quoteReadiness}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(quotes ?? []).map((quote) => (
            <div key={quote.id} className="rounded-md border border-border p-3">
              <p className="font-semibold">Quote #{quote.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">
                {c.status}: {quote.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.total} ${Number(quote.total).toFixed(0)} • {c.deposit} ${Number(quote.deposit_required).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.paymentUnlocked}: {quote.payment_unlocked ? "yes" : "no"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
