"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const copy = {
  en: "Sign out",
  es: "Cerrar sesión"
} as const;

export function SignOutButton() {
  const { locale } = useLanguage();
  const router = useRouter();

  const logout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={logout}>
      {copy[locale]}
    </Button>
  );
}
