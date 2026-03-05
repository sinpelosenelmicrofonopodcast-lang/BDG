import { z } from "zod";

export const messageSchema = z.object({
  body: z.string().min(1).max(2000),
  projectId: z.string().uuid().optional(),
  ticketId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional()
});

export type MessageInput = z.infer<typeof messageSchema>;
