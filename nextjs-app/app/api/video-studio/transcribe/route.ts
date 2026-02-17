import { NextRequest, NextResponse } from "next/server";
import { videoStudioTranscribeRequestSchema } from "@/lib/db/schema";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = videoStudioTranscribeRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  try {
    const { videoUrl } = parsed.data;

    // Fetch video from URL
    const resp = await fetch(videoUrl);
    if (!resp.ok) return NextResponse.json({ error: "Failed to fetch video URL" }, { status: 400 });
    const buffer = Buffer.from(await resp.arrayBuffer());

    // TODO: Implement Whisper transcription
    // For now, return a placeholder response
    return NextResponse.json({
      text: "Transcription not yet implemented",
      words: [],
      segments: [],
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
