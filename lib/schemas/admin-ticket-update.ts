import { z } from "zod";

export const adminTicketUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high"]).optional()
});

export type AdminTicketUpdateInput = z.infer<typeof adminTicketUpdateSchema>;
