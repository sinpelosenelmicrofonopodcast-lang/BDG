import { z } from "zod";

const timezoneSchema = z.string().trim().min(2).max(64);
const scheduledTimeSchema = z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

export const automationEnginePlatformsSchema = z.object({
  instagram: z.boolean(),
  facebook: z.boolean(),
  tiktok: z.boolean(),
  x: z.boolean()
});

export const automationEngineSettingsSchema = z.object({
  autoPostEnabled: z.boolean(),
  autoDmEnabled: z.boolean(),
  autoReplyEnabled: z.boolean(),
  platforms: automationEnginePlatformsSchema,
  preferredScheduleTimes: z.array(scheduledTimeSchema).min(1).max(8),
  timezone: timezoneSchema.default("America/Chicago"),
  autoReplyMessage: z.string().trim().min(8).max(280),
  autoDmMessage: z.string().trim().min(8).max(280),
  simulatePosting: z.boolean().default(true)
});

export const automationEngineGenerateSchema = z.object({
  force: z.boolean().optional().default(false)
});

export type AutomationEngineSettingsInput = z.infer<typeof automationEngineSettingsSchema>;
export type AutomationEngineGenerateInput = z.infer<typeof automationEngineGenerateSchema>;
