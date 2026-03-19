import { NextResponse } from "next/server";
import { hasSocialCronSecret, getSocialCronSecret } from "@/lib/social/facebook/config";
import { runDailyAutomation, runScheduledFacebookPosts } from "@/lib/social/facebook/jobs";

export async function POST(request: Request) {
  if (!hasSocialCronSecret()) {
    return NextResponse.json({ error: "Missing SOCIAL_CRON_SECRET." }, { status: 500 });
  }

  const secret = request.headers.get("x-cron-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

  if (!secret || secret !== getSocialCronSecret()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [automation, scheduled] = await Promise.all([runDailyAutomation(), runScheduledFacebookPosts()]);

  return NextResponse.json({
    ok: true,
    automation,
    scheduled
  });
}
