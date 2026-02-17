import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // TODO: FFmpeg is not available in Vercel serverless.
  // Options:
  // 1. Use ffmpeg-static npm package with Node.js runtime
  // 2. Move to Supabase Edge Function
  // 3. Use external processing service
  return NextResponse.json({
    error: "Dead air removal requires FFmpeg processing. This feature is being migrated to use cloud-based processing."
  }, { status: 501 });
}
