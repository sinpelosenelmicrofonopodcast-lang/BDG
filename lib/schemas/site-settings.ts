import { z } from "zod";

export const contactMethodSchema = z.enum(["form", "email", "phone", "custom_url"]);

const contactLabelSchema = z.string().trim().min(2).max(48);
const contactValueSchema = z.string().trim().max(255);
const contactLocationSchema = z.string().trim().min(2).max(120);
const contactEmailSchema = z.string().trim().max(120);
const contactPhoneSchema = z.string().trim().max(30);

function isPhoneNumber(value: string) {
  return /^\+?[0-9()\-\s]{7,20}$/.test(value);
}

function isEmailAddress(value: string) {
  return z.string().email().safeParse(value).success;
}

function isCustomUrlValue(value: string) {
  if (!value) {
    return false;
  }

  if (value.startsWith("/")) {
    return true;
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
    return true;
  }

  return /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value);
}

export const defaultContactSettings = {
  method: "form",
  value: "",
  labelEn: "Contact Us",
  labelEs: "Contactanos",
  openInNewTab: false,
  agencyEmail: "sales@youragency.com",
  agencyPhone: "+1-000-000-0000",
  locationEn: "United States",
  locationEs: "Estados Unidos"
} as const;

export const contactSettingsSchema = z
  .object({
    method: contactMethodSchema.default(defaultContactSettings.method),
    value: contactValueSchema.optional().default(defaultContactSettings.value),
    labelEn: contactLabelSchema.default(defaultContactSettings.labelEn),
    labelEs: contactLabelSchema.default(defaultContactSettings.labelEs),
    openInNewTab: z.boolean().default(defaultContactSettings.openInNewTab),
    agencyEmail: contactEmailSchema.default(defaultContactSettings.agencyEmail),
    agencyPhone: contactPhoneSchema.default(defaultContactSettings.agencyPhone),
    locationEn: contactLocationSchema.default(defaultContactSettings.locationEn),
    locationEs: contactLocationSchema.default(defaultContactSettings.locationEs)
  })
  .superRefine((input, context) => {
    if (input.agencyEmail && !isEmailAddress(input.agencyEmail)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid agency email address.",
        path: ["agencyEmail"]
      });
    }

    if (input.agencyPhone && !isPhoneNumber(input.agencyPhone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid agency phone number.",
        path: ["agencyPhone"]
      });
    }

    if (input.method === "form") {
      return;
    }

    if (input.method === "email") {
      const emailTarget = input.value || input.agencyEmail;

      if (!emailTarget) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide a destination email or agency email.",
          path: ["value"]
        });
        return;
      }

      if (!isEmailAddress(emailTarget)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email address.",
          path: ["value"]
        });
      }
      return;
    }

    if (input.method === "phone") {
      const phoneTarget = input.value || input.agencyPhone;

      if (!phoneTarget) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide a destination phone or agency phone.",
          path: ["value"]
        });
        return;
      }

      if (!isPhoneNumber(phoneTarget)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid phone number.",
          path: ["value"]
        });
      }
      return;
    }

    if (!input.value) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A destination value is required for this method.",
        path: ["value"]
      });
      return;
    }

    if (input.method === "custom_url" && !isCustomUrlValue(input.value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid URL or path.",
        path: ["value"]
      });
    }
  });

export type ContactSettings = z.infer<typeof contactSettingsSchema>;

export function parseContactSettings(input: unknown): ContactSettings {
  const parsed = contactSettingsSchema.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  return { ...defaultContactSettings };
}
