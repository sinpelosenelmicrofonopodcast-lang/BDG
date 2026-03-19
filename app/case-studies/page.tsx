import Link from "next/link";
import { ArrowRight, ChartColumnBig } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const content = {
  en: {
    eyebrow: "Proof",
    title: "Selected growth outcomes",
    description: "Representative scenarios of how BDG packages bookings, leads and automation into a local growth platform.",
    cta: "Request walkthrough",
    items: [
      {
        name: "Barber booking system",
        result: "+118% online bookings in 90 days",
        stack: "Bookings, reminders, repeat-client promos",
        type: "Appointments"
      },
      {
        name: "HVAC lead engine",
        result: "+63% qualified leads",
        stack: "SEO architecture, forms, follow-up workflow",
        type: "Lead gen"
      },
      {
        name: "Podcast creator platform",
        result: "4x recurring revenue",
        stack: "Membership, dashboard, analytics",
        type: "Retention"
      }
    ]
  },
  es: {
    eyebrow: "Resultados",
    title: "Resultados de crecimiento seleccionados",
    description: "Escenarios representativos de como BDG empaqueta reservas, leads y automatizacion en una plataforma de crecimiento local.",
    cta: "Solicitar walkthrough",
    items: [
      {
        name: "Sistema de reservas para barberia",
        result: "+118% reservas online en 90 dias",
        stack: "Reservas, recordatorios, promos para clientes recurrentes",
        type: "Appointments"
      },
      {
        name: "Motor de leads HVAC",
        result: "+63% leads calificados",
        stack: "Arquitectura SEO, formularios, flujo de seguimiento",
        type: "Lead gen"
      },
      {
        name: "Plataforma para creator de podcast",
        result: "4x ingresos recurrentes",
        stack: "Membership, dashboard, analytics",
        type: "Retention"
      }
    ]
  }
} as const;

export default async function CaseStudiesPage() {
  const locale = await getServerLocale();
  const c = content[locale];

  return (
    <div className="container-shell space-y-8 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-5 md:grid-cols-3">
        {c.items.map((item) => (
          <Card key={item.name} className="h-full">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
                <Badge variant="secondary">{item.type}</Badge>
              </div>
              <CardTitle className="text-xl">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold text-primary">{item.result}</p>
              <p className="text-sm leading-6 text-muted-foreground">{item.stack}</p>
              <Button asChild variant="outline">
                <Link href="/contact">
                  {c.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
