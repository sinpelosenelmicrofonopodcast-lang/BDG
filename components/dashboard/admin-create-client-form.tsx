"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const copy = {
  en: {
    title: "Add client manually",
    email: "Email",
    password: "Temporary password",
    fullName: "Full name",
    company: "Company",
    phone: "Phone",
    emailConfirmed: "Mark email as confirmed",
    submit: "Create client",
    creating: "Creating...",
    success: "Client created",
    failed: "Could not create client"
  },
  es: {
    title: "Agregar cliente manual",
    email: "Email",
    password: "Contrasena temporal",
    fullName: "Nombre completo",
    company: "Empresa",
    phone: "Telefono",
    emailConfirmed: "Marcar email como confirmado",
    submit: "Crear cliente",
    creating: "Creando...",
    success: "Cliente creado",
    failed: "No se pudo crear el cliente"
  }
} as const;

type ErrorPayload = { error?: string };

export function AdminCreateClientForm({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || null,
          companyName: companyName || null,
          phone: phone || null,
          emailConfirmed
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
        setStatus(payload?.error ?? c.failed);
        return;
      }

      setStatus(c.success);
      setEmail("");
      setPassword("");
      setFullName("");
      setCompanyName("");
      setPhone("");
      setEmailConfirmed(true);
      router.refresh();
    } catch {
      setStatus(c.failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>{c.email}</Label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>{c.password}</Label>
              <Input type="text" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>{c.fullName}</Label>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.company}</Label>
              <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.phone}</Label>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={emailConfirmed} onChange={(event) => setEmailConfirmed(event.target.checked)} />
            {c.emailConfirmed}
          </label>

          <Button disabled={isSubmitting}>{isSubmitting ? c.creating : c.submit}</Button>
          {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
