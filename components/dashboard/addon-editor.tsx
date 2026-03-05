"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Addon = {
  id: string;
  name: string;
  slug: string;
  billing_type: "one_time" | "subscription";
  price_min: number;
  price_max: number;
  active: boolean;
};

const copy = {
  en: {
    title: "Add-ons editor",
    active: "Active",
    save: "Save",
    saving: "Saving...",
    failed: "Failed to save add-on changes.",
    saved: "Saved"
  },
  es: {
    title: "Editor de add-ons",
    active: "Activo",
    save: "Guardar",
    saving: "Guardando...",
    failed: "No se pudieron guardar cambios del add-on.",
    saved: "Guardado"
  }
} as const;

export function AddonEditor({ addons }: { addons: Addon[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [rows, setRows] = useState(addons);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const updateRow = (id: string, partial: Partial<Addon>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...partial } : row)));
  };

  const saveRow = async (row: Addon) => {
    setSavingId(row.id);
    setStatus(null);

    const response = await fetch(`/api/admin/addons/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: row.name,
        priceMin: row.price_min,
        priceMax: row.price_max,
        active: row.active
      })
    });

    setSavingId(null);

    if (!response.ok) {
      setStatus(c.failed);
      return;
    }

    setStatus(`${c.saved} ${row.name}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="space-y-3 rounded-md border border-border p-3 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={row.name} onChange={(event) => updateRow(row.id, { name: event.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={row.price_min}
                  onChange={(event) => updateRow(row.id, { price_min: Number(event.target.value) })}
                />
                <Input
                  type="number"
                  value={row.price_max}
                  onChange={(event) => updateRow(row.id, { price_max: Number(event.target.value) })}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={row.active} onChange={(event) => updateRow(row.id, { active: event.target.checked })} />
                {c.active}
              </label>
              <span>{row.billing_type}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => saveRow(row)} disabled={savingId === row.id}>
              {savingId === row.id ? c.saving : c.save}
            </Button>
          </div>
        ))}
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
