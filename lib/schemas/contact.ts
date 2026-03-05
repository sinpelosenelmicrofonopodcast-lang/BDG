import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().min(10).max(2000)
});

export type ContactInput = z.infer<typeof contactSchema>;
