import { NextRequest, NextResponse } from "next/server";
import { improveCreativeRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildImproveCreativePrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = improveCreativeRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const prompt = buildImproveCreativePrompt({
      headline: parsed.data.headline,
      primaryText: parsed.data.primaryText,
      hook: parsed.data.hook,
      clinicType: parsed.data.clinicType || undefined,
      service: parsed.data.service || undefined,
      direction: parsed.data.direction || undefined,
    });
    const result = await callAI(prompt);
    if (!result || !result.headline) {
      return NextResponse.json({ error: "Improve creative failed" }, { status: 500 });
    }
    return NextResponse.json({
      headline: result.headline,
      primary_text: result.primary_text ?? result.primaryText ?? parsed.data.primaryText,
      hook: result.hook ?? parsed.data.hook,
      changes_summary: result.changes_summary ?? "",
    });
  } catch (error) {
    console.error("Improve creative error:", error);
    return NextResponse.json({ error: "Improve creative failed" }, { status: 500 });
  }
}
