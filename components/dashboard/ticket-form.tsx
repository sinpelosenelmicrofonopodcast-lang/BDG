"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { analyticsEvents } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { type TicketInput, ticketSchema } from "@/lib/schemas/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProjectOption = {
  id: string;
  name: string;
};

const copy = {
  en: {
    title: "Open ticket",
    project: "Project",
    type: "Type",
    priority: "Priority",
    subject: "Subject",
    description: "Description",
    create: "Create ticket",
    creating: "Creating...",
    success: "Ticket created successfully.",
    bug: "Bug",
    changeRequest: "Change request",
    question: "Question",
    addonRequest: "Add-on request",
    low: "Low",
    medium: "Medium",
    high: "High"
  },
  es: {
    title: "Abrir ticket",
    project: "Proyecto",
    type: "Tipo",
    priority: "Prioridad",
    subject: "Asunto",
    description: "Descripción",
    create: "Crear ticket",
    creating: "Creando...",
    success: "Ticket creado correctamente.",
    bug: "Bug",
    changeRequest: "Solicitud de cambio",
    question: "Pregunta",
    addonRequest: "Solicitud de add-on",
    low: "Baja",
    medium: "Media",
    high: "Alta"
  }
} as const;

export function TicketForm({ projects }: { projects: ProjectOption[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      projectId: projects[0]?.id,
      type: "question",
      priority: "medium",
      subject: "",
      description: ""
    }
  });

  const onSubmit = async (values: TicketInput) => {
    setSuccess(null);
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      throw new Error("Ticket creation failed");
    }

    trackEvent(analyticsEvents.OPEN_TICKET, { projectId: values.projectId, type: values.type });
    setSuccess(c.success);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="font-semibold">{c.title}</p>
      <div className="space-y-2">
        <Label htmlFor="project">{c.project}</Label>
        <select id="project" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("projectId")}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">{c.type}</Label>
          <select id="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("type")}>
            <option value="bug">{c.bug}</option>
            <option value="change_request">{c.changeRequest}</option>
            <option value="question">{c.question}</option>
            <option value="addon_request">{c.addonRequest}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">{c.priority}</Label>
          <select id="priority" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("priority")}>
            <option value="low">{c.low}</option>
            <option value="medium">{c.medium}</option>
            <option value="high">{c.high}</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">{c.subject}</Label>
        <Input id="subject" {...register("subject")} />
        {errors.subject ? <p className="text-xs text-destructive">{errors.subject.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{c.description}</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
      </div>
      <Button disabled={isSubmitting}>{isSubmitting ? c.creating : c.create}</Button>
      {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
    </form>
  );
}
