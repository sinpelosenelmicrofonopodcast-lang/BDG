"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { quoteAcceptanceSchema, type QuoteAcceptanceInput } from "@/lib/schemas/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuoteAcceptanceCardProps = {
  quoteId: string;
  paymentUnlocked: boolean;
};

const copy = {
  en: {
    acceptanceTitle: "Digital acceptance",
    typedName: "Typed name",
    submitting: "Submitting...",
    accept: "Accept proposal",
    accepted: "Accepted",
    nextStep: "Continue with deposit payment to start onboarding.",
    loadingCheckout: "Loading checkout...",
    pay: "Pay deposit",
    acceptanceFailed: "Could not register acceptance.",
    acceptanceSuccess: "Proposal accepted. Payment is now available.",
    paymentUnavailable: "Payment link unavailable"
  },
  es: {
    acceptanceTitle: "Aceptación digital",
    typedName: "Nombre escrito",
    submitting: "Enviando...",
    accept: "Aceptar propuesta",
    accepted: "Aceptada",
    nextStep: "Continúa con el pago del depósito para iniciar onboarding.",
    loadingCheckout: "Cargando checkout...",
    pay: "Pagar depósito",
    acceptanceFailed: "No se pudo registrar la aceptación.",
    acceptanceSuccess: "Propuesta aceptada. El pago ya está habilitado.",
    paymentUnavailable: "Link de pago no disponible"
  }
} as const;

export function QuoteAcceptanceCard({ quoteId, paymentUnlocked }: QuoteAcceptanceCardProps) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [accepted, setAccepted] = useState(paymentUnlocked);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<QuoteAcceptanceInput>({
    resolver: zodResolver(quoteAcceptanceSchema)
  });

  const accept = async (values: QuoteAcceptanceInput) => {
    setStatus(null);

    const response = await fetch(`/api/quotes/${quoteId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setStatus(c.acceptanceFailed);
      return;
    }

    setAccepted(true);
    setStatus(c.acceptanceSuccess);
  };

  const pay = async () => {
    setLoadingPayment(true);
    setStatus(null);

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "quote", quoteId, mode: "payment" })
    });

    setLoadingPayment(false);
    const payload = (await response.json()) as { checkoutUrl?: string; error?: string };

    if (!response.ok || !payload.checkoutUrl) {
      setStatus(payload.error ?? c.paymentUnavailable);
      return;
    }

    window.location.href = payload.checkoutUrl;
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      {!accepted ? (
        <form onSubmit={handleSubmit(accept)} className="space-y-3">
          <p className="font-semibold">{c.acceptanceTitle}</p>
          <div className="space-y-2">
            <Label htmlFor="typedName">{c.typedName}</Label>
            <Input id="typedName" {...register("typedName")} />
            {errors.typedName ? <p className="text-xs text-destructive">{errors.typedName.message}</p> : null}
          </div>
          <Button disabled={isSubmitting}>{isSubmitting ? c.submitting : c.accept}</Button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="font-semibold text-emerald-700">{c.accepted}</p>
          <p className="text-sm text-muted-foreground">{c.nextStep}</p>
          <Button onClick={pay} disabled={loadingPayment}>
            {loadingPayment ? c.loadingCheckout : c.pay}
          </Button>
        </div>
      )}
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
