import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bot, Camera, Megaphone, PlayCircle, Search, ShoppingBag } from "lucide-react";
import { addonCatalog } from "@/lib/constants";
import { getServerLocale } from "@/lib/i18n/server";
import { currency } from "@/lib/utils";
import { SectionTitle } from "@/components/marketing/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AddonSlug = (typeof addonCatalog)[number]["slug"];

const addonIcons: Record<AddonSlug, LucideIcon> = {
  "seo-local": Search,
  "social-ads-management": Megaphone,
  "marketing-automation": Bot,
  "pro-photography": Camera,
  "social-videos-reels": PlayCircle
};

const copy = {
  en: {
    eyebrow: "Add-ons",
    title: "Activate growth modules when your operation is ready",
    description: "Keep the core system lean, then add demand generation and content production without rebuilding the platform.",
    categoryOne: "Demand generation",
    categoryTwo: "Content and creative",
    month: "/ month",
    monthly: "Monthly",
    oneTime: "One-time",
    cta: "Request add-on",
    growthPack: "Growth Pack",
    growthPackDescription: "Bundle the three modules that usually move visibility, paid demand and repeat follow-up together.",
    growthPackItems: ["Local SEO", "Ads management", "Marketing automation", "Monthly reporting"]
  },
  es: {
    eyebrow: "Add-ons",
    title: "Activa modulos de crecimiento cuando tu operacion lo necesite",
    description: "Mantiene el sistema base ligero y suma generacion de demanda o contenido sin reconstruir la plataforma.",
    categoryOne: "Generacion de demanda",
    categoryTwo: "Contenido y creativo",
    month: "/ mes",
    monthly: "Mensual",
    oneTime: "Pago unico",
    cta: "Solicitar add-on",
    growthPack: "Growth Pack",
    growthPackDescription: "Agrupa los tres modulos que normalmente mueven visibilidad, demanda pagada y seguimiento recurrente al mismo tiempo.",
    growthPackItems: ["SEO local", "Ads management", "Automatizacion marketing", "Reportes mensuales"]
  }
} as const;

const performanceSlugs = new Set<AddonSlug>(["seo-local", "social-ads-management", "marketing-automation"]);

export default async function AddonsPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const performanceAddons = addonCatalog.filter((addon) => performanceSlugs.has(addon.slug));
  const creativeAddons = addonCatalog.filter((addon) => !performanceSlugs.has(addon.slug));

  return (
    <div className="container-shell space-y-10 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{c.categoryOne}</CardTitle>
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
                      <Badge variant="secondary">{c.monthly}</Badge>
                    </div>
                  </div>
                );
              })}
              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">{c.cta}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{c.categoryTwo}</CardTitle>
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
                <Link href="/contact">{c.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-[hsl(var(--warning-soft))] bg-[linear-gradient(145deg,rgba(255,250,235,0.98),rgba(255,255,255,0.96))] shadow-[0_24px_80px_rgba(245,158,11,0.12)]">
          <CardHeader className="space-y-4">
            <Badge className="w-fit bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]">{c.growthPack}</Badge>
            <div className="space-y-2">
              <CardTitle className="text-3xl">{c.growthPack}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">{c.growthPackDescription}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-sm font-medium text-white/70">{c.monthly}</p>
              <p className="mt-1 text-4xl font-bold">{currency(199)} {c.month}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              {c.growthPackItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="w-full">
              <Link href="/contact">
                {c.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
