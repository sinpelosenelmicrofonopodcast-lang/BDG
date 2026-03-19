import { getServerLocale } from "@/lib/i18n/server";
import { NameYourPlanWizard } from "@/components/name-your-plan/wizard";
import { SectionTitle } from "@/components/marketing/section-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: {
    eyebrow: "Flexible budget",
    title: "Name your plan",
    description: "Tell us your budget, industry and needs. We convert it into a realistic roadmap for launch and growth.",
    sideTitle: "What you will get",
    sideItems: [
      "Plan recommendation based on your budget",
      "Suggested growth system for your business type",
      "Clear starting scope without overbuilding",
      "Fast handoff to pricing and launch"
    ]
  },
  es: {
    eyebrow: "Presupuesto flexible",
    title: "Nombra tu plan",
    description: "Cuentanos presupuesto, industria y necesidades. Lo convertimos en un roadmap realista para lanzar y crecer.",
    sideTitle: "Lo que vas a recibir",
    sideItems: [
      "Recomendacion de plan segun tu presupuesto",
      "Sistema de crecimiento sugerido para tu tipo de negocio",
      "Scope inicial claro sin sobredisenar",
      "Transicion rapida hacia pricing y lanzamiento"
    ]
  }
} as const;

export default async function NameYourPlanPage() {
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell space-y-8 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <NameYourPlanWizard />
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{c.sideTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {c.sideItems.map((item) => (
              <div key={item} className="rounded-xl border border-border/80 bg-secondary/35 px-4 py-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
