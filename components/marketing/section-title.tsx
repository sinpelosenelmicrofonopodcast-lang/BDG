import { cn } from "@/lib/utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionTitle({ eyebrow, title, description, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
      <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {description ? <p className="max-w-3xl text-muted-foreground">{description}</p> : null}
    </div>
  );
}
