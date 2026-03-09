import { getServerLocale } from "@/lib/i18n/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminWebsiteForm } from "@/components/dashboard/admin-website-form";

export default async function AdminWebsitesPage() {
  const locale = await getServerLocale();
  const supabase = await getSupabaseServerClient();

  const [{ data: projects }, { data: websites }] = await Promise.all([
    supabase.from("projects").select("id,name,client_id").order("created_at", { ascending: false }).limit(200),
    supabase
      .from("project_websites")
      .select("id,label,domain,status,website_url,platform,ssl_expires_at,notes")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  return <AdminWebsiteForm locale={locale} projects={projects ?? []} websites={websites ?? []} />;
}
