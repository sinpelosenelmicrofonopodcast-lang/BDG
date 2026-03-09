import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTicketStatusActions } from "@/components/dashboard/admin-ticket-status-actions";

const labels = {
  en: {
    open: "Open",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed"
  },
  es: {
    open: "Abierto",
    inProgress: "En progreso",
    resolved: "Resuelto",
    closed: "Cerrado"
  }
} as const;

export default async function AdminTicketsPage() {
  const locale = await getServerLocale();
  const l = labels[locale];

  const ticketColumns = [
    { key: "open", label: l.open },
    { key: "in_progress", label: l.inProgress },
    { key: "resolved", label: l.resolved },
    { key: "closed", label: l.closed }
  ] as const;

  const supabase = await getSupabaseServerClient();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id,subject,type,priority,status,created_at")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {ticketColumns.map((column) => (
        <Card key={column.key}>
          <CardHeader>
            <CardTitle className="text-lg">{column.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(tickets ?? [])
              .filter((ticket) => ticket.status === column.key)
              .map((ticket) => (
                <div key={ticket.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.type} • {ticket.priority}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>

                  <AdminTicketStatusActions
                    ticketId={ticket.id}
                    locale={locale}
                    initialStatus={ticket.status}
                    initialPriority={ticket.priority}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
