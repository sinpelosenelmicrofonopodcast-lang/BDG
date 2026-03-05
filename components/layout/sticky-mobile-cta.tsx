"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

const copy = {
  en: {
    getQuote: "Get Quote",
    namePlan: "Name Plan"
  },
  es: {
    getQuote: "Cotizar",
    namePlan: "Nombra plan"
  }
} as const;

export function StickyMobileCta() {
  const { locale } = useLanguage();
  const c = copy[locale];

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <Button className="flex-1" asChild>
          <Link href="/pricing">{c.getQuote}</Link>
        </Button>
        <Button className="flex-1" variant="secondary" asChild>
          <Link href="/name-your-plan">{c.namePlan}</Link>
        </Button>
      </div>
    </div>
  );
}
