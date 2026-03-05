import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AddonEditor } from "@/components/dashboard/addon-editor";

export default async function AdminAddonsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: addons } = await supabase.from("addons").select("*").order("name", { ascending: true });

  return <AddonEditor addons={addons ?? []} />;
}
