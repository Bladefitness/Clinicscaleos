import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";
import { offerScoreRequestSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { callAI } from "@/lib/services/ai";
import { buildOfferScoringPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = offerScoreRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  let offer: any = null;
  try {
    const [result] = await db.insert(offers).values(parsed.data).returning();
    offer = result;
  } catch (dbErr) {
    console.warn("Offer scoring: DB unavailable:", (dbErr as Error).message);
  }

  try {
    const prompt = buildOfferScoringPrompt({
      ...parsed.data,
      price: parsed.data.price || "",
      differentiator: parsed.data.differentiator || "",
      targetMarket: parsed.data.targetMarket || "",
    });
    const result = await callAI(prompt);

    if (result) {
      const rawScore = result.overall_score;
      const safeScore = typeof rawScore === "number" ? Math.round(rawScore) : parseInt(String(rawScore), 10) || 0;
      const compInsights = result.competitor_insights || {};
      const rawWeaknesses = result.weaknesses;
      const weaknesses = Array.isArray(rawWeaknesses)
        ? rawWeaknesses.map((w: any) =>
            typeof w === "string"
              ? { issue: w, impact: "medium" as const, fix_suggestion: "" }
              : { issue: w?.issue ?? String(w), impact: w?.impact ?? "medium", fix_suggestion: w?.fix_suggestion ?? "" }
          )
        : [];
      const variations = Array.isArray(result.variations)
        ? result.variations.map((v: any) => ({ ...v, weaknesses_addressed: v.weaknesses_addressed ?? [] }))
        : [];
      // DB columns: weaknesses is text[], strengths is text[] — store strings only
      const weaknessStrings = weaknesses.map((w) => w.issue);
      const strengthStrings = Array.isArray(result.strengths) ? result.strengths.map(String) : [];
      const dbFields = {
        score: safeScore,
        scoreBreakdown: result.breakdown,
        weaknesses: weaknessStrings,
        strengths: strengthStrings,
        verdict: result.verdict,
        variations,
        competitorData: { ...compInsights, common_competitor_offers: compInsights.common_competitor_offers ?? [] },
        marketTemperature: compInsights.market_temperature,
        status: "scored" as const,
      };
      // Rich API response includes full weakness objects
      const apiOffer = {
        ...(offer || {}),
        ...parsed.data,
        ...dbFields,
        weaknesses,
      };
      if (offer?.id) {
        await db.update(offers).set(dbFields).where(eq(offers.id, offer.id)).catch((dbErr) => {
          console.error("[offers/score] DB update failed:", (dbErr as Error).message);
        });
        return NextResponse.json({ offer: apiOffer, source: "ai" });
      }
      return NextResponse.json({ offer: apiOffer, source: "ai" });
    }

    return NextResponse.json({ offer: offer || { ...parsed.data, score: null, status: "error" }, source: "error", error: "AI response parsing failed" });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Offer scoring error:", error);
    return NextResponse.json({ error: err.message || "Failed to score offer" }, { status: 500 });
  }
}
