import { getServerLocale } from "@/lib/i18n/server";
import { NameYourPlanWizard } from "@/components/name-your-plan/wizard";
import { SectionTitle } from "@/components/marketing/section-title";

const copy = {
  en: {
    eyebrow: "Flexible budget",
    title: "Name your plan",
    description: "Tell us your budget, industry and needs. We convert it into a feasible roadmap."
  },
  es: {
    eyebrow: "Presupuesto flexible",
    title: "Nombra tu plan",
    description: "Cuéntanos presupuesto, industria y necesidades. Lo convertimos en un roadmap viable."
  }
} as const;

export default async function NameYourPlanPage() {
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-8 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <NameYourPlanWizard />
    </div>
  );
}
