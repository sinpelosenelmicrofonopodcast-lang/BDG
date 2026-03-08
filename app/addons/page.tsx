import Link from "next/link";
import { addonCatalog } from "@/lib/constants";
import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: {
    eyebrow: "Add-ons",
    title: "Growth Add-ons for Local Businesses",
    description: "Extra modules you can activate based on your current growth stage.",
    subscription: "Subscription",
    oneTime: "One-time",
    request: "Request add-on",
    month: "/ month"
  },
  es: {
    eyebrow: "Add-ons",
    title: "Add-ons de Crecimiento para Negocios Locales",
    description: "Modulos extra que puedes activar segun la etapa de tu negocio.",
    subscription: "Suscripcion",
    oneTime: "Pago unico",
    request: "Solicitar add-on",
    month: "/ mes"
  }
} as const;

export default async function AddonsPage() {
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-10 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />

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
    </div>
  );
}
