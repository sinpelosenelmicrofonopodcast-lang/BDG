"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

type AdminTestimonialActionsProps = {
  testimonialId: string;
  locale: Locale;
  initialActive: boolean;
  initialFeatured: boolean;
};

const copy = {
  en: { approve: "Approve", hide: "Hide", feature: "Feature", unfeature: "Unfeature", saving: "Saving..." },
  es: { approve: "Aprobar", hide: "Ocultar", feature: "Destacar", unfeature: "Quitar destacado", saving: "Guardando..." }
} as const;

export function AdminTestimonialActions({ testimonialId, locale, initialActive, initialFeatured }: AdminTestimonialActionsProps) {
  const router = useRouter();
  const c = copy[locale];
  const [active, setActive] = useState(initialActive);
  const [featured, setFeatured] = useState(initialFeatured);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (nextActive: boolean, nextFeatured: boolean) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive, isFeatured: nextFeatured })
      });

      if (!response.ok) {
        return;
      }

      setActive(nextActive);
      setFeatured(nextFeatured);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={isSaving} onClick={() => save(!active, featured)}>
        {isSaving ? c.saving : active ? c.hide : c.approve}
      </Button>
      <Button size="sm" variant="outline" disabled={isSaving || !active} onClick={() => save(active, !featured)}>
        {isSaving ? c.saving : featured ? c.unfeature : c.feature}
      </Button>
    </div>
  );
}
