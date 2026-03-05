"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  role: "admin" | "client";
};

const copy = {
  en: {
    menu: "menu",
    clientPortal: "Client Portal",
    overview: "Overview",
    clients: "Clients",
    projects: "Projects",
    plans: "Plans",
    addons: "Add-ons",
    quotes: "Quotes",
    tickets: "Tickets",
    messages: "Messages",
    billing: "Billing",
    audit: "Audit",
    settings: "Settings",
    testimonials: "Testimonials"
  },
  es: {
    menu: "menú",
    clientPortal: "Portal Cliente",
    overview: "Resumen",
    clients: "Clientes",
    projects: "Proyectos",
    plans: "Planes",
    addons: "Add-ons",
    quotes: "Cotizaciones",
    tickets: "Tickets",
    messages: "Mensajes",
    billing: "Facturación",
    audit: "Auditoría",
    settings: "Configuración",
    testimonials: "Testimonios"
  }
} as const;

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const c = copy[locale];

  const clientLinks = [{ href: "/dashboard/client", label: c.clientPortal }];

  const adminLinks = [
    { href: "/dashboard/admin/overview", label: c.overview },
    { href: "/dashboard/admin/clients", label: c.clients },
    { href: "/dashboard/admin/projects", label: c.projects },
    { href: "/dashboard/admin/plans", label: c.plans },
    { href: "/dashboard/admin/addons", label: c.addons },
    { href: "/dashboard/admin/quotes", label: c.quotes },
    { href: "/dashboard/admin/tickets", label: c.tickets },
    { href: "/dashboard/admin/messages", label: c.messages },
    { href: "/dashboard/admin/billing", label: c.billing },
    { href: "/dashboard/admin/audit", label: c.audit },
    { href: "/dashboard/admin/testimonials", label: c.testimonials },
    { href: "/dashboard/admin/settings", label: c.settings }
  ];

  const links = role === "admin" ? adminLinks : clientLinks;

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {role} {c.menu}
      </p>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
              pathname === link.href && "bg-secondary text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
