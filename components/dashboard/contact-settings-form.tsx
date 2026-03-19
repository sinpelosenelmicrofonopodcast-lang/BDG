"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Locale } from "@/lib/i18n/config";
import { contactSettingsSchema, type ContactSettings } from "@/lib/schemas/site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RequestError = {
  error?: string;
};

const copy = {
  en: {
    title: "Primary contact channel",
    description: "Set how website visitors should contact your business.",
    method: "Method",
    value: "Destination",
    valueHint: "Used for email, phone, or custom URL. If empty on email/phone, it uses public contact data below.",
    labels: "Button labels",
    labelEn: "Button label (English)",
    labelEs: "Button label (Spanish)",
    publicContactTitle: "Public contact info",
    agencyEmail: "Agency email",
    agencyPhone: "Agency phone",
    locationEn: "Location (English)",
    locationEs: "Location (Spanish)",
    openInNewTab: "Open external link in new tab",
    save: "Save contact settings",
    saving: "Saving...",
    saved: "Contact settings saved.",
    failed: "Failed to save contact settings.",
    methods: {
      form: "Contact form (/contact)",
      email: "Email",
      phone: "Phone",
      custom_url: "Custom URL"
    },
    placeholders: {
      form: "No value required",
      email: "sales@youragency.com",
      phone: "+1-254-000-0000",
      custom_url: "https://example.com/contact or /contact"
    }
  },
  es: {
    title: "Canal de contacto principal",
    description: "Define como deben contactarte los visitantes del sitio.",
    method: "Metodo",
    value: "Destino",
    valueHint: "Se usa para email, telefono o URL personalizada. Si va vacio para email/telefono, usa los datos publicos de abajo.",
    labels: "Texto de botones",
    labelEn: "Texto boton (Ingles)",
    labelEs: "Texto boton (Espanol)",
    publicContactTitle: "Informacion de contacto publica",
    agencyEmail: "Email de agencia",
    agencyPhone: "Telefono de agencia",
    locationEn: "Ubicacion (Ingles)",
    locationEs: "Ubicacion (Espanol)",
    openInNewTab: "Abrir enlace externo en nueva pestana",
    save: "Guardar contacto",
    saving: "Guardando...",
    saved: "Configuracion de contacto guardada.",
    failed: "No se pudo guardar la configuracion.",
    methods: {
      form: "Formulario (/contact)",
      email: "Email",
      phone: "Telefono",
      custom_url: "URL personalizada"
    },
    placeholders: {
      form: "No requiere valor",
      email: "ventas@tuagencia.com",
      phone: "+1-254-000-0000",
      custom_url: "https://example.com/contact o /contact"
    }
  }
} as const;

type ContactSettingsFormProps = {
  locale: Locale;
  initialValues: ContactSettings;
};

export function ContactSettingsForm({ locale, initialValues }: ContactSettingsFormProps) {
  const router = useRouter();
  const c = copy[locale];
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactSettings>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: initialValues
  });

  const method = watch("method");

  const onSubmit = async (values: ContactSettings) => {
    setStatus(null);
    setStatusType(null);

    try {
      const response = await fetch("/api/admin/settings/contact", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as RequestError | null;
        setStatus(payload?.error ?? c.failed);
        setStatusType("error");
        return;
      }

      setStatus(c.saved);
      setStatusType("success");
      router.refresh();
    } catch {
      setStatus(c.failed);
      setStatusType("error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{c.description}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="contact-method">{c.method}</Label>
            <select
              id="contact-method"
              {...register("method")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="form">{c.methods.form}</option>
              <option value="email">{c.methods.email}</option>
              <option value="phone">{c.methods.phone}</option>
              <option value="custom_url">{c.methods.custom_url}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-value">{c.value}</Label>
            <Input id="contact-value" placeholder={c.placeholders[method]} {...register("value")} />
            <p className="text-xs text-muted-foreground">{c.valueHint}</p>
            {errors.value ? <p className="text-xs text-destructive">{errors.value.message}</p> : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{c.labels}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-label-en">{c.labelEn}</Label>
                <Input id="contact-label-en" {...register("labelEn")} />
                {errors.labelEn ? <p className="text-xs text-destructive">{errors.labelEn.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-label-es">{c.labelEs}</Label>
                <Input id="contact-label-es" {...register("labelEs")} />
                {errors.labelEs ? <p className="text-xs text-destructive">{errors.labelEs.message}</p> : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{c.publicContactTitle}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-agency-email">{c.agencyEmail}</Label>
                <Input id="contact-agency-email" {...register("agencyEmail")} />
                {errors.agencyEmail ? <p className="text-xs text-destructive">{errors.agencyEmail.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-agency-phone">{c.agencyPhone}</Label>
                <Input id="contact-agency-phone" {...register("agencyPhone")} />
                {errors.agencyPhone ? <p className="text-xs text-destructive">{errors.agencyPhone.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-location-en">{c.locationEn}</Label>
                <Input id="contact-location-en" {...register("locationEn")} />
                {errors.locationEn ? <p className="text-xs text-destructive">{errors.locationEn.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-location-es">{c.locationEs}</Label>
                <Input id="contact-location-es" {...register("locationEs")} />
                {errors.locationEs ? <p className="text-xs text-destructive">{errors.locationEs.message}</p> : null}
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("openInNewTab")} />
            {c.openInNewTab}
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? c.saving : c.save}
          </Button>

          {status ? <p className={`text-sm ${statusType === "error" ? "text-destructive" : "text-status-success"}`}>{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
