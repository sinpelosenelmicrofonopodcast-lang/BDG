import type { Locale } from "@/lib/i18n/config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqByLocale = {
  en: [
    {
      id: "faq-1",
      q: "How fast can we launch?",
      a: "Starter projects launch in 7-12 days. Business projects typically launch in 2-4 weeks depending on content and approvals."
    },
    {
      id: "faq-2",
      q: "Can I start with a low budget?",
      a: "Yes. Use Name Your Plan and we build a phased roadmap that fits your budget and growth goals."
    },
    {
      id: "faq-3",
      q: "Do you handle ongoing updates?",
      a: "Yes. Care Plan and growth retainers include continuous support, optimization and monthly reporting."
    },
    {
      id: "faq-4",
      q: "Do you offer payment plans?",
      a: "Yes. Proposals define deposit, milestones and monthly options. Stripe subscriptions are available when applicable."
    }
  ],
  es: [
    {
      id: "faq-1",
      q: "¿Qué tan rápido podemos lanzar?",
      a: "Los proyectos Starter se lanzan en 7-12 días. Los Business normalmente en 2-4 semanas según contenido y aprobaciones."
    },
    {
      id: "faq-2",
      q: "¿Puedo comenzar con bajo presupuesto?",
      a: "Sí. Con Name Your Plan armamos un roadmap por fases que se ajusta a tu presupuesto y objetivos."
    },
    {
      id: "faq-3",
      q: "¿Manejan soporte continuo?",
      a: "Sí. Care Plan y los retainers de crecimiento incluyen soporte, optimización y reporte mensual."
    },
    {
      id: "faq-4",
      q: "¿Ofrecen planes de pago?",
      a: "Sí. Las propuestas incluyen depósito, hitos y opciones mensuales. Stripe subscriptions está disponible cuando aplica."
    }
  ]
} as const;

export function FaqSection({ locale }: { locale: Locale }) {
  return (
    <Accordion type="single" collapsible className="w-full rounded-lg border border-border bg-card p-5">
      {faqByLocale[locale].map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
