import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CreditCard,
  Home,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Rocket,
  Scissors,
  ShieldCheck,
  Store,
  Truck,
  Utensils,
  Zap
} from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/marketing/section-title";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqSection } from "@/components/marketing/faq-section";
import { LeadMagnetForm } from "@/components/marketing/lead-magnet-form";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";

const copy = {
  en: {
    heroBadge: "Built for local businesses",
    heroTitle: "Turn your website into a customer machine.",
    heroSubtitle:
      "Get more calls, reservations, orders and leads with a system designed for restaurants, food trucks, barbers, salons, realtors and local service businesses.",
    ctaPrimary: "See Pricing",
    ctaSecondary: "Name Your Plan",
    ctaWhatsApp: "WhatsApp",
    heroCardTitle: "What you launch first",
    heroCardItems: [
      "Mobile-first pages that load fast",
      "WhatsApp/call CTA in every key section",
      "Lead capture, booking or order flow",
      "Simple dashboard to track activity"
    ],
    heroTrust: ["No long contracts", "Fast setup", "Conversion-focused"],
    problemsEyebrow: "Problems We Solve",
    problemsTitle: "Most local businesses lose clients for the same 4 reasons",
    benefitsEyebrow: "Why It Works",
    benefitsTitle: "Designed to help you sell without adding extra daily work",
    processEyebrow: "How It Works",
    processTitle: "From idea to live system in clear steps",
    useCasesEyebrow: "Use Cases",
    useCasesTitle: "Different businesses, same goal: more paying customers",
    pricingEyebrow: "Pricing",
    pricingTitle: "Choose your plan and launch",
    pricingDescription: "Clear setup + monthly plans. No hidden complexity.",
    pricingCta: "See full pricing",
    trustEyebrow: "Integrations",
    trustTitle: "Everything connected for local growth",
    trustDescription: "Your site works with the tools your business already uses.",
    testimonialsEyebrow: "Results",
    testimonialsTitle: "Real clients. Real outcomes.",
    faqEyebrow: "FAQ",
    faqTitle: "Questions before you start",
    leadEyebrow: "Free Audit",
    leadTitle: "Get a free growth audit in 24 hours",
    leadDescription: "We review your current website and show clear opportunities to improve leads, orders or bookings.",
    finalEyebrow: "Ready To Start",
    finalTitle: "If you want more clients this month, this is your next step",
    finalSubtitle: "Choose a plan or tell us your budget. We will map the fastest path to launch.",
    finalPrimary: "Start now",
    finalSecondary: "Talk on WhatsApp"
  },
  es: {
    heroBadge: "Hecho para negocios locales",
    heroTitle: "Convierte tu web en una maquina de clientes.",
    heroSubtitle:
      "Recibe mas llamadas, reservas, pedidos y leads con un sistema pensado para restaurantes, food trucks, barberos, esteticas, realtors y servicios locales.",
    ctaPrimary: "Ver pricing",
    ctaSecondary: "Nombra tu plan",
    ctaWhatsApp: "WhatsApp",
    heroCardTitle: "Lo que lanzas primero",
    heroCardItems: [
      "Paginas mobile-first con carga rapida",
      "CTA de WhatsApp/llamada en puntos clave",
      "Flujo de leads, reservas o pedidos",
      "Dashboard simple para ver actividad"
    ],
    heroTrust: ["Sin contratos largos", "Setup rapido", "Enfoque en conversion"],
    problemsEyebrow: "Problemas Que Resolvemos",
    problemsTitle: "La mayoria de negocios locales pierde clientes por las mismas 4 razones",
    benefitsEyebrow: "Por Que Funciona",
    benefitsTitle: "Disenado para vender mas sin agregar mas carga operativa",
    processEyebrow: "Como Funciona",
    processTitle: "De idea a sistema en vivo en pasos claros",
    useCasesEyebrow: "Casos De Uso",
    useCasesTitle: "Distintos negocios, mismo objetivo: mas clientes que pagan",
    pricingEyebrow: "Pricing",
    pricingTitle: "Elige tu plan y lanza",
    pricingDescription: "Setup + mensual claros. Sin complejidad oculta.",
    pricingCta: "Ver pricing completo",
    trustEyebrow: "Integraciones",
    trustTitle: "Todo conectado para crecer localmente",
    trustDescription: "Tu web funciona con las herramientas que ya usa tu negocio.",
    testimonialsEyebrow: "Resultados",
    testimonialsTitle: "Clientes reales. Resultados reales.",
    faqEyebrow: "FAQ",
    faqTitle: "Preguntas antes de empezar",
    leadEyebrow: "Auditoria Gratis",
    leadTitle: "Recibe una auditoria de crecimiento en 24 horas",
    leadDescription: "Revisamos tu sitio actual y te mostramos oportunidades claras para mejorar leads, pedidos o reservas.",
    finalEyebrow: "Listo Para Empezar",
    finalTitle: "Si quieres mas clientes este mes, este es el siguiente paso",
    finalSubtitle: "Elige un plan o dinos tu presupuesto. Te mostramos la ruta mas rapida para lanzar.",
    finalPrimary: "Comenzar ahora",
    finalSecondary: "Hablar por WhatsApp"
  }
} as const;

const problemsByLocale = {
  en: [
    {
      title: "People visit but do not contact you",
      body: "Your site has no clear conversion path, so traffic leaves without calling or messaging."
    },
    {
      title: "No booking or order flow",
      body: "Potential clients have to wait for manual replies, and many never come back."
    },
    {
      title: "Slow mobile experience",
      body: "Most local traffic is mobile. If the experience is slow, trust drops immediately."
    },
    {
      title: "No visibility of what is working",
      body: "Without tracking and reports, you cannot improve your marketing decisions."
    }
  ],
  es: [
    {
      title: "La gente entra pero no te contacta",
      body: "Tu sitio no tiene un camino claro de conversion y el trafico se va sin escribir ni llamar."
    },
    {
      title: "No hay flujo de reservas o pedidos",
      body: "Los clientes esperan respuesta manual y muchos no regresan."
    },
    {
      title: "Experiencia movil lenta",
      body: "La mayoria del trafico local es movil. Si la experiencia falla, baja la confianza."
    },
    {
      title: "No sabes que esta funcionando",
      body: "Sin tracking ni reportes, no puedes mejorar tus decisiones comerciales."
    }
  ]
} as const;

const benefitsByLocale = {
  en: [
    {
      title: "More local leads",
      body: "Capture calls, WhatsApp chats and form leads from every key page.",
      icon: MapPin
    },
    {
      title: "More bookings and orders",
      body: "Use booking/order flows with confirmations to reduce drop-off.",
      icon: Calendar
    },
    {
      title: "More repeat customers",
      body: "Use automation and follow-up campaigns to bring clients back.",
      icon: Zap
    },
    {
      title: "More control",
      body: "Track activity in one place with practical metrics for decisions.",
      icon: BarChart3
    }
  ],
  es: [
    {
      title: "Mas leads locales",
      body: "Captura llamadas, chats de WhatsApp y formularios desde cada pagina clave.",
      icon: MapPin
    },
    {
      title: "Mas reservas y pedidos",
      body: "Usa flujos de reserva/pedido con confirmaciones para reducir abandono.",
      icon: Calendar
    },
    {
      title: "Mas clientes que regresan",
      body: "Activa automatizaciones y seguimiento para recuperar clientes.",
      icon: Zap
    },
    {
      title: "Mas control de tu operacion",
      body: "Ve la actividad en un solo lugar con metricas utiles para decidir.",
      icon: BarChart3
    }
  ]
} as const;

const processByLocale = {
  en: [
    { step: "01", title: "Business diagnosis", body: "We define your offer, audience and fastest conversion path." },
    { step: "02", title: "Build + setup", body: "We launch your pages, forms, flows and core integrations." },
    { step: "03", title: "Go live", body: "Your system goes live with tracking, QA and conversion checks." },
    { step: "04", title: "Optimize", body: "We improve results with data, tests and monthly actions." }
  ],
  es: [
    { step: "01", title: "Diagnostico del negocio", body: "Definimos oferta, audiencia y ruta mas rapida de conversion." },
    { step: "02", title: "Build + setup", body: "Lanzamos paginas, formularios, flujos e integraciones clave." },
    { step: "03", title: "Go live", body: "Tu sistema sale en vivo con tracking, QA y chequeos de conversion." },
    { step: "04", title: "Optimizacion", body: "Mejoramos resultados con datos, pruebas y acciones mensuales." }
  ]
} as const;

const useCasesByLocale = {
  en: [
    {
      title: "Restaurants",
      body: "Drive reservations, orders and repeat visits.",
      points: ["Menu + CTA", "Bookings", "Promo campaigns"],
      icon: Utensils
    },
    {
      title: "Food Trucks",
      body: "Share location, menu and daily demand in minutes.",
      points: ["Mobile-first page", "WhatsApp orders", "Location updates"],
      icon: Truck
    },
    {
      title: "Barbers & Salons",
      body: "Fill your weekly agenda with online booking.",
      points: ["Service catalog", "Appointment flow", "Client reminders"],
      icon: Scissors
    },
    {
      title: "Realtors",
      body: "Turn property traffic into qualified leads.",
      points: ["Listing pages", "Lead forms", "Fast follow-up"],
      icon: Home
    },
    {
      title: "Local Shops",
      body: "Sell products/services with clear local positioning.",
      points: ["Local SEO base", "Offers page", "Direct messaging"],
      icon: Store
    }
  ],
  es: [
    {
      title: "Restaurantes",
      body: "Genera mas reservas, pedidos y clientes recurrentes.",
      points: ["Menu + CTA", "Reservas", "Campanas de promocion"],
      icon: Utensils
    },
    {
      title: "Food Trucks",
      body: "Publica ubicacion, menu y demanda diaria en minutos.",
      points: ["Pagina mobile-first", "Pedidos por WhatsApp", "Actualizacion de ubicacion"],
      icon: Truck
    },
    {
      title: "Barberos y Esteticas",
      body: "Llena tu agenda semanal con reservas online.",
      points: ["Catalogo de servicios", "Flujo de citas", "Recordatorios a clientes"],
      icon: Scissors
    },
    {
      title: "Realtors",
      body: "Convierte trafico de propiedades en leads calificados.",
      points: ["Paginas de listings", "Formularios", "Seguimiento rapido"],
      icon: Home
    },
    {
      title: "Negocios Locales",
      body: "Vende mejor con una presencia clara y enfocada en conversion.",
      points: ["SEO local base", "Pagina de ofertas", "Mensajeria directa"],
      icon: Store
    }
  ]
} as const;

const integrationsByLocale = {
  en: [
    { label: "WhatsApp", icon: MessageCircle },
    { label: "Google Maps", icon: MapPin },
    { label: "Instagram", icon: Instagram },
    { label: "Email notifications", icon: Mail },
    { label: "Payments", icon: CreditCard },
    { label: "Analytics", icon: BarChart3 }
  ],
  es: [
    { label: "WhatsApp", icon: MessageCircle },
    { label: "Google Maps", icon: MapPin },
    { label: "Instagram", icon: Instagram },
    { label: "Notificaciones por email", icon: Mail },
    { label: "Pagos", icon: CreditCard },
    { label: "Analytics", icon: BarChart3 }
  ]
} as const;

const trustStatsByLocale = {
  en: [
    { label: "Launch speed", value: "7-21 days", icon: Rocket },
    { label: "Admin complexity", value: "Simple", icon: ShieldCheck },
    { label: "Lead channels", value: "Calls + WhatsApp + Forms", icon: MessageCircle }
  ],
  es: [
    { label: "Velocidad de lanzamiento", value: "7-21 dias", icon: Rocket },
    { label: "Complejidad de admin", value: "Simple", icon: ShieldCheck },
    { label: "Canales de leads", value: "Llamadas + WhatsApp + Formularios", icon: MessageCircle }
  ]
} as const;

export default async function HomePage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const problems = problemsByLocale[locale];
  const benefits = benefitsByLocale[locale];
  const executionSteps = processByLocale[locale];
  const useCases = useCasesByLocale[locale];
  const integrations = integrationsByLocale[locale];
  const trustStats = trustStatsByLocale[locale];

  return (
    <div className="pb-20">
      <section className="container-shell grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="space-y-6">
          <Badge className="rounded-full bg-foreground px-4 py-1.5 text-background">{c.heroBadge}</Badge>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{c.heroTitle}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{c.heroSubtitle}</p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/pricing">{c.ctaPrimary}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/name-your-plan">{c.ctaSecondary}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "https://wa.me/10000000000"} target="_blank" rel="noreferrer">
                {c.ctaWhatsApp}
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {c.heroTrust.map((item) => (
              <Badge key={item} variant="secondary" className="rounded-full">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">{c.heroCardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {c.heroCardItems.map((item) => (
              <div key={item} className="rounded-xl border border-border bg-secondary/55 px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.problemsEyebrow} title={c.problemsTitle} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {problems.map((problem) => (
            <Card key={problem.title}>
              <CardHeader>
                <CardTitle className="text-xl">{problem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{problem.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.benefitsEyebrow} title={c.benefitsTitle} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardHeader>
                <benefit.icon className="h-5 w-5 text-foreground" />
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{benefit.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.processEyebrow} title={c.processTitle} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {executionSteps.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{step.step}</p>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.useCasesEyebrow} title={c.useCasesTitle} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="h-5 w-5 text-foreground" />
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{item.body}</p>
                <div className="flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <Badge key={point} variant="outline" className="rounded-full">
                      {point}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.pricingEyebrow} title={c.pricingTitle} description={c.pricingDescription} />
        <PricingCards locale={locale} />
        <Button asChild variant="outline">
          <Link href="/pricing">
            {c.pricingCta} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.trustEyebrow} title={c.trustTitle} description={c.trustDescription} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trustStats.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <item.icon className="h-5 w-5 text-foreground" />
                <CardTitle className="text-base">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {integrations.map((integration) => (
            <Badge key={integration.label} variant="secondary" className="rounded-full px-3 py-1">
              <integration.icon className="mr-1 h-3.5 w-3.5" />
              {integration.label}
            </Badge>
          ))}
        </div>
      </section>

      <TestimonialsSection locale={locale} eyebrow={c.testimonialsEyebrow} title={c.testimonialsTitle} />

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.faqEyebrow} title={c.faqTitle} />
        <FaqSection locale={locale} />
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.leadEyebrow} title={c.leadTitle} description={c.leadDescription} />
        <LeadMagnetForm />
      </section>

      <section className="container-shell py-8">
        <Card className="border-border bg-secondary/65">
          <CardContent className="flex flex-col items-start justify-between gap-5 py-8 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.finalEyebrow}</p>
              <h3 className="max-w-3xl text-2xl font-bold">{c.finalTitle}</h3>
              <p className="text-sm text-muted-foreground">{c.finalSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact">{c.finalPrimary}</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "https://wa.me/10000000000"} target="_blank" rel="noreferrer">
                  {c.finalSecondary}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
