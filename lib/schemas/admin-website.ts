import { z } from "zod";

export const adminWebsiteCreateSchema = z.object({
  projectId: z.string().uuid(),
  clientId: z.string().uuid(),
  label: z.string().trim().min(2).max(120),
  domain: z.string().trim().min(3).max(255),
  websiteUrl: z.string().trim().max(300).optional().nullable(),
  platform: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["active", "maintenance", "suspended", "offline"]).default("active"),
  sslExpiresAt: z.string().date().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable()
});

export const adminWebsiteUpdateSchema = z.object({
  status: z.enum(["active", "maintenance", "suspended", "offline"]),
  notes: z.string().trim().max(1000).optional().nullable(),
  sslExpiresAt: z.string().date().optional().nullable(),
  lastCheckedAt: z.string().datetime().optional().nullable()
});

export type AdminWebsiteCreateInput = z.infer<typeof adminWebsiteCreateSchema>;
export type AdminWebsiteUpdateInput = z.infer<typeof adminWebsiteUpdateSchema>;
