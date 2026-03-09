"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    title: "Send testimonial",
    fullName: "Full name",
    companyName: "Company",
    companyRole: "Role",
    quoteEn: "Quote (English)",
    quoteEs: "Quote (Spanish)",
    submit: "Submit testimonial",
    submitting: "Submitting...",
    success: "Submitted for admin review.",
    failed: "Could not submit testimonial."
  },
  es: {
    title: "Enviar testimonio",
    fullName: "Nombre completo",
    companyName: "Empresa",
    companyRole: "Rol",
    quoteEn: "Testimonio (Ingles)",
    quoteEs: "Testimonio (Espanol)",
    submit: "Enviar testimonio",
    submitting: "Enviando...",
    success: "Enviado para revision de admin.",
    failed: "No se pudo enviar el testimonio."
  }
} as const;

export function ClientTestimonialForm({ locale, defaultFullName }: { locale: Locale; defaultFullName?: string | null }) {
  const c = copy[locale];
  const [fullName, setFullName] = useState(defaultFullName ?? "");
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [quoteEn, setQuoteEn] = useState("");
  const [quoteEs, setQuoteEs] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          companyName,
          companyRole,
          quoteEn,
          quoteEs
        })
      });

      if (!response.ok) {
        setStatus(c.failed);
        return;
      }

      setStatus(c.success);
      setCompanyName("");
      setCompanyRole("");
      setQuoteEn("");
      setQuoteEs("");
    } catch {
      setStatus(c.failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>{c.fullName}</Label>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>{c.companyName}</Label>
              <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{c.companyRole}</Label>
            <Input value={companyRole} onChange={(event) => setCompanyRole(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>{c.quoteEn}</Label>
            <Textarea rows={3} value={quoteEn} onChange={(event) => setQuoteEn(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>{c.quoteEs}</Label>
            <Textarea rows={3} value={quoteEs} onChange={(event) => setQuoteEs(event.target.value)} />
          </div>

          <Button disabled={isSubmitting}>{isSubmitting ? c.submitting : c.submit}</Button>
          {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
