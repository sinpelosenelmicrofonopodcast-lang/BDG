"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";

const copy = {
  en: {
    description: "Web and app growth systems for service businesses.",
    services: "Services",
    company: "Company",
    legal: "Legal",
    copyright: "All rights reserved.",
    caseStudies: "Case Studies",
    blog: "Blog",
    contact: "Contact",
    terms: "Terms",
    privacy: "Privacy",
    billing: "Billing Policy",
    webDev: "Web Development",
    appPlatforms: "App Platforms",
    automation: "Automation CRM",
    seo: "SEO Retainers"
  },
  es: {
    description: "Sistemas web y app para crecimiento de negocios de servicios.",
    services: "Servicios",
    company: "Empresa",
    legal: "Legal",
    copyright: "Todos los derechos reservados.",
    caseStudies: "Casos",
    blog: "Blog",
    contact: "Contacto",
    terms: "Términos",
    privacy: "Privacidad",
    billing: "Política de pagos",
    webDev: "Desarrollo Web",
    appPlatforms: "Plataformas App",
    automation: "Automatización CRM",
    seo: "Retainers SEO"
  }
} as const;

export function SiteFooter() {
  const { locale } = useLanguage();
  const c = copy[locale];

  return (
    <footer className="mt-20 border-t border-border/70 bg-card/50">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Image src="/logo.png" alt="BDG" width={156} height={56} className="h-10 w-auto rounded-sm border border-border/50" />
          <p className="text-sm text-muted-foreground">{c.description}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{c.services}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{c.webDev}</li>
            <li>{c.appPlatforms}</li>
            <li>{c.automation}</li>
            <li>{c.seo}</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{c.company}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/case-studies">{c.caseStudies}</Link>
            </li>
            <li>
              <Link href="/blog">{c.blog}</Link>
            </li>
            <li>
              <Link href="/contact">{c.contact}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{c.legal}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{c.terms}</li>
            <li>{c.privacy}</li>
            <li>{c.billing}</li>
          </ul>
        </div>
      </div>
      <div className="container-shell border-t border-border/60 py-4 text-xs text-muted-foreground">
        Copyright {new Date().getFullYear()} BDG. {c.copyright}
      </div>
    </footer>
  );
}
