import { z } from "zod";

export const adminClientCreateSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().max(120).optional().nullable(),
  companyName: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  emailConfirmed: z.boolean().default(true)
});

export type AdminClientCreateInput = z.infer<typeof adminClientCreateSchema>;
