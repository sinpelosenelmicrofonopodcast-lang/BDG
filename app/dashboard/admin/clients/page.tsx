import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  en: { title: "Clients", name: "Name", email: "Email", company: "Company", created: "Created" },
  es: { title: "Clientes", name: "Nombre", email: "Email", company: "Empresa", created: "Creado" }
} as const;

export default async function AdminClientsPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();
  const { data: clients } = await supabase.from("profiles").select("id,full_name,email,company_name,created_at").order("created_at", { ascending: false }).limit(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">{c.name}</th>
                <th className="py-2">{c.email}</th>
                <th className="py-2">{c.company}</th>
                <th className="py-2">{c.created}</th>
              </tr>
            </thead>
            <tbody>
              {(clients ?? []).map((client) => (
                <tr key={client.id} className="border-b border-border/60">
                  <td className="py-2">{client.full_name || "-"}</td>
                  <td className="py-2">{client.email || "-"}</td>
                  <td className="py-2">{client.company_name || "-"}</td>
                  <td className="py-2">{formatDate(client.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
