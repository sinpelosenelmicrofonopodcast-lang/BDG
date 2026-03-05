import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PlanEditor } from "@/components/dashboard/plan-editor";

export default async function AdminPlansPage() {
  const supabase = await getSupabaseServerClient();
  const { data: plans } = await supabase.from("plans").select("*").order("category", { ascending: true });

  return <PlanEditor plans={plans ?? []} />;
}
