import type { Locale } from "@/lib/i18n/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { contactSettingsSchema, defaultContactSettings, parseContactSettings, type ContactSettings } from "@/lib/schemas/site-settings";

export const CONTACT_SETTINGS_KEY = "contact_settings";

function normalizeCustomUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/contact";
  }

  if (trimmed.startsWith("/") || /^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function resolveContactHref(settings: ContactSettings) {
  const value = settings.value.trim();

  switch (settings.method) {
    case "email": {
      const emailTarget = value || settings.agencyEmail.trim();
      return emailTarget ? `mailto:${emailTarget}` : "/contact";
    }
    case "phone": {
      const phoneTarget = value || settings.agencyPhone.trim();
      return phoneTarget ? `tel:${phoneTarget}` : "/contact";
    }
    case "custom_url":
      return normalizeCustomUrl(value);
    case "form":
    default:
      return "/contact";
  }
}

export function resolveContactLabel(settings: ContactSettings, locale: Locale) {
  return locale === "es" ? settings.labelEs : settings.labelEn;
}

export function getPublicContactInfo(settings: ContactSettings, locale: Locale) {
  return {
    email: settings.agencyEmail,
    phone: settings.agencyPhone,
    location: locale === "es" ? settings.locationEs : settings.locationEn
  };
}

export function resolveContactCta(settings: ContactSettings, locale: Locale) {
  const href = resolveContactHref(settings);
  const isExternal = !href.startsWith("/");
  const openInNewTab = isExternal && settings.openInNewTab;

  return {
    href,
    label: resolveContactLabel(settings, locale),
    isExternal,
    target: openInNewTab ? "_blank" : undefined,
    rel: openInNewTab ? "noreferrer" : undefined
  };
}

export async function getContactSettings() {
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseConfig) {
    return { ...defaultContactSettings };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", CONTACT_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return { ...defaultContactSettings };
    }

    return parseContactSettings(data.value);
  } catch {
    return { ...defaultContactSettings };
  }
}

export function sanitizeContactSettings(input: unknown) {
  return contactSettingsSchema.safeParse(input);
}
