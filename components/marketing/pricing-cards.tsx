import Link from "next/link";
import { Check } from "lucide-react";
import { projectPlans, retainerPlans } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { currency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const planCopy = {
  en: {
    headerRetainers: "Retainers",
    quoteCta: "Get Quote",
    requestQuoteOnly: "Request quote",
    mostSold: "Most Sold",
    month: "/ month",
    descriptions: {
      "starter-landing": "Ideal to launch fast and start selling from one conversion page.",
      "business-website": "Professional website for companies ready to scale client acquisition.",
      "small-business-quote": "Flexible small-business plan, quoted based on real scope and priorities.",
      "growth-system": "Conversion system with automations and operational visibility.",
      "app-platform": "Digital product with login, roles, payments and integrations.",
      enterprise: "Enterprise architecture and roadmap tailored to your operation.",
      "care-plan": "Monthly technical maintenance and monitoring.",
      "seo-growth": "Organic growth retainer focused on lead generation.",
      "automation-crm": "Automate sales follow-up and pipeline execution."
    },
    features: {
      "starter-landing": ["1 page", "WhatsApp", "Lead form", "Basic SEO", "Responsive", "Basic tracking"],
      "business-website": ["5-8 pages", "Technical SEO", "Performance", "Optional blog", "Analytics"],
      "small-business-quote": ["Scope by need", "Phased roadmap", "Conversion-first approach", "Modular execution"],
      "growth-system": ["Premium website", "Booking", "Simple CRM", "Automations", "Basic dashboard"],
      "app-platform": ["Login", "Roles", "Admin dashboard", "Payments", "Integrations"],
      enterprise: ["Custom quote", "Dedicated architecture", "Priority support"],
      "care-plan": ["Maintenance", "Backups", "Monthly support"],
      "seo-growth": ["Technical SEO", "Content", "Monthly report"],
      "automation-crm": ["CRM", "Automations", "Funnel optimization"]
    }
  },
  es: {
    headerRetainers: "Retainers",
    quoteCta: "Cotizar",
    requestQuoteOnly: "Solicitar quote",
    mostSold: "Más vendido",
    month: "/ mes",
    descriptions: {
      "starter-landing": "Ideal para lanzar rápido y vender desde una sola página.",
      "business-website": "Sitio profesional para empresas que quieren escalar clientes.",
      "small-business-quote": "Plan flexible para pequeños negocios, cotizado según necesidad real.",
      "growth-system": "Sistema de conversión con automatizaciones y control comercial.",
      "app-platform": "Producto digital con login, roles, pagos e integraciones.",
      enterprise: "Arquitectura enterprise y roadmap a medida.",
      "care-plan": "Mantenimiento técnico mensual y monitoreo.",
      "seo-growth": "Retainer de crecimiento orgánico orientado a leads.",
      "automation-crm": "Automatiza ventas, seguimiento y pipeline."
    },
    features: {
      "starter-landing": ["1 página", "WhatsApp", "Formulario", "SEO básico", "Responsive", "Tracking básico"],
      "business-website": ["5-8 páginas", "SEO técnico", "Performance", "Blog opcional", "Analytics"],
      "small-business-quote": ["Scope por necesidad", "Roadmap por fases", "Prioridad a conversión", "Implementación modular"],
      "growth-system": ["Web premium", "Booking", "CRM simple", "Automations", "Dashboard básico"],
      "app-platform": ["Login", "Roles", "Dashboard admin", "Pagos", "Integraciones"],
      enterprise: ["Cotización personalizada", "Arquitectura dedicada", "Soporte prioritario"],
      "care-plan": ["Mantenimiento", "Backups", "Soporte mensual"],
      "seo-growth": ["SEO técnico", "Contenido", "Reporte mensual"],
      "automation-crm": ["CRM", "Automations", "Optimización funnel"]
    }
  }
} as const;

function renderPrice(min: number, max: number, suffix?: string) {
  if (max <= min) {
    return `${currency(min)}${suffix ? ` ${suffix}` : ""}`;
  }

  return `${currency(min)} - ${currency(max)}${suffix ? ` ${suffix}` : ""}`;
}

function shouldHidePrice(priceMin: number, priceMax: number, billingType: string) {
  if (billingType === "quote_only") {
    return true;
  }

  return priceMin >= 5000 || priceMax >= 5000;
}

export function PricingCards({ locale }: { locale: Locale }) {
  const c = planCopy[locale];

  return (
    <div className="space-y-10">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projectPlans.map((plan) => {
          const quoteOnly = shouldHidePrice(plan.priceMin, plan.priceMax, plan.billingType);

          return (
            <Card key={plan.slug} className="relative overflow-hidden">
              {plan.popular ? <Badge className="absolute right-4 top-4">{c.mostSold}</Badge> : null}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-bold">
                  {quoteOnly ? c.requestQuoteOnly : renderPrice(plan.priceMin, plan.priceMax)}
                </p>
                <p className="text-sm text-muted-foreground">{c.descriptions[plan.slug]}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {c.features[plan.slug].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild className="w-full">
                  <Link href="/contact">{c.quoteCta}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div>
        <h3 className="mb-4 font-heading text-2xl font-bold">{c.headerRetainers}</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {retainerPlans.map((plan) => (
            <Card key={plan.slug}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-xl font-bold">{renderPrice(plan.priceMin, plan.priceMax, c.month)}</p>
                <p className="text-sm text-muted-foreground">{c.descriptions[plan.slug]}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {c.features[plan.slug].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
