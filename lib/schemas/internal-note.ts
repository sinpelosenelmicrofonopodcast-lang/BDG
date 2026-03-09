import { z } from "zod";

export const internalNoteSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  visibility: z.enum(["internal", "client"]).default("internal"),
  note: z.string().trim().min(3).max(3000)
});

export type InternalNoteInput = z.infer<typeof internalNoteSchema>;
