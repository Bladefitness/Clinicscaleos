import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { researchSessions, painPointSearchRequestSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildPainPointResearchPrompt } from "@/lib/prompts/research";
import { parseJSON } from "@/lib/services/ai";

export const maxDuration = 120;

function getAnthropic(): Anthropic {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = painPointSearchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { query, clinicType, service } = parsed.data;

    // Create a pending session
    const [session] = await db.insert(researchSessions).values({
      query,
      clinicType: clinicType || null,
      service: service || null,
      source: "web_search",
    }).returning();

    const prompt = buildPainPointResearchPrompt({ query, clinicType: clinicType || "", service: service || "" });

    let resultText = "";
    let source: "web_search" | "ai_synthesis" = "web_search";

    try {
      // Try Claude with web search tool
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        tools: [{ type: "web_search_20250305" as any, name: "web_search", max_uses: 10 } as any],
        messages: [{ role: "user", content: prompt }],
      });

      for (const block of response.content) {
        if (block.type === "text") {
          resultText += block.text;
        }
      }
    } catch (webSearchError: any) {
      // Fallback to standard Claude without web search
      console.warn("Web search unavailable, falling back to AI synthesis:", webSearchError.message);
      source = "ai_synthesis";
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      for (const block of response.content) {
        if (block.type === "text") {
          resultText += block.text;
        }
      }
    }

    const parsedResults = parseJSON(resultText);

    // Update session with results
    const [updated] = await db.update(researchSessions)
      .set({
        status: parsedResults ? "complete" : "error",
        source,
        results: parsedResults,
        synthesis: parsedResults ? {
          validated_pain_points: (parsedResults as any).validated_pain_points || [],
          emotional_triggers: (parsedResults as any).emotional_triggers || [],
          messaging_angles: (parsedResults as any).messaging_angles || [],
        } : null,
      })
      .where(eq(researchSessions.id, session.id))
      .returning();

    return NextResponse.json({ session: updated, source });
  } catch (err: any) {
    console.error("Pain point research error:", err);
    return NextResponse.json({ error: err.message || "Research failed" }, { status: 500 });
  }
}
