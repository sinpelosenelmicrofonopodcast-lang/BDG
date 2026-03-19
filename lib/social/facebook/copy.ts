import type { FacebookCopyGeneratorInput } from "@/lib/schemas/facebook-automation";
import type { AutomationSettingsRecord, SocialTemplateRecord } from "@/lib/social/facebook/types";

type CopyLength = "short" | "medium" | "long";

type CopyVariables = {
  brand_name: string;
  services: string;
  cta: string;
  offer: string;
  market: string;
  urgency: string;
  demo_clause: string;
};

function toSentenceCase(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildCta(settings: AutomationSettingsRecord | null) {
  if (!settings) {
    return "Request a demo.";
  }

  const action = settings.cta_label.trim() || "Request a demo";

  return `${toSentenceCase(action)}${action.endsWith(".") ? "" : "."}`;
}

function buildVariables(settings: AutomationSettingsRecord | null): CopyVariables {
  return {
    brand_name: "BDG",
    services: settings?.active_services?.length ? settings.active_services.join(", ") : "automation, dashboards and digital growth systems",
    cta: buildCta(settings),
    offer: settings?.offer?.trim() || "a stronger local growth system",
    market: settings?.market?.trim() || "your market",
    urgency: settings?.urgency_level ?? "high",
    demo_clause: settings?.includes_demo ? "Live demo available." : ""
  };
}

function renderVariables(template: string, settings: AutomationSettingsRecord | null) {
  const variables = buildVariables(settings);

  return Object.entries(variables).reduce((value, [key, replacement]) => value.replaceAll(`{{${key}}}`, replacement), template).replace(/\s+/g, " ").trim();
}

export function renderTemplateCopy(template: SocialTemplateRecord, length: CopyLength, settings: AutomationSettingsRecord | null) {
  const source = length === "short" ? template.short_copy : length === "medium" ? template.medium_copy : template.long_copy;

  return renderVariables(source, settings);
}

export function generateCopyOptions(
  input: FacebookCopyGeneratorInput,
  templates: SocialTemplateRecord[],
  settings: AutomationSettingsRecord | null,
  selectedTemplate: SocialTemplateRecord | null
) {
  const currentCopy = input.currentCopy?.trim() ?? "";
  const filteredTemplates = input.category ? templates.filter((template) => template.category === input.category) : templates;

  switch (input.mode) {
    case "generate_more":
      return filteredTemplates.slice(0, 4).map((template) => ({
        templateId: template.id,
        title: template.title,
        copy: renderTemplateCopy(template, "medium", settings)
      }));
    case "rewrite":
      if (!selectedTemplate) {
        return [];
      }
      return [
        {
          templateId: selectedTemplate.id,
          title: `${selectedTemplate.title} / rewrite`,
          copy: renderTemplateCopy(selectedTemplate, "long", settings)
        }
      ];
    case "shorter":
      return currentCopy
        ? [
            {
              title: "Shorter",
              copy: currentCopy
                .split(".")
                .map((chunk) => chunk.trim())
                .filter(Boolean)
                .slice(0, 2)
                .join(". ") + "."
            }
          ]
        : [];
    case "aggressive":
      return currentCopy
        ? [
            {
              title: "More aggressive",
              copy: `${currentCopy.replace(/\.*$/, ".")} Every day you wait, more demand goes elsewhere. ${buildCta(settings)}`
            }
          ]
        : [];
    case "premium":
      return currentCopy
        ? [
            {
              title: "More premium",
              copy: currentCopy
                .replaceAll("cheap", "low-value")
                .replaceAll("fast", "decisive")
                .replaceAll("good", "high-quality")
            }
          ]
        : [];
    default:
      return [];
  }
}
