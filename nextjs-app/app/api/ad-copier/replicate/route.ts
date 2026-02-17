import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { avatars } from "@/lib/db/schema";
import { adCopierRequestSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { callAI } from "@/lib/services/ai";
import { buildAdCopierPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = adCopierRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { avatarId, emotion, style, count } = parsed.data;

  try {
    // Fetch avatar from database
    const [avatar] = await db.select().from(avatars).where(eq(avatars.id, avatarId));
    if (!avatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    // Build prompt using avatar data — derive location from request body or fallback
    const location = (body as { location?: string }).location || "Local area";
    const prompt = buildAdCopierPrompt({
      clinicType: avatar.clinicType,
      service: avatar.service,
      location,
      offer: (body as { offer?: string }).offer || "Contact us for current specials",
      targetAudience: avatar.demographics || "General local audience",
    });

    const result = await callAI(prompt);
    const resultCreatives = result?.creatives && Array.isArray(result.creatives) ? result.creatives : [];

    if (resultCreatives.length === 0) {
      return NextResponse.json({ error: "AI could not generate variations", creatives: [] }, { status: 500 });
    }

    // Apply emotion and style filters, limit to requested count
    const filtered = resultCreatives
      .filter((c: any) => (!emotion || c.emotion === emotion) && (!style || c.style === style))
      .slice(0, count);

    filtered.forEach((c: any, i: number) => {
      c.id = i + 1;
      c.primary_text = c.primary_text || c.primaryText;
      c.avatar = avatar.name;
    });

    return NextResponse.json({ creatives: filtered, source: "ai", avatar: { name: avatar.name, situation: avatar.situation } });
  } catch (error) {
    console.error("Ad Copier error:", error);
    return NextResponse.json({ error: "Ad Copier failed", creatives: [] }, { status: 500 });
  }
}
