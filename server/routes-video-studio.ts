/**
 * Video Studio API: transcribe, FFmpeg jobs, Director.
 */

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import os from "os";
import { storage } from "./storage";
import { transcribe as whisperTranscribe } from "./whisper";
import { removeSilence, wordsToSrt, burnSubtitles, probe } from "./ffmpeg";
import { buildDirectorSystemPrompt } from "./lib/prompts-video-studio";
import {
  videoStudioTranscribeRequestSchema,
  videoStudioDirectorRequestSchema,
} from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";

const router = express.Router();

function getAnthropic(): Anthropic {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

function parseJSON(text: string): Record<string, unknown> | null {
  if (!text || typeof text !== "string") return null;
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/g, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const m = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (m) try { return JSON.parse(m[0]) as Record<string, unknown>; } catch { /* ignore */ }
  }
  return null;
}

// ---------- Projects ----------
router.get("/api/video-studio/projects", async (_req: any, res: any) => {
  try {
    const list = await storage.getVideoProjects();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/api/video-studio/projects", async (req: any, res: any) => {
  try {
    const { name = "Untitled project", type = "short_form" } = req.body || {};
    const project = await storage.createVideoProject({
      name: String(name),
      type: type === "long_form" ? "long_form" : "short_form",
      timeline: { tracks: [], duration: 0 },
    });
    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/api/video-studio/projects/:id", async (req: any, res: any) => {
  try {
    const project = await storage.getVideoProject(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.patch("/api/video-studio/projects/:id", async (req: any, res: any) => {
  try {
    const { name, type, timeline } = req.body || {};
    const project = await storage.updateVideoProject(req.params.id, {
      ...(name !== undefined && { name: String(name) }),
      ...(type !== undefined && { type }),
      ...(timeline !== undefined && { timeline }),
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/api/video-studio/projects/:id/assets", async (req: any, res: any) => {
  try {
    const assets = await storage.getVideoAssets(req.params.id);
    res.json(assets);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/api/video-studio/projects/:id/messages", async (req: any, res: any) => {
  try {
    const messages = await storage.getAgentMessages(req.params.id, 50);
    res.json(messages.reverse());
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/api/video-studio/projects/:id/versions", async (req: any, res: any) => {
  try {
    const versions = await storage.getTimelineVersions(req.params.id, 20);
    res.json(versions);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/api/video-studio/projects/:id/assets", async (req: any, res: any) => {
  try {
    const projectId = req.params.id;
    const { kind = "video", url, fileBase64, mimeType = "video/mp4" } = req.body || {};
    let assetUrl = url;
    if (fileBase64) {
      const prefix = mimeType.startsWith("video/") ? "video" : mimeType.startsWith("audio/") ? "audio" : "image";
      assetUrl = `data:${mimeType};base64,${fileBase64}`;
    }
    if (!assetUrl) return res.status(400).json({ error: "url or fileBase64 required" });
    const project = await storage.getVideoProject(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const asset = await storage.createVideoAsset({
      projectId,
      kind: String(kind),
      url: assetUrl,
      metadata: {},
    });
    interface TrackShape { id?: string; type?: string; clips?: unknown[] }
    const timeline = (project.timeline as { tracks?: TrackShape[]; duration?: number }) || { tracks: [], duration: 0 };
    const duration = typeof (asset.metadata as { duration?: number })?.duration === "number"
      ? (asset.metadata as { duration: number }).duration
      : 0;
    const newClip = {
      id: `clip_${asset.id}`,
      start: 0,
      end: duration || 60,
      url: assetUrl,
      assetId: asset.id,
    };
    const tracks: TrackShape[] = Array.isArray(timeline.tracks) ? timeline.tracks : [];
    const mainTrack = tracks.find((t) => t.id === "main") || { id: "main", type: "video", clips: [] as unknown[] };
    const clips = Array.isArray(mainTrack.clips) ? [...mainTrack.clips, newClip] : [newClip];
    const newTracks = tracks.filter((t) => t.id !== "main");
    newTracks.push({ ...mainTrack, clips });
    const newDuration = Math.max(timeline.duration || 0, newClip.end);
    await storage.updateVideoProject(projectId, {
      timeline: { ...timeline, tracks: newTracks, duration: newDuration },
    });
    res.status(201).json({ asset, timeline: { ...timeline, tracks: newTracks, duration: newDuration } });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// ---------- Transcribe ----------
router.post("/api/video-studio/transcribe", async (req: any, res: any) => {
  const parsed = videoStudioTranscribeRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });

  try {
    const { videoUrl, audioUrl, fileBase64, mimeType } = parsed.data;
    let buffer: Buffer | undefined;
    if (fileBase64) {
      buffer = Buffer.from(fileBase64, "base64");
    } else if (videoUrl || audioUrl) {
      const url = videoUrl || audioUrl!;
      const resp = await fetch(url);
      if (!resp.ok) return res.status(400).json({ error: "Failed to fetch audio/video URL" });
      buffer = Buffer.from(await resp.arrayBuffer());
    }
    const result = await whisperTranscribe({
      buffer,
      mimeType: mimeType || "video/mp4",
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// ---------- Remove dead air (Whisper not required for detection; we use FFmpeg silencedetect) ----------
// Optional: use Whisper segments to refine. For Phase 1 we use FFmpeg only for silence removal.
router.post("/api/video-studio/jobs/remove-dead-air", async (req: any, res: any) => {
  const { videoUrl, projectId } = req.body || {};
  if (!videoUrl || typeof videoUrl !== "string") return res.status(400).json({ error: "videoUrl required" });

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `vs_input_${Date.now()}.mp4`);
  const outputPath = path.join(tmpDir, `vs_output_${Date.now()}.mp4`);

  try {
    const resp = await fetch(videoUrl);
    if (!resp.ok) throw new Error("Failed to fetch video");
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(inputPath, buf);

    const result = await removeSilence(inputPath, outputPath, { padding: 0.2 });
    const outputBuffer = fs.readFileSync(outputPath);
    const base64 = outputBuffer.toString("base64");

    if (projectId) {
      await storage.createVideoAsset({
        projectId,
        kind: "video",
        url: `data:video/mp4;base64,${base64}`,
        metadata: {
          source: "remove_dead_air",
          originalDuration: result.originalDuration,
          newDuration: result.newDuration,
          segmentsRemoved: result.segmentsRemoved,
        },
      });
    }

    fs.unlinkSync(inputPath);
    try { fs.unlinkSync(outputPath); } catch { /* ignore */ }

    res.json({
      success: true,
      videoBase64: base64,
      mimeType: "video/mp4",
      originalDuration: result.originalDuration,
      newDuration: result.newDuration,
      segmentsRemoved: result.segmentsRemoved,
    });
  } catch (e) {
    try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
    try { fs.unlinkSync(outputPath); } catch { /* ignore */ }
    res.status(500).json({ error: (e as Error).message });
  }
});

// ---------- Director: parse prompt and execute action ----------
router.post("/api/video-studio/director", async (req: any, res: any) => {
  const parsed = videoStudioDirectorRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });

  const { projectId, prompt, timeline } = parsed.data;
  const timelineSummary = timeline
    ? `Tracks: ${JSON.stringify((timeline as { tracks?: unknown[] }).tracks?.length ?? 0)}; duration: ${(timeline as { duration?: number }).duration ?? 0}s`
    : "No timeline yet";

  try {
    await storage.createAgentMessage({
      projectId,
      agent: "director",
      role: "user",
      content: prompt,
    });

    const anthropic = getAnthropic();
    const sys = buildDirectorSystemPrompt({
      timelineSummary,
      availableSkills: ["remove_dead_air", "add_captions"],
    });
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: sys,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (msg.content.find((c) => c.type === "text") as { type: "text"; text: string } | undefined)?.text ?? "";
    const actionObj = parseJSON(text);
    const action = (actionObj?.action as string) || "unknown";

    const project = await storage.getVideoProject(projectId);
    const saveTimelineVersion = async (description: string, newState: object) => {
      const versions = await storage.getTimelineVersions(projectId, 1);
      const nextVersion = (versions[0]?.version ?? 0) + 1;
      await storage.createTimelineVersion({
        projectId,
        version: nextVersion,
        timelineState: newState,
        description,
      });
    };
    const replyToUser = (content: string) => storage.createAgentMessage({
      projectId,
      agent: "director",
      role: "assistant",
      content,
    });

    if (action === "remove_dead_air") {
      const assets = project ? await storage.getVideoAssets(projectId) : [];
      const videoAsset = assets.find((a) => a.kind === "video" && a.url);
      const videoUrl = videoAsset?.url;
      if (!videoUrl) {
        await replyToUser("No video in project. Add a video to the timeline first.");
        return res.json({
          action,
          success: false,
          message: "No video in project. Add a video to the timeline first.",
        });
      }
      const tmpDir = os.tmpdir();
      const inputPath = path.join(tmpDir, `vs_in_${Date.now()}.mp4`);
      const outputPath = path.join(tmpDir, `vs_out_${Date.now()}.mp4`);
      try {
        const resp = await fetch(videoUrl);
        if (!resp.ok) throw new Error("Failed to fetch project video");
        const buf = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(inputPath, buf);
        const result = await removeSilence(inputPath, outputPath, { padding: 0.2 });
        const outBuf = fs.readFileSync(outputPath);
        const base64 = outBuf.toString("base64");
        const dataUrl = `data:video/mp4;base64,${base64}`;
        await storage.createVideoAsset({
          projectId,
          kind: "video",
          url: dataUrl,
          metadata: {
            source: "remove_dead_air",
            originalDuration: result.originalDuration,
            newDuration: result.newDuration,
            segmentsRemoved: result.segmentsRemoved,
          },
        });
        const updatedTimeline = {
          ...(project?.timeline as object || {}),
          tracks: [
            {
              id: "main",
              type: "video",
              clips: [
                {
                  id: `clip_${Date.now()}`,
                  start: 0,
                  end: result.newDuration,
                  url: dataUrl,
                  label: "Edited (dead air removed)",
                },
              ],
            },
          ],
          duration: result.newDuration,
        };
        await saveTimelineVersion("Removed dead air", updatedTimeline);
        await storage.updateVideoProject(projectId, { timeline: updatedTimeline });
        const successMsg = `Removed ${result.segmentsRemoved} silent segments. Duration ${result.originalDuration.toFixed(1)}s → ${result.newDuration.toFixed(1)}s.`;
        await replyToUser(successMsg);
        fs.unlinkSync(inputPath);
        try { fs.unlinkSync(outputPath); } catch { /* ignore */ }
        return res.json({
          action,
          success: true,
          message: successMsg,
          timeline: updatedTimeline,
          newVideoUrl: dataUrl,
        });
      } finally {
        try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
        try { fs.unlinkSync(outputPath); } catch { /* ignore */ }
      }
    }

    if (action === "add_captions") {
      const assets = project ? await storage.getVideoAssets(projectId) : [];
      const videoAsset = assets.find((a) => a.kind === "video" && a.url);
      const videoUrl = videoAsset?.url;
      if (!videoUrl) {
        await replyToUser("No video in project. Add a video first.");
        return res.json({
          action,
          success: false,
          message: "No video in project. Add a video first.",
        });
      }
      let buffer: Buffer;
      if (videoUrl.startsWith("data:")) {
        const base64 = videoUrl.split(",")[1];
        if (!base64) return res.status(400).json({ error: "Invalid data URL" });
        buffer = Buffer.from(base64, "base64");
      } else {
        const resp = await fetch(videoUrl);
        if (!resp.ok) throw new Error("Failed to fetch video");
        buffer = Buffer.from(await resp.arrayBuffer());
      }
      const transcript = await whisperTranscribe({
        buffer,
        mimeType: "video/mp4",
      });
      const words = transcript.words ?? [];
      const hasWords = words.length > 0;

      if (hasWords) {
        const tmpDir = os.tmpdir();
        const ts = Date.now();
        const inputPath = path.join(tmpDir, `vs_cap_in_${ts}.mp4`);
        const srtPath = path.join(tmpDir, `vs_cap_${ts}.srt`);
        const outputPath = path.join(tmpDir, `vs_cap_out_${ts}.mp4`);
        try {
          fs.writeFileSync(inputPath, buffer);
          const srtContent = wordsToSrt(words);
          fs.writeFileSync(srtPath, srtContent, "utf8");
          await burnSubtitles(inputPath, srtPath, outputPath);
          const outBuf = fs.readFileSync(outputPath);
          const base64 = outBuf.toString("base64");
          const dataUrl = `data:video/mp4;base64,${base64}`;
          const probed = await probe(outputPath).catch(() => null);
          const durationSec = probed?.duration ?? transcript.duration ?? 0;
          await storage.createVideoAsset({
            projectId,
            kind: "video",
            url: dataUrl,
            metadata: {
              source: "add_captions",
              text: transcript.text,
              wordCount: words.length,
            },
          });
          const updatedTimeline = {
            ...(project?.timeline as object || {}),
            tracks: [
              { id: "main", type: "video", clips: [{ id: `clip_${ts}`, start: 0, end: durationSec, url: dataUrl, label: "With captions" }] },
              { id: "c1", type: "caption", clips: [], metadata: { words: transcript.words, segments: transcript.segments } },
            ],
            duration: durationSec,
          };
          await saveTimelineVersion("Added captions (burned-in)", updatedTimeline);
          await storage.updateVideoProject(projectId, { timeline: updatedTimeline });
          const successMsg = `Captions burned in (${words.length} words). Timeline updated.`;
          await replyToUser(successMsg);
          try { fs.unlinkSync(inputPath); fs.unlinkSync(srtPath); fs.unlinkSync(outputPath); } catch { /* ignore */ }
          return res.json({
            action,
            success: true,
            message: successMsg,
            timeline: updatedTimeline,
            newVideoUrl: dataUrl,
            captions: { words: transcript.words, segments: transcript.segments, text: transcript.text },
          });
        } finally {
          try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
          try { fs.unlinkSync(srtPath); } catch { /* ignore */ }
          try { fs.unlinkSync(outputPath); } catch { /* ignore */ }
        }
      }

      await storage.createVideoAsset({
        projectId,
        kind: "caption",
        metadata: {
          source: "whisper",
          text: transcript.text,
          words: transcript.words,
          segments: transcript.segments,
        },
      });
      const successMsg = "Captions generated (word-level timestamps saved). Use a video with speech for burned-in captions.";
      await replyToUser(successMsg);
      return res.json({
        action,
        success: true,
        message: successMsg,
        captions: { words: transcript.words, segments: transcript.segments, text: transcript.text },
      });
    }

    await replyToUser("No matching action. Try: 'Remove dead air' or 'Add captions'.");
    res.json({ action, success: false, message: "No matching action for your prompt. Try: 'Remove dead air' or 'Add captions'." });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export function registerVideoStudioRoutes(app: Express): void {
  app.use(router);
}
