import { SectionTitle } from "@/components/marketing/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

type TestimonialsSectionProps = {
  locale: Locale;
  eyebrow: string;
  title: string;
};

type TestimonialRow = {
  id: string;
  full_name: string;
  company_name: string | null;
  company_role: string | null;
  quote_en: string | null;
  quote_es: string | null;
};

type TestimonialCard = {
  id: string;
  quote: string;
  name: string;
  company: string;
};

export async function TestimonialsSection({ locale, eyebrow, title }: TestimonialsSectionProps) {
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseConfig) {
    return null;
  }

  let rows: TestimonialRow[] = [];

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id,full_name,company_name,company_role,quote_en,quote_es")
      .eq("active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data?.length) {
      return null;
    }

    rows = data as TestimonialRow[];
  } catch {
    return null;
  }

  const fallbackCompany = locale === "es" ? "Cliente verificado" : "Verified client";

  const items = rows
    .map((row): TestimonialCard | null => {
      const quote = locale === "es" ? (row.quote_es ?? row.quote_en) : (row.quote_en ?? row.quote_es);

      if (!quote) {
        return null;
      }

      return {
        id: row.id,
        quote,
        name: row.full_name,
        company: row.company_name ?? row.company_role ?? fallbackCompany
      };
    })
    .filter((row): row is TestimonialCard => Boolean(row));

  if (!items.length) {
    return null;
  }

  return (
    <section className="container-shell py-10">
      <SectionTitle eyebrow={eyebrow} title={title} className="mb-7" />
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm">&ldquo;{item.quote}&rdquo;</p>
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.company}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
