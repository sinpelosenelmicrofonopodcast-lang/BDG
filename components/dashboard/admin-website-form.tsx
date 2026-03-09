"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProjectOption = {
  id: string;
  name: string;
  client_id: string;
};

type WebsiteRow = {
  id: string;
  label: string;
  domain: string;
  status: "active" | "maintenance" | "suspended" | "offline";
  website_url: string | null;
  platform: string | null;
  ssl_expires_at: string | null;
  notes: string | null;
};

type AdminWebsiteFormProps = {
  locale: Locale;
  projects: ProjectOption[];
  websites: WebsiteRow[];
};

const copy = {
  en: {
    title: "Client websites",
    add: "Add website",
    adding: "Adding...",
    label: "Label",
    domain: "Domain",
    url: "Website URL",
    platform: "Platform",
    project: "Project",
    status: "Status",
    save: "Save",
    saving: "Saving..."
  },
  es: {
    title: "Websites de clientes",
    add: "Agregar website",
    adding: "Agregando...",
    label: "Etiqueta",
    domain: "Dominio",
    url: "URL del website",
    platform: "Plataforma",
    project: "Proyecto",
    status: "Estado",
    save: "Guardar",
    saving: "Guardando..."
  }
} as const;

export function AdminWebsiteForm({ locale, projects, websites }: AdminWebsiteFormProps) {
  const router = useRouter();
  const c = copy[locale];
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [domain, setDomain] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);

  const onAdd = async () => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    setIsAdding(true);

    try {
      await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          clientId: project.client_id,
          label,
          domain,
          websiteUrl,
          platform,
          status: "active"
        })
      });

      setLabel("");
      setDomain("");
      setWebsiteUrl("");
      setPlatform("");
      router.refresh();
    } finally {
      setIsAdding(false);
    }
  };

  const onUpdateStatus = async (websiteId: string, status: WebsiteRow["status"]) => {
    setIsSavingId(websiteId);
    try {
      await fetch(`/api/admin/websites/${websiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      router.refresh();
    } finally {
      setIsSavingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">{c.project}</span>
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">{c.label}</span>
            <Input value={label} onChange={(event) => setLabel(event.target.value)} className="h-9" />
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">{c.domain}</span>
            <Input value={domain} onChange={(event) => setDomain(event.target.value)} className="h-9" />
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">{c.url}</span>
            <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} className="h-9" />
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">{c.platform}</span>
            <Input value={platform} onChange={(event) => setPlatform(event.target.value)} className="h-9" />
          </label>
        </div>

        <Button size="sm" variant="outline" disabled={isAdding || !projectId || !label || !domain} onClick={onAdd}>
          {isAdding ? c.adding : c.add}
        </Button>

        <div className="space-y-2">
          {websites.map((website) => (
            <div key={website.id} className="rounded-md border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {website.label} • {website.domain}
                </p>
                <label className="inline-flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{c.status}</span>
                  <select
                    value={website.status}
                    onChange={(event) => onUpdateStatus(website.id, event.target.value as WebsiteRow["status"])}
                    className="h-8 rounded-md border border-input bg-background px-2"
                  >
                    <option value="active">active</option>
                    <option value="maintenance">maintenance</option>
                    <option value="suspended">suspended</option>
                    <option value="offline">offline</option>
                  </select>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {website.website_url ?? "-"} • {website.platform ?? "-"}
              </p>
              {isSavingId === website.id ? <p className="text-xs text-muted-foreground">{c.saving}</p> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
