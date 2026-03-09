import { requireUser } from "@/lib/auth";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketForm } from "@/components/dashboard/ticket-form";
import { MessageForm } from "@/components/dashboard/message-form";
import { AddonRequestForm } from "@/components/dashboard/addon-request-form";
import { AssetUploadForm } from "@/components/dashboard/asset-upload-form";
import { BillingPortalButton } from "@/components/dashboard/billing-portal-button";
import { ClientTestimonialForm } from "@/components/dashboard/client-testimonial-form";

const copy = {
  en: {
    activeProjects: "Active projects",
    openTickets: "Open tickets",
    pendingAddons: "Pending add-ons",
    uploadedFiles: "Uploaded files",
    planStatus: "Plan and service status",
    noProjects: "No active projects yet.",
    expires: "Expires",
    due: "Due",
    tbd: "TBD",
    price: "Price",
    nextBilling: "Next billing",
    service: "Service",
    billing: "Billing",
    payments: "Payments",
    noPayments: "No payment records yet.",
    amount: "Amount",
    status: "Status",
    websites: "Websites",
    noWebsites: "No websites linked yet.",
    addOns: "Active add-ons",
    noAddOns: "No active add-ons yet.",
    internalUpdates: "Internal updates",
    noUpdates: "No updates yet.",
    recentTickets: "Recent tickets",
    recentMessages: "Recent messages"
  },
  es: {
    activeProjects: "Proyectos activos",
    openTickets: "Tickets abiertos",
    pendingAddons: "Add-ons pendientes",
    uploadedFiles: "Archivos subidos",
    planStatus: "Estado de plan y servicio",
    noProjects: "No hay proyectos activos todavia.",
    expires: "Expira",
    due: "Entrega",
    tbd: "Por definir",
    price: "Precio",
    nextBilling: "Proximo cobro",
    service: "Servicio",
    billing: "Cobro",
    payments: "Pagos",
    noPayments: "Sin registros de pago.",
    amount: "Monto",
    status: "Estado",
    websites: "Websites",
    noWebsites: "No hay websites vinculados.",
    addOns: "Add-ons activos",
    noAddOns: "Sin add-ons activos.",
    internalUpdates: "Actualizaciones internas",
    noUpdates: "Sin actualizaciones.",
    recentTickets: "Tickets recientes",
    recentMessages: "Mensajes recientes"
  }
} as const;

export default async function ClientDashboardPage() {
  const user = await requireUser();
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const [
    { data: profile },
    { data: projects },
    { data: tickets },
    { data: messages },
    { data: addonRequests },
    { data: files },
    { data: addons },
    { data: entitlements },
    { data: websites },
    { data: billingEvents },
    { data: internalNotes },
    { data: alerts }
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("projects")
      .select("id,name,status,service_status,billing_status,due_date,expiration_date,next_billing_date,total_price")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("tickets").select("id,subject,status,type,created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase
      .from("messages")
      .select("id,body,created_at,is_admin_message")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("addon_requests").select("id,status,created_at,addon_id").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("files").select("id,path,created_at,project_id").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("addons").select("id,name").eq("active", true),
    supabase.from("entitlements").select("id,status,type,starts_at,expires_at,addon_id,project_id").order("created_at", { ascending: false }).limit(100),
    supabase
      .from("project_websites")
      .select("id,label,domain,status,website_url,ssl_expires_at,last_checked_at,project_id")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_events")
      .select("id,status,amount,currency,due_date,paid_at,created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("internal_notes")
      .select("id,note,visibility,created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("admin_alerts")
      .select("id,title,message,severity,status,created_at")
      .eq("client_id", user.id)
      .eq("visible_to_client", true)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const projectOptions = (projects ?? []).map((project) => ({ id: project.id, name: project.name }));
  const addonMap = new Map((addons ?? []).map((addon) => [addon.id, addon.name]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.activeProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.openTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(tickets ?? []).filter((ticket) => ticket.status === "open").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.pendingAddons}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(addonRequests ?? []).filter((item) => item.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{c.uploadedFiles}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{files?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.planStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(projects ?? []).length === 0 ? <p className="text-muted-foreground">{c.noProjects}</p> : null}
            {(projects ?? []).map((project) => (
              <div key={project.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{project.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={project.service_status === "active" ? "success" : "warning"}>{c.service}: {project.service_status ?? project.status}</Badge>
                  <Badge variant={project.billing_status === "current" ? "secondary" : "warning"}>{c.billing}: {project.billing_status ?? "current"}</Badge>
                  {project.expiration_date ? <Badge variant="warning">{c.expires} {formatDate(project.expiration_date)}</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.due}: {project.due_date ? formatDate(project.due_date) : c.tbd} | {c.nextBilling}: {project.next_billing_date ? formatDate(project.next_billing_date) : c.tbd}
                </p>
                <p className="text-xs text-muted-foreground">{c.price}: ${project.total_price ?? 0}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.payments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(billingEvents ?? []).length === 0 ? <p className="text-muted-foreground">{c.noPayments}</p> : null}
            {(billingEvents ?? []).map((payment) => (
              <div key={payment.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">
                  {c.amount}: ${Number(payment.amount).toFixed(0)} {payment.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.status}: {payment.status} • {payment.due_date ? formatDate(payment.due_date) : formatDate(payment.created_at)}
                </p>
              </div>
            ))}
            <BillingPortalButton />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.websites}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(websites ?? []).map((website) => (
              <div key={website.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{website.label} • {website.domain}</p>
                <p className="text-xs text-muted-foreground">{website.website_url ?? "-"}</p>
                <Badge variant={website.status === "active" ? "success" : "warning"}>{website.status}</Badge>
              </div>
            ))}
            {(websites ?? []).length === 0 ? <p className="text-muted-foreground">{c.noWebsites}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.addOns}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(entitlements ?? []).map((item) => (
              <div key={item.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{addonMap.get(item.addon_id ?? "") ?? item.addon_id ?? "Add-on"}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type} • {item.status} • {formatDate(item.starts_at)}
                  {item.expires_at ? ` → ${formatDate(item.expires_at)}` : ""}
                </p>
              </div>
            ))}
            {(entitlements ?? []).length === 0 ? <p className="text-muted-foreground">{c.noAddOns}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.internalUpdates}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(alerts ?? []).map((alert) => (
              <div key={alert.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{alert.title}</p>
                {alert.message ? <p>{alert.message}</p> : null}
                <p className="text-xs text-muted-foreground">{alert.severity} • {formatDate(alert.created_at)}</p>
              </div>
            ))}
            {(internalNotes ?? []).map((note) => (
              <div key={note.id} className="rounded-md border border-border p-3">
                <p>{note.note}</p>
                <p className="text-xs text-muted-foreground">{note.visibility} • {formatDate(note.created_at)}</p>
              </div>
            ))}
            {(alerts ?? []).length === 0 && (internalNotes ?? []).length === 0 ? <p className="text-muted-foreground">{c.noUpdates}</p> : null}
          </CardContent>
        </Card>

        <ClientTestimonialForm locale={locale} defaultFullName={profile?.full_name} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projectOptions.length > 0 ? <TicketForm projects={projectOptions} /> : null}
        {projectOptions.length > 0 ? <MessageForm projects={projectOptions} /> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projectOptions.length > 0 ? <AssetUploadForm projects={projectOptions} /> : null}
        {projectOptions.length > 0 ? <AddonRequestForm projects={projectOptions} addons={addons ?? []} /> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{c.recentTickets}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(tickets ?? []).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.type}</p>
                </div>
                <Badge variant={ticket.status === "open" ? "warning" : "secondary"}>{ticket.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.recentMessages}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(messages ?? []).map((message) => (
              <div key={message.id} className="rounded-md border border-border p-3">
                <p className="line-clamp-3">{message.body}</p>
                <p className="text-xs text-muted-foreground">{formatDate(message.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
