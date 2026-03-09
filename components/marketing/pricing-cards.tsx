import Link from "next/link";
import { Check } from "lucide-react";
import { projectPlans } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { currency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const planCopy = {
  en: {
    quoteCta: "Get Quote",
    mostSold: "Most Sold",
    setup: "Setup",
    month: "/ month",
    includes: "Includes",
    perfectFor: "Perfect for",
    descriptions: {
      "starter-local": "Professional online presence for local businesses.",
      "business-local": "System to receive and manage clients automatically.",
      "pro-local": "Automated growth system with full operational visibility.",
      "realtors-dealers": "Special plan for real estate and automotive listings."
    },
    features: {
      "starter-local": [
        "Mobile-optimized professional page",
        "Business info (services, menu or products)",
        "Direct call or contact button",
        "Google Maps integration",
        "Social media integration",
        "Secure hosting",
        "Basic maintenance",
        "Basic push notifications"
      ],
      "business-local": [
        "Everything in Starter",
        "Orders or booking system",
        "Automatic customer confirmation",
        "Basic admin panel",
        "Automatic push notifications",
        "Email notifications",
        "Basic local SEO",
        "Social media integration"
      ],
      "pro-local": [
        "Everything in Business",
        "Full client dashboard",
        "Orders or booking control",
        "Client database",
        "Automated promotions",
        "Business analytics",
        "Promo landing pages",
        "Advanced notification system"
      ],
      "realtors-dealers": [
        "Professional website",
        "Property or car listings",
        "Lead forms",
        "New client notifications",
        "Listings management panel",
        "Social media integration"
      ]
    },
    perfectForList: {
      "starter-local": ["Food trucks", "Barbers", "Salons", "Small businesses"],
      "business-local": ["Restaurants", "Travel agencies", "Salons", "Barbers", "Local services"],
      "pro-local": ["Large restaurants", "Dealers", "Travel agencies", "Realtors", "Growing businesses"],
      "realtors-dealers": ["Realtors", "Dealers"]
    },
    noteTitle: "Included in every plan",
    noteLineOne: "Hosting, maintenance and technical support are included in all plans.",
    noteLineTwo: "All systems are mobile-optimized and designed to help local businesses get more clients."
  },
  es: {
    quoteCta: "Solicitar quote",
    mostSold: "Mas vendido",
    setup: "Setup",
    month: "/ mes",
    includes: "Incluye",
    perfectFor: "Perfecto para",
    descriptions: {
      "starter-local": "Presencia profesional online para negocios locales.",
      "business-local": "Sistema para recibir y administrar clientes automaticamente.",
      "pro-local": "Sistema de crecimiento automatizado con visibilidad completa.",
      "realtors-dealers": "Plan especial para listados de realtors y dealers."
    },
    features: {
      "starter-local": [
        "Pagina profesional optimizada para celular",
        "Informacion del negocio (servicios, menu o productos)",
        "Boton de llamada o contacto directo",
        "Google Maps integrado",
        "Integracion con redes sociales",
        "Hosting seguro",
        "Mantenimiento basico",
        "Notificaciones push basicas"
      ],
      "business-local": [
        "Todo lo incluido en Starter",
        "Sistema de ordenes o reservas",
        "Confirmacion automatica al cliente",
        "Panel basico para administrar",
        "Notificaciones push automaticas",
        "Notificaciones por email",
        "SEO local basico",
        "Integracion con redes sociales"
      ],
      "pro-local": [
        "Todo lo incluido en Business",
        "Dashboard completo de clientes",
        "Control de ordenes o reservas",
        "Base de datos de clientes",
        "Promociones automaticas",
        "Analytics del negocio",
        "Landing pages para promociones",
        "Sistema de notificaciones avanzado"
      ],
      "realtors-dealers": [
        "Pagina profesional",
        "Listados de propiedades o autos",
        "Formularios para leads",
        "Notificaciones de nuevos clientes",
        "Panel para administrar listings",
        "Integracion con redes sociales"
      ]
    },
    perfectForList: {
      "starter-local": ["Food trucks", "Barberos", "Esteticas", "Pequenos negocios"],
      "business-local": ["Restaurantes", "Agencias de viajes", "Esteticas", "Barberos", "Servicios locales"],
      "pro-local": ["Restaurantes grandes", "Dealers", "Agencias de viajes", "Realtors", "Negocios en crecimiento"],
      "realtors-dealers": ["Realtors", "Dealers"]
    },
    noteTitle: "Incluido en todos los planes",
    noteLineOne: "Hosting, mantenimiento y soporte tecnico incluidos en todos los planes.",
    noteLineTwo: "Los sistemas estan optimizados para celulares y disenados para ayudar a negocios locales a recibir mas clientes."
  }
} as const;

export function PricingCards({ locale, showBottomNote = false }: { locale: Locale; showBottomNote?: boolean }) {
  const c = planCopy[locale];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {projectPlans.map((plan) => (
          <Card key={plan.slug} className="relative overflow-hidden">
            {plan.popular ? <Badge className="absolute right-4 top-4">{c.mostSold}</Badge> : null}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-sm font-semibold text-primary">
                {c.setup}: {currency(plan.setupFee)}
              </p>
              <p className="text-3xl font-bold">
                {currency(plan.priceMin)} {c.month}
              </p>
              <p className="text-sm text-muted-foreground">{c.descriptions[plan.slug]}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.includes}</p>
                <ul className="space-y-2 text-sm">
                  {c.features[plan.slug].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.perfectFor}</p>
                <p className="text-sm text-muted-foreground">{c.perfectForList[plan.slug].join(" • ")}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/contact">{c.quoteCta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {showBottomNote ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">{c.noteTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{c.noteLineOne}</p>
            <p>{c.noteLineTwo}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
