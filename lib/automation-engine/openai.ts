import "server-only";

import type { AutomationEnginePlatform, GeneratedAutomationPost } from "@/lib/automation-engine/types";

const DEFAULT_MODEL = process.env.OPENAI_AUTOMATION_MODEL ?? "gpt-5-mini";

const FALLBACK_POSTS: GeneratedAutomationPost[] = [
  {
    title: "Why manual posting keeps businesses invisible",
    content:
      "Your business should not disappear the moment your day gets busy. BDG plans the post, publishes it on time, and keeps your brand in front of customers every single day without you touching social media.",
    contentType: "educational",
    platform: "multi-platform",
    performanceScore: 88,
    metrics: { engagement: 124, clicks: 34, leads: 7 }
  },
  {
    title: "3 signs your follow-up system is costing you sales",
    content:
      "If replies slow down after hours, DMs sit unanswered, or leads vanish after the first click, the problem is not demand. It is manual workflow. BDG keeps content, response flow, and lead capture running automatically so momentum does not die.",
    contentType: "educational",
    platform: "multi-platform",
    performanceScore: 91,
    metrics: { engagement: 152, clicks: 41, leads: 9 }
  },
  {
    title: "Offer post",
    content:
      "Want daily posting, lead capture, and follow-up handled for you? Activate BDG and let your business publish, engage, and convert while you focus on delivery.",
    contentType: "sales",
    platform: "multi-platform",
    performanceScore: 95,
    metrics: { engagement: 167, clicks: 58, leads: 13 }
  },
  {
    title: "Short-form video script",
    content:
      "Hook: Still posting manually every day?\nScene 1: Show missed messages and empty scheduling gaps.\nScene 2: Show BDG generating content and auto-posting to every channel.\nScene 3: Show comments, DMs, and leads arriving.\nCTA: Stop managing every post. Activate BDG.",
    contentType: "video_script",
    platform: "tiktok",
    performanceScore: 93,
    metrics: { engagement: 210, clicks: 49, leads: 11 }
  }
];

function stripCodeFence(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
}

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const direct = Reflect.get(payload, "output_text");
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const output = Reflect.get(payload, "output");
  if (!Array.isArray(output)) {
    return "";
  }

  const parts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Reflect.get(item, "content");
    if (!Array.isArray(content)) {
      continue;
    }

    for (const block of content) {
      if (!block || typeof block !== "object") {
        continue;
      }

      const text = Reflect.get(block, "text");
      if (typeof text === "string" && text.trim()) {
        parts.push(text.trim());
      }
    }
  }

  return parts.join("\n").trim();
}

function normalizePosts(value: unknown, platforms: AutomationEnginePlatform[]) {
  if (!value || typeof value !== "object" || !Array.isArray((value as { items?: unknown[] }).items)) {
    throw new Error("Invalid OpenAI response shape.");
  }

  return (value as { items: unknown[] }).items.slice(0, 4).map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid post payload.");
    }

    const record = item as Record<string, unknown>;
    const fallbackPlatform = index === 3 && platforms.includes("tiktok") ? "tiktok" : "multi-platform";
    const contentType = record.contentType;

    return {
      title: typeof record.title === "string" ? record.title.trim() : `BDG automation post ${index + 1}`,
      content: typeof record.content === "string" ? record.content.trim() : "",
      contentType:
        contentType === "educational" || contentType === "sales" || contentType === "video_script" ? contentType : index === 2 ? "sales" : index === 3 ? "video_script" : "educational",
      platform:
        record.platform === "instagram" ||
        record.platform === "facebook" ||
        record.platform === "tiktok" ||
        record.platform === "x" ||
        record.platform === "multi-platform"
          ? record.platform
          : fallbackPlatform,
      performanceScore:
        typeof record.performanceScore === "number" && Number.isFinite(record.performanceScore)
          ? Math.max(1, Math.min(100, Math.round(record.performanceScore)))
          : 82 + index * 4,
      metrics: {
        engagement:
          typeof record.metrics === "object" && record.metrics && typeof (record.metrics as Record<string, unknown>).engagement === "number"
            ? Math.max(0, Math.round((record.metrics as Record<string, unknown>).engagement as number))
            : 120 + index * 22,
        clicks:
          typeof record.metrics === "object" && record.metrics && typeof (record.metrics as Record<string, unknown>).clicks === "number"
            ? Math.max(0, Math.round((record.metrics as Record<string, unknown>).clicks as number))
            : 28 + index * 7,
        leads:
          typeof record.metrics === "object" && record.metrics && typeof (record.metrics as Record<string, unknown>).leads === "number"
            ? Math.max(0, Math.round((record.metrics as Record<string, unknown>).leads as number))
            : 5 + index * 2
      }
    } satisfies GeneratedAutomationPost;
  });
}

export async function generateAutomationContent(params: {
  businessName: string;
  platforms: AutomationEnginePlatform[];
  timezone: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      source: "fallback" as const,
      posts: FALLBACK_POSTS
    };
  }

  const businessName = params.businessName.trim() || "BDG";
  const platforms: AutomationEnginePlatform[] = params.platforms.length ? params.platforms : ["instagram", "facebook", "tiktok", "x"];

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        reasoning: {
          effort: "low"
        },
        input: [
          {
            role: "developer",
            content:
              "You create concise, conversion-driven social content for autonomous business systems. Return valid JSON only with an items array."
          },
          {
            role: "user",
            content: `Create exactly 4 pieces of daily social content for ${businessName}. The platform story is AI automation, daily posting, lead generation, and a self-running business system. Target platforms: ${platforms.join(
              ", "
            )}. Timezone: ${params.timezone}. Return JSON with this exact shape: {"items":[{"title":"string","content":"string","contentType":"educational|sales|video_script","platform":"instagram|facebook|tiktok|x|multi-platform","performanceScore":90,"metrics":{"engagement":120,"clicks":35,"leads":8}}]}. Requirements: 2 educational posts, 1 sales post, 1 short-form video script. No markdown fences.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;
    const rawText = extractResponseText(payload);
    const parsed = JSON.parse(stripCodeFence(rawText));

    return {
      source: "openai" as const,
      posts: normalizePosts(parsed, platforms)
    };
  } catch {
    return {
      source: "fallback" as const,
      posts: FALLBACK_POSTS
    };
  }
}
