import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Rocket,
  Store
} from "lucide-react";
import { projectPlans } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { cn, currency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type PlanSlug = (typeof projectPlans)[number]["slug"];

const planCopy = {
  en: {
    defaultCta: "Start now",
    popularCta: "Activate system",
    mostSold: "Best Seller",
    setup: "Setup",
    month: "/ month",
    includes: "What is included",
    perfectFor: "Ideal for",
    descriptors: {
      "starter-local": "Launch a professional customer-facing presence without adding operational friction.",
      "business-local": "Automate bookings, orders and follow-up so your team stops chasing every lead manually.",
      "pro-local": "Run a full growth engine with client data, campaigns and performance visibility in one dashboard.",
      "realtors-dealers": "Manage dynamic inventory, capture leads and organize listings from a single control panel."
    },
    features: {
      "starter-local": [
        "Mobile-optimized page",
        "Direct call button",
        "Google Maps integration",
        "Social media integration",
        "Secure hosting",
        "Basic notifications",
        "Simple contact panel"
      ],
      "business-local": [
        "Everything in Starter",
        "Booking or ordering system",
        "Automatic confirmations",
        "Admin panel",
        "Push notifications",
        "Email notifications",
        "Basic local SEO",
        "Full social integration"
      ],
      "pro-local": [
        "Everything in Business",
        "Full client dashboard",
        "Client database",
        "Full booking or order control",
        "Automated promotions",
        "Business analytics",
        "Promotional landing pages",
        "Advanced notification system"
      ],
      "realtors-dealers": [
        "Professional page",
        "Vehicle or property listings",
        "Lead forms",
        "New lead notifications",
        "Listings management panel",
        "Social media integration"
      ]
    },
    perfectForList: {
      "starter-local": ["Food trucks", "Barbers", "Salons", "Small businesses"],
      "business-local": ["Restaurants", "Salons", "Local services", "Travel agencies"],
      "pro-local": ["Large restaurants", "Realtors", "Dealers", "Growing operations"],
      "realtors-dealers": ["Realtors", "Dealers", "Local marketplaces"]
    },
    noteTitle: "Built like a growth platform, not just a website",
    noteLineOne: "Every plan includes hosting, maintenance and a mobile-first experience optimized for local conversions.",
    noteLineTwo: "As you move up, BDG adds automation, customer data, campaigns and dashboard visibility without rebuilding from zero."
  },
  es: {
    defaultCta: "Comenzar ahora",
    popularCta: "Activar sistema",
    mostSold: "MAS VENDIDO",
    setup: "Setup",
    month: "/ mes",
    includes: "Lo que incluye",
    perfectFor: "Ideal para",
    descriptors: {
      "starter-local": "Activa una presencia profesional para captar clientes sin complicar la operacion diaria.",
      "business-local": "Automatiza reservas, pedidos y seguimiento para dejar de perseguir clientes manualmente.",
      "pro-local": "Opera un sistema de crecimiento completo con datos, campanas y visibilidad total desde un dashboard.",
      "realtors-dealers": "Administra inventario o listados, recibe leads y controla publicaciones desde un solo panel."
    },
    features: {
      "starter-local": [
        "Pagina optimizada para celular",
        "Boton de llamada directa",
        "Google Maps integrado",
        "Integracion con redes sociales",
        "Hosting seguro",
        "Notificaciones basicas",
        "Panel simple de contacto"
      ],
      "business-local": [
        "Todo lo de Starter",
        "Sistema de reservas o pedidos",
        "Confirmaciones automaticas",
        "Panel de administracion",
        "Notificaciones push",
        "Notificaciones por email",
        "SEO local basico",
        "Integracion completa con redes"
      ],
      "pro-local": [
        "Todo lo de Business",
        "Dashboard completo de clientes",
        "Base de datos de clientes",
        "Control total de pedidos o reservas",
        "Promociones automaticas",
        "Analytics del negocio",
        "Landing pages promocionales",
        "Sistema avanzado de notificaciones"
      ],
      "realtors-dealers": [
        "Pagina profesional",
        "Listados de autos o propiedades",
        "Formularios de leads",
        "Notificaciones de nuevos clientes",
        "Panel para administrar listings",
        "Integracion con redes sociales"
      ]
    },
    perfectForList: {
      "starter-local": ["Food trucks", "Barberos", "Esteticas", "Negocios pequenos"],
      "business-local": ["Restaurantes", "Esteticas", "Servicios locales", "Agencias de viaje"],
      "pro-local": ["Restaurantes grandes", "Realtors", "Dealers", "Negocios en crecimiento"],
      "realtors-dealers": ["Realtors", "Dealers", "Marketplaces locales"]
    },
    noteTitle: "BDG se presenta como plataforma de crecimiento, no solo como pagina web",
    noteLineOne: "Todos los planes incluyen hosting, mantenimiento y una experiencia mobile-first optimizada para conversion local.",
    noteLineTwo: "A medida que subes de plan, activas automatizacion, base de datos, campanas y dashboard sin reconstruir el sistema."
  }
} as const;

const planDecor: Record<
  PlanSlug,
  {
    icon: LucideIcon;
    iconClassName: string;
    cardClassName: string;
    glowClassName: string;
  }
> = {
  "starter-local": {
    icon: Store,
    iconClassName: "bg-slate-900 text-white",
    cardClassName: "border-slate-200 hover:-translate-y-1 hover:border-slate-300",
    glowClassName: "from-slate-100 via-transparent to-transparent"
  },
  "business-local": {
    icon: CalendarCheck2,
    iconClassName: "bg-primary/10 text-primary",
    cardClassName: "border-[rgba(37,99,235,0.18)] hover:-translate-y-1 hover:border-[rgba(37,99,235,0.34)]",
    glowClassName: "from-[rgba(37,99,235,0.12)] via-transparent to-transparent"
  },
  "pro-local": {
    icon: Rocket,
    iconClassName: "bg-primary text-white",
    cardClassName:
      "border-[rgba(37,99,235,0.22)] bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(255,255,255,0.98))] ring-2 ring-[rgba(37,99,235,0.14)] hover:-translate-y-1 hover:border-[rgba(37,99,235,0.38)]",
    glowClassName: "from-[rgba(37,99,235,0.12)] via-transparent to-transparent"
  },
  "realtors-dealers": {
    icon: Building2,
    iconClassName: "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]",
    cardClassName: "border-[hsl(var(--success-soft))] hover:-translate-y-1 hover:border-[rgba(20,143,99,0.34)]",
    glowClassName: "from-[hsl(var(--success-soft))] via-transparent to-transparent"
  }
};

export function PricingCards({ locale, showBottomNote = false }: { locale: Locale; showBottomNote?: boolean }) {
  const c = planCopy[locale];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {projectPlans.map((plan) => {
          const decor = planDecor[plan.slug];
          const Icon = decor.icon;
          const isPopular = plan.popular;

          return (
            <Card
              key={plan.slug}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden transition-all duration-300",
                decor.cardClassName
              )}
            >
              <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", decor.glowClassName)} />

              <CardHeader className="relative space-y-4 p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", decor.iconClassName)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {isPopular ? <Badge className="bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]">{c.mostSold}</Badge> : null}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground">{plan.name}</p>
                    <CardTitle className="mt-2 text-[1.75rem]">{currency(plan.priceMin)} {c.month}</CardTitle>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {c.setup}: {currency(plan.setupFee)}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{c.descriptors[plan.slug]}</p>
                </div>
              </CardHeader>

              <CardContent className="relative flex flex-1 flex-col gap-6 px-7 pb-7 pt-0">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{c.includes}</p>
                  <ul className="space-y-3 text-sm">
                    {c.features[plan.slug].map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <span className="leading-6">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{c.perfectFor}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.perfectForList[plan.slug].map((item) => (
                      <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="relative mt-auto p-7 pt-0">
                <Button asChild className="w-full" size="lg">
                  <Link href="/contact">
                    {isPopular ? c.popularCta : c.defaultCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {showBottomNote ? (
        <Card className="border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{c.noteTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>{c.noteLineOne}</p>
            <p>{c.noteLineTwo}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
