import { TestimonialForm } from "@/components/dashboard/testimonial-form";
import { AdminTestimonialActions } from "@/components/dashboard/admin-testimonial-actions";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const copy = {
  en: {
    eyebrow: "Social proof",
    title: "Testimonials",
    description: "Review incoming testimonials, decide what becomes public and highlight the strongest proof.",
    recent: "Recent testimonials",
    pending: "Pending approval",
    status: "Status",
    featured: "Featured",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    empty: "No testimonials yet.",
    emptyBody: "New client feedback will appear here once submitted."
  },
  es: {
    eyebrow: "Prueba social",
    title: "Testimonios",
    description: "Revisa testimonios entrantes, decide cuales se publican y destaca la mejor prueba social.",
    recent: "Testimonios recientes",
    pending: "Pendientes de aprobacion",
    status: "Estado",
    featured: "Destacado",
    active: "Activo",
    inactive: "Inactivo",
    yes: "Si",
    no: "No",
    empty: "Aun no hay testimonios.",
    emptyBody: "Los nuevos testimonios enviados por clientes apareceran aqui."
  }
} as const;

type Row = {
  id: string;
  full_name: string;
  company_name: string | null;
  company_role: string | null;
  quote_en: string | null;
  quote_es: string | null;
  is_featured: boolean;
  active: boolean;
  created_at: string;
};

export default async function AdminTestimonialsPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("testimonials")
    .select("id,full_name,company_name,company_role,quote_en,quote_es,is_featured,active,created_at")
    .order("active", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(80);

  const rows = (data ?? []) as Row[];
  const pendingRows = rows.filter((row) => !row.active);

  return (
    <div className="space-y-6">
      <DashboardPageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <TestimonialForm />

      <Card>
        <CardHeader>
          <CardTitle>{c.pending}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingRows.length === 0 ? <EmptyState title={c.empty} description={c.emptyBody} compact /> : null}
          {pendingRows.map((row) => {
            const quote = locale === "es" ? (row.quote_es ?? row.quote_en) : (row.quote_en ?? row.quote_es);
            return (
              <div key={row.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.full_name}</p>
                    <p className="text-xs text-muted-foreground">{row.company_name ?? row.company_role ?? "-"}</p>
                  </div>
                  <Badge variant="warning">{c.inactive}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6">{quote ? `\"${quote}\"` : "-"}</p>
                <p className="mt-3 text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
                <AdminTestimonialActions testimonialId={row.id} locale={locale} initialActive={row.active} initialFeatured={row.is_featured} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{c.recent}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? <EmptyState title={c.empty} description={c.emptyBody} compact /> : null}
          {rows.map((row) => {
            const quote = locale === "es" ? (row.quote_es ?? row.quote_en) : (row.quote_en ?? row.quote_es);
            return (
              <div key={row.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.full_name}</p>
                    <p className="text-xs text-muted-foreground">{row.company_name ?? row.company_role ?? "-"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={row.active ? "success" : "secondary"}>{row.active ? c.active : c.inactive}</Badge>
                    {row.is_featured ? <Badge variant="secondary">{c.featured}</Badge> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6">{quote ? `\"${quote}\"` : "-"}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.status}: {row.active ? c.active : c.inactive} • {c.featured}: {row.is_featured ? c.yes : c.no} • {formatDate(row.created_at)}
                </p>
                <AdminTestimonialActions testimonialId={row.id} locale={locale} initialActive={row.active} initialFeatured={row.is_featured} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
