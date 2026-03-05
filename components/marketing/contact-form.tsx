"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { contactSchema, type ContactInput } from "@/lib/schemas/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const copy = {
  en: {
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    details: "Project details",
    send: "Send message",
    sending: "Sending...",
    success: "Message sent. We will reply in less than 24h."
  },
  es: {
    fullName: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    details: "Detalles del proyecto",
    send: "Enviar mensaje",
    sending: "Enviando...",
    success: "Mensaje enviado. Responderemos en menos de 24h."
  }
} as const;

export function ContactForm() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (values: ContactInput) => {
    setStatus(null);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      throw new Error("Contact form failed");
    }

    setStatus(c.success);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="name">{c.fullName}</Label>
        <Input id="name" {...register("fullName")} />
        {errors.fullName ? <p className="text-xs text-destructive">{errors.fullName.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{c.email}</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{c.phone}</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{c.details}</Label>
        <Textarea id="message" rows={6} {...register("message")} />
        {errors.message ? <p className="text-xs text-destructive">{errors.message.message}</p> : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? c.sending : c.send}
      </Button>
      {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
    </form>
  );
}
