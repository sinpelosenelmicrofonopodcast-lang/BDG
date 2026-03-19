import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    title: "Build Digital Growth",
    subtitle: "Apps. Automation. Systems that scale your business.",
    cta: "Activate Your System"
  },
  es: {
    title: "Construye Crecimiento Digital",
    subtitle: "Apps. Automatizacion. Sistemas que escalan tu negocio.",
    cta: "Activa Tu Sistema"
  }
} as const;

export function TopGrowthBanner({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05122b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_34%),linear-gradient(180deg,rgba(5,18,43,0.9),rgba(2,9,24,0.98))]" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.22),transparent_48%)]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_80%_40%,rgba(96,165,250,0.18),transparent_45%)]" />

      <div className="pointer-events-none absolute left-[-8%] top-[14%] h-px w-[34%] rotate-[18deg] bg-gradient-to-r from-transparent via-[#56a4ff] to-transparent opacity-80" />
      <div className="pointer-events-none absolute left-[-2%] top-[30%] h-px w-[28%] rotate-[14deg] bg-gradient-to-r from-transparent via-[#8bc6ff] to-transparent opacity-55" />
      <div className="pointer-events-none absolute right-[-6%] top-[24%] h-px w-[32%] -rotate-[7deg] bg-gradient-to-r from-transparent via-[#56a4ff] to-transparent opacity-80" />
      <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-px bg-gradient-to-r from-transparent via-[#7fc0ff] to-transparent opacity-90" />

      <div className="pointer-events-none absolute left-[8%] top-[26%] hidden h-[42px] w-[42px] rounded-full border border-[#9fd0ff]/70 bg-[radial-gradient(circle,rgba(159,208,255,0.95),rgba(59,130,246,0.22)_55%,transparent_70%)] shadow-[0_0_28px_rgba(96,165,250,0.7)] md:block" />
      <div className="pointer-events-none absolute bottom-[18%] left-[48%] h-[10px] w-[10px] rounded-full bg-[#c6e3ff] shadow-[0_0_26px_rgba(159,208,255,0.9)]" />
      <div className="pointer-events-none absolute right-[16%] top-[18%] h-[7px] w-[7px] rounded-full bg-[#9fd0ff] shadow-[0_0_18px_rgba(96,165,250,0.95)]" />

      <div className="pointer-events-none absolute left-[2.5%] top-[22%] hidden w-[21%] rounded-2xl border border-[#79b7ff]/25 bg-[linear-gradient(180deg,rgba(8,24,56,0.8),rgba(5,15,34,0.56))] p-3 shadow-[0_0_45px_rgba(37,99,235,0.16)] lg:block">
        <div className="mb-2 flex gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-[#9fd0ff]/80" />
          <span className="h-1.5 w-10 rounded-full bg-[#9fd0ff]/30" />
        </div>
        <div className="grid grid-cols-[34px_1fr] gap-2">
          <div className="rounded-xl border border-[#9fd0ff]/25 bg-[#56a4ff]/10" />
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-[#9fd0ff]/25" />
            <div className="h-2 w-4/5 rounded-full bg-[#9fd0ff]/15" />
            <div className="h-12 rounded-xl border border-[#9fd0ff]/15 bg-[linear-gradient(180deg,rgba(77,144,255,0.18),rgba(37,99,235,0.05))]" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-[3%] top-[18%] hidden w-[29%] rounded-2xl border border-[#79b7ff]/25 bg-[linear-gradient(180deg,rgba(8,24,56,0.8),rgba(5,15,34,0.56))] p-3 shadow-[0_0_55px_rgba(37,99,235,0.14)] lg:block">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d9ebff]/85">Analytics</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#9fd0ff]/15 bg-[#56a4ff]/10 p-2">
            <div className="mb-2 h-1.5 w-10 rounded-full bg-[#9fd0ff]/50" />
            <div className="h-9 rounded-lg bg-[linear-gradient(180deg,rgba(77,144,255,0.24),rgba(37,99,235,0.05))]" />
          </div>
          <div className="rounded-xl border border-[#9fd0ff]/15 bg-[#56a4ff]/10 p-2">
            <div className="mb-2 h-1.5 w-8 rounded-full bg-[#9fd0ff]/50" />
            <div className="h-9 rounded-lg bg-[linear-gradient(180deg,rgba(159,208,255,0.22),rgba(37,99,235,0.05))]" />
          </div>
          <div className="rounded-xl border border-[#9fd0ff]/15 bg-[#56a4ff]/10 p-2">
            <div className="mb-2 h-1.5 w-12 rounded-full bg-[#9fd0ff]/50" />
            <div className="h-9 rounded-lg bg-[linear-gradient(180deg,rgba(96,165,250,0.22),rgba(37,99,235,0.05))]" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="absolute right-4 top-3 text-xl font-black tracking-tight text-white/95 sm:right-6 sm:top-4 sm:text-2xl md:text-3xl">
          BDG
        </div>

        <div className="pointer-events-none absolute inset-x-[28%] top-[44%] h-12 -translate-y-1/2 bg-[radial-gradient(circle,rgba(77,144,255,0.28),transparent_62%)] blur-2xl" />

        <h2 className="max-w-[95%] text-[22px] font-black leading-none tracking-[-0.04em] text-white drop-shadow-[0_0_18px_rgba(96,165,250,0.5)] sm:text-[30px] md:text-[42px]">
          {c.title}
        </h2>
        <p className="mt-2 max-w-[92%] text-[10px] font-medium text-[#d9ebff]/88 sm:text-xs md:text-sm">
          {c.subtitle}
        </p>
        <div className="mt-3 inline-flex rounded-2xl border border-[#9fd0ff]/60 bg-[linear-gradient(180deg,rgba(37,99,235,0.65),rgba(77,144,255,0.28))] px-4 py-1.5 text-[10px] font-semibold text-white shadow-[0_0_22px_rgba(77,144,255,0.45)] sm:px-5 sm:text-xs md:mt-4 md:px-6 md:py-2.5 md:text-sm">
          {c.cta}
        </div>
      </div>
    </div>
  );
}
