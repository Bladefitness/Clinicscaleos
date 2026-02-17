import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentMessages, videoProjects, videoAssets, timelineVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { videoStudioDirectorRequestSchema } from "@/lib/db/schema";
import { callAIWithSystem } from "@/lib/services/ai";
import { buildDirectorSystemPrompt } from "@/lib/prompts/video-studio";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = videoStudioDirectorRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  const { projectId, instruction, context } = parsed.data;
  const timeline = context?.currentTimeline;
  const timelineSummary = timeline
    ? `Tracks: ${JSON.stringify((timeline as { tracks?: unknown[] }).tracks?.length ?? 0)}; duration: ${(timeline as { duration?: number }).duration ?? 0}s`
    : "No timeline yet";

  try {
    // Save user message
    await db.insert(agentMessages).values({
      projectId,
      agent: "director",
      role: "user",
      content: instruction,
    }).catch((err) => console.warn("[director] Failed to save user message:", (err as Error).message));

    const sys = buildDirectorSystemPrompt({
      timelineSummary,
      availableSkills: ["remove_dead_air", "add_captions"],
    });
    const actionObj = await callAIWithSystem({ system: sys, prompt: instruction, maxTokens: 256 });
    const action = (actionObj?.action as string) || "unknown";

    const replyToUser = async (content: string) => {
      await db.insert(agentMessages).values({
        projectId,
        agent: "director",
        role: "assistant",
        content,
      }).catch((err) => console.warn("[director] Failed to save assistant message:", (err as Error).message));
    };

    if (action === "add_captions") {
      const assets = await db.select().from(videoAssets).where(eq(videoAssets.projectId, projectId)).orderBy(desc(videoAssets.createdAt));
      const videoAsset = assets.find((a) => a.kind === "video" && a.url);
      const videoUrl = videoAsset?.url;

      if (!videoUrl) {
        await replyToUser("No video in project. Add a video first.");
        return NextResponse.json({ action, success: false, message: "No video in project." });
      }

      // TODO: Implement Whisper transcription
      // For now, create placeholder caption asset
      await db.insert(videoAssets).values({
        projectId,
        kind: "caption",
        metadata: {
          source: "whisper",
          text: "Transcription not yet implemented",
          words: [],
          segments: [],
        },
      });

      const successMsg = "Caption generation requires Whisper integration which is being implemented. Placeholder created.";
      await replyToUser(successMsg);
      return NextResponse.json({
        action,
        success: false,
        message: successMsg,
        captions: { words: [], segments: [], text: "Transcription not yet implemented" },
      });
    }

    if (action === "remove_dead_air") {
      await replyToUser("Dead air removal requires FFmpeg processing which is being migrated to cloud-based processing.");
      return NextResponse.json({
        action,
        success: false,
        message: "Dead air removal requires FFmpeg. This feature is being migrated to cloud processing.",
      });
    }

    await replyToUser("No matching action. Try: 'Remove dead air' or 'Add captions'.");
    return NextResponse.json({ action, success: false, message: "No matching action." });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
