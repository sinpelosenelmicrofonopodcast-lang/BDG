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

const copy = {
  en: {
    activeProjects: "Active projects",
    openTickets: "Open tickets",
    pendingAddons: "Pending add-ons",
    uploadedFiles: "Uploaded files",
    planStatus: "Plan and project status",
    noProjects: "No active projects yet.",
    expires: "Expires",
    due: "Due",
    tbd: "TBD",
    price: "Price",
    quotesInvoices: "Quotes and invoices",
    noQuotes: "No quotes linked to your account yet.",
    quote: "Quote",
    status: "Status",
    total: "Total",
    deposit: "Deposit",
    paymentAvailable: "Payment available",
    awaitingAcceptance: "Awaiting acceptance",
    recentTickets: "Recent tickets",
    recentMessages: "Recent messages"
  },
  es: {
    activeProjects: "Proyectos activos",
    openTickets: "Tickets abiertos",
    pendingAddons: "Add-ons pendientes",
    uploadedFiles: "Archivos subidos",
    planStatus: "Estado de plan y proyecto",
    noProjects: "No hay proyectos activos todavía.",
    expires: "Expira",
    due: "Entrega",
    tbd: "Por definir",
    price: "Precio",
    quotesInvoices: "Cotizaciones y facturas",
    noQuotes: "No hay cotizaciones vinculadas a tu cuenta.",
    quote: "Cotización",
    status: "Estado",
    total: "Total",
    deposit: "Depósito",
    paymentAvailable: "Pago disponible",
    awaitingAcceptance: "Pendiente de aceptación",
    recentTickets: "Tickets recientes",
    recentMessages: "Mensajes recientes"
  }
} as const;

export default async function ClientDashboardPage() {
  const user = await requireUser();
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const [{ data: projects }, { data: tickets }, { data: messages }, { data: quoteList }, { data: addonRequests }, { data: files }, { data: addons }] =
    await Promise.all([
      supabase.from("projects").select("id,name,status,due_date,expiration_date,total_price,timeline").eq("client_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tickets").select("id,subject,status,type,created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase
        .from("messages")
        .select("id,body,created_at,is_admin_message")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("quotes").select("id,status,total,deposit_required,payment_unlocked,created_at").eq("client_id", user.id).order("created_at", { ascending: false }),
      supabase.from("addon_requests").select("id,status,created_at,addon_id").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("files").select("id,path,created_at,project_id").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("addons").select("id,name").eq("active", true)
    ]);

  const projectOptions = (projects ?? []).map((project) => ({ id: project.id, name: project.name }));

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
                  <Badge variant="secondary">{project.status}</Badge>
                  {project.expiration_date ? <Badge variant="warning">{c.expires} {formatDate(project.expiration_date)}</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.due}: {project.due_date ? formatDate(project.due_date) : c.tbd} | {c.price}: ${project.total_price ?? 0}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.quotesInvoices}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(quoteList ?? []).length === 0 ? <p className="text-muted-foreground">{c.noQuotes}</p> : null}
            {(quoteList ?? []).map((quote) => (
              <div key={quote.id} className="rounded-md border border-border p-3">
                <p className="font-semibold">
                  {c.quote} #{quote.id.slice(0, 8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.status}: {quote.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.total}: ${Number(quote.total).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.deposit}: ${Number(quote.deposit_required).toFixed(0)}
                </p>
                {quote.payment_unlocked ? <Badge variant="success">{c.paymentAvailable}</Badge> : <Badge variant="outline">{c.awaitingAcceptance}</Badge>}
              </div>
            ))}
            <BillingPortalButton />
          </CardContent>
        </Card>
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
