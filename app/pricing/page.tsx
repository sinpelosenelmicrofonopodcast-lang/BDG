import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { PricingAnalyticsTracker } from "@/components/marketing/pricing-analytics-tracker";

const copy = {
  en: {
    eyebrow: "Pricing",
    title: "Project plans and retainers",
    description: "Transparent ranges, clear deliverables and options to start fast or scale.",
    compareEyebrow: "Comparison",
    compareTitle: "Find your best fit in 60 seconds"
  },
  es: {
    eyebrow: "Precios",
    title: "Planes de proyecto y retainers",
    description: "Rangos transparentes, entregables claros y opciones para lanzar rápido o escalar.",
    compareEyebrow: "Comparador",
    compareTitle: "Encuentra tu plan ideal en 60 segundos"
  }
} as const;

export default async function PricingPage() {
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-10 py-14">
      <PricingAnalyticsTracker />
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <PricingCards locale={locale} />
      <SectionTitle eyebrow={c.compareEyebrow} title={c.compareTitle} />
      <PlanComparison locale={locale} />
    </div>
  );
}
