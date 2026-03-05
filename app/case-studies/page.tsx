import { ArrowUpRight } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const caseStudiesByLocale = {
  en: [
    {
      name: "Barber Chain Booking Funnel",
      result: "+118% online bookings in 90 days",
      stack: "Next.js, Supabase, Stripe"
    },
    {
      name: "HVAC Lead Engine",
      result: "+63% qualified leads",
      stack: "SEO architecture + CRM automation"
    },
    {
      name: "Podcast Creator Platform",
      result: "4x recurring revenue",
      stack: "Membership + dashboard + analytics"
    }
  ],
  es: [
    {
      name: "Funnel de reservas para cadena de barberías",
      result: "+118% reservas online en 90 días",
      stack: "Next.js, Supabase, Stripe"
    },
    {
      name: "Motor de leads HVAC",
      result: "+63% leads calificados",
      stack: "Arquitectura SEO + automatización CRM"
    },
    {
      name: "Plataforma para creator de podcast",
      result: "4x ingresos recurrentes",
      stack: "Membership + dashboard + analytics"
    }
  ]
} as const;

const copy = {
  en: {
    eyebrow: "Proof",
    title: "Case studies",
    description: "Real growth outcomes from web and app projects.",
    details: "View details"
  },
  es: {
    eyebrow: "Resultados",
    title: "Casos de estudio",
    description: "Resultados reales de crecimiento en proyectos web y app.",
    details: "Ver detalles"
  }
} as const;

export default async function CaseStudiesPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const caseStudies = caseStudiesByLocale[locale];

  return (
    <div className="container-shell space-y-8 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="grid gap-5 md:grid-cols-3">
        {caseStudies.map((item) => (
          <Card key={item.name}>
            <CardHeader>
              <CardTitle className="text-xl">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold text-primary">{item.result}</p>
              <p className="text-sm text-muted-foreground">{item.stack}</p>
              <button className="inline-flex items-center text-sm font-medium text-foreground">
                {c.details} <ArrowUpRight className="ml-1 h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
