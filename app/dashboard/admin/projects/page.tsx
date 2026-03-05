import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const copy = {
  en: { title: "Projects", client: "Client ID", start: "Start", due: "Due", expiration: "Expiration", total: "Total" },
  es: { title: "Proyectos", client: "ID Cliente", start: "Inicio", due: "Entrega", expiration: "Expira", total: "Total" }
} as const;

export default async function AdminProjectsPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id,name,client_id,status,start_date,due_date,expiration_date,total_price")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(projects ?? []).map((project) => (
          <div key={project.id} className="rounded-md border border-border p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{project.name}</p>
              <Badge variant={project.status === "active" ? "success" : "secondary"}>{project.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {c.client}: {project.client_id}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.start}: {project.start_date ? formatDate(project.start_date) : "-"} | {c.due}: {project.due_date ? formatDate(project.due_date) : "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.expiration}: {project.expiration_date ? formatDate(project.expiration_date) : "-"} | {c.total}: ${project.total_price ?? 0}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
