import { z } from "zod";

export const serviceStatusSchema = z.enum(["active", "past_due", "suspended", "canceled"]);
export const billingStatusSchema = z.enum(["current", "past_due", "unpaid", "canceled"]);

export const adminProjectServiceSchema = z.object({
  serviceStatus: serviceStatusSchema,
  billingStatus: billingStatusSchema,
  nextBillingDate: z.string().date().optional().nullable(),
  expirationDate: z.string().date().optional().nullable(),
  suspensionReason: z.string().trim().max(500).optional().nullable()
});

export type AdminProjectServiceInput = z.infer<typeof adminProjectServiceSchema>;
