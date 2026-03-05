import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminQuoteActions } from "@/components/dashboard/admin-quote-actions";

const copy = {
  en: {
    incoming: "Incoming quote requests",
    quotes: "Quotes",
    budget: "Budget",
    total: "Total",
    deposit: "Deposit",
    paymentUnlocked: "Payment unlocked"
  },
  es: {
    incoming: "Solicitudes de cotización",
    quotes: "Cotizaciones",
    budget: "Presupuesto",
    total: "Total",
    deposit: "Depósito",
    paymentUnlocked: "Pago habilitado"
  }
} as const;

export default async function AdminQuotesPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const [{ data: quoteRequests }, { data: quotes }] = await Promise.all([
    supabase.from("quote_requests").select("id,business_name,email,budget,industry,status,created_at").order("created_at", { ascending: false }).limit(20),
    supabase
      .from("quotes")
      .select("id,status,recommended_plan,total,deposit_required,payment_unlocked,quote_request_id,created_at")
      .order("created_at", { ascending: false })
      .limit(30)
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{c.incoming}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(quoteRequests ?? []).map((request) => (
            <div key={request.id} className="rounded-md border border-border p-3">
              <p className="font-semibold">{request.business_name}</p>
              <p className="text-xs text-muted-foreground">{request.email}</p>
              <p className="text-xs text-muted-foreground">
                {c.budget} ${request.budget} • {request.industry} • {request.status}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(request.created_at)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{c.quotes}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(quotes ?? []).map((quote) => (
            <div key={quote.id} className="space-y-3 rounded-md border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Quote #{quote.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{quote.recommended_plan}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={quote.status === "accepted" ? "success" : "secondary"}>{quote.status}</Badge>
                  {quote.payment_unlocked ? <Badge variant="warning">{c.paymentUnlocked}</Badge> : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {c.total} ${Number(quote.total).toFixed(0)} • {c.deposit} ${Number(quote.deposit_required).toFixed(0)} • {formatDate(quote.created_at)}
              </p>
              <AdminQuoteActions quoteId={quote.id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
