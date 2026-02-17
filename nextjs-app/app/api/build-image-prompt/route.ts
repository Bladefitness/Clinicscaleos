import { NextRequest, NextResponse } from "next/server";
import { buildHyperdopamineImagePrompt } from "@/lib/services/image-generation";

export async function POST(req: NextRequest) {
  const { prompt, style, avatar, emotion, headline, hook } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const { prompt: built } = buildHyperdopamineImagePrompt({
    prompt,
    style: typeof style === "string" ? style : undefined,
    avatar: typeof avatar === "string" ? avatar : undefined,
    emotion: typeof emotion === "string" ? emotion : undefined,
    headline: typeof headline === "string" ? headline : undefined,
    hook: typeof hook === "string" ? hook : undefined,
  });
  return NextResponse.json({ prompt: built });
}
