import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminProjectServiceActions } from "@/components/dashboard/admin-project-service-actions";
import { AdminCreateProjectForm } from "@/components/dashboard/admin-create-project-form";

type SearchParams = Promise<{ service?: string; billing?: string; q?: string }>;

const copy = {
  en: {
    title: "Projects",
    filters: "Filters",
    service: "Service",
    billing: "Billing",
    search: "Search",
    apply: "Apply",
    client: "Client",
    start: "Start",
    due: "Due",
    expiration: "Expiration",
    total: "Total",
    nextBilling: "Next billing",
    noResults: "No projects found.",
    noClientsHint: "Create at least one client to enable manual project creation."
  },
  es: {
    title: "Proyectos",
    filters: "Filtros",
    service: "Servicio",
    billing: "Cobro",
    search: "Buscar",
    apply: "Aplicar",
    client: "Cliente",
    start: "Inicio",
    due: "Entrega",
    expiration: "Expiracion",
    total: "Total",
    nextBilling: "Proximo cobro",
    noResults: "No se encontraron proyectos.",
    noClientsHint: "Crea al menos un cliente para habilitar la creacion manual de proyectos."
  }
} as const;

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
};

type PlanOption = {
  id: string;
  name: string;
  active: boolean;
};

export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await getServerLocale();
  const c = copy[locale];
  const params = await searchParams;
  const serviceFilter = params.service ?? "all";
  const billingFilter = params.billing ?? "all";
  const query = (params.q ?? "").trim().toLowerCase();

  const supabase = await getSupabaseServerClient();
  let projectsQuery = supabase
    .from("projects")
    .select(
      "id,name,client_id,status,service_status,billing_status,start_date,due_date,expiration_date,next_billing_date,total_price,suspension_reason"
    )
    .order("created_at", { ascending: false })
    .limit(150);

  if (serviceFilter !== "all") {
    projectsQuery = projectsQuery.eq("service_status", serviceFilter);
  }

  if (billingFilter !== "all") {
    projectsQuery = projectsQuery.eq("billing_status", billingFilter);
  }

  const [projectsResult, clientsResult, plansResult] = await Promise.all([
    projectsQuery,
    supabase.from("profiles").select("id,full_name,email,company_name").order("created_at", { ascending: false }).limit(300),
    supabase.from("plans").select("id,name,active").order("created_at", { ascending: false }).limit(200)
  ]);

  const projects = projectsResult.data ?? [];
  const clientsForForm = (clientsResult.data ?? []) as ClientProfile[];
  const plansForForm = (plansResult.data ?? []) as PlanOption[];

  const clientIds = [...new Set(projects.map((item) => item.client_id))];
  const { data: profiles } = clientIds.length
    ? await supabase.from("profiles").select("id,full_name,email,company_name").in("id", clientIds)
    : { data: [] as ClientProfile[] };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const filteredProjects = projects.filter((project) => {
    if (!query) {
      return true;
    }

    const profile = profileMap.get(project.client_id);
    const haystack = [project.name, profile?.full_name, profile?.email, profile?.company_name].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className="space-y-4">
      <AdminCreateProjectForm locale={locale} clients={clientsForForm} plans={plansForForm} />

      {clientsForForm.length === 0 ? (
        <p className="text-xs text-muted-foreground">{c.noClientsHint}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{c.filters}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" method="get">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">{c.service}</span>
              <select name="service" defaultValue={serviceFilter} className="h-9 w-full rounded-md border border-input bg-background px-2">
                <option value="all">all</option>
                <option value="active">active</option>
                <option value="past_due">past_due</option>
                <option value="suspended">suspended</option>
                <option value="canceled">canceled</option>
              </select>
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">{c.billing}</span>
              <select name="billing" defaultValue={billingFilter} className="h-9 w-full rounded-md border border-input bg-background px-2">
                <option value="all">all</option>
                <option value="current">current</option>
                <option value="past_due">past_due</option>
                <option value="unpaid">unpaid</option>
                <option value="canceled">canceled</option>
              </select>
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">{c.search}</span>
              <input name="q" defaultValue={query} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" />
            </label>
            <button type="submit" className="h-9 rounded-md border border-border bg-secondary px-3 text-sm font-medium">
              {c.apply}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{c.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredProjects.map((project) => {
            const profile = profileMap.get(project.client_id);

            return (
              <div key={project.id} className="rounded-md border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{project.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={project.service_status === "active" ? "success" : "warning"}>{project.service_status}</Badge>
                    <Badge variant={project.billing_status === "current" ? "secondary" : "warning"}>{project.billing_status}</Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {c.client}: {profile?.full_name || profile?.company_name || profile?.email || project.client_id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.start}: {project.start_date ? formatDate(project.start_date) : "-"} | {c.due}: {project.due_date ? formatDate(project.due_date) : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.expiration}: {project.expiration_date ? formatDate(project.expiration_date) : "-"} | {c.nextBilling}: {project.next_billing_date ? formatDate(project.next_billing_date) : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.total}: ${project.total_price ?? 0}
                </p>

                <AdminProjectServiceActions
                  projectId={project.id}
                  locale={locale}
                  initialServiceStatus={project.service_status ?? "active"}
                  initialBillingStatus={project.billing_status ?? "current"}
                  initialNextBillingDate={project.next_billing_date}
                  initialExpirationDate={project.expiration_date}
                  initialSuspensionReason={project.suspension_reason}
                />
              </div>
            );
          })}

          {filteredProjects.length === 0 ? <p className="text-sm text-muted-foreground">{c.noResults}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
