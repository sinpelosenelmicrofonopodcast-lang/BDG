import { z } from "zod";

export const ticketSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(["bug", "change_request", "question", "addon_request"]),
  priority: z.enum(["low", "medium", "high"]),
  subject: z.string().min(5).max(120),
  description: z.string().min(10).max(2000)
});

export type TicketInput = z.infer<typeof ticketSchema>;
