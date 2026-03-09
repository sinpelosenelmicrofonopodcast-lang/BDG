import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StickyMobileCta } from "@/components/layout/sticky-mobile-cta";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { getServerLocale } from "@/lib/i18n/server";
import { getCurrentUserRole } from "@/lib/auth";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700"]
});

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

  let viewerRole: "guest" | "client" | "admin" = "guest";
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (hasSupabaseConfig) {
    try {
      const role = await getCurrentUserRole();
      if (role === "admin" || role === "client") {
        viewerRole = role;
      }
    } catch {
      viewerRole = "guest";
    }
  }

  return (
    <html lang={locale}>
      <body className={`${bodyFont.variable} ${headingFont.variable} font-body bg-background text-foreground`}>
        <LanguageProvider initialLocale={locale}>
          <AnalyticsProvider />
          <SiteHeader viewerRole={viewerRole} />
          <main>{children}</main>
          <SiteFooter />
          <StickyMobileCta />
        </LanguageProvider>

        <Script id="tawk-to" strategy="afterInteractive">
          {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/69ae1446811e1a1c36cff53e/1jj81qejs';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
        </Script>
      </body>
    </html>
  );
}
