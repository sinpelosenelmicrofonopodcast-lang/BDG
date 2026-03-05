import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StickyMobileCta } from "@/components/layout/sticky-mobile-cta";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { getServerLocale } from "@/lib/i18n/server";
import { getCurrentUserRole } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "BDG Agency SaaS Platform",
  description: "Web and app systems for growth-focused businesses.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }]
  },
  openGraph: {
    title: "BDG Agency SaaS Platform",
    description: "Web and app systems for growth-focused businesses.",
    images: [{ url: "/logo.png" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "BDG Agency SaaS Platform",
    description: "Web and app systems for growth-focused businesses.",
    images: ["/logo.png"]
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();

  let isAdmin = false;
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (hasSupabaseConfig) {
    try {
      const role = await getCurrentUserRole();
      isAdmin = role === "admin";
    } catch {
      isAdmin = false;
    }
  }

  return (
    <html lang={locale}>
      <body className="font-body">
        <LanguageProvider initialLocale={locale}>
          <AnalyticsProvider />
          <SiteHeader isAdmin={isAdmin} />
          <main>{children}</main>
          <SiteFooter />
          <StickyMobileCta />
          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
