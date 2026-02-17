import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    anthropicConfigured: !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10),
    databaseUrl: process.env.DATABASE_URL ? "set" : "missing",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
  });
}
