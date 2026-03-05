import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteAcceptanceCard } from "@/components/dashboard/quote-acceptance-card";

const copy = {
  en: {
    proposal: "Proposal",
    status: "Status",
    client: "Client",
    plan: "Plan recommended",
    timeline: "Timeline",
    addons: "Add-ons",
    noAddons: "No add-ons selected",
    total: "Total",
    deposit: "Deposit required",
    expires: "Expires",
    paymentUnlocked: "Payment unlocked",
    awaitingAcceptance: "Awaiting acceptance",
    viewPdf: "View proposal PDF",
    noPdf: "PDF not generated yet."
  },
  es: {
    proposal: "Propuesta",
    status: "Estado",
    client: "Cliente",
    plan: "Plan recomendado",
    timeline: "Timeline",
    addons: "Add-ons",
    noAddons: "No hay add-ons seleccionados",
    total: "Total",
    deposit: "Depósito requerido",
    expires: "Expira",
    paymentUnlocked: "Pago habilitado",
    awaitingAcceptance: "Pendiente de aceptación",
    viewPdf: "Ver PDF de propuesta",
    noPdf: "Aún no se generó el PDF."
  }
} as const;

export default async function QuoteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = getSupabaseAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, quote_requests(business_name,email,phone), quote_documents(public_url,created_at)")
    .eq("id", id)
    .maybeSingle();

  if (!quote) {
    notFound();
  }

  const docs = Array.isArray(quote.quote_documents) ? quote.quote_documents : [];
  const addons = Array.isArray(quote.addons) ? quote.addons : [];

  return (
    <div className="container-shell grid gap-6 py-14 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>
            {c.proposal} #{quote.id.slice(0, 8)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {c.status}: {quote.status}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">{c.client}</p>
            <p>{quote.quote_requests?.business_name ?? "N/A"}</p>
            <p className="text-muted-foreground">{quote.quote_requests?.email ?? "N/A"}</p>
            <p className="text-muted-foreground">{quote.quote_requests?.phone ?? "N/A"}</p>
          </div>

          <div>
            <p className="font-semibold">{c.plan}</p>
            <p>{quote.recommended_plan}</p>
            <p className="text-muted-foreground">
              {c.timeline}: {quote.timeline}
            </p>
          </div>

          <div>
            <p className="font-semibold">{c.addons}</p>
            {addons.length === 0 ? <p className="text-muted-foreground">{c.noAddons}</p> : null}
            {addons.map((addon: unknown, index: number) => (
              <p key={index} className="text-muted-foreground">
                {typeof addon === "object" && addon && "name" in addon ? String(addon.name) : "Add-on"}
              </p>
            ))}
          </div>

          <div className="rounded-md border border-border p-3">
            <p>
              <strong>{c.total}:</strong> ${Number(quote.total).toFixed(0)}
            </p>
            <p>
              <strong>{c.deposit}:</strong> ${Number(quote.deposit_required).toFixed(0)}
            </p>
            {quote.expires_at ? (
              <p className="text-xs text-muted-foreground">
                {c.expires}: {formatDate(quote.expires_at)}
              </p>
            ) : null}
            <Badge variant={quote.payment_unlocked ? "success" : "warning"} className="mt-2">
              {quote.payment_unlocked ? c.paymentUnlocked : c.awaitingAcceptance}
            </Badge>
          </div>

          {docs[0]?.public_url ? (
            <Link href={docs[0].public_url} className="text-sm font-medium text-primary" target="_blank" rel="noreferrer">
              {c.viewPdf}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">{c.noPdf}</p>
          )}
        </CardContent>
      </Card>

      <QuoteAcceptanceCard quoteId={quote.id} paymentUnlocked={quote.payment_unlocked} />
    </div>
  );
}
