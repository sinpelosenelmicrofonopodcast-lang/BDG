import { NextResponse } from "next/server";
import { getAdminApiContext } from "@/lib/auth/admin-api";
import { facebookCopyGeneratorSchema } from "@/lib/schemas/facebook-automation";
import { generateCopyOptions } from "@/lib/social/facebook/copy";
import { getFacebookConnectionForAdmin, getTemplateById, listFacebookTemplates } from "@/lib/social/facebook/repository";

export async function POST(request: Request) {
  const { context, error } = await getAdminApiContext();

  if (error || !context) {
    return error as NextResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = facebookCopyGeneratorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  const [templates, connection] = await Promise.all([listFacebookTemplates(), getFacebookConnectionForAdmin(context.user.id)]);
  const selectedTemplate = parsed.data.templateId ? await getTemplateById(parsed.data.templateId) : null;

  const options = generateCopyOptions(parsed.data, templates, connection.settings, selectedTemplate);

  return NextResponse.json({ ok: true, options });
}
