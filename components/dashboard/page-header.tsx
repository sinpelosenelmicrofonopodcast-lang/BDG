import { cn } from "@/lib/utils";

type DashboardPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function DashboardPageHeader({ eyebrow, title, description, actions, className }: DashboardPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
