"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Blocks,
  Bot,
  CreditCard,
  Globe,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Package,
  Quote,
  Settings,
  ShieldCheck,
  SquareKanban,
  Star,
  Ticket,
  Users
} from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  role: "admin" | "client";
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const copy = {
  en: {
    admin: "Admin workspace",
    client: "Client workspace",
    overview: "Overview",
    inbox: "Inbox",
    clients: "Clients",
    projects: "Projects",
    websites: "Websites",
    plans: "Plans",
    addons: "Add-ons",
    quotes: "Quotes",
    tickets: "Tickets",
    messages: "Messages",
    billing: "Billing",
    alerts: "Alerts",
    audit: "Audit",
    settings: "Settings",
    testimonials: "Testimonials",
    clientPortal: "Client portal",
    adminSubline: "Operations and system control",
    clientSubline: "Projects, support and service status",
    groups: {
      core: "Core",
      delivery: "Delivery",
      system: "System",
      growth: "Growth"
    }
  },
  es: {
    admin: "Workspace admin",
    client: "Workspace cliente",
    overview: "Resumen",
    inbox: "Inbox",
    clients: "Clientes",
    projects: "Proyectos",
    websites: "Websites",
    plans: "Planes",
    addons: "Add-ons",
    quotes: "Cotizaciones",
    tickets: "Tickets",
    messages: "Mensajes",
    billing: "Facturacion",
    alerts: "Alertas",
    audit: "Auditoria",
    settings: "Configuracion",
    testimonials: "Testimonios",
    clientPortal: "Portal cliente",
    adminSubline: "Operacion y control del sistema",
    clientSubline: "Proyectos, soporte y estado del servicio",
    groups: {
      core: "Core",
      delivery: "Operacion",
      system: "Sistema",
      growth: "Crecimiento"
    }
  }
} as const;

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const c = copy[locale];

  const clientGroups = [
    {
      label: c.groups.core,
      items: [{ href: "/dashboard/client", label: c.clientPortal, icon: LayoutDashboard }]
    }
  ];

  const adminGroups: { label: string; items: NavItem[] }[] = [
    {
      label: c.groups.core,
      items: [
        { href: "/dashboard/admin/overview", label: c.overview, icon: LayoutDashboard },
        { href: "/dashboard/admin/inbox", label: c.inbox, icon: Inbox },
        { href: "/dashboard/admin/clients", label: c.clients, icon: Users },
        { href: "/dashboard/admin/quotes", label: c.quotes, icon: Quote }
      ]
    },
    {
      label: c.groups.delivery,
      items: [
        { href: "/dashboard/admin/projects", label: c.projects, icon: SquareKanban },
        { href: "/dashboard/admin/websites", label: c.websites, icon: Globe },
        { href: "/dashboard/admin/tickets", label: c.tickets, icon: Ticket },
        { href: "/dashboard/admin/messages", label: c.messages, icon: MessageSquare },
        { href: "/dashboard/admin/testimonials", label: c.testimonials, icon: Star }
      ]
    },
    {
      label: c.groups.system,
      items: [
        { href: "/dashboard/admin/plans", label: c.plans, icon: Blocks },
        { href: "/dashboard/admin/addons", label: c.addons, icon: Package },
        { href: "/dashboard/admin/billing", label: c.billing, icon: CreditCard },
        { href: "/dashboard/admin/alerts", label: c.alerts, icon: Bell },
        { href: "/dashboard/admin/audit", label: c.audit, icon: ShieldCheck },
        { href: "/dashboard/admin/settings", label: c.settings, icon: Settings }
      ]
    },
    {
      label: c.groups.growth,
      items: [
        { href: "/dashboard/admin/automation-engine", label: "Automation Engine", icon: Bot },
        { href: "/dashboard/admin/facebook-automation", label: "Facebook Automation", icon: Bot }
      ]
    }
  ];

  const groups = role === "admin" ? adminGroups : clientGroups;

  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{role === "admin" ? c.admin : c.client}</p>
          <p className="text-sm text-muted-foreground">{role === "admin" ? c.adminSubline : c.clientSubline}</p>
        </div>
        <Badge variant="secondary">{role}</Badge>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
