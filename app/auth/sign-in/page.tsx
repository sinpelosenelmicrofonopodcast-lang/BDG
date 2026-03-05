"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type AuthValues = z.infer<typeof authSchema>;

const copy = {
  en: {
    createAccount: "Create account",
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    loading: "Please wait...",
    already: "Already have an account? Sign in",
    need: "Need an account? Create one",
    checkInbox: "Account created. Check your email to confirm your account before signing in.",
    accountReady: "Account created. Redirecting to dashboard...",
    unexpected: "Unexpected auth response. Please try again."
  },
  es: {
    createAccount: "Crear cuenta",
    signIn: "Iniciar sesión",
    email: "Email",
    password: "Contraseña",
    loading: "Espera...",
    already: "¿Ya tienes cuenta? Inicia sesión",
    need: "¿Necesitas cuenta? Crear una",
    checkInbox: "Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.",
    accountReady: "Cuenta creada. Redirigiendo al dashboard...",
    unexpected: "Respuesta inesperada de autenticación. Intenta de nuevo."
  }
} as const;

export default function SignInPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const c = copy[locale];
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (values: AuthValues) => {
    setErrorMessage(null);
    setInfoMessage(null);
    const supabase = getSupabaseBrowserClient();

    if (isSignUp) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const emailRedirectTo = `${appUrl.replace(/\/$/, "")}/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo }
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        setInfoMessage(c.accountReady);
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (data.user) {
        setInfoMessage(c.checkInbox);
        return;
      }

      setErrorMessage(c.unexpected);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-14">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? c.createAccount : c.signIn}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{c.email}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{c.password}</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
            </div>
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? c.loading : isSignUp ? c.createAccount : c.signIn}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setIsSignUp((prev) => !prev)}>
              {isSignUp ? c.already : c.need}
            </Button>
            {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
            {infoMessage ? <p className="text-xs text-emerald-600">{infoMessage}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
