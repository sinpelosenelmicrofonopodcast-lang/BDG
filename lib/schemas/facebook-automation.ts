import { z } from "zod";

const timezoneSchema = z.string().trim().min(2).max(64);
const scheduledTimeSchema = z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

export const facebookConnectSchema = z.object({
  userAccessToken: z.string().trim().min(20),
  scopes: z.array(z.string().trim().min(1)).default([])
});

export const selectFacebookPageSchema = z.object({
  pageId: z.string().trim().min(1),
  pageName: z.string().trim().min(1)
});

export const facebookPostIntentSchema = z.enum(["draft", "schedule", "publish_now"]);

export const facebookPostCreateSchema = z
  .object({
    caption: z.string().trim().min(8).max(5000),
    mediaAssetId: z.string().uuid().nullable().optional(),
    templateId: z.string().uuid().nullable().optional(),
    ctaUsed: z.string().trim().max(160).optional(),
    timezone: timezoneSchema.default("America/Chicago"),
    scheduledDate: z.string().trim().optional(),
    scheduledTime: scheduledTimeSchema.optional(),
    intent: facebookPostIntentSchema,
    isAutomated: z.boolean().optional().default(false)
  })
  .superRefine((input, context) => {
    if (input.intent !== "schedule") {
      return;
    }

    if (!input.scheduledDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled date is required.",
        path: ["scheduledDate"]
      });
    }

    if (!input.scheduledTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled time is required.",
        path: ["scheduledTime"]
      });
    }
  });

export const facebookPostUpdateSchema = z.object({
  intent: z.enum(["update", "duplicate", "publish_now", "cancel"]),
  caption: z.string().trim().min(8).max(5000).optional(),
  mediaAssetId: z.string().uuid().nullable().optional(),
  templateId: z.string().uuid().nullable().optional(),
  ctaUsed: z.string().trim().max(160).optional(),
  timezone: timezoneSchema.optional(),
  scheduledDate: z.string().trim().optional(),
  scheduledTime: scheduledTimeSchema.optional()
});

export const facebookAutomationSettingsSchema = z.object({
  enabled: z.boolean(),
  dailyPostsCount: z.number().int().min(1).max(10),
  timezone: timezoneSchema,
  scheduledTimes: z.array(scheduledTimeSchema).min(1).max(10),
  useImages: z.boolean(),
  contentCategories: z.array(z.string().trim().min(1)).min(1).max(10),
  rotateTemplates: z.boolean(),
  avoidRepeatTemplate: z.boolean(),
  aggressiveCtaEnabled: z.boolean(),
  ctaLabel: z.string().trim().min(2).max(120),
  ctaUrl: z.string().trim().min(1).max(255),
  tone: z.enum(["premium", "direct", "aggressive", "modern"]).default("premium"),
  offer: z.string().trim().max(255).optional().default(""),
  market: z.string().trim().max(120).optional().default(""),
  urgencyLevel: z.enum(["low", "medium", "high"]).default("high"),
  includesDemo: z.boolean(),
  activeServices: z.array(z.string().trim().min(1)).max(12).default([])
});

export const facebookCopyGeneratorSchema = z.object({
  mode: z.enum(["generate_more", "rewrite", "shorter", "aggressive", "premium"]),
  templateId: z.string().uuid().optional(),
  currentCopy: z.string().trim().max(5000).optional(),
  category: z.string().trim().max(120).optional()
});

export type FacebookConnectInput = z.infer<typeof facebookConnectSchema>;
export type SelectFacebookPageInput = z.infer<typeof selectFacebookPageSchema>;
export type FacebookPostCreateInput = z.infer<typeof facebookPostCreateSchema>;
export type FacebookPostUpdateInput = z.infer<typeof facebookPostUpdateSchema>;
export type FacebookAutomationSettingsInput = z.infer<typeof facebookAutomationSettingsSchema>;
export type FacebookCopyGeneratorInput = z.infer<typeof facebookCopyGeneratorSchema>;
