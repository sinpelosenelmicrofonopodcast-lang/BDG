"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormValues = {
  fullName: string;
  companyName: string;
  companyRole: string;
  quoteEn: string;
  quoteEs: string;
  sortOrder: number;
  isFeatured: boolean;
  active: boolean;
};

const INITIAL_VALUES: FormValues = {
  fullName: "",
  companyName: "",
  companyRole: "",
  quoteEn: "",
  quoteEs: "",
  sortOrder: 100,
  isFeatured: true,
  active: true
};

const copy = {
  en: {
    title: "Add real testimonial",
    fullName: "Full name",
    companyName: "Company",
    companyRole: "Role",
    quoteEn: "Quote (English)",
    quoteEs: "Quote (Spanish)",
    sortOrder: "Sort order",
    isFeatured: "Featured",
    active: "Active",
    save: "Save testimonial",
    saving: "Saving...",
    success: "Testimonial saved.",
    failed: "Failed to save testimonial."
  },
  es: {
    title: "Agregar testimonio real",
    fullName: "Nombre completo",
    companyName: "Empresa",
    companyRole: "Rol",
    quoteEn: "Testimonio (Inglés)",
    quoteEs: "Testimonio (Español)",
    sortOrder: "Orden",
    isFeatured: "Destacado",
    active: "Activo",
    save: "Guardar testimonio",
    saving: "Guardando...",
    success: "Testimonio guardado.",
    failed: "No se pudo guardar el testimonio."
  }
} as const;

export function TestimonialForm() {
  const router = useRouter();
  const { locale } = useLanguage();
  const c = copy[locale];
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(payload?.error ?? c.failed);
        return;
      }

      setSuccessMessage(c.success);
      setValues(INITIAL_VALUES);
      router.refresh();
    } catch {
      setErrorMessage(c.failed);
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
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="testimonial-full-name">{c.fullName}</Label>
              <Input
                id="testimonial-full-name"
                value={values.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonial-company-name">{c.companyName}</Label>
              <Input
                id="testimonial-company-name"
                value={values.companyName}
                onChange={(event) => update("companyName", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial-company-role">{c.companyRole}</Label>
            <Input
              id="testimonial-company-role"
              value={values.companyRole}
              onChange={(event) => update("companyRole", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial-quote-es">{c.quoteEs}</Label>
            <Textarea
              id="testimonial-quote-es"
              value={values.quoteEs}
              onChange={(event) => update("quoteEs", event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial-quote-en">{c.quoteEn}</Label>
            <Textarea
              id="testimonial-quote-en"
              value={values.quoteEn}
              onChange={(event) => update("quoteEn", event.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="testimonial-sort-order">{c.sortOrder}</Label>
              <Input
                id="testimonial-sort-order"
                type="number"
                value={values.sortOrder}
                onChange={(event) => update("sortOrder", Number(event.target.value) || 100)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(event) => update("isFeatured", event.target.checked)}
              />
              {c.isFeatured}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(event) => update("active", event.target.checked)}
              />
              {c.active}
            </label>
          </div>

          <Button disabled={isSubmitting}>{isSubmitting ? c.saving : c.save}</Button>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
