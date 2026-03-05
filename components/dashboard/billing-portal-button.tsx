"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

const copy = {
  en: {
    open: "Open Billing Portal",
    opening: "Opening..."
  },
  es: {
    open: "Abrir portal de facturación",
    opening: "Abriendo..."
  }
} as const;

export function BillingPortalButton() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    const response = await fetch("/api/stripe/billing-portal", { method: "POST" });
    setLoading(false);

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { url: string };
    if (payload.url) {
      window.location.href = payload.url;
    }
  };

  return (
    <Button variant="outline" onClick={openPortal} disabled={loading}>
      {loading ? c.opening : c.open}
    </Button>
  );
}
