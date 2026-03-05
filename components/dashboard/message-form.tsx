"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { type MessageInput, messageSchema } from "@/lib/schemas/message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProjectOption = {
  id: string;
  name: string;
};

const copy = {
  en: {
    title: "Message admin",
    project: "Project",
    message: "Message",
    send: "Send",
    sending: "Sending...",
    success: "Message sent."
  },
  es: {
    title: "Mensaje al admin",
    project: "Proyecto",
    message: "Mensaje",
    send: "Enviar",
    sending: "Enviando...",
    success: "Mensaje enviado."
  }
} as const;

export function MessageForm({ projects }: { projects: ProjectOption[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      body: "",
      projectId: projects[0]?.id
    }
  });

  const onSubmit = async (values: MessageInput) => {
    setSuccess(null);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      throw new Error("Message send failed");
    }

    setSuccess(c.success);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="font-semibold">{c.title}</p>
      <div className="space-y-2">
        <Label htmlFor="message-project">{c.project}</Label>
        <select id="message-project" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("projectId")}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message-body">{c.message}</Label>
        <Textarea id="message-body" rows={4} {...register("body")} />
        {errors.body ? <p className="text-xs text-destructive">{errors.body.message}</p> : null}
      </div>
      <Button disabled={isSubmitting}>{isSubmitting ? c.sending : c.send}</Button>
      {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
    </form>
  );
}
