import { NextRequest, NextResponse } from "next/server";
import { headlineAnalyzeRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildHeadlineAnalyzerPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = headlineAnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const prompt = buildHeadlineAnalyzerPrompt(parsed.data);
    const result = await callAI(prompt);
    if (!result || typeof result.score !== "number") {
      return NextResponse.json({ error: "Headline analysis failed" }, { status: 500 });
    }
    return NextResponse.json({
      score: result.score,
      breakdown: result.breakdown ?? {},
      feedback: result.feedback ?? "",
      alternatives: Array.isArray(result.alternatives) ? result.alternatives : [],
    });
  } catch (error) {
    console.error("Headline analyze error:", error);
    return NextResponse.json({ error: "Headline analysis failed" }, { status: 500 });
  }
}
