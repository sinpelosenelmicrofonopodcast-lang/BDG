"use client";
import { motion } from "framer-motion";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Instagram,
  MessageCircleMore,
  PlayCircle,
  Send,
  Sparkles,
  TrendingUp,
  Video
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/marketing/section-title";

type Locale = "en" | "es";

const copy = {
  en: {
    demoEyebrow: "Automation Demo",
    demoTitle: "See BDG running the content machine for you",
    demoDescription: "A visual look at how AI creates the post, schedules it, publishes across channels, and turns engagement into customer conversations.",
    howEyebrow: "How BDG Works",
    howTitle: "A 3-step system that keeps your business moving automatically",
    flowEyebrow: "Automation Flow",
    flowTitle: "From AI generation to revenue, the loop stays active every day",
    proofEyebrow: "Results",
    proofTitle: "The platform should feel automatic and outcome-driven"
  },
  es: {
    demoEyebrow: "Demo De Automatizacion",
    demoTitle: "Mira como BDG corre la maquina de contenido por ti",
    demoDescription: "Una vista visual de como la IA crea el post, lo agenda, publica en varios canales y convierte interacciones en conversaciones con clientes.",
    howEyebrow: "Como Funciona BDG",
    howTitle: "Un sistema de 3 pasos que mantiene tu negocio moviendose automaticamente",
    flowEyebrow: "Flujo De Automatizacion",
    flowTitle: "De IA a revenue, el loop se mantiene activo todos los dias",
    proofEyebrow: "Resultados",
    proofTitle: "La plataforma debe sentirse automatica y enfocada en resultados"
  }
} as const;

const steps = {
  en: [
    { step: "01", title: "Connect your business", body: "BDG learns your offer, services, audience, and the channels that should run every day." },
    { step: "02", title: "BDG generates and posts daily", body: "Content is created, scheduled, and prepared for Instagram, TikTok, Facebook, and X automatically." },
    { step: "03", title: "Customers are captured and converted", body: "Comments, DMs, clicks, and leads feed into a system built to turn attention into revenue." }
  ],
  es: [
    { step: "01", title: "Conecta tu negocio", body: "BDG entiende tu oferta, servicios, audiencia y los canales que deben correr todos los dias." },
    { step: "02", title: "BDG genera y publica diario", body: "El contenido se crea, agenda y prepara para Instagram, TikTok, Facebook y X automaticamente." },
    { step: "03", title: "Los clientes se capturan y convierten", body: "Comentarios, DMs, clics y leads entran a un sistema hecho para convertir atencion en revenue." }
  ]
} as const;

const flowSteps = ["AI", "Content", "Post", "Engagement", "Customer", "Revenue"];

const results = [
  { value: "+200%", label: "engagement", icon: TrendingUp },
  { value: "+3x", label: "leads", icon: Sparkles },
  { value: "Faster", label: "bookings", icon: CheckCircle2 }
];

export function AutomationShowcase({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <div className="space-y-8">
      <section id="automation-demo" className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.demoEyebrow} title={c.demoTitle} description={c.demoDescription} />
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45 }}>
            <Card className="automation-glow overflow-hidden border-primary/20 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(255,255,255,0.96))]">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full bg-foreground px-3 py-1 text-background">AUTOMATIC</Badge>
                  <Badge variant="secondary" className="rounded-full">
                    <Bot className="mr-1 h-3.5 w-3.5" />
                    Live demo sequence
                  </Badge>
                </div>
                <CardTitle className="text-2xl">AI generates the post, schedules it, and ships it everywhere</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="font-semibold">AI generating today&apos;s caption</p>
                    </div>
                    <span className="text-xs text-muted-foreground">08:12 AM</span>
                  </div>
                  <motion.div
                    animate={{ opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY }}
                    className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"
                  >
                    BDG is building the post, CTA, and angle based on your business goals for today.
                  </motion.div>
                </motion.div>

                <div className="grid gap-3 md:grid-cols-3">
                  <motion.div whileInView={{ y: [8, 0] }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Auto scheduling</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">11:45 AM, 3:15 PM, 6:30 PM queued automatically.</p>
                  </motion.div>
                  <motion.div whileInView={{ y: [8, 0] }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.05 }} className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Multi-platform</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Instagram, TikTok, Facebook, and X stay active from one loop.</p>
                  </motion.div>
                  <motion.div whileInView={{ y: [8, 0] }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.1 }} className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircleMore className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Engagement</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Comments and messages flow back into a conversion-ready system.</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: 0.08 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Mock real-time business activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Sparkles, label: "Caption generated", body: "Educational post ready for local business owners." },
                  { icon: PlayCircle, label: "Video script queued", body: "Short-form script prepared for TikTok and Reels." },
                  { icon: Send, label: "Posts dispatched", body: "Facebook + Instagram publishing flow activated." },
                  { icon: MessageCircleMore, label: "New DM captured", body: "Prospect asked for pricing after seeing the post." }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/25 p-4"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.howEyebrow} title={c.howTitle} />
        <div className="grid gap-4 md:grid-cols-3">
          {steps[locale].map((item, index) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.08 }}>
              <Card className="h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit rounded-full">
                    {item.step}
                  </Badge>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.flowEyebrow} title={c.flowTitle} />
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {flowSteps.map((step, index) => (
            <motion.div key={step} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <Card className="h-full border-primary/15 text-center">
                <CardContent className="flex min-h-[128px] flex-col items-center justify-center gap-3 p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {index === 0 ? <Bot className="h-5 w-5" /> : index === 1 ? <Sparkles className="h-5 w-5" /> : index === 2 ? <Send className="h-5 w-5" /> : index === 3 ? <MessageCircleMore className="h-5 w-5" /> : index === 4 ? <ChevronRight className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                  </div>
                  <p className="font-semibold">{step}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-7 py-8">
        <SectionTitle eyebrow={c.proofEyebrow} title={c.proofTitle} />
        <div className="grid gap-4 md:grid-cols-3">
          {results.map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.08 }}>
              <Card className="automation-glow h-full border-primary/15">
                <CardHeader>
                  <item.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-4xl">{item.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium capitalize text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
