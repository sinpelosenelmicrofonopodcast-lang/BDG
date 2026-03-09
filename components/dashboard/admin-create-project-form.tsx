"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClientOption = {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
};

type PlanOption = {
  id: string;
  name: string;
  active: boolean;
};

type ErrorPayload = { error?: string };

const copy = {
  en: {
    title: "Add project manually",
    client: "Client",
    plan: "Plan",
    noPlan: "No plan",
    noClients: "No clients available. Create a client first.",
    name: "Project name",
    status: "Project status",
    serviceStatus: "Service status",
    billingStatus: "Billing status",
    startDate: "Start date",
    dueDate: "Due date",
    nextBillingDate: "Next billing",
    expirationDate: "Expiration",
    totalPrice: "Total price",
    stripeCustomer: "Stripe customer ID",
    stripeSubscription: "Stripe subscription ID",
    suspensionReason: "Suspension reason",
    timeline: "Timeline JSON",
    invalidTimeline: "Invalid timeline JSON",
    create: "Create project",
    creating: "Creating...",
    success: "Project created",
    failed: "Could not create project"
  },
  es: {
    title: "Agregar proyecto manual",
    client: "Cliente",
    plan: "Plan",
    noPlan: "Sin plan",
    noClients: "No hay clientes disponibles. Crea un cliente primero.",
    name: "Nombre del proyecto",
    status: "Estado del proyecto",
    serviceStatus: "Estado de servicio",
    billingStatus: "Estado de cobro",
    startDate: "Fecha inicio",
    dueDate: "Fecha entrega",
    nextBillingDate: "Proximo cobro",
    expirationDate: "Expiracion",
    totalPrice: "Precio total",
    stripeCustomer: "Stripe customer ID",
    stripeSubscription: "Stripe subscription ID",
    suspensionReason: "Razon de suspension",
    timeline: "Timeline JSON",
    invalidTimeline: "Timeline JSON invalido",
    create: "Crear proyecto",
    creating: "Creando...",
    success: "Proyecto creado",
    failed: "No se pudo crear el proyecto"
  }
} as const;

function parseTimelineValue(value: string) {
  if (!value.trim()) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function AdminCreateProjectForm({ locale, clients, plans }: { locale: Locale; clients: ClientOption[]; plans: PlanOption[] }) {
  const c = copy[locale];
  const router = useRouter();

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [planId, setPlanId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [serviceStatus, setServiceStatus] = useState("active");
  const [billingStatus, setBillingStatus] = useState("current");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [timeline, setTimeline] = useState('{"phase":"kickoff"}');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        id: client.id,
        label: client.full_name || client.company_name || client.email || client.id
      })),
    [clients]
  );

  const hasClients = clientOptions.length > 0;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!hasClients || !clientId) {
      setStatusMessage(c.noClients);
      return;
    }

    const parsedTimeline = parseTimelineValue(timeline);
    if (parsedTimeline === null) {
      setStatusMessage(c.invalidTimeline);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          planId: planId || null,
          name,
          status,
          serviceStatus,
          billingStatus,
          startDate: startDate || null,
          dueDate: dueDate || null,
          nextBillingDate: nextBillingDate || null,
          expirationDate: expirationDate || null,
          totalPrice: totalPrice ? Number(totalPrice) : null,
          stripeCustomerId: stripeCustomerId || null,
          stripeSubscriptionId: stripeSubscriptionId || null,
          suspensionReason: suspensionReason || null,
          timeline: parsedTimeline
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
        setStatusMessage(payload?.error ?? c.failed);
        return;
      }

      setStatusMessage(c.success);
      setName("");
      setTotalPrice("");
      setStripeCustomerId("");
      setStripeSubscriptionId("");
      setSuspensionReason("");
      setTimeline('{"phase":"kickoff"}');
      router.refresh();
    } catch {
      setStatusMessage(c.failed);
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
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>{c.client}</Label>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                required
                disabled={!hasClients}
              >
                {hasClients ? (
                  clientOptions.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.label}
                    </option>
                  ))
                ) : (
                  <option value="">{c.noClients}</option>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <Label>{c.plan}</Label>
              <select value={planId} onChange={(event) => setPlanId(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="">{c.noPlan}</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.active ? "" : "(inactive)"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>{c.name}</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>{c.status}</Label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="in_review">in_review</option>
                <option value="completed">completed</option>
                <option value="paused">paused</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>{c.serviceStatus}</Label>
              <select value={serviceStatus} onChange={(event) => setServiceStatus(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="active">active</option>
                <option value="past_due">past_due</option>
                <option value="suspended">suspended</option>
                <option value="canceled">canceled</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>{c.billingStatus}</Label>
              <select value={billingStatus} onChange={(event) => setBillingStatus(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="current">current</option>
                <option value="past_due">past_due</option>
                <option value="unpaid">unpaid</option>
                <option value="canceled">canceled</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>{c.startDate}</Label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.dueDate}</Label>
              <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.nextBillingDate}</Label>
              <Input type="date" value={nextBillingDate} onChange={(event) => setNextBillingDate(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.expirationDate}</Label>
              <Input type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>{c.totalPrice}</Label>
              <Input type="number" step="0.01" min="0" value={totalPrice} onChange={(event) => setTotalPrice(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.stripeCustomer}</Label>
              <Input value={stripeCustomerId} onChange={(event) => setStripeCustomerId(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{c.stripeSubscription}</Label>
              <Input value={stripeSubscriptionId} onChange={(event) => setStripeSubscriptionId(event.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{c.suspensionReason}</Label>
            <Input value={suspensionReason} onChange={(event) => setSuspensionReason(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>{c.timeline}</Label>
            <Textarea rows={4} value={timeline} onChange={(event) => setTimeline(event.target.value)} />
          </div>

          <Button disabled={isSubmitting || !hasClients || !clientId || !name}>{isSubmitting ? c.creating : c.create}</Button>
          {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
