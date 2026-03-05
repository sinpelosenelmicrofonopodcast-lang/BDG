"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProjectOption = {
  id: string;
  name: string;
};

const copy = {
  en: {
    title: "Upload project assets",
    project: "Project",
    upload: "Upload",
    uploading: "Uploading...",
    selectFirst: "Select a file first.",
    failed: "Upload failed.",
    success: "Asset uploaded successfully."
  },
  es: {
    title: "Subir assets del proyecto",
    project: "Proyecto",
    upload: "Subir",
    uploading: "Subiendo...",
    selectFirst: "Selecciona un archivo primero.",
    failed: "La subida falló.",
    success: "Archivo subido correctamente."
  }
} as const;

export function AssetUploadForm({ projects }: { projects: ProjectOption[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];

    if (!file) {
      setStatus(c.selectFirst);
      return;
    }

    setLoading(true);
    setStatus(null);
    const body = new FormData();
    body.append("file", file);
    body.append("projectId", projectId);

    const response = await fetch("/api/files/upload-url", {
      method: "POST",
      body
    });

    setLoading(false);

    if (!response.ok) {
      setStatus(c.failed);
      return;
    }

    setStatus(c.success);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
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
      <input ref={fileRef} type="file" className="block w-full text-sm" />
      <Button onClick={upload} disabled={loading || !projectId}>
        {loading ? c.uploading : c.upload}
      </Button>
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
