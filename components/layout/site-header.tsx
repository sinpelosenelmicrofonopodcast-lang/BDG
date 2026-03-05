"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  isAdmin?: boolean;
};

const navLabels = {
  en: {
    pricing: "Pricing",
    addons: "Add-ons",
    caseStudies: "Case Studies",
    blog: "Blog",
    contact: "Contact",
    namePlan: "Name Your Plan",
    getQuote: "Get Quote",
    adminDashboard: "Admin Dashboard",
    adminShort: "Admin",
    constructionBanner: "Under construction. Better improvements for you are coming soon."
  },
  es: {
    pricing: "Precios",
    addons: "Add-ons",
    caseStudies: "Casos",
    blog: "Blog",
    contact: "Contacto",
    namePlan: "Nombra tu plan",
    getQuote: "Cotizar",
    adminDashboard: "Panel Admin",
    adminShort: "Admin",
    constructionBanner: "En construcción. Pronto vienen mejoras para ustedes."
  }
} as const;

export function SiteHeader({ isAdmin = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const c = navLabels[locale];
  const adminHref = "/dashboard/admin/overview";

  const links = [
    ...(isAdmin ? [{ href: adminHref, label: c.adminDashboard }] : []),
    { href: "/pricing", label: c.pricing },
    { href: "/addons", label: c.addons },
    { href: "/case-studies", label: c.caseStudies },
    { href: "/blog", label: c.blog },
    { href: "/contact", label: c.contact }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-xs font-semibold tracking-wide text-primary">
        {c.constructionBanner}
      </div>

      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href={isAdmin ? adminHref : "/"} className="inline-flex items-center gap-3">
          <Image src="/logo.png" alt="BDG" width={132} height={44} priority className="h-9 w-auto rounded-sm border border-border/50" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          {isAdmin ? (
            <Button asChild variant="outline" size="sm">
              <Link href={adminHref}>{c.adminDashboard}</Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href="/name-your-plan">{c.namePlan}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/pricing">{c.getQuote}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          {isAdmin ? (
            <Button asChild variant="outline" size="sm">
              <Link href={adminHref}>{c.adminShort}</Link>
            </Button>
          ) : null}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
