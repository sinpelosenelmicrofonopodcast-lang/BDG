import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "default" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]",
  warning: "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]"
};

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: Tone;
  helpText?: string;
};

export function DashboardStatCard({
  label,
  value,
  icon: Icon = Activity,
  tone = "default",
  helpText
}: DashboardStatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {helpText ? <p className="text-xs leading-5 text-muted-foreground">{helpText}</p> : null}
        </div>
        <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
