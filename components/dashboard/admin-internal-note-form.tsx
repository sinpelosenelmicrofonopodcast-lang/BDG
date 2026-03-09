"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AdminInternalNoteFormProps = {
  locale: Locale;
  clientId: string;
};

const copy = {
  en: {
    saveInternal: "Save internal note",
    saveClientVisible: "Save client-visible note",
    saving: "Saving...",
    placeholder: "Write note..."
  },
  es: {
    saveInternal: "Guardar nota interna",
    saveClientVisible: "Guardar nota visible al cliente",
    saving: "Guardando...",
    placeholder: "Escribe una nota..."
  }
} as const;

export function AdminInternalNoteForm({ locale, clientId }: AdminInternalNoteFormProps) {
  const router = useRouter();
  const c = copy[locale];
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = async (visibility: "internal" | "client") => {
    if (!note.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          note,
          visibility
        })
      });

      setNote("");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder={c.placeholder} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={isSaving} onClick={() => save("internal")}>
          {isSaving ? c.saving : c.saveInternal}
        </Button>
        <Button size="sm" variant="outline" disabled={isSaving} onClick={() => save("client")}>
          {isSaving ? c.saving : c.saveClientVisible}
        </Button>
      </div>
    </div>
  );
}
