import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Bot, Layers, Rocket, ShieldCheck } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/marketing/section-title";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { FaqSection } from "@/components/marketing/faq-section";
import { LeadMagnetForm } from "@/components/marketing/lead-magnet-form";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";

const copy = {
  en: {
    badge: "Digital Agency SaaS Platform",
    title: "Build, sell and scale digital services with one platform.",
    subtitle:
      "Sell clear plans, collect payments, generate proposals, run projects and keep clients in one secure SaaS workflow.",
    getQuote: "Get Quote",
    namePlan: "Name Your Plan",
    whatsapp: "WhatsApp",
    resultsTitle: "Results-first growth stack",
    leadLift: "Average lead lift in 90 days",
    launchSpeed: "Typical launch speed",
    retention: "Client retention with Care Plan",
    auditTitle: "Audit Express Free",
    auditText: "Receive a tactical report with conversion opportunities in under 24h.",
    servicesEyebrow: "Services",
    servicesTitle: "Everything you need to sell and deliver digital projects",
    plansEyebrow: "Plans",
    plansTitle: "Clear plans optimized for conversion",
    compareEyebrow: "Comparison",
    compareTitle: "Compare plans quickly",
    compareDescription: "Make decisions fast with transparent scope and budget ranges.",
    processEyebrow: "Process",
    processTitle: "How we execute",
    portfolioEyebrow: "Portfolio",
    portfolioTitle: "Selected outcomes",
    testimonialsEyebrow: "Testimonials",
    testimonialsTitle: "What clients say",
    faqEyebrow: "FAQ",
    faqTitle: "Common questions",
    leadEyebrow: "Lead Magnet",
    leadTitle: "Audit Express Free",
    leadDescription: "Get a concise growth audit with UX, speed, SEO and conversion recommendations.",
    ctaEyebrow: "Ready to launch?",
    ctaTitle: "Get proposal + timeline in less than 24 hours",
    startNow: "Start now"
  },
  es: {
    badge: "Plataforma SaaS para agencia digital",
    title: "Construye, vende y escala servicios digitales desde una sola plataforma.",
    subtitle:
      "Vende planes claros, cobra online, genera propuestas, ejecuta proyectos y gestiona clientes en un solo flujo seguro.",
    getQuote: "Cotizar",
    namePlan: "Nombra tu plan",
    whatsapp: "WhatsApp",
    resultsTitle: "Stack de crecimiento orientado a resultados",
    leadLift: "Aumento promedio de leads en 90 días",
    launchSpeed: "Velocidad típica de lanzamiento",
    retention: "Retención con Care Plan",
    auditTitle: "Audit Express Gratis",
    auditText: "Recibe un reporte táctico con oportunidades de conversión en menos de 24h.",
    servicesEyebrow: "Servicios",
    servicesTitle: "Todo lo que necesitas para vender y entregar proyectos digitales",
    plansEyebrow: "Planes",
    plansTitle: "Planes claros optimizados para conversión",
    compareEyebrow: "Comparador",
    compareTitle: "Compara planes rápidamente",
    compareDescription: "Toma decisiones rápido con alcance y rangos de inversión transparentes.",
    processEyebrow: "Proceso",
    processTitle: "Cómo ejecutamos",
    portfolioEyebrow: "Portafolio",
    portfolioTitle: "Resultados destacados",
    testimonialsEyebrow: "Testimonios",
    testimonialsTitle: "Lo que dicen los clientes",
    faqEyebrow: "FAQ",
    faqTitle: "Preguntas frecuentes",
    leadEyebrow: "Lead Magnet",
    leadTitle: "Audit Express Gratis",
    leadDescription: "Obtén una auditoría puntual de UX, velocidad, SEO y conversión.",
    ctaEyebrow: "¿Listo para lanzar?",
    ctaTitle: "Recibe propuesta + timeline en menos de 24 horas",
    startNow: "Comenzar ahora"
  }
} as const;

const servicesByLocale = {
  en: [
    { title: "Conversion website", icon: Layers, description: "Landing pages and websites built to sell with CTA, SEO and tracking." },
    { title: "App development", icon: Rocket, description: "Internal tools or SaaS with roles, payments, dashboards and workflows." },
    { title: "Automation CRM", icon: Bot, description: "Automated lead follow-up through WhatsApp and sales operations." },
    { title: "Growth retainers", icon: ShieldCheck, description: "Monthly support, maintenance, CRO and continuous optimization." }
  ],
  es: [
    { title: "Web de conversión", icon: Layers, description: "Landings y sitios listos para vender con CTA, SEO y tracking." },
    { title: "Desarrollo de apps", icon: Rocket, description: "Apps internas o SaaS con roles, pagos, dashboards y procesos." },
    { title: "Automation CRM", icon: Bot, description: "Seguimiento automático de leads vía WhatsApp y operación comercial." },
    { title: "Retainers de crecimiento", icon: ShieldCheck, description: "Soporte mensual, mantenimiento, CRO y optimización continua." }
  ]
} as const;

const processByLocale = {
  en: [
    "Discovery + strategy",
    "Professional proposal with roadmap",
    "Sprint-based production",
    "QA, launch and support"
  ],
  es: [
    "Discovery express + estrategia",
    "Propuesta profesional con roadmap",
    "Producción por sprints",
    "QA, lanzamiento y soporte"
  ]
} as const;

const portfolioByLocale = {
  en: ["Restaurant Growth Site", "HVAC Lead Funnel", "Clinic Booking App"],
  es: ["Sitio de crecimiento para restaurante", "Funnel de leads HVAC", "App de reservas para clínica"]
} as const;

export default async function HomePage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const services = servicesByLocale[locale];
  const executionSteps = processByLocale[locale];
  const portfolio = portfolioByLocale[locale];

  return (
    <div className="pb-20">
      <section className="container-shell grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {c.badge}
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{c.title}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{c.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/pricing">{c.getQuote}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/name-your-plan">{c.namePlan}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "https://wa.me/10000000000"} target="_blank" rel="noreferrer">
                {c.whatsapp}
              </a>
            </Button>
          </div>
        </div>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/60">
          <CardHeader>
            <CardTitle className="text-3xl">{c.resultsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border bg-background/80 px-4 py-3">
              <span>{c.leadLift}</span>
              <span className="font-bold text-primary">+32% to +140%</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-background/80 px-4 py-3">
              <span>{c.launchSpeed}</span>
              <span className="font-bold">7-28 days</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-background/80 px-4 py-3">
              <span>{c.retention}</span>
              <span className="font-bold">88%</span>
            </div>
            <div className="rounded-md border border-border bg-background/80 px-4 py-3">
              <p className="font-semibold">{c.auditTitle}</p>
              <p className="text-muted-foreground">{c.auditText}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionTitle eyebrow={c.servicesEyebrow} title={c.servicesTitle} />
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.title} className="animate-fade-in">
              <CardHeader>
                <service.icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionTitle eyebrow={c.plansEyebrow} title={c.plansTitle} />
        <PricingCards locale={locale} />
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionTitle eyebrow={c.compareEyebrow} title={c.compareTitle} description={c.compareDescription} />
        <PlanComparison locale={locale} />
      </section>

      <section className="container-shell py-10">
        <SectionTitle eyebrow={c.processEyebrow} title={c.processTitle} className="mb-7" />
        <div className="grid gap-4 md:grid-cols-4">
          {executionSteps.map((step, idx) => (
            <Card key={step}>
              <CardHeader>
                <p className="text-3xl font-bold text-primary">0{idx + 1}</p>
                <CardTitle className="text-lg">{step}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell py-10">
        <SectionTitle eyebrow={c.portfolioEyebrow} title={c.portfolioTitle} className="mb-7" />
        <div className="grid gap-5 md:grid-cols-3">
          {portfolio.map((item) => (
            <Card key={item} className="bg-gradient-to-br from-secondary/70 to-card">
              <CardHeader>
                <CardTitle className="text-xl">{item}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Conversion-focused architecture, tracking and ongoing optimization.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <TestimonialsSection locale={locale} eyebrow={c.testimonialsEyebrow} title={c.testimonialsTitle} />

      <section className="container-shell space-y-8 py-10">
        <SectionTitle eyebrow={c.faqEyebrow} title={c.faqTitle} />
        <FaqSection locale={locale} />
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionTitle eyebrow={c.leadEyebrow} title={c.leadTitle} description={c.leadDescription} />
        <LeadMagnetForm />
      </section>

      <section className="container-shell py-10">
        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 via-card to-accent/70">
          <CardContent className="flex flex-col items-start justify-between gap-5 py-8 md:flex-row md:items-center">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">{c.ctaEyebrow}</p>
              <h3 className="font-heading text-2xl font-bold">{c.ctaTitle}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact">
                  {c.startNow} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/name-your-plan">
                  <BadgeDollarSign className="mr-1 h-4 w-4" />
                  {c.namePlan}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
