import { getServerLocale } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const locale = await getServerLocale();
  const title = locale === "es" ? "Configuración de entorno y negocio" : "Environment and business settings";
  const configured = locale === "es" ? "Configurado" : "Configured";
  const missing = locale === "es" ? "Falta" : "Missing";

  const checks = [
    { label: "Supabase URL", ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { label: "Supabase anon key", ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { label: "Supabase service key", ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { label: "Stripe secret key", ok: Boolean(process.env.STRIPE_SECRET_KEY) },
    { label: "Stripe webhook secret", ok: Boolean(process.env.STRIPE_WEBHOOK_SECRET) },
    { label: "Resend key", ok: Boolean(process.env.RESEND_API_KEY) },
    { label: "PostHog key", ok: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {checks.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-md border border-border p-3">
            <span>{item.label}</span>
            <span className={item.ok ? "text-emerald-600" : "text-destructive"}>{item.ok ? configured : missing}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
