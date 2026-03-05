"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { contactSchema, type ContactInput } from "@/lib/schemas/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const copy = {
  en: {
    name: "Full name",
    email: "Email",
    phone: "Phone",
    auditPrompt: "What should we audit?",
    submit: "Get Free Audit Express",
    submitting: "Submitting...",
    success: "Audit request submitted. We will contact you soon.",
    defaultMessage: "I want a free Audit Express for my current website."
  },
  es: {
    name: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    auditPrompt: "¿Qué debemos auditar?",
    submit: "Solicitar Audit Express Gratis",
    submitting: "Enviando...",
    success: "Auditoría enviada. Te contactamos pronto.",
    defaultMessage: "Quiero una Audit Express gratis para mi web actual."
  }
} as const;

export function LeadMagnetForm() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: c.defaultMessage
    }
  });

  const onSubmit = async (values: ContactInput) => {
    setSuccessMessage(null);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        source: "audit_express",
        notes: values.message
      })
    });

    if (!response.ok) {
      throw new Error("Could not submit lead magnet form");
    }

    setSuccessMessage(c.success);
    reset({
      fullName: "",
      email: "",
      phone: "",
      message: c.defaultMessage
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="audit-name">{c.name}</Label>
          <Input id="audit-name" {...register("fullName")} />
          {errors.fullName ? <p className="text-xs text-destructive">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="audit-email">{c.email}</Label>
          <Input id="audit-email" type="email" {...register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audit-phone">{c.phone}</Label>
        <Input id="audit-phone" {...register("phone")} />
        {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="audit-msg">{c.auditPrompt}</Label>
        <Textarea id="audit-msg" {...register("message")} />
        {errors.message ? <p className="text-xs text-destructive">{errors.message.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? c.submitting : c.submit}
      </Button>

      {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
    </form>
  );
}
