"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/language-provider";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-secondary/50 p-1">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded px-2.5 py-1 text-xs font-semibold transition",
          locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("es")}
        className={cn(
          "rounded px-2.5 py-1 text-xs font-semibold transition",
          locale === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        ES
      </button>
    </div>
  );
}
