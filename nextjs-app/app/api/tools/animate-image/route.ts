import { NextRequest, NextResponse } from "next/server";
import { animateImageRequestSchema } from "@/lib/db/schema";
import { animateImageWithFal } from "@/lib/services/fal-animate";
import { animateImage as runwayAnimateImage } from "@/lib/services/runway";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = animateImageRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { imageUrl, imageBase64, promptText, duration, model } = parsed.data;
  if (!imageUrl && !imageBase64) return NextResponse.json({ error: "imageUrl or imageBase64 required" }, { status: 400 });

  const hasFal = !!process.env.FAL_KEY;
  const hasRunway = !!(process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET);
  if (!hasFal && !hasRunway) {
    return NextResponse.json({ error: "Set FAL_KEY (or RUNWAY_API_KEY) for image-to-video." }, { status: 400 });
  }

  const opts = { imageUrl, imageBase64, promptText, duration };
  const errors: string[] = [];
  const falModel = model as "kling" | "pika" | "minimax" | "kling3" | "veo2";

  try {
    if (hasFal) {
      try {
        const result = await animateImageWithFal({ ...opts, model: falModel });
        if (result.videoUrl) return NextResponse.json({ videoUrl: result.videoUrl, status: "SUCCEEDED", provider: falModel });
        if (result.error) errors.push(`${falModel}: ${result.error}`);
      } catch (e) {
        errors.push(`${falModel}: ${(e as Error).message?.slice(0, 80) || "failed"}`);
      }
    }
    if (hasRunway) {
      try {
        const result = await runwayAnimateImage(opts);
        if (result.videoUrl) return NextResponse.json({ videoUrl: result.videoUrl, status: result.status, provider: "runway" });
        if (result.error) errors.push(`runway: ${result.error}`);
      } catch (e) {
        errors.push(`runway: ${(e as Error).message?.slice(0, 80) || "failed"}`);
      }
    }
    const msg = errors.length ? `All providers failed. ${errors.join("; ")}` : "No video provider available.";
    return NextResponse.json({ error: msg }, { status: 422 });
  } catch (err) {
    console.error("Animate image error:", err);
    return NextResponse.json({ error: (err as Error).message || "Animate image failed" }, { status: 500 });
  }
}
