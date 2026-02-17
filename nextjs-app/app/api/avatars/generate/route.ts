import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { avatars } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildAvatarGenerationPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { clinicType, service, targetMarket, offer } = await req.json();
  if (!clinicType || !service) return NextResponse.json({ error: "clinicType and service required" }, { status: 400 });

  try {
    const prompt = buildAvatarGenerationPrompt({ clinicType, service, targetMarket: targetMarket || "", offer: offer || "" });
    const result = await callAI(prompt);

    if (result?.avatars) {
      const saved = [];
      for (const a of result.avatars) {
        const [avatar] = await db.insert(avatars).values({
          clinicType, service,
          name: a.name, situation: a.situation,
          demographics: a.demographics, psychographics: a.psychographics,
          emotions: a.emotions, hooks: a.hooks,
          objections: a.objections, buyingTriggers: a.buying_triggers,
        }).returning();
        saved.push(avatar);
      }
      return NextResponse.json({ avatars: saved, source: "ai" });
    }
    console.error("[avatars/generate] AI returned no avatars data");
    return NextResponse.json({ error: "AI returned no avatar data", avatars: [], source: "error" }, { status: 500 });
  } catch (error) {
    console.error("Avatar generation error:", error);
    return NextResponse.json({ error: "Failed to generate avatars" }, { status: 500 });
  }
}
