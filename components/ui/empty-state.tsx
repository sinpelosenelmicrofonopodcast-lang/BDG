import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
  compact = false
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-secondary/35 text-center",
        compact ? "px-4 py-5" : "px-6 py-8",
        className
      )}
    >
      <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
