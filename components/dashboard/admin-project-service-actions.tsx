"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { AdminProjectServiceInput } from "@/lib/schemas/admin-project-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminProjectServiceActionsProps = {
  projectId: string;
  locale: Locale;
  initialServiceStatus: AdminProjectServiceInput["serviceStatus"];
  initialBillingStatus: AdminProjectServiceInput["billingStatus"];
  initialNextBillingDate?: string | null;
  initialExpirationDate?: string | null;
  initialSuspensionReason?: string | null;
};

const copy = {
  en: {
    service: "Service",
    billing: "Billing",
    nextBilling: "Next billing",
    expiration: "Expiration",
    reason: "Suspension reason",
    save: "Save",
    saving: "Saving...",
    saved: "Saved",
    failed: "Could not save",
    serviceOptions: {
      active: "Active",
      past_due: "Past due",
      suspended: "Suspended",
      canceled: "Canceled"
    },
    billingOptions: {
      current: "Current",
      past_due: "Past due",
      unpaid: "Unpaid",
      canceled: "Canceled"
    }
  },
  es: {
    service: "Servicio",
    billing: "Cobro",
    nextBilling: "Proximo cobro",
    expiration: "Expiracion",
    reason: "Razon de suspension",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Guardado",
    failed: "No se pudo guardar",
    serviceOptions: {
      active: "Activo",
      past_due: "Vencido",
      suspended: "Suspendido",
      canceled: "Cancelado"
    },
    billingOptions: {
      current: "Al corriente",
      past_due: "Vencido",
      unpaid: "No pagado",
      canceled: "Cancelado"
    }
  }
} as const;

export function AdminProjectServiceActions({
  projectId,
  locale,
  initialServiceStatus,
  initialBillingStatus,
  initialNextBillingDate,
  initialExpirationDate,
  initialSuspensionReason
}: AdminProjectServiceActionsProps) {
  const router = useRouter();
  const c = copy[locale];
  const [serviceStatus, setServiceStatus] = useState<AdminProjectServiceInput["serviceStatus"]>(initialServiceStatus);
  const [billingStatus, setBillingStatus] = useState<AdminProjectServiceInput["billingStatus"]>(initialBillingStatus);
  const [nextBillingDate, setNextBillingDate] = useState(initialNextBillingDate ?? "");
  const [expirationDate, setExpirationDate] = useState(initialExpirationDate ?? "");
  const [suspensionReason, setSuspensionReason] = useState(initialSuspensionReason ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSave = async () => {
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/service-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceStatus,
          billingStatus,
          nextBillingDate: nextBillingDate || null,
          expirationDate: expirationDate || null,
          suspensionReason: suspensionReason || null
        })
      });

      if (!response.ok) {
        setStatus(c.failed);
        return;
      }

      setStatus(c.saved);
      router.refresh();
    } catch {
      setStatus(c.failed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs">
          <span className="mb-1 block text-muted-foreground">{c.service}</span>
          <select
            value={serviceStatus}
            onChange={(event) => setServiceStatus(event.target.value as AdminProjectServiceInput["serviceStatus"])}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="active">{c.serviceOptions.active}</option>
            <option value="past_due">{c.serviceOptions.past_due}</option>
            <option value="suspended">{c.serviceOptions.suspended}</option>
            <option value="canceled">{c.serviceOptions.canceled}</option>
          </select>
        </label>

        <label className="text-xs">
          <span className="mb-1 block text-muted-foreground">{c.billing}</span>
          <select
            value={billingStatus}
            onChange={(event) => setBillingStatus(event.target.value as AdminProjectServiceInput["billingStatus"])}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="current">{c.billingOptions.current}</option>
            <option value="past_due">{c.billingOptions.past_due}</option>
            <option value="unpaid">{c.billingOptions.unpaid}</option>
            <option value="canceled">{c.billingOptions.canceled}</option>
          </select>
        </label>

        <label className="text-xs">
          <span className="mb-1 block text-muted-foreground">{c.nextBilling}</span>
          <Input type="date" value={nextBillingDate} onChange={(event) => setNextBillingDate(event.target.value)} className="h-9" />
        </label>

        <label className="text-xs">
          <span className="mb-1 block text-muted-foreground">{c.expiration}</span>
          <Input type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} className="h-9" />
        </label>
      </div>

      <label className="text-xs">
        <span className="mb-1 block text-muted-foreground">{c.reason}</span>
        <Input value={suspensionReason} onChange={(event) => setSuspensionReason(event.target.value)} className="h-9" />
      </label>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving}>
          {isSaving ? c.saving : c.save}
        </Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </div>
    </div>
  );
}
