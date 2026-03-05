import { z } from "zod";

export const nameYourPlanSchema = z.object({
  budget: z.number().min(150).max(100000),
  industry: z.string().min(2),
  needs: z.array(z.string()).min(1),
  businessName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  notes: z.string().max(1000).optional().or(z.literal(""))
});

export type NameYourPlanInput = z.infer<typeof nameYourPlanSchema>;
