"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminAlertActionsProps = {
  alertId: string;
  currentStatus: "open" | "resolved";
};

export function AdminAlertActions({ alertId, currentStatus }: AdminAlertActionsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const toggle = async () => {
    const nextStatus = currentStatus === "open" ? "resolved" : "open";
    setIsSaving(true);

    try {
      await fetch(`/api/admin/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={toggle} disabled={isSaving}>
      {isSaving ? "..." : currentStatus === "open" ? "Resolve" : "Reopen"}
    </Button>
  );
}
