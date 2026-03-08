import Link from "next/link";
import { addonCatalog } from "@/lib/constants";
import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { PricingAnalyticsTracker } from "@/components/marketing/pricing-analytics-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: {
    eyebrow: "Pricing",
    title: "Pricing for Local Businesses",
    description: "Clear setup + monthly plans designed to help local businesses get more clients.",
    addOnsEyebrow: "Add-ons",
    addOnsTitle: "Add-ons to accelerate growth",
    addOnsDescription: "You can combine these add-ons with any plan.",
    subscription: "Subscription",
    oneTime: "One-time",
    request: "Request add-on",
    month: "/ month",
    compareEyebrow: "Comparison",
    compareTitle: "Compare plans quickly"
  },
  es: {
    eyebrow: "Precios",
    title: "Pricing para Negocios Locales",
    description: "Planes claros de setup + mensual para ayudar a negocios locales a recibir mas clientes.",
    addOnsEyebrow: "Add-ons",
    addOnsTitle: "Add-ons para acelerar crecimiento",
    addOnsDescription: "Puedes combinar estos add-ons con cualquier plan.",
    subscription: "Suscripcion",
    oneTime: "Pago unico",
    request: "Solicitar add-on",
    month: "/ mes",
    compareEyebrow: "Comparador",
    compareTitle: "Compara planes rapidamente"
  }
} as const;

export default async function PricingPage() {
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-10 py-14">
      <PricingAnalyticsTracker />

      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <PricingCards locale={locale} showBottomNote />

      <SectionTitle eyebrow={c.addOnsEyebrow} title={c.addOnsTitle} description={c.addOnsDescription} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {addonCatalog.map((addon) => (
          <Card key={addon.slug}>
            <CardHeader>
              <CardTitle>{addon.name}</CardTitle>
              <p className="text-lg font-bold">
                ${addon.priceMin}
                {addon.billingType === "subscription" ? ` ${c.month}` : ""}
              </p>
              <Badge variant={addon.billingType === "subscription" ? "warning" : "secondary"}>
                {addon.billingType === "subscription" ? c.subscription : c.oneTime}
              </Badge>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/contact">{c.request}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionTitle eyebrow={c.compareEyebrow} title={c.compareTitle} />
      <PlanComparison locale={locale} />
    </div>
  );
}
