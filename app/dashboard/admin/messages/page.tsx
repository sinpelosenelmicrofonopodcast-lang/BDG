import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminMessageForm } from "@/components/dashboard/admin-message-form";

const copy = {
  en: { recent: "Recent messages", admin: "Admin", client: "Client" },
  es: { recent: "Mensajes recientes", admin: "Admin", client: "Cliente" }
} as const;

export default async function AdminMessagesPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();
  const [{ data: profiles }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("id,email,full_name").order("created_at", { ascending: false }).limit(200),
    supabase.from("messages").select("id,body,sender_id,recipient_id,is_admin_message,created_at").order("created_at", { ascending: false }).limit(60)
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminMessageForm recipients={profiles ?? []} />
      <Card>
        <CardHeader>
          <CardTitle>{c.recent}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(messages ?? []).map((message) => (
            <div key={message.id} className="rounded-md border border-border p-3">
              <p className="line-clamp-3">{message.body}</p>
              <p className="text-xs text-muted-foreground">
                {message.is_admin_message ? c.admin : c.client} • {formatDate(message.created_at)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
