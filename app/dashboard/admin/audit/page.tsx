import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: { title: "Admin audit log", entityId: "Entity ID", adminId: "Admin ID" },
  es: { title: "Log de auditoría admin", entityId: "ID Entidad", adminId: "ID Admin" }
} as const;

export default async function AdminAuditPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();
  const { data: audit } = await supabase
    .from("admin_audit_log")
    .select("id,admin_id,action,entity_type,entity_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {(audit ?? []).map((entry) => (
          <div key={entry.id} className="rounded-md border border-border p-3">
            <p className="font-medium">
              {entry.action} • {entry.entity_type}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.entityId}: {entry.entity_id ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.adminId}: {entry.admin_id}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
