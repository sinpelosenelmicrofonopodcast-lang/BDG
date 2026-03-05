"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, type Locale, normalizeLocale } from "@/lib/i18n/config";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

export function LanguageProvider({ initialLocale, children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(normalizeLocale(initialLocale));
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      const normalized = normalizeLocale(next);
      if (normalized === locale) {
        return;
      }

      setLocaleState(normalized);
      document.cookie = `${LOCALE_COOKIE_NAME}=${normalized}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [locale, router]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale
    }),
    [locale, setLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
