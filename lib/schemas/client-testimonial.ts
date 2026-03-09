import { z } from "zod";

export const clientTestimonialSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  companyRole: z.string().trim().max(120).optional().or(z.literal("")),
  quoteEn: z.string().trim().max(700).optional().or(z.literal("")),
  quoteEs: z.string().trim().max(700).optional().or(z.literal(""))
});

export type ClientTestimonialInput = z.infer<typeof clientTestimonialSchema>;
