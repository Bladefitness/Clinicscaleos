import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { iterations, iterationRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildWinnerVariationPrompt, buildLoserDiagnosisPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = iterationRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  try {
    const promptBuilder = parsed.data.type === "winner_variation" ? buildWinnerVariationPrompt : buildLoserDiagnosisPrompt;
    const prompt = promptBuilder({
      creativeName: parsed.data.creativeName,
      creativeHeadline: parsed.data.creativeHeadline,
      creativeCopy: parsed.data.creativeCopy,
      performanceData: parsed.data.performanceData || "",
      clinicType: parsed.data.clinicType || "",
      service: parsed.data.service || "",
    });
    const result = await callAI(prompt);

    if (result) {
      try {
        await db.insert(iterations).values({
          sourceCreativeId: parsed.data.creativeId || null,
          iterationType: parsed.data.type,
          diagnosis: result,
          newCreatives: result.variations || result.fix_options,
        });
      } catch (dbErr) {
        console.warn("Iteration save failed:", (dbErr as Error).message);
      }
      return NextResponse.json({ result, type: parsed.data.type, source: "ai" });
    }
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  } catch (error) {
    console.error("Iteration analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze creative" }, { status: 500 });
  }
}
