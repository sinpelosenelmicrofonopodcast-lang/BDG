import { z } from "zod";

export const quoteAcceptanceSchema = z.object({
  typedName: z.string().min(2).max(120)
});

export const createCheckoutSchema = z.object({
  kind: z.enum(["plan", "addon", "quote"]),
  planId: z.string().uuid().optional(),
  addonId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  mode: z.enum(["payment", "subscription"]).default("payment")
});

export type QuoteAcceptanceInput = z.infer<typeof quoteAcceptanceSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
