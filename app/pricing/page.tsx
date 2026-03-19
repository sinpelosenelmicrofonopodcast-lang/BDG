import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Camera,
  ChartColumnBig,
  Megaphone,
  MessagesSquare,
  PlayCircle,
  Search,
  ShoppingBag,
  Sparkles,
  Users
} from "lucide-react";
import { addonCatalog } from "@/lib/constants";
import { getServerLocale } from "@/lib/i18n/server";
import { currency } from "@/lib/utils";
import { SectionTitle } from "@/components/marketing/section-title";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { PricingAnalyticsTracker } from "@/components/marketing/pricing-analytics-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AddonSlug = (typeof addonCatalog)[number]["slug"];

const copy = {
  en: {
    heroEyebrow: "Local Growth Platform",
    heroTitle: "Digital systems that bring customers to your business automatically.",
    heroDescription:
      "Automate bookings, orders, messages and marketing from one dashboard. Built for local businesses that want to grow without living glued to their phone.",
    heroPrimary: "See Plans",
    heroSecondary: "Request Demo",
    heroBullets: [
      "More bookings and orders automatically",
      "Customer and marketing automation",
      "Total business control from one dashboard"
    ],
    heroPreviewTitle: "BDG Growth OS",
    heroPreviewBody: "Customer system, campaigns and operations unified in a single control panel.",
    heroStats: [
      { value: "+40%", label: "More customer messages" },
      { value: "+30%", label: "More bookings or orders" },
      { value: "24/7", label: "Automated lead capture" }
    ],
    heroFeed: [
      "12 new leads captured this week",
      "8 bookings confirmed automatically",
      "2 campaigns sending promotions today"
    ],
    plansEyebrow: "Plans",
    plansTitle: "Choose the customer system that matches your growth stage.",
    plansDescription: "Same foundation, more automation and more visibility as your local business scales.",
    resultsEyebrow: "Results",
    resultsTitle: "YOUR RESULTS WITH BDG",
    resultsDescription: "The offer is no longer just a website. It is a system designed to capture, convert and retain more local customers.",
    resultsCards: [
      { value: "+40%", label: "More customer messages", body: "Conversion-focused experiences increase direct inquiries from search, maps and social." },
      { value: "+30%", label: "More bookings or orders", body: "Automated confirmations remove friction and recover opportunities faster." },
      { value: "End-to-end", label: "Customer contact automation", body: "Notifications, follow-up and promo flows work without manual chasing." },
      { value: "24/7", label: "Growth system running", body: "Your business keeps attracting and organizing demand even outside working hours." }
    ],
    addonsEyebrow: "Add-ons",
    addonsTitle: "Growth modules you can activate as you scale.",
    addonsDescription: "Two clear categories: demand generation and content assets that improve conversion quality.",
    addonCategoryOne: "Demand Generation",
    addonCategoryTwo: "Content and Creative",
    addonCta: "Activate add-on",
    month: "/ month",
    oneTime: "One-time",
    subscription: "Monthly",
    growthPackBadge: "Recommended Bundle",
    growthPackTitle: "GROWTH PACK",
    growthPackDescription: "Bundle the core channels that drive local visibility, paid traffic and automated follow-up.",
    growthPackIncludes: ["Local SEO", "Ads management", "Marketing automation", "Monthly reports"],
    growthPackCta: "Request Demo",
    dashboardEyebrow: "Dashboard",
    dashboardTitle: "Control your entire business from one dashboard.",
    dashboardDescription:
      "This is what makes BDG feel like SaaS. Your team can see clients, reservations, orders, campaigns and analytics from the same operating layer.",
    dashboardBullets: [
      "View customers",
      "View bookings",
      "View orders",
      "View campaigns",
      "View analytics",
      "Send promotions"
    ],
    dashboardPanelTitle: "Business control panel",
    dashboardPerformanceTitle: "This week",
    dashboardPerformanceBody: "New bookings, repeat customers, campaign performance and response speed in one snapshot.",
    dashboardPipelineTitle: "Growth actions",
    dashboardPipeline: [
      "Promotions scheduled for inactive customers",
      "Leads tagged automatically by source",
      "Bookings and orders synced in real time"
    ],
    socialEyebrow: "Social Proof",
    socialTitle: "Local businesses are already growing with BDG",
    socialDescription: "Built to fit high-intent local categories where speed, follow-up and operational visibility matter.",
    industries: ["Food trucks", "Barbershops", "Restaurants", "Dealers"],
    testimonials: [
      {
        quote: "The system centralizes messages and bookings, so we spend less time chasing people and more time serving them.",
        role: "Barbershop example"
      },
      {
        quote: "Orders now arrive with confirmation and follow-up built in. That changed the pace of the operation.",
        role: "Restaurant example"
      },
      {
        quote: "Listings, leads and promotions finally live in the same workflow instead of five disconnected tools.",
        role: "Dealer example"
      }
    ],
    compareEyebrow: "Comparison",
    compareTitle: "Compare the growth systems quickly",
    finalTitle: "Turn your local business into an always-on customer acquisition system.",
    finalBody:
      "BDG helps local businesses grow with technology, automation and systems designed to attract more customers.",
    finalPrimary: "Request Demo",
    finalSecondary: "See Case Studies"
  },
  es: {
    heroEyebrow: "Plataforma de crecimiento local",
    heroTitle: "Sistemas digitales que traen clientes automaticamente a tu negocio.",
    heroDescription:
      "Automatiza reservas, pedidos, mensajes y marketing desde un solo dashboard. Disenado para negocios locales que quieren crecer sin vivir pegados al celular.",
    heroPrimary: "Ver Planes",
    heroSecondary: "Solicitar Demo",
    heroBullets: [
      "Mas reservas y pedidos automaticamente",
      "Automatizacion de clientes y marketing",
      "Control total del negocio desde un solo panel"
    ],
    heroPreviewTitle: "BDG Growth OS",
    heroPreviewBody: "Sistema de clientes, campanas y operacion unificados en un solo panel de control.",
    heroStats: [
      { value: "+40%", label: "Mas mensajes de clientes" },
      { value: "+30%", label: "Mas reservas o pedidos" },
      { value: "24/7", label: "Captacion automatica de leads" }
    ],
    heroFeed: [
      "12 nuevos leads captados esta semana",
      "8 reservas confirmadas automaticamente",
      "2 campanas enviando promociones hoy"
    ],
    plansEyebrow: "Planes",
    plansTitle: "Elige el sistema de clientes que encaja con tu etapa de crecimiento.",
    plansDescription: "Misma base, mas automatizacion y mas visibilidad a medida que tu negocio local escala.",
    resultsEyebrow: "Resultados",
    resultsTitle: "TUS RESULTADOS CON BDG",
    resultsDescription: "La oferta ya no se siente como una pagina web. Se siente como un sistema que capta, convierte y retiene mas clientes locales.",
    resultsCards: [
      { value: "+40%", label: "Mas mensajes de clientes", body: "Experiencias optimizadas para conversion aumentan el contacto directo desde Google, Maps y redes." },
      { value: "+30%", label: "Mas reservas o pedidos", body: "Las confirmaciones automaticas eliminan friccion y recuperan oportunidades mas rapido." },
      { value: "Completa", label: "Automatizacion completa del contacto", body: "Notificaciones, seguimiento y promociones corren sin perseguir clientes manualmente." },
      { value: "24/7", label: "Sistema de crecimiento activo", body: "Tu negocio sigue atrayendo y organizando demanda incluso fuera de horario." }
    ],
    addonsEyebrow: "Add-ons",
    addonsTitle: "Modulos de crecimiento que puedes activar al escalar.",
    addonsDescription: "Dos categorias claras: generacion de demanda y activos de contenido para elevar la conversion.",
    addonCategoryOne: "Generacion de demanda",
    addonCategoryTwo: "Contenido y creativo",
    addonCta: "Activar add-on",
    month: "/ mes",
    oneTime: "Pago unico",
    subscription: "Mensual",
    growthPackBadge: "Bundle recomendado",
    growthPackTitle: "GROWTH PACK",
    growthPackDescription: "Agrupa los canales clave para visibilidad local, trafico pagado y seguimiento automatizado.",
    growthPackIncludes: ["SEO local", "Ads management", "Automatizacion marketing", "Reportes mensuales"],
    growthPackCta: "Solicitar Demo",
    dashboardEyebrow: "Dashboard",
    dashboardTitle: "Controla todo tu negocio desde un solo dashboard.",
    dashboardDescription:
      "Aqui es donde BDG se justifica como SaaS. Tu equipo puede ver clientes, reservas, pedidos, campanas y analytics desde la misma capa operativa.",
    dashboardBullets: [
      "Ver clientes",
      "Ver reservas",
      "Ver pedidos",
      "Ver campanas",
      "Ver analytics",
      "Enviar promociones"
    ],
    dashboardPanelTitle: "Panel de control del negocio",
    dashboardPerformanceTitle: "Esta semana",
    dashboardPerformanceBody: "Nuevas reservas, clientes recurrentes, rendimiento de campanas y velocidad de respuesta en una sola vista.",
    dashboardPipelineTitle: "Acciones de crecimiento",
    dashboardPipeline: [
      "Promociones programadas para clientes inactivos",
      "Leads etiquetados automaticamente por origen",
      "Reservas y pedidos sincronizados en tiempo real"
    ],
    socialEyebrow: "Prueba social",
    socialTitle: "Negocios locales ya estan creciendo con BDG",
    socialDescription: "Disenado para categorias locales con alta intencion donde importan la rapidez, el seguimiento y la visibilidad operativa.",
    industries: ["Food trucks", "Barberias", "Restaurantes", "Dealers"],
    testimonials: [
      {
        quote: "El sistema centraliza mensajes y reservas, asi que el equipo deja de perseguir clientes y se enfoca en atenderlos.",
        role: "Ejemplo de barberia"
      },
      {
        quote: "Los pedidos ya llegan con confirmacion y seguimiento integrado. Eso cambio el ritmo completo de la operacion.",
        role: "Ejemplo de restaurante"
      },
      {
        quote: "Listings, leads y promociones por fin viven en el mismo flujo en lugar de cinco herramientas desconectadas.",
        role: "Ejemplo de dealer"
      }
    ],
    compareEyebrow: "Comparador",
    compareTitle: "Compara los sistemas de crecimiento rapidamente",
    finalTitle: "Convierte tu negocio local en un sistema de adquisicion de clientes que trabaja siempre.",
    finalBody:
      "BDG ayuda a negocios locales a crecer con tecnologia, automatizacion y sistemas disenados para atraer mas clientes.",
    finalPrimary: "Solicitar Demo",
    finalSecondary: "Ver Casos de Exito"
  }
} as const;

const addonGroups = {
  performance: ["seo-local", "social-ads-management", "marketing-automation"],
  creative: ["pro-photography", "social-videos-reels"]
} as const satisfies Record<string, readonly AddonSlug[]>;

const addonIcons: Record<AddonSlug, LucideIcon> = {
  "seo-local": Search,
  "social-ads-management": Megaphone,
  "marketing-automation": Bot,
  "pro-photography": Camera,
  "social-videos-reels": PlayCircle
};

export default async function PricingPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const performanceAddons = addonCatalog.filter((addon) =>
    (addonGroups.performance as readonly string[]).includes(addon.slug)
  );
  const creativeAddons = addonCatalog.filter((addon) =>
    (addonGroups.creative as readonly string[]).includes(addon.slug)
  );

  return (
    <div className="pb-16">
      <PricingAnalyticsTracker />

      <section className="container-shell py-10 md:py-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,255,0.95))] shadow-[0_25px_100px_rgba(15,23,42,0.08)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.12),transparent_34%)]" />
          <div className="relative grid gap-10 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="bg-primary text-primary-foreground">{c.heroEyebrow}</Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {c.heroTitle}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{c.heroDescription}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {c.heroBullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium leading-6">{bullet}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="#planes">
                    {c.heroPrimary}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">{c.heroSecondary}</Link>
                </Button>
              </div>
            </div>

            <Card className="border-border bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground">{c.heroPreviewTitle}</p>
                    <CardTitle className="mt-2 text-2xl">{c.dashboardPanelTitle}</CardTitle>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <ChartColumnBig className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{c.heroPreviewBody}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {c.heroStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-border/80 bg-secondary/60 p-4">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{c.dashboardPerformanceTitle}</p>
                      <p className="text-xs text-muted-foreground">{c.dashboardPerformanceBody}</p>
                    </div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    {c.heroFeed.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-3 py-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="planes" className="container-shell space-y-7 py-12">
        <SectionTitle eyebrow={c.plansEyebrow} title={c.plansTitle} description={c.plansDescription} />
        <PricingCards locale={locale} showBottomNote />
      </section>

      <section className="container-shell py-12">
        <SectionTitle eyebrow={c.resultsEyebrow} title={c.resultsTitle} description={c.resultsDescription} className="mb-7" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {c.resultsCards.map((item) => (
            <Card key={item.label} className="border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,249,253,0.92))]">
              <CardHeader className="space-y-3 pb-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <MessagesSquare className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold">{item.value}</p>
                <CardTitle className="text-xl">{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{item.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell py-12">
        <SectionTitle eyebrow={c.addonsEyebrow} title={c.addonsTitle} description={c.addonsDescription} className="mb-7" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">{c.addonCategoryOne}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceAddons.map((addon) => {
                  const Icon = addonIcons[addon.slug];

                  return (
                    <div key={addon.slug} className="rounded-2xl border border-border/80 bg-secondary/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{addon.name}</p>
                            <p className="mt-1 text-sm font-medium text-primary">
                              {currency(addon.priceMin)} {c.month}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{c.subscription}</Badge>
                      </div>
                    </div>
                  );
                })}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">{c.addonCta}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">{c.addonCategoryTwo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {creativeAddons.map((addon) => {
                  const Icon = addonIcons[addon.slug];

                  return (
                    <div key={addon.slug} className="rounded-2xl border border-border/80 bg-secondary/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{addon.name}</p>
                            <p className="mt-1 text-sm font-medium text-primary">{currency(addon.priceMin)}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{c.oneTime}</Badge>
                      </div>
                    </div>
                  );
                })}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">{c.addonCta}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-[hsl(var(--warning-soft))] bg-[linear-gradient(145deg,rgba(255,250,235,0.98),rgba(255,255,255,0.96))] shadow-[0_24px_80px_rgba(245,158,11,0.12)]">
            <CardHeader className="space-y-4">
              <Badge className="w-fit bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]">{c.growthPackBadge}</Badge>
              <div className="space-y-2">
                <CardTitle className="text-3xl">{c.growthPackTitle}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">{c.growthPackDescription}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                <p className="text-sm font-medium text-white/70">{c.subscription}</p>
                <p className="mt-1 text-4xl font-bold">{currency(199)} {c.month}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {c.growthPackIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/contact">
                  {c.growthPackCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <SectionTitle eyebrow={c.dashboardEyebrow} title={c.dashboardTitle} description={c.dashboardDescription} />
            <div className="grid gap-3 sm:grid-cols-2">
              {c.dashboardBullets.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ChartColumnBig className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <Button asChild size="lg">
              <Link href="/contact">{c.heroSecondary}</Link>
            </Button>
          </div>

          <Card className="border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,253,0.94))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground">{c.dashboardPanelTitle}</p>
                  <CardTitle className="mt-2 text-2xl">{c.dashboardPerformanceTitle}</CardTitle>
                </div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{c.dashboardPerformanceBody}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {c.heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-border/80 bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_0.95fr]">
                <div className="rounded-2xl border border-border/80 bg-background p-5">
                  <p className="text-sm font-semibold">{c.dashboardPipelineTitle}</p>
                  <div className="mt-4 space-y-3">
                    {c.dashboardPipeline.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm leading-6">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/80 bg-slate-950 p-5 text-white">
                  <p className="text-sm font-semibold text-white/80">{c.heroPreviewTitle}</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">CRM</p>
                      <p className="mt-2 text-lg font-semibold">Clients tagged by source and stage</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">Campaigns</p>
                      <p className="mt-2 text-lg font-semibold">Promotions activated for repeat sales and no-shows</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">Ops</p>
                      <p className="mt-2 text-lg font-semibold">Bookings, orders and follow-up synced from one place</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-shell py-12">
        <SectionTitle eyebrow={c.socialEyebrow} title={c.socialTitle} description={c.socialDescription} className="mb-7" />
        <div className="grid gap-4 md:grid-cols-4">
          {c.industries.map((industry) => (
            <Card key={industry} className="border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,253,0.92))]">
              <CardContent className="flex items-center gap-3 pt-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <p className="font-semibold">{industry}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {c.testimonials.map((testimonial) => (
            <Card key={testimonial.role} className="border-border">
              <CardContent className="space-y-4 pt-6">
                <p className="text-base leading-7">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.role}</p>
                  <p className="text-sm text-muted-foreground">BDG local growth platform</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-12">
        <SectionTitle eyebrow={c.compareEyebrow} title={c.compareTitle} />
        <PlanComparison locale={locale} />
      </section>

      <section className="container-shell pt-8">
        <Card className="overflow-hidden border-border bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(18,42,97,0.94))] text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
          <CardContent className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">{c.heroEyebrow}</p>
              <h2 className="max-w-3xl font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">{c.finalTitle}</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">{c.finalBody}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-white/90">
                <Link href="/contact">{c.finalPrimary}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/case-studies">{c.finalSecondary}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
