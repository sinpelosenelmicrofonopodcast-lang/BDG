"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { TopGrowthBanner } from "@/components/layout/top-growth-banner";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

type ViewerRole = "guest" | "client" | "admin";

type SiteHeaderProps = {
  viewerRole?: ViewerRole;
};

const navLabels = {
  en: {
    pricing: "Pricing",
    addons: "Add-ons",
    caseStudies: "Case Studies",
    blog: "Blog",
    contact: "Contact",
    namePlan: "Name Your Plan",
    getQuote: "Activate System",
    clientPortal: "Client Portal",
    adminPortal: "Admin Portal",
    topBannerAlt: "Activate your growth system."
  },
  es: {
    pricing: "Precios",
    addons: "Add-ons",
    caseStudies: "Casos",
    blog: "Blog",
    contact: "Contacto",
    namePlan: "Nombra tu plan",
    getQuote: "Activar sistema",
    clientPortal: "Portal Cliente",
    adminPortal: "Portal Admin",
    topBannerAlt: "Activa tu sistema de crecimiento."
  }
} as const;

export function SiteHeader({ viewerRole = "guest" }: SiteHeaderProps) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const c = navLabels[locale];

  const adminHref = "/dashboard/admin/overview";
  const clientHref = "/dashboard/client";
  const guestPortalHref = "/client-portal";

  const portalHref = viewerRole === "admin" ? adminHref : viewerRole === "client" ? clientHref : guestPortalHref;
  const portalLabel = viewerRole === "admin" ? c.adminPortal : c.clientPortal;
  const homeHref = viewerRole === "admin" ? adminHref : "/";

  const links = [
    { href: "/pricing", label: c.pricing },
    { href: "/addons", label: c.addons },
    { href: "/case-studies", label: c.caseStudies },
    { href: "/blog", label: c.blog },
    { href: "/contact", label: c.contact }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="relative h-[108px] w-full overflow-hidden border-b border-border/80 sm:h-[128px] md:h-[148px]">
        <Link href="/pricing" className="block h-full w-full" aria-label={c.topBannerAlt}>
          <TopGrowthBanner locale={locale} />
        </Link>
      </div>

      <div className="container-shell flex h-[72px] items-center justify-between gap-4">
        <Link href={homeHref} className="inline-flex items-center rounded-md bg-black px-3 py-1.5 shadow-sm">
          <Image
            src="/logo-footer.png"
            alt="BDG"
            width={132}
            height={44}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold text-muted-foreground hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <Button asChild variant="outline" size="sm">
            <Link href={portalHref}>{portalLabel}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/name-your-plan">{c.namePlan}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/pricing">{c.getQuote}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <Button asChild variant="outline" size="sm">
            <Link href={portalHref}>{portalLabel}</Link>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
