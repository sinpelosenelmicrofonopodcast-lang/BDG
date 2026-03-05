import { projectPlans } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    headers: {
      plan: "Plan",
      bestFor: "Best For",
      range: "Range",
      includes: "Includes"
    },
    descriptions: {
      "starter-landing": "Fast launch for first digital sales.",
      "business-website": "Service businesses scaling lead generation.",
      "small-business-quote": "Small businesses needing a tailored quote based on priorities.",
      "growth-system": "Companies optimizing sales operations.",
      "app-platform": "Teams building internal or client-facing software.",
      enterprise: "Complex operations with custom architecture."
    },
    includes: {
      "starter-landing": "1 page • WhatsApp • Basic SEO",
      "business-website": "5-8 pages • SEO • Analytics",
      "small-business-quote": "Custom scope • Phased roadmap • Modular build",
      "growth-system": "Premium web • Booking • CRM",
      "app-platform": "Login • Roles • Payments",
      enterprise: "Custom scope • Architecture • Priority support"
    },
    requestQuote: "Request quote"
  },
  es: {
    headers: {
      plan: "Plan",
      bestFor: "Ideal para",
      range: "Rango",
      includes: "Incluye"
    },
    descriptions: {
      "starter-landing": "Lanzamiento rápido para primeras ventas digitales.",
      "business-website": "Negocios de servicios que escalan leads.",
      "small-business-quote": "Pequeños negocios que necesitan cotización a medida según prioridades.",
      "growth-system": "Empresas optimizando operación comercial.",
      "app-platform": "Equipos construyendo software interno o para clientes.",
      enterprise: "Operaciones complejas con arquitectura personalizada."
    },
    includes: {
      "starter-landing": "1 página • WhatsApp • SEO básico",
      "business-website": "5-8 páginas • SEO • Analytics",
      "small-business-quote": "Scope personalizado • Roadmap por fases • Build modular",
      "growth-system": "Web premium • Booking • CRM",
      "app-platform": "Login • Roles • Pagos",
      enterprise: "Scope custom • Arquitectura • Soporte prioritario"
    },
    requestQuote: "Solicitar quote"
  }
} as const;

function shouldHidePrice(priceMin: number, priceMax: number, billingType: string) {
  if (billingType === "quote_only") {
    return true;
  }

  return priceMin >= 5000 || priceMax >= 5000;
}

export function PlanComparison({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-secondary/60 text-left">
            <th className="px-4 py-3 font-semibold">{c.headers.plan}</th>
            <th className="px-4 py-3 font-semibold">{c.headers.bestFor}</th>
            <th className="px-4 py-3 font-semibold">{c.headers.range}</th>
            <th className="px-4 py-3 font-semibold">{c.headers.includes}</th>
          </tr>
        </thead>
        <tbody>
          {projectPlans.map((plan) => {
            const quoteOnly = shouldHidePrice(plan.priceMin, plan.priceMax, plan.billingType);

            return (
              <tr key={plan.slug} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{plan.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.descriptions[plan.slug]}</td>
                <td className="px-4 py-3">{quoteOnly ? c.requestQuote : `$${plan.priceMin} - $${plan.priceMax}`}</td>
                <td className="px-4 py-3">{c.includes[plan.slug]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
