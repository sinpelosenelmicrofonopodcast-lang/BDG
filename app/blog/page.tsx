import Link from "next/link";
import { ArrowRight, NotebookText } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const content = {
  en: {
    eyebrow: "Insights",
    title: "Playbooks for local growth systems",
    description: "Short strategic notes on automation, conversion flows and operations for local businesses.",
    cta: "Request demo",
    items: [
      {
        title: "From brochure site to customer system",
        excerpt: "How local businesses move from a passive website to a workflow that captures, qualifies and follows up automatically.",
        tag: "Conversion"
      },
      {
        title: "What a useful client dashboard should actually show",
        excerpt: "The minimum visibility needed for bookings, messages, campaigns and repeat-customer actions without bloating the UI.",
        tag: "Product"
      },
      {
        title: "When to add SEO, ads and automation together",
        excerpt: "How to decide if your growth stack should stay lean or shift into a bundled acquisition system.",
        tag: "Growth"
      }
    ]
  },
  es: {
    eyebrow: "Insights",
    title: "Playbooks para sistemas de crecimiento local",
    description: "Notas cortas sobre automatizacion, conversion y operacion para negocios locales.",
    cta: "Solicitar demo",
    items: [
      {
        title: "De sitio brochure a sistema de clientes",
        excerpt: "Como pasar de una web pasiva a un flujo que capta, califica y da seguimiento automaticamente.",
        tag: "Conversion"
      },
      {
        title: "Que deberia mostrar un dashboard realmente util",
        excerpt: "La visibilidad minima necesaria para reservas, mensajes, campanas y acciones sobre clientes recurrentes sin saturar el UI.",
        tag: "Producto"
      },
      {
        title: "Cuando activar SEO, ads y automatizacion juntos",
        excerpt: "Como decidir si tu stack de crecimiento debe seguir simple o pasar a un sistema de adquisicion empaquetado.",
        tag: "Growth"
      }
    ]
  }
} as const;

export default async function BlogPage() {
  const locale = await getServerLocale();
  const c = content[locale];

  return (
    <div className="container-shell space-y-8 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-5 md:grid-cols-3">
        {c.items.map((item) => (
          <Card key={item.title} className="h-full">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <NotebookText className="h-5 w-5" />
                </div>
                <Badge variant="secondary">{item.tag}</Badge>
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
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
