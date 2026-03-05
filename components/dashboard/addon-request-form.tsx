"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { analyticsEvents } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ProjectOption = {
  id: string;
  name: string;
};

type AddonOption = {
  id: string;
  name: string;
};

const copy = {
  en: {
    title: "Request extra add-on",
    project: "Project",
    addon: "Add-on",
    notes: "Notes",
    sending: "Sending...",
    request: "Request add-on",
    failed: "Could not request add-on.",
    success: "Add-on requested."
  },
  es: {
    title: "Solicitar add-on extra",
    project: "Proyecto",
    addon: "Add-on",
    notes: "Notas",
    sending: "Enviando...",
    request: "Solicitar add-on",
    failed: "No se pudo solicitar el add-on.",
    success: "Add-on solicitado."
  }
} as const;

export function AddonRequestForm({ projects, addons }: { projects: ProjectOption[]; addons: AddonOption[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [addonId, setAddonId] = useState(addons[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/addon-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, addonId, notes })
    });

    setLoading(false);

    if (!response.ok) {
      setStatus(c.failed);
      return;
    }

    trackEvent(analyticsEvents.REQUEST_ADDON, { projectId, addonId });
    setStatus(c.success);
    setNotes("");
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="font-semibold">{c.title}</p>
      <div className="space-y-2">
        <Label>{c.project}</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>{c.addon}</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={addonId}
          onChange={(event) => setAddonId(event.target.value)}
        >
          {addons.map((addon) => (
            <option key={addon.id} value={addon.id}>
              {addon.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>{c.notes}</Label>
        <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <Button onClick={submit} disabled={loading || !projectId || !addonId}>
        {loading ? c.sending : c.request}
      </Button>
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
