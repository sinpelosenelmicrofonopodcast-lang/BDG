"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { analyticsEvents } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { type NameYourPlanInput, nameYourPlanSchema } from "@/lib/schemas/name-your-plan";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const content = {
  en: {
    title: "Name Your Plan Wizard",
    stepTitles: ["Budget", "Industry", "Needs", "Details", "Confirm"],
    step1: "Step 1: Budget",
    step2: "Step 2: Industry",
    step3: "Step 3: Needs",
    businessName: "Business name",
    email: "Email",
    phone: "Phone",
    notes: "Notes",
    successTitle: "Quote request created successfully.",
    requestId: "Request ID",
    budgetLabel: "Budget",
    industryLabel: "Industry",
    needsLabel: "Needs",
    businessLabel: "Business",
    emailLabel: "Email",
    phoneLabel: "Phone",
    notesLabel: "Notes",
    none: "-",
    back: "Back",
    continue: "Continue",
    submit: "Create Quote Request",
    submitting: "Submitting...",
    budget: [150, 250, 400, 600, 900],
    industry: ["Barbershop", "Nail Salon", "Restaurant", "Realtor", "HVAC Services", "Podcast Creator"],
    needs: ["Landing", "3 pages", "Logo", "SEO", "Booking", "Payments", "Blog"]
  },
  es: {
    title: "Wizard Nombra Tu Plan",
    stepTitles: ["Presupuesto", "Industria", "Necesidades", "Detalles", "Confirmar"],
    step1: "Paso 1: Presupuesto",
    step2: "Paso 2: Industria",
    step3: "Paso 3: Necesidades",
    businessName: "Nombre del negocio",
    email: "Email",
    phone: "Teléfono",
    notes: "Notas",
    successTitle: "Solicitud de cotización creada correctamente.",
    requestId: "ID de solicitud",
    budgetLabel: "Presupuesto",
    industryLabel: "Industria",
    needsLabel: "Necesidades",
    businessLabel: "Negocio",
    emailLabel: "Email",
    phoneLabel: "Teléfono",
    notesLabel: "Notas",
    none: "-",
    back: "Atrás",
    continue: "Continuar",
    submit: "Crear Solicitud",
    submitting: "Enviando...",
    budget: [150, 250, 400, 600, 900],
    industry: ["Barbería", "Nail Salon", "Restaurante", "Realtor", "Servicios HVAC", "Podcast Creator"],
    needs: ["Landing", "3 páginas", "Logo", "SEO", "Booking", "Pagos", "Blog"]
  }
} as const;

export function NameYourPlanWizard() {
  const { locale } = useLanguage();
  const c = content[locale];
  const [step, setStep] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const {
    register,
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<NameYourPlanInput>({
    resolver: zodResolver(nameYourPlanSchema),
    defaultValues: {
      budget: 250,
      industry: c.industry[0],
      needs: [c.needs[0]],
      businessName: "",
      email: "",
      phone: "",
      notes: ""
    }
  });

  useEffect(() => {
    trackEvent(analyticsEvents.START_NAME_YOUR_PLAN);
  }, []);

  const values = watch();

  const stepValidationFields = useMemo(
    () => ({
      1: ["budget"] as const,
      2: ["industry"] as const,
      3: ["needs"] as const,
      4: ["businessName", "email", "phone"] as const,
      5: ["budget", "industry", "needs", "businessName", "email", "phone", "notes"] as const
    }),
    []
  );

  const next = async () => {
    const isValid = await trigger(stepValidationFields[step as keyof typeof stepValidationFields]);
    if (!isValid) {
      return;
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleNeed = (need: string) => {
    const current = values.needs || [];
    if (current.includes(need)) {
      setValue(
        "needs",
        current.filter((n) => n !== need),
        { shouldValidate: true }
      );
      return;
    }

    setValue("needs", [...current, need], { shouldValidate: true });
  };

  const onSubmit = async (input: NameYourPlanInput) => {
    const response = await fetch("/api/name-your-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error("Unable to submit quote request");
    }

    const payload = (await response.json()) as { id: string };
    trackEvent(analyticsEvents.SUBMIT_NAME_YOUR_PLAN, {
      budget: input.budget,
      industry: input.industry,
      needsCount: input.needs.length
    });
    setSubmittedId(payload.id);
    setStep(5);
  };

  const progress = `${(step / 5) * 100}%`;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl">{c.title}</CardTitle>
        <div className="h-2 rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: progress }} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {c.stepTitles.map((title, idx) => (
            <span key={title} className={cn("rounded-full border px-3 py-1", step >= idx + 1 ? "border-primary text-primary" : "text-muted-foreground")}>
              {idx + 1}. {title}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-3">
              <Label>{c.step1}</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {c.budget.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setValue("budget", amount, { shouldValidate: true })}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition",
                      values.budget === amount ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              {errors.budget ? <p className="text-xs text-destructive">{errors.budget.message}</p> : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              <Label>{c.step2}</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {c.industry.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => setValue("industry", industry, { shouldValidate: true })}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition",
                      values.industry === industry ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                  >
                    {industry}
                  </button>
                ))}
              </div>
              {errors.industry ? <p className="text-xs text-destructive">{errors.industry.message}</p> : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <Label>{c.step3}</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {c.needs.map((need) => {
                  const checked = values.needs?.includes(need);
                  return (
                    <button
                      key={need}
                      type="button"
                      onClick={() => toggleNeed(need)}
                      className={cn(
                        "rounded-lg border p-3 text-left text-sm transition",
                        checked ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      )}
                    >
                      {need}
                    </button>
                  );
                })}
              </div>
              {errors.needs ? <p className="text-xs text-destructive">{errors.needs.message}</p> : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="biz-name">{c.businessName}</Label>
                <Input id="biz-name" {...register("businessName")} />
                {errors.businessName ? <p className="text-xs text-destructive">{errors.businessName.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-email">{c.email}</Label>
                <Input id="biz-email" type="email" {...register("email")} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-phone">{c.phone}</Label>
                <Input id="biz-phone" {...register("phone")} />
                {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="biz-notes">{c.notes}</Label>
                <Textarea id="biz-notes" rows={5} {...register("notes")} />
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
              {submittedId ? (
                <div className="space-y-2">
                  <p className="font-semibold text-emerald-700">{c.successTitle}</p>
                  <p className="text-muted-foreground">
                    {c.requestId}: {submittedId}
                  </p>
                </div>
              ) : (
                <>
                  <p>
                    <strong>{c.budgetLabel}:</strong> ${values.budget}
                  </p>
                  <p>
                    <strong>{c.industryLabel}:</strong> {values.industry}
                  </p>
                  <p>
                    <strong>{c.needsLabel}:</strong> {(values.needs || []).join(", ")}
                  </p>
                  <p>
                    <strong>{c.businessLabel}:</strong> {values.businessName}
                  </p>
                  <p>
                    <strong>{c.emailLabel}:</strong> {values.email}
                  </p>
                  <p>
                    <strong>{c.phoneLabel}:</strong> {values.phone}
                  </p>
                  <p>
                    <strong>{c.notesLabel}:</strong> {values.notes || c.none}
                  </p>
                </>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {step > 1 && !submittedId ? (
              <Button type="button" variant="outline" onClick={back}>
                {c.back}
              </Button>
            ) : null}

            {step < 5 ? (
              <Button type="button" onClick={next}>
                {c.continue}
              </Button>
            ) : null}

            {step === 5 && !submittedId ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? c.submitting : c.submit}
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
