import { projectPlans } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { currency } from "@/lib/utils";

const copy = {
  en: {
    headers: {
      plan: "Plan",
      bestFor: "Best For",
      investment: "Investment",
      includes: "Includes"
    },
    descriptions: {
      "starter-local": "Food trucks, barbers, salons and small businesses.",
      "business-local": "Restaurants, travel agencies and local service operations.",
      "pro-local": "High-volume businesses needing full automation.",
      "realtors-dealers": "Realtors and dealers managing dynamic listings."
    },
    includes: {
      "starter-local": "Mobile page • Contact/call • Maps • Hosting",
      "business-local": "Starter + bookings/orders • Admin panel • Local SEO",
      "pro-local": "Business + dashboard • Database • Analytics • Promotions",
      "realtors-dealers": "Listings • Lead forms • Notifications • Listings panel"
    },
    setup: "setup",
    month: "/ month"
  },
  es: {
    headers: {
      plan: "Plan",
      bestFor: "Ideal para",
      investment: "Inversion",
      includes: "Incluye"
    },
    descriptions: {
      "starter-local": "Food trucks, barberos, esteticas y pequenos negocios.",
      "business-local": "Restaurantes, agencias de viajes y servicios locales.",
      "pro-local": "Negocios con mayor volumen que necesitan automatizacion completa.",
      "realtors-dealers": "Realtors y dealers con operacion de listings activa."
    },
    includes: {
      "starter-local": "Pagina movil • Contacto/llamada • Maps • Hosting",
      "business-local": "Starter + reservas/ordenes • Panel admin • SEO local",
      "pro-local": "Business + dashboard • Base de datos • Analytics • Promociones",
      "realtors-dealers": "Listings • Formularios lead • Notificaciones • Panel listings"
    },
    setup: "setup",
    month: "/ mes"
  }
} as const;

export function PlanComparison({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-secondary/60 text-left">
            <th className="px-4 py-3 font-semibold">{c.headers.plan}</th>
            <th className="px-4 py-3 font-semibold">{c.headers.bestFor}</th>
            <th className="px-4 py-3 font-semibold">{c.headers.investment}</th>
            <th className="px-4 py-3 font-semibold">{c.headers.includes}</th>
          </tr>
        </thead>
        <tbody>
          {projectPlans.map((plan) => (
            <tr key={plan.slug} className="border-t border-border">
              <td className="px-4 py-3 font-medium">{plan.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.descriptions[plan.slug]}</td>
              <td className="px-4 py-3">
                {currency(plan.setupFee)} {c.setup} + {currency(plan.priceMin)} {c.month}
              </td>
              <td className="px-4 py-3">{c.includes[plan.slug]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
