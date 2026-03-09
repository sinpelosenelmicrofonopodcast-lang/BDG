"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { AdminTicketUpdateInput } from "@/lib/schemas/admin-ticket-update";
import { Button } from "@/components/ui/button";

type AdminTicketStatusActionsProps = {
  ticketId: string;
  locale: Locale;
  initialStatus: AdminTicketUpdateInput["status"];
  initialPriority: AdminTicketUpdateInput["priority"] | null;
};

const copy = {
  en: {
    save: "Update",
    saving: "Updating...",
    failed: "Could not update",
    status: "Status",
    priority: "Priority"
  },
  es: {
    save: "Actualizar",
    saving: "Actualizando...",
    failed: "No se pudo actualizar",
    status: "Estado",
    priority: "Prioridad"
  }
} as const;

export function AdminTicketStatusActions({ ticketId, locale, initialStatus, initialPriority }: AdminTicketStatusActionsProps) {
  const router = useRouter();
  const c = copy[locale];
  const [status, setStatus] = useState<AdminTicketUpdateInput["status"]>(initialStatus);
  const [priority, setPriority] = useState<AdminTicketUpdateInput["priority"]>(initialPriority ?? "medium");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, priority })
      });

      if (!response.ok) {
        setError(c.failed);
        return;
      }

      router.refresh();
    } catch {
      setError(c.failed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      <label className="inline-flex items-center gap-1">
        <span className="text-muted-foreground">{c.status}</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as AdminTicketUpdateInput["status"])} className="h-8 rounded-md border border-input bg-background px-2">
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">closed</option>
        </select>
      </label>

      <label className="inline-flex items-center gap-1">
        <span className="text-muted-foreground">{c.priority}</span>
        <select value={priority} onChange={(event) => setPriority(event.target.value as AdminTicketUpdateInput["priority"])} className="h-8 rounded-md border border-input bg-background px-2">
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>

      <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving}>
        {isSaving ? c.saving : c.save}
      </Button>

      {error ? <span className="text-destructive">{error}</span> : null}
    </div>
  );
}
