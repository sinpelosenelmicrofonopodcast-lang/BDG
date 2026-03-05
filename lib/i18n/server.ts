import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, normalizeLocale } from "@/lib/i18n/config";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE_NAME)?.value);
  return locale ?? DEFAULT_LOCALE;
}
