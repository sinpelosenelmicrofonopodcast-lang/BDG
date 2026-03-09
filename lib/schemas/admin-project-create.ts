import { z } from "zod";

export const projectStatusSchema = z.enum(["draft", "active", "in_review", "completed", "paused"]);
export const serviceStatusSchema = z.enum(["active", "past_due", "suspended", "canceled"]);
export const billingStatusSchema = z.enum(["current", "past_due", "unpaid", "canceled"]);

export const adminProjectCreateSchema = z.object({
  clientId: z.string().uuid(),
  planId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(160),
  status: projectStatusSchema,
  serviceStatus: serviceStatusSchema,
  billingStatus: billingStatusSchema,
  startDate: z.string().date().optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
  nextBillingDate: z.string().date().optional().nullable(),
  expirationDate: z.string().date().optional().nullable(),
  totalPrice: z.number().nonnegative().optional().nullable(),
  stripeCustomerId: z.string().trim().max(120).optional().nullable(),
  stripeSubscriptionId: z.string().trim().max(120).optional().nullable(),
  timeline: z.record(z.string(), z.unknown()).or(z.array(z.unknown())).or(z.object({}).passthrough()).optional(),
  suspensionReason: z.string().trim().max(500).optional().nullable()
});

export type AdminProjectCreateInput = z.infer<typeof adminProjectCreateSchema>;
