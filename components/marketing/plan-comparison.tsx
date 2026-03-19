import { projectPlans } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { cn, currency } from "@/lib/utils";

const copy = {
  en: {
    headers: {
      plan: "Plan",
      bestFor: "Best for",
      investment: "Investment",
      includes: "Growth system"
    },
    descriptions: {
      "starter-local": "Food trucks, barbers, salons and small businesses that need a conversion-ready presence.",
      "business-local": "Restaurants, salons, travel agencies and local services automating bookings or orders.",
      "pro-local": "Growth-stage operations that need client data, campaigns and a complete dashboard.",
      "realtors-dealers": "Realtors, dealers and local marketplaces with active listings or inventory."
    },
    includes: {
      "starter-local": "Mobile page, direct contact, maps, hosting and simple contact panel",
      "business-local": "Starter plus bookings or orders, confirmations, admin panel and local SEO",
      "pro-local": "Business plus client dashboard, database, analytics and automated promotions",
      "realtors-dealers": "Listings, lead forms, lead alerts and listings control panel"
    },
    setup: "setup",
    month: "/ month"
  },
  es: {
    headers: {
      plan: "Plan",
      bestFor: "Ideal para",
      investment: "Inversion",
      includes: "Sistema de crecimiento"
    },
    descriptions: {
      "starter-local": "Food trucks, barberos, esteticas y negocios pequenos que necesitan presencia enfocada en conversion.",
      "business-local": "Restaurantes, esteticas, agencias de viaje y servicios locales que automatizan reservas o pedidos.",
      "pro-local": "Negocios en crecimiento que necesitan datos, campanas y dashboard completo del negocio.",
      "realtors-dealers": "Realtors, dealers y marketplaces locales con inventario o listings activos."
    },
    includes: {
      "starter-local": "Pagina movil, contacto directo, maps, hosting y panel simple de contacto",
      "business-local": "Starter mas reservas o pedidos, confirmaciones, panel admin y SEO local",
      "pro-local": "Business mas dashboard de clientes, base de datos, analytics y promociones automaticas",
      "realtors-dealers": "Listings, formularios de lead, alertas de clientes y panel de control de inventario"
    },
    setup: "setup",
    month: "/ mes"
  }
} as const;

export function PlanComparison({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-secondary/70 text-left">
              <th className="px-5 py-4 font-semibold">{c.headers.plan}</th>
              <th className="px-5 py-4 font-semibold">{c.headers.bestFor}</th>
              <th className="px-5 py-4 font-semibold">{c.headers.investment}</th>
              <th className="px-5 py-4 font-semibold">{c.headers.includes}</th>
            </tr>
          </thead>
          <tbody>
            {projectPlans.map((plan) => (
              <tr
                key={plan.slug}
                className={cn("border-t border-border align-top", plan.popular && "bg-[hsl(var(--accent))/0.65]")}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.popular ? (
                      <span className="rounded-full bg-[hsl(var(--warning-soft))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--warning))]">
                        {locale === "es" ? "Mas vendido" : "Best Seller"}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4 leading-6 text-muted-foreground">{c.descriptions[plan.slug]}</td>
                <td className="px-5 py-4">
                  <span className="font-semibold">{currency(plan.setupFee)}</span> {c.setup} +{" "}
                  <span className="font-semibold">{currency(plan.priceMin)}</span> {c.month}
                </td>
                <td className="px-5 py-4 leading-6">{c.includes[plan.slug]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
