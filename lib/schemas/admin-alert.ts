import { z } from "zod";

export const adminAlertUpdateSchema = z.object({
  status: z.enum(["open", "resolved"])
});

export type AdminAlertUpdateInput = z.infer<typeof adminAlertUpdateSchema>;
