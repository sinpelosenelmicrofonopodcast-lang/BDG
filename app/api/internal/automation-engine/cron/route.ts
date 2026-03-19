import { NextResponse } from "next/server";
import { runAutomationEngineDaily, runAutomationEnginePostingSweep } from "@/lib/automation-engine/jobs";

function getAutomationCronSecret() {
  return process.env.AUTOMATION_ENGINE_CRON_SECRET ?? process.env.SOCIAL_CRON_SECRET ?? "";
}

export async function POST(request: Request) {
  const configuredSecret = getAutomationCronSecret();

  if (!configuredSecret) {
    return NextResponse.json({ error: "Missing AUTOMATION_ENGINE_CRON_SECRET." }, { status: 500 });
  }

  const providedSecret = request.headers.get("x-cron-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [generated, posting] = await Promise.all([runAutomationEngineDaily(), runAutomationEnginePostingSweep()]);

  return NextResponse.json({
    ok: true,
    generated,
    posting
  });
}
