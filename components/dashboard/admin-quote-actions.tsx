"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

type AdminQuoteActionsProps = {
  quoteId: string;
};

const copy = {
  en: {
    pdf: "Generate PDF",
    pdfLoading: "Generating...",
    convert: "Convert",
    convertLoading: "Converting...",
    payment: "Payment link",
    paymentLoading: "Creating link...",
    pdfFailed: "PDF generation failed.",
    convertFailed: "Conversion failed.",
    paymentFailed: "Unable to create payment link.",
    pdfGenerated: "PDF generated.",
    paymentCopied: "Payment link copied to clipboard.",
    converted: "Converted to project"
  },
  es: {
    pdf: "Generar PDF",
    pdfLoading: "Generando...",
    convert: "Convertir",
    convertLoading: "Convirtiendo...",
    payment: "Link de pago",
    paymentLoading: "Creando link...",
    pdfFailed: "Falló la generación de PDF.",
    convertFailed: "Falló la conversión.",
    paymentFailed: "No se pudo crear el link de pago.",
    pdfGenerated: "PDF generado.",
    paymentCopied: "Link de pago copiado al portapapeles.",
    converted: "Convertido a proyecto"
  }
} as const;

export function AdminQuoteActions({ quoteId }: AdminQuoteActionsProps) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"pdf" | "convert" | "payment" | null>(null);

  const generatePdf = async () => {
    setLoading("pdf");
    setStatus(null);
    const response = await fetch(`/api/quotes/${quoteId}/pdf`, { method: "POST" });
    const payload = (await response.json()) as { url?: string; error?: string };
    setLoading(null);

    if (!response.ok) {
      setStatus(payload.error ?? c.pdfFailed);
      return;
    }

    setStatus(payload.url ? `PDF ready: ${payload.url}` : c.pdfGenerated);
  };

  const convertQuote = async () => {
    setLoading("convert");
    setStatus(null);
    const response = await fetch("/api/admin/quotes/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId })
    });
    const payload = (await response.json()) as { error?: string; projectId?: string };
    setLoading(null);

    if (!response.ok) {
      setStatus(payload.error ?? c.convertFailed);
      return;
    }

    setStatus(`${c.converted}: ${payload.projectId}`);
  };

  const generatePaymentLink = async () => {
    setLoading("payment");
    setStatus(null);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "quote", quoteId, mode: "payment" })
    });
    const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
    setLoading(null);

    if (!response.ok || !payload.checkoutUrl) {
      setStatus(payload.error ?? c.paymentFailed);
      return;
    }

    await navigator.clipboard.writeText(payload.checkoutUrl);
    setStatus(c.paymentCopied);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={generatePdf}>
          {loading === "pdf" ? c.pdfLoading : c.pdf}
        </Button>
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={convertQuote}>
          {loading === "convert" ? c.convertLoading : c.convert}
        </Button>
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={generatePaymentLink}>
          {loading === "payment" ? c.paymentLoading : c.payment}
        </Button>
      </div>
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
