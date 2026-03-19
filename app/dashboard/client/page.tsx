import {
  Bell,
  CreditCard,
  FileUp,
  FolderKanban,
  Globe,
  MessageSquare,
  Package,
  Ticket
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { TicketForm } from "@/components/dashboard/ticket-form";
import { MessageForm } from "@/components/dashboard/message-form";
import { AddonRequestForm } from "@/components/dashboard/addon-request-form";
import { AssetUploadForm } from "@/components/dashboard/asset-upload-form";
import { BillingPortalButton } from "@/components/dashboard/billing-portal-button";
import { ClientTestimonialForm } from "@/components/dashboard/client-testimonial-form";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const copy = {
  en: {
    eyebrow: "Client workspace",
    title: "Project and service visibility",
    description: "Track projects, billing, website status and support from one place.",
    activeProjects: "Active projects",
    openTickets: "Open tickets",
    pendingAddons: "Pending add-ons",
    uploadedFiles: "Uploaded files",
    planStatus: "Plan and service status",
    noProjects: "No active projects yet.",
    noProjectsBody: "Once a project is active, this area will show service status, billing and delivery dates.",
    expires: "Expires",
    due: "Due",
    tbd: "TBD",
    price: "Price",
    nextBilling: "Next billing",
    service: "Service",
    billing: "Billing",
    payments: "Payments",
    noPayments: "No payment records yet.",
    noPaymentsBody: "Billing events will appear here once invoices or subscription charges are created.",
    amount: "Amount",
    status: "Status",
    websites: "Websites",
    noWebsites: "No websites linked yet.",
    noWebsitesBody: "When domains and launch URLs are attached to your projects, you will see them here.",
    addOns: "Active add-ons",
    noAddOns: "No active add-ons yet.",
    noAddOnsBody: "Approved add-ons and time-bound entitlements will appear here.",
    internalUpdates: "Internal updates",
    noUpdates: "No updates yet.",
    noUpdatesBody: "Project alerts and internal notes shared with your account will appear here.",
    recentTickets: "Recent tickets",
    noRecentTickets: "No tickets yet.",
    noRecentTicketsBody: "Use the support form below whenever you need help or a request.",
    recentMessages: "Recent messages",
    noRecentMessages: "No messages yet.",
    noRecentMessagesBody: "Messages with your project team will show up here."
  },
  es: {
    eyebrow: "Workspace cliente",
    title: "Visibilidad de proyectos y servicio",
    description: "Sigue proyectos, cobros, websites y soporte desde un solo lugar.",
    activeProjects: "Proyectos activos",
    openTickets: "Tickets abiertos",
    pendingAddons: "Add-ons pendientes",
    uploadedFiles: "Archivos subidos",
    planStatus: "Estado de plan y servicio",
    noProjects: "No hay proyectos activos todavia.",
    noProjectsBody: "Cuando un proyecto este activo, aqui veras servicio, cobro y fechas clave.",
    expires: "Expira",
    due: "Entrega",
    tbd: "Por definir",
    price: "Precio",
    nextBilling: "Proximo cobro",
    service: "Servicio",
    billing: "Cobro",
    payments: "Pagos",
    noPayments: "Sin registros de pago.",
    noPaymentsBody: "Los eventos de cobro apareceran aqui cuando existan facturas o cargos de suscripcion.",
    amount: "Monto",
    status: "Estado",
    websites: "Websites",
    noWebsites: "No hay websites vinculados.",
    noWebsitesBody: "Cuando se conecten dominios y URLs de lanzamiento a tus proyectos, apareceran aqui.",
    addOns: "Add-ons activos",
    noAddOns: "Sin add-ons activos.",
    noAddOnsBody: "Los add-ons aprobados y las vigencias activas apareceran aqui.",
    internalUpdates: "Actualizaciones internas",
    noUpdates: "Sin actualizaciones.",
    noUpdatesBody: "Las alertas y notas internas visibles para tu cuenta apareceran aqui.",
    recentTickets: "Tickets recientes",
    noRecentTickets: "Todavia no hay tickets.",
    noRecentTicketsBody: "Usa el formulario de soporte de abajo cuando necesites ayuda o un cambio.",
    recentMessages: "Mensajes recientes",
    noRecentMessages: "Todavia no hay mensajes.",
    noRecentMessagesBody: "Los mensajes con tu equipo del proyecto apareceran aqui."
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
      <DashboardPageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label={c.activeProjects} value={projects?.length ?? 0} icon={FolderKanban} />
        <DashboardStatCard
          label={c.openTickets}
          value={(tickets ?? []).filter((ticket) => ticket.status === "open").length}
          icon={Ticket}
          tone="warning"
        />
        <DashboardStatCard
          label={c.pendingAddons}
          value={(addonRequests ?? []).filter((item) => item.status === "pending").length}
          icon={Package}
        />
        <DashboardStatCard label={c.uploadedFiles} value={files?.length ?? 0} icon={FileUp} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.planStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(projects ?? []).length === 0 ? <EmptyState title={c.noProjects} description={c.noProjectsBody} compact icon={FolderKanban} /> : null}
            {(projects ?? []).map((project) => (
              <div key={project.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {c.due}: {project.due_date ? formatDate(project.due_date) : c.tbd} | {c.nextBilling}:{" "}
                      {project.next_billing_date ? formatDate(project.next_billing_date) : c.tbd}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.price}: ${project.total_price ?? 0}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={project.service_status === "active" ? "success" : "warning"}>
                      {c.service}: {project.service_status ?? project.status}
                    </Badge>
                    <Badge variant={project.billing_status === "current" ? "secondary" : "warning"}>
                      {c.billing}: {project.billing_status ?? "current"}
                    </Badge>
                    {project.expiration_date ? <Badge variant="warning">{c.expires} {formatDate(project.expiration_date)}</Badge> : null}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <CardTitle>{c.payments}</CardTitle>
            <BillingPortalButton />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(billingEvents ?? []).length === 0 ? <EmptyState title={c.noPayments} description={c.noPaymentsBody} compact icon={CreditCard} /> : null}
            {(billingEvents ?? []).map((payment) => (
              <div key={payment.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {c.amount}: ${Number(payment.amount).toFixed(0)} {payment.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.status}: {payment.status} • {payment.due_date ? formatDate(payment.due_date) : formatDate(payment.created_at)}
                    </p>
                  </div>
                  <Badge variant={payment.status === "paid" ? "success" : "warning"}>{payment.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.websites}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(websites ?? []).length === 0 ? <EmptyState title={c.noWebsites} description={c.noWebsitesBody} compact icon={Globe} /> : null}
            {(websites ?? []).map((website) => (
              <div key={website.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{website.label} • {website.domain}</p>
                    <p className="text-xs text-muted-foreground">{website.website_url ?? "-"}</p>
                  </div>
                  <Badge variant={website.status === "active" ? "success" : "warning"}>{website.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.addOns}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(entitlements ?? []).length === 0 ? <EmptyState title={c.noAddOns} description={c.noAddOnsBody} compact icon={Package} /> : null}
            {(entitlements ?? []).map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">{addonMap.get(item.addon_id ?? "") ?? item.addon_id ?? "Add-on"}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type} • {item.status} • {formatDate(item.starts_at)}
                  {item.expires_at ? ` → ${formatDate(item.expires_at)}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{c.internalUpdates}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(alerts ?? []).length === 0 && (internalNotes ?? []).length === 0 ? (
              <EmptyState title={c.noUpdates} description={c.noUpdatesBody} compact icon={Bell} />
            ) : null}
            {(alerts ?? []).map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    {alert.message ? <p className="mt-1 leading-6">{alert.message}</p> : null}
                    <p className="text-xs text-muted-foreground">{alert.severity} • {formatDate(alert.created_at)}</p>
                  </div>
                  <Badge variant={alert.severity === "critical" || alert.severity === "high" ? "warning" : "secondary"}>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
            {(internalNotes ?? []).map((note) => (
              <div key={note.id} className="rounded-xl border border-border p-4">
                <p>{note.note}</p>
                <p className="text-xs text-muted-foreground">{note.visibility} • {formatDate(note.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <ClientTestimonialForm locale={locale} defaultFullName={profile?.full_name} />
      </div>

      {projectOptions.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <TicketForm projects={projectOptions} />
          <MessageForm projects={projectOptions} />
        </div>
      ) : null}

      {projectOptions.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <AssetUploadForm projects={projectOptions} />
          <AddonRequestForm projects={projectOptions} addons={addons ?? []} />
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{c.recentTickets}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(tickets ?? []).length === 0 ? <EmptyState title={c.noRecentTickets} description={c.noRecentTicketsBody} compact icon={Ticket} /> : null}
            {(tickets ?? []).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
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
          <CardContent className="space-y-3 text-sm">
            {(messages ?? []).length === 0 ? <EmptyState title={c.noRecentMessages} description={c.noRecentMessagesBody} compact icon={MessageSquare} /> : null}
            {(messages ?? []).map((message) => (
              <div key={message.id} className="rounded-xl border border-border p-4">
                <p className="line-clamp-3">{message.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(message.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
