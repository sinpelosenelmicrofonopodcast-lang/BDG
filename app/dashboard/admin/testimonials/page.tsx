import { TestimonialForm } from "@/components/dashboard/testimonial-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const copy = {
  en: {
    title: "Testimonials",
    recent: "Recent testimonials",
    name: "Name",
    company: "Company",
    quote: "Quote",
    status: "Status",
    featured: "Featured",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    empty: "No testimonials yet."
  },
  es: {
    title: "Testimonios",
    recent: "Testimonios recientes",
    name: "Nombre",
    company: "Empresa",
    quote: "Testimonio",
    status: "Estado",
    featured: "Destacado",
    active: "Activo",
    inactive: "Inactivo",
    yes: "Sí",
    no: "No",
    empty: "Aún no hay testimonios."
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <TestimonialForm />

      <Card>
        <CardHeader>
          <CardTitle>{c.recent}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => {
            const quote = locale === "es" ? (row.quote_es ?? row.quote_en) : (row.quote_en ?? row.quote_es);
            return (
              <div key={row.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{row.full_name}</p>
                <p className="text-xs text-muted-foreground">{row.company_name ?? row.company_role ?? "-"}</p>
                <p className="mt-2 text-sm">{quote ? `\"${quote}\"` : "-"}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.status}: {row.active ? c.active : c.inactive} • {c.featured}: {row.is_featured ? c.yes : c.no} • {formatDate(row.created_at)}
                </p>
              </div>
            );
          })}
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">{c.empty}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
