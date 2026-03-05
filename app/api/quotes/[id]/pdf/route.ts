import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function drawLine(page: ReturnType<PDFDocument["addPage"]>, y: number) {
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: rgb(0.72, 0.66, 0.45)
  });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  const { data: quote, error } = await admin
    .from("quotes")
    .select("*, quote_requests(business_name,email,phone,notes)")
    .eq("id", id)
    .maybeSingle();

  if (error || !quote) {
    return NextResponse.json({ error: error?.message ?? "Quote not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 790;

  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "logo.png"));
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, { x: 50, y: 742, width: 170, height: 70 });
    y = 728;
  } catch {
    page.drawText(process.env.AGENCY_NAME ?? "BDG", { x: 50, y, size: 20, font: fontBold, color: rgb(0.62, 0.47, 0.12) });
    y -= 22;
  }

  page.drawText(process.env.AGENCY_NAME ?? "BDG Agency", { x: 235, y: 780, size: 12, font: fontBold, color: rgb(0.18, 0.18, 0.18) });
  page.drawText(process.env.AGENCY_PHONE ?? "+1-000-000-0000", { x: 235, y: 764, size: 10, font: fontRegular });
  page.drawText(process.env.AGENCY_EMAIL ?? "sales@youragency.com", { x: 235, y: 750, size: 10, font: fontRegular });
  page.drawText(process.env.AGENCY_WEBSITE ?? "https://youragency.com", { x: 235, y: 736, size: 10, font: fontRegular });

  drawLine(page, y - 10);
  y -= 34;

  page.drawText("Proposal", { x: 50, y, size: 18, font: fontBold, color: rgb(0.62, 0.47, 0.12) });
  y -= 22;
  page.drawText(`Quote ID: ${quote.id}`, { x: 50, y, size: 10, font: fontRegular });
  y -= 20;

  page.drawText("Client Information", { x: 50, y, size: 12, font: fontBold });
  y -= 16;
  page.drawText(`Business: ${quote.quote_requests?.business_name ?? "N/A"}`, { x: 50, y, size: 10, font: fontRegular });
  y -= 14;
  page.drawText(`Email: ${quote.quote_requests?.email ?? "N/A"}`, { x: 50, y, size: 10, font: fontRegular });
  y -= 14;
  page.drawText(`Phone: ${quote.quote_requests?.phone ?? "N/A"}`, { x: 50, y, size: 10, font: fontRegular });

  drawLine(page, y - 12);
  y -= 36;

  page.drawText("Recommended Plan", { x: 50, y, size: 12, font: fontBold });
  y -= 16;
  page.drawText(quote.recommended_plan, { x: 50, y, size: 10, font: fontRegular });
  y -= 18;
  page.drawText(`Timeline: ${quote.timeline}`, { x: 50, y, size: 10, font: fontRegular });
  y -= 18;

  page.drawText("Add-ons", { x: 50, y, size: 12, font: fontBold });
  y -= 16;

  const addons = Array.isArray(quote.addons) ? quote.addons : [];
  if (addons.length === 0) {
    page.drawText("No add-ons selected", { x: 50, y, size: 10, font: fontRegular });
    y -= 16;
  } else {
    addons.slice(0, 8).forEach((addon: unknown) => {
      const label = typeof addon === "object" && addon && "name" in addon ? String(addon.name) : "Add-on";
      const amount = typeof addon === "object" && addon && "amount" in addon ? Number(addon.amount) : 0;
      page.drawText(`${label}: $${amount.toFixed(0)}`, { x: 50, y, size: 10, font: fontRegular });
      y -= 14;
    });
  }

  drawLine(page, y - 10);
  y -= 32;

  page.drawText(`Subtotal: $${Number(quote.subtotal).toFixed(0)}`, { x: 50, y, size: 11, font: fontRegular });
  y -= 14;
  page.drawText(`Add-ons: $${Number(quote.addons_total).toFixed(0)}`, { x: 50, y, size: 11, font: fontRegular });
  y -= 14;
  page.drawText(`Total: $${Number(quote.total).toFixed(0)}`, { x: 50, y, size: 13, font: fontBold });
  y -= 18;
  page.drawText(`Required Deposit: $${Number(quote.deposit_required).toFixed(0)}`, {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.62, 0.47, 0.12)
  });
  y -= 26;

  page.drawText("Conditions", { x: 50, y, size: 12, font: fontBold });
  y -= 14;
  page.drawText("- Deposit unlocks scheduling and project onboarding.", { x: 50, y, size: 10, font: fontRegular });
  y -= 14;
  page.drawText("- Scope changes are quoted separately.", { x: 50, y, size: 10, font: fontRegular });
  y -= 14;
  page.drawText("- Client approvals are required at each milestone.", { x: 50, y, size: 10, font: fontRegular });
  y -= 20;

  page.drawText("CTA: Accept proposal and proceed to payment", { x: 50, y, size: 11, font: fontBold, color: rgb(0.42, 0.32, 0.1) });

  const pdfBytes = await pdfDoc.save();
  const filePath = `quotes/${quote.id}/proposal-${Date.now()}.pdf`;

  const { error: uploadError } = await admin.storage.from("quote-documents").upload(filePath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = admin.storage.from("quote-documents").getPublicUrl(filePath);

  const { data: existingDoc } = await admin
    .from("quote_documents")
    .select("version")
    .eq("quote_id", quote.id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: docError } = await admin.from("quote_documents").insert({
    quote_id: quote.id,
    storage_path: filePath,
    public_url: publicData.publicUrl,
    version: (existingDoc?.version ?? 0) + 1
  });

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 500 });
  }

  await admin
    .from("quotes")
    .update({
      status: "sent",
      updated_at: new Date().toISOString()
    })
    .eq("id", quote.id);

  return NextResponse.json({ ok: true, url: publicData.publicUrl });
}
