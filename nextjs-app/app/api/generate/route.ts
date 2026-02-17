import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creatives } from "@/lib/db/schema";
import { generateRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import {
  buildCreativePrompt,
  buildAvatarGenerationPrompt,
  buildAvatarResearchPrompt,
  AVATAR_PAIRS,
} from "@/lib/prompts";
import { generateImage, buildHyperdopamineImagePrompt } from "@/lib/services/image-generation";

export const maxDuration = 120;

async function synthesizeAvatarResearch(opts: {
  clinicType: string;
  service: string;
  targetMarket?: string;
  offer?: string;
}): Promise<{ summary: string; researchText: string } | null> {
  const prompt = buildAvatarResearchPrompt(opts);
  const result = await callAI(prompt);
  if (!result || typeof result !== "object") return null;
  const summary = result.summary || "Research synthesis completed.";
  const researchText = [
    result.summary,
    "Emotional triggers: " + (result.emotional_triggers || []).join("; "),
    "Pain points: " + (result.pain_points || []).join("; "),
    "Buying motivations: " + (result.buying_motivations || []).join("; "),
    "Top segments: " + (result.top_segments || []).join("; "),
    "Messaging angles: " + (result.messaging_angles || []).join("; "),
  ].filter(Boolean).join("\n");
  return { summary, researchText };
}

function avatarPairsFromList(avatarsList: Array<{ name: string; demographics?: string; situation?: string }>): string[] {
  const formatted = avatarsList.map((a) => {
    const extra = [a.demographics, a.situation].filter(Boolean).join(", ");
    return extra ? `"${a.name} (${extra})"` : `"${a.name}"`;
  });
  const pairs: string[] = [];
  for (let i = 0; i < formatted.length - 1; i += 2) {
    pairs.push(`${formatted[i]} + ${formatted[i + 1]}`);
  }
  if (formatted.length % 2 === 1) pairs.push(formatted[formatted.length - 1]);
  return pairs;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { clinicType, service, location, currentOffer, differentiator, targetMarket, count } = parsed.data;
  const offer = currentOffer || "Contact us for current specials";
  const targetAudience = targetMarket || "";
  const goal = differentiator || "Generate high-performing ad creative";
  const quickMode = count <= 3;
  const imageCount = Math.min(6, Math.max(0, count));

  try {
    let research: { summary: string; researchText: string } | null = null;
    let avatarList: Array<{ name: string; situation?: string; demographics?: string; emotions?: object }> = [];
    let avatarPairStrings: string[] | null = null;

    if (quickMode) {
      avatarPairStrings = [...AVATAR_PAIRS].slice(0, 2);
    } else {
      research = await synthesizeAvatarResearch({ clinicType, service, targetMarket: targetAudience || undefined, offer });
      const avatarPrompt = buildAvatarGenerationPrompt({
        clinicType, service,
        targetMarket: targetAudience || "General local audience",
        offer,
        researchFindings: research?.researchText,
      });
      const avatarResult = await callAI(avatarPrompt);
      avatarList = avatarResult?.avatars && Array.isArray(avatarResult.avatars) ? avatarResult.avatars : [];
      avatarPairStrings = avatarList.length >= 4 ? avatarPairsFromList(avatarList) : [...AVATAR_PAIRS].slice(0, 3);
    }

    const batchCount = avatarPairStrings?.length ?? 3;
    const batchPromises = Array.from({ length: batchCount }, (_, batch) =>
      (async () => {
        const avatarPair = avatarPairStrings?.[batch];
        const prompt = buildCreativePrompt(
          { clinicType, service, location, targetAudience: targetAudience || "", offerDetails: offer, goal, avatarPair: avatarPair || undefined },
          batch
        );
        const result = await callAI(prompt);
        const arr = Array.isArray(result) ? result : result?.creatives;
        return Array.isArray(arr) ? arr : [];
      })()
    );

    const batchResults = await Promise.allSettled(batchPromises);
    const allCreatives: any[] = [];
    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        const offset = allCreatives.length;
        result.value.forEach((c: any, i: number) => { c.id = offset + i + 1; });
        allCreatives.push(...result.value);
      }
    }

    if (allCreatives.length === 0) {
      console.error("Generate: all AI batches returned empty results");
      return NextResponse.json({ error: "AI generated no creatives — please retry", creatives: [], source: "fallback", research: null, avatars: [], inlineImageUrls: {} });
    }

    // Inline image generation
    const inlineImageUrls: Record<number, string> = {};
    if (imageCount > 0) {
      const BATCH_SIZE = 3;
      const toGenerate = allCreatives.slice(0, imageCount);
      for (let i = 0; i < toGenerate.length; i += BATCH_SIZE) {
        const batch = toGenerate.slice(i, i + BATCH_SIZE);
        const imagePromises = batch.map(async (c: any, idx: number) => {
          const globalIdx = i + idx;
          const { prompt: adImagePrompt, usePro } = buildHyperdopamineImagePrompt({
            prompt: c.image_prompt || "",
            style: c.style,
            avatar: c.avatar,
            emotion: c.emotion,
            headline: c.headline,
            hook: c.hook,
          });
          try {
            const url = await generateImage(adImagePrompt, usePro);
            return { index: globalIdx, url };
          } catch (imgErr) {
            console.warn(`Inline image ${globalIdx + 1} failed:`, (imgErr as Error).message);
            return { index: globalIdx, url: null };
          }
        });
        const imageResults = await Promise.all(imagePromises);
        for (const { index, url } of imageResults) {
          if (url) inlineImageUrls[index] = url;
        }
        if (i + BATCH_SIZE < toGenerate.length) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    // Save to DB
    const toSave = allCreatives.map((c: any) => ({
      avatarName: c.avatar || "Unknown",
      emotion: c.emotion || "trust",
      style: c.style || "Direct Offer",
      headline: c.headline || "",
      primaryText: c.primary_text || "",
      imagePrompt: c.image_prompt || "",
      hook: c.hook || "",
      category: c.category || "Avatar Test A",
      copyFormula: c.copy_formula || "",
      clinicType, service, location, status: "pending",
    }));
    try {
      await db.insert(creatives).values(toSave);
    } catch (dbErr) {
      console.warn("Creative save failed:", (dbErr as Error).message);
    }

    return NextResponse.json({
      creatives: allCreatives,
      source: "ai",
      research: research ? { summary: research.summary } : null,
      avatars: avatarList.map((a: any) => ({ name: a.name, situation: a.situation, emotions: a.emotions })),
      inlineImageUrls,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Generate endpoint error:", err.message, err.stack);
    return NextResponse.json(
      { error: err.message || "Creative generation failed", creatives: [], source: "error", research: null, avatars: [], inlineImageUrls: {} },
      { status: 500 }
    );
  }
}
