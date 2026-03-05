"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Plan = {
  id: string;
  name: string;
  slug: string;
  category: "project" | "retainer";
  billing_type: "one_time" | "subscription" | "quote_only";
  price_min: number;
  price_max: number;
  active: boolean;
  is_popular: boolean;
};

const copy = {
  en: {
    title: "Plans editor",
    active: "Active",
    mostSold: "Most sold badge",
    save: "Save",
    saving: "Saving...",
    failed: "Failed to save plan changes.",
    saved: "Saved"
  },
  es: {
    title: "Editor de planes",
    active: "Activo",
    mostSold: "Badge más vendido",
    save: "Guardar",
    saving: "Guardando...",
    failed: "No se pudieron guardar los cambios del plan.",
    saved: "Guardado"
  }
} as const;

export function PlanEditor({ plans }: { plans: Plan[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [rows, setRows] = useState(plans);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const updateRow = (id: string, partial: Partial<Plan>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...partial } : row)));
  };

  const saveRow = async (row: Plan) => {
    setSavingId(row.id);
    setStatus(null);

    const response = await fetch(`/api/admin/plans/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: row.name,
        priceMin: row.price_min,
        priceMax: row.price_max,
        active: row.active,
        popular: row.is_popular
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
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.is_popular}
                  onChange={(event) => updateRow(row.id, { is_popular: event.target.checked })}
                />
                {c.mostSold}
              </label>
              <span>
                {row.category} • {row.billing_type}
              </span>
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
