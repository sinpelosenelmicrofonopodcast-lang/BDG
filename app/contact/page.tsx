import { Mail, MapPin, PhoneCall } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { ContactForm } from "@/components/marketing/contact-form";
import { SectionTitle } from "@/components/marketing/section-title";
import { Card, CardContent } from "@/components/ui/card";

const copy = {
  en: {
    eyebrow: "Contact",
    title: "Tell us your project goals",
    description: "Get plan recommendation, timeline and budget strategy in less than 24h."
  },
  es: {
    eyebrow: "Contacto",
    title: "Cuéntanos tus objetivos de proyecto",
    description: "Recibe recomendación de plan, timeline y estrategia de presupuesto en menos de 24h."
  }
} as const;

export default async function ContactPage() {
  const locale = await getServerLocale();
  const c = copy[locale];

  return (
    <div className="container-shell grid gap-8 py-14 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />

        <Card>
          <CardContent className="space-y-4 pt-6 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              {process.env.AGENCY_EMAIL ?? "sales@youragency.com"}
            </p>
            <p className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              {process.env.AGENCY_PHONE ?? "+1-000-000-0000"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              United States
            </p>
          </CardContent>
        </Card>
      </div>

      <ContactForm />
    </div>
  );
}
