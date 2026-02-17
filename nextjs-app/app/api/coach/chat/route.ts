import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coachingSessions, coachChatRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildAdCoachChatPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = coachChatRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const prompt = buildAdCoachChatPrompt({
      message: parsed.data.message,
      clinicContext: parsed.data.clinicContext || "",
      campaignData: parsed.data.campaignData || "",
    });
    const result = await callAI(prompt);

    if (result) {
      try {
        await db.insert(coachingSessions).values({
          sessionType: "chat",
          userMessage: parsed.data.message,
          aiResponse: typeof result.response === 'string' ? result.response : JSON.stringify(result.response),
          content: result,
        });
      } catch (dbErr) {
        console.warn("Coach session save failed:", (dbErr as Error).message);
      }
      return NextResponse.json(result);
    }
    return NextResponse.json({
      response: "I'm having trouble analyzing that right now. Could you rephrase your question?",
      data_referenced: [],
      confidence_level: "low",
      follow_up_questions: ["What specific campaign metrics are you concerned about?", "What's your current monthly ad budget?"],
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Coach chat error:", errMsg);
    const hasKey = !!(process.env.ANTHROPIC_API_KEY)?.length;
    if (hasKey) {
      return NextResponse.json({
        response: `The AI service returned an error: ${errMsg}. Check your API key or try again shortly.`,
        data_referenced: [],
        confidence_level: "low",
        follow_up_questions: ["What's a good CPL for a med spa?", "How do I improve my CTR?"],
      });
    }
    return NextResponse.json({
      response: "I'm your AI Ad Coach! To get personalized advice, add your Anthropic API key. Here are some quick tips: focus on clear CTAs, test 3-5 ad variations, and track CPL by audience segment.",
      data_referenced: [],
      confidence_level: "low",
      follow_up_questions: ["What's a good CPL for a med spa?", "How do I improve my CTR?", "Which audiences should I test?"],
    });
  }
}
