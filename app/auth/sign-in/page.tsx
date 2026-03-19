"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type User } from "@supabase/supabase-js";
import { z } from "zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().trim().max(120).optional(),
  companyName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional()
});

type AuthValues = z.infer<typeof authSchema>;

const copy = {
  en: {
    titleSignIn: "Client sign in",
    titleSignUp: "Create client account",
    subtitle: "Access your projects, payments, tickets and service status.",
    createAccount: "Create account",
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    fullName: "Full name",
    companyName: "Business name",
    phone: "Phone",
    loading: "Please wait...",
    already: "Already have an account? Sign in",
    need: "Need an account? Create one",
    checkInbox:
      "Account created. Check your email to confirm. Then return to Client Portal and sign in.",
    accountReady: "Account created. Redirecting to dashboard...",
    unexpected: "Unexpected auth response. Please try again.",
    requestFailed: "Request failed. Check your Supabase URL/keys and internet connection."
  },
  es: {
    titleSignIn: "Iniciar sesion cliente",
    titleSignUp: "Crear cuenta cliente",
    subtitle: "Accede a tus proyectos, pagos, tickets y estado de servicio.",
    createAccount: "Crear cuenta",
    signIn: "Iniciar sesion",
    email: "Email",
    password: "Contrasena",
    fullName: "Nombre completo",
    companyName: "Nombre del negocio",
    phone: "Telefono",
    loading: "Espera...",
    already: "Ya tienes cuenta? Inicia sesion",
    need: "Necesitas cuenta? Crear una",
    checkInbox:
      "Cuenta creada. Revisa tu email para confirmar y luego vuelve al Portal Cliente para iniciar sesion.",
    accountReady: "Cuenta creada. Redirigiendo al dashboard...",
    unexpected: "Respuesta inesperada de autenticacion. Intenta de nuevo.",
    requestFailed: "La solicitud fallo. Revisa URL/keys de Supabase y tu conexion a internet."
  }
} as const;

async function ensureClientProfile(user: User, values: AuthValues) {
  const supabase = getSupabaseBrowserClient();

  const payload = {
    id: user.id,
    email: user.email ?? values.email,
    full_name: values.fullName || user.user_metadata?.full_name || null,
    company_name: values.companyName || user.user_metadata?.company_name || null,
    phone: values.phone || user.user_metadata?.phone || null,
    updated_at: new Date().toISOString()
  };

  await supabase.from("profiles").upsert(payload, { onConflict: "id" });
}

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
    resolver: zodResolver(authSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      phone: ""
    }
  });

  const onSubmit = async (values: AuthValues) => {
    setErrorMessage(null);
    setInfoMessage(null);
    const supabase = getSupabaseBrowserClient();

    try {
      if (isSignUp) {
        const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/sign-in` : undefined;

        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo,
            data: {
              full_name: values.fullName || null,
              company_name: values.companyName || null,
              phone: values.phone || null
            }
          }
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session && data.user) {
          await ensureClientProfile(data.user, values);
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

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await ensureClientProfile(userData.user, values);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : c.requestFailed;
      setErrorMessage(message || c.requestFailed);
    }
  };

  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-14">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? c.titleSignUp : c.titleSignIn}</CardTitle>
          <p className="text-sm text-muted-foreground">{c.subtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp ? (
              <div className="space-y-2">
                <Label htmlFor="fullName">{c.fullName}</Label>
                <Input id="fullName" type="text" {...register("fullName")} />
              </div>
            ) : null}

            {isSignUp ? (
              <div className="space-y-2">
                <Label htmlFor="companyName">{c.companyName}</Label>
                <Input id="companyName" type="text" {...register("companyName")} />
              </div>
            ) : null}

            {isSignUp ? (
              <div className="space-y-2">
                <Label htmlFor="phone">{c.phone}</Label>
                <Input id="phone" type="text" {...register("phone")} />
              </div>
            ) : null}

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

            {errorMessage ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{errorMessage}</p> : null}
            {infoMessage ? <p className="rounded-md border border-status-success-soft bg-status-success-soft p-2 text-xs text-status-success">{infoMessage}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
