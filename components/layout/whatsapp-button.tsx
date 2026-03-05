"use client";

import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { analyticsEvents } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

const copy = {
  en: "Open WhatsApp",
  es: "Abrir WhatsApp"
} as const;

export function WhatsAppButton() {
  const { locale } = useLanguage();
  const url = process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "https://wa.me/10000000000";

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent(analyticsEvents.CLICK_WHATSAPP)}
      className="fixed bottom-20 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 md:bottom-6"
      aria-label={copy[locale]}
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
