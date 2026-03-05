export type Locale = "en" | "es";

export const LOCALE_COOKIE_NAME = "bdg_locale";
export const DEFAULT_LOCALE: Locale = "en";

export function normalizeLocale(value?: string | null): Locale {
  return value === "es" ? "es" : "en";
}

export function pickByLocale<T>(locale: Locale, copy: { en: T; es: T }): T {
  return copy[locale];
}
