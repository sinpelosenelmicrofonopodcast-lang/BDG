import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminCreateClientForm } from "@/components/dashboard/admin-create-client-form";
import { AdminInternalNoteForm } from "@/components/dashboard/admin-internal-note-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

type SearchParams = Promise<{ q?: string }>;

const copy = {
  en: {
    eyebrow: "Admin CRM",
    title: "Clients CRM",
    description: "Search clients, check delivery risk, open balances and leave internal notes without jumping across modules.",
    filters: "Filters",
    search: "Search",
    apply: "Apply",
    company: "Company",
    created: "Created",
    projects: "Projects",
    services: "Service statuses",
    billing: "Billing statuses",
    balance: "Balance",
    expiringSoon: "Expiring soon",
    recentNotes: "Recent notes",
    noNotes: "No notes yet",
    empty: "No clients match this search.",
    emptyBody: "Try another term or create a new client record."
  },
  es: {
    eyebrow: "CRM admin",
    title: "CRM de clientes",
    description: "Busca clientes, revisa riesgo operativo, balance pendiente y deja notas internas sin saltar entre modulos.",
    filters: "Filtros",
    search: "Buscar",
    apply: "Aplicar",
    company: "Empresa",
    created: "Creado",
    projects: "Proyectos",
    services: "Estados de servicio",
    billing: "Estados de cobro",
    balance: "Balance",
    expiringSoon: "Expiran pronto",
    recentNotes: "Notas recientes",
    noNotes: "Sin notas",
    empty: "Ningun cliente coincide con la busqueda.",
    emptyBody: "Prueba otro termino o crea un nuevo cliente."
  }
} as const;

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  created_at: string;
};

export default async function AdminClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await getServerLocale();
  const c = copy[locale];
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const supabase = await getSupabaseServerClient();
  const [{ data: clients }, { data: projects }, { data: billingEvents }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,email,company_name,created_at").order("created_at", { ascending: false }).limit(150),
    supabase
      .from("projects")
      .select("id,client_id,service_status,billing_status,expiration_date")
      .order("created_at", { ascending: false }),
    supabase.from("billing_events").select("id,client_id,status,amount,due_date").order("created_at", { ascending: false }).limit(800),
    supabase
      .from("internal_notes")
      .select("id,client_id,note,visibility,created_at")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  const projectByClient = new Map<string, { total: number; service: Record<string, number>; billing: Record<string, number>; expiringSoon: number }>();
  const today = new Date();

  for (const project of projects ?? []) {
    const current = projectByClient.get(project.client_id) ?? { total: 0, service: {}, billing: {}, expiringSoon: 0 };
    current.total += 1;
    const serviceStatus = project.service_status ?? "active";
    const billingStatus = project.billing_status ?? "current";
    current.service[serviceStatus] = (current.service[serviceStatus] ?? 0) + 1;
    current.billing[billingStatus] = (current.billing[billingStatus] ?? 0) + 1;

    if (project.expiration_date) {
      const expirationDate = new Date(project.expiration_date);
      const diffMs = expirationDate.getTime() - today.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 14) {
        current.expiringSoon += 1;
      }
    }

    projectByClient.set(project.client_id, current);
  }

  const balanceByClient = new Map<string, number>();
  for (const event of billingEvents ?? []) {
    if (event.status === "open" || event.status === "past_due" || event.status === "failed") {
      balanceByClient.set(event.client_id, (balanceByClient.get(event.client_id) ?? 0) + Number(event.amount));
    }
  }

  const notesByClient = new Map<string, { id: string; note: string; visibility: string; created_at: string }[]>();
  for (const note of notes ?? []) {
    const key = note.client_id;
    if (!key) continue;
    const current = notesByClient.get(key) ?? [];
    current.push(note);
    notesByClient.set(key, current);
  }

  const filteredClients = ((clients ?? []) as ClientProfile[]).filter((client) => {
    if (!query) {
      return true;
    }

    const haystack = [client.full_name, client.email, client.company_name].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className="space-y-4">
      <DashboardPageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <AdminCreateClientForm locale={locale} />

      <Card>
        <CardHeader>
          <CardTitle>{c.filters}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" method="get">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">{c.search}</span>
              <Input name="q" defaultValue={query} />
            </label>
            <Button type="submit" variant="outline" className="self-end">
              {c.apply}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{c.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredClients.length === 0 ? <EmptyState title={c.empty} description={c.emptyBody} compact /> : null}
          {filteredClients.map((client) => {
            const projectStats = projectByClient.get(client.id) ?? { total: 0, service: {}, billing: {}, expiringSoon: 0 };
            const clientBalance = balanceByClient.get(client.id) ?? 0;
            const clientNotes = notesByClient.get(client.id)?.slice(0, 3) ?? [];

            return (
              <div key={client.id} className="space-y-3 rounded-xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{client.full_name || client.email || client.id}</p>
                    <p className="text-xs text-muted-foreground">{client.email || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.company}: {client.company_name || "-"} • {c.created}: {formatDate(client.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {c.projects}: {projectStats.total}
                    </Badge>
                    <Badge variant={clientBalance > 0 ? "warning" : "success"}>
                      {c.balance}: ${clientBalance.toFixed(0)}
                    </Badge>
                    {projectStats.expiringSoon > 0 ? <Badge variant="warning">{c.expiringSoon}: {projectStats.expiringSoon}</Badge> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-muted-foreground">{c.services}:</span>
                  {Object.entries(projectStats.service).map(([key, value]) => (
                    <Badge key={key} variant="outline">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-muted-foreground">{c.billing}:</span>
                  {Object.entries(projectStats.billing).map(([key, value]) => (
                    <Badge key={key} variant="outline">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{c.recentNotes}</p>
                  {clientNotes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{c.noNotes}</p>
                  ) : (
                    clientNotes.map((note) => (
                      <p key={note.id} className="rounded-md bg-secondary/50 px-2 py-1 text-xs">
                        {note.visibility} • {formatDate(note.created_at)} • {note.note}
                      </p>
                    ))
                  )}
                </div>

                <AdminInternalNoteForm locale={locale} clientId={client.id} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
