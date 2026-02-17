import { NextRequest, NextResponse } from "next/server";
import { adCopyToolsRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildAdCopyPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = adCopyToolsRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const prompt = buildAdCopyPrompt({
      service: parsed.data.service,
      offer: parsed.data.offer,
      audience: parsed.data.audience,
      clinicType: parsed.data.clinicType || undefined,
    });
    const result = await callAI(prompt);
    const resultCreatives = result?.creatives && Array.isArray(result.creatives) ? result.creatives : [];
    return NextResponse.json({ creatives: resultCreatives, source: "ai" });
  } catch (error) {
    console.error("Ad copy tools error:", error);
    return NextResponse.json({ error: "Ad copy generation failed", creatives: [] }, { status: 500 });
  }
}
