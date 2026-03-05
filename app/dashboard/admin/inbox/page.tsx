import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: {
    title: "Admin Inbox",
    subtitle: "All incoming client writing in one place.",
    editPlans: "Edit plans",
    editAddons: "Edit add-ons",
    leads: "Leads and contact messages",
    quoteRequests: "Name Your Plan requests",
    clientTickets: "Client tickets",
    clientMessages: "Client messages",
    source: "Source",
    status: "Status",
    budget: "Budget",
    industry: "Industry",
    needs: "Needs",
    empty: "No items yet.",
    noText: "No text provided"
  },
  es: {
    title: "Inbox Admin",
    subtitle: "Todo lo que escriben los clientes en un solo lugar.",
    editPlans: "Editar planes",
    editAddons: "Editar add-ons",
    leads: "Leads y mensajes de contacto",
    quoteRequests: "Solicitudes Nombra Tu Plan",
    clientTickets: "Tickets de clientes",
    clientMessages: "Mensajes de clientes",
    source: "Origen",
    status: "Estado",
    budget: "Presupuesto",
    industry: "Industria",
    needs: "Necesidades",
    empty: "Aún no hay elementos.",
    noText: "Sin texto"
  }
} as const;

type LeadRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string;
  notes: string | null;
  status: string;
  created_at: string;
};

type QuoteRequestRow = {
  id: string;
  business_name: string;
  email: string;
  phone: string;
  budget: number;
  industry: string;
  needs: string[];
  notes: string | null;
  status: string;
  created_at: string;
};

type TicketRow = {
  id: string;
  subject: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function ShortId({ id }: { id: string }) {
  return <span className="font-mono text-xs text-muted-foreground">{id.slice(0, 8)}</span>;
}

export default async function AdminInboxPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const [{ data: leads }, { data: quoteRequests }, { data: tickets }, { data: messages }] = await Promise.all([
    supabase.from("leads").select("id,full_name,email,phone,source,notes,status,created_at").order("created_at", { ascending: false }).limit(30),
    supabase
      .from("quote_requests")
      .select("id,business_name,email,phone,budget,industry,needs,notes,status,created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("tickets")
      .select("id,subject,description,type,status,priority,created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("messages")
      .select("id,sender_id,body,created_at")
      .eq("is_admin_message", false)
      .order("created_at", { ascending: false })
      .limit(30)
  ]);

  const leadsRows = (leads ?? []) as LeadRow[];
  const quoteRows = (quoteRequests ?? []) as QuoteRequestRow[];
  const ticketRows = (tickets ?? []) as TicketRow[];
  const messageRows = (messages ?? []) as MessageRow[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{c.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{c.subtitle}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/plans">{c.editPlans}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/addons">{c.editAddons}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.leads}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {leadsRows.map((lead) => (
              <div key={lead.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{lead.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {lead.email} {lead.phone ? `• ${lead.phone}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.source}: {lead.source} • {c.status}: {lead.status} • {formatDate(lead.created_at)}
                </p>
                <p className="mt-2">{lead.notes || c.noText}</p>
              </div>
            ))}
            {leadsRows.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.quoteRequests}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {quoteRows.map((row) => (
              <div key={row.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{row.business_name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.email} • {row.phone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.status}: {row.status} • {c.budget}: ${row.budget} • {c.industry}: {row.industry} • {formatDate(row.created_at)}
                </p>
                <p className="mt-2">
                  <strong>{c.needs}:</strong> {row.needs.join(", ")}
                </p>
                <p className="mt-1">{row.notes || c.noText}</p>
              </div>
            ))}
            {quoteRows.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.clientTickets}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {ticketRows.map((ticket) => (
              <div key={ticket.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{ticket.subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ticket.type} • {ticket.status} • {ticket.priority} • {formatDate(ticket.created_at)}
                </p>
                <p className="mt-2">{ticket.description || c.noText}</p>
              </div>
            ))}
            {ticketRows.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.clientMessages}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {messageRows.map((message) => (
              <div key={message.id} className="rounded-md border border-border p-3">
                <p className="font-medium">
                  <ShortId id={message.sender_id} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(message.created_at)}</p>
                <p className="mt-2">{message.body || c.noText}</p>
              </div>
            ))}
            {messageRows.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
