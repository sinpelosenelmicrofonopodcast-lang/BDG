"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Recipient = {
  id: string;
  email: string | null;
  full_name: string | null;
};

const copy = {
  en: {
    title: "Reply to client",
    recipient: "Recipient",
    message: "Message",
    send: "Send message",
    sending: "Sending...",
    failed: "Failed to send admin message.",
    success: "Message sent."
  },
  es: {
    title: "Responder cliente",
    recipient: "Destinatario",
    message: "Mensaje",
    send: "Enviar mensaje",
    sending: "Enviando...",
    failed: "No se pudo enviar el mensaje del admin.",
    success: "Mensaje enviado."
  }
} as const;

export function AdminMessageForm({ recipients }: { recipients: Recipient[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [recipientId, setRecipientId] = useState(recipients[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId, body })
    });

    setLoading(false);

    if (!response.ok) {
      setStatus(c.failed);
      return;
    }

    setBody("");
    setStatus(c.success);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="font-semibold">{c.title}</p>
      <div className="space-y-2">
        <Label>{c.recipient}</Label>
        <select
          value={recipientId}
          onChange={(event) => setRecipientId(event.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.full_name || recipient.email || recipient.id}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>{c.message}</Label>
        <Textarea value={body} rows={5} onChange={(event) => setBody(event.target.value)} />
      </div>
      <Button onClick={send} disabled={loading || !recipientId || !body}>
        {loading ? c.sending : c.send}
      </Button>
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
