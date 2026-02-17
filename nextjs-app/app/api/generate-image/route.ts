import { NextRequest, NextResponse } from "next/server";
import { generateImage, buildHyperdopamineImagePrompt } from "@/lib/services/image-generation";

export async function POST(req: NextRequest) {
  const { prompt, style, avatar, emotion, headline, hook } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  try {
    const { prompt: adImagePrompt, usePro } = buildHyperdopamineImagePrompt({
      prompt,
      style: typeof style === "string" ? style : undefined,
      avatar: typeof avatar === "string" ? avatar : undefined,
      emotion: typeof emotion === "string" ? emotion : undefined,
      headline: typeof headline === "string" ? headline : undefined,
      hook: typeof hook === "string" ? hook : undefined,
    });
    const imageUrl = await generateImage(adImagePrompt, usePro);
    return NextResponse.json({ imageUrl, prompt: adImagePrompt });
  } catch (error: any) {
    console.error("Image generation error:", error?.message);
    return NextResponse.json({ error: "Failed to generate image", details: error?.message }, { status: 500 });
  }
}
