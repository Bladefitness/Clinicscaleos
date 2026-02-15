/**
 * FFmpeg wrapper for Video Studio: trim, concat, silence removal, probe.
 * Requires FFmpeg binary on PATH or FFMPEG_PATH env.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execFileAsync = promisify(execFile);

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

export interface ProbeResult {
  duration: number;
  width?: number;
  height?: number;
  hasVideo: boolean;
  hasAudio: boolean;
}

/** Get duration and basic stream info. */
export async function probe(inputPath: string): Promise<ProbeResult> {
  const { stdout } = await execFileAsync(FFPROBE, [
    "-v", "quiet",
    "-print_format", "json",
    "-show_format",
    "-show_streams",
    inputPath,
  ], { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 });
  const data = JSON.parse(stdout);
  const format = data.format || {};
  const duration = parseFloat(format.duration || "0");
  const videoStream = (data.streams || []).find((s: { codec_type: string }) => s.codec_type === "video");
  const audioStream = (data.streams || []).find((s: { codec_type: string }) => s.codec_type === "audio");
  return {
    duration,
    width: videoStream?.width,
    height: videoStream?.height,
    hasVideo: !!videoStream,
    hasAudio: !!audioStream,
  };
}

/** Detect silence segments: returns [{ start, end }] in seconds. */
export async function detectSilence(
  inputPath: string,
  opts: { noiseDb?: number; minDuration?: number } = {}
): Promise<Array<{ start: number; end: number }>> {
  const noiseDb = opts.noiseDb ?? -35;
  const minDuration = opts.minDuration ?? 0.5;
  const { stderr } = await execFileAsync(FFMPEG, [
    "-i", inputPath,
    "-af", `silencedetect=noise=${noiseDb}dB:d=${minDuration}`,
    "-f", "null",
    "-",
  ], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }).catch((err: { stderr?: string }) => ({ stdout: "", stderr: err.stderr || "" }));

  const segments: Array<{ start: number; end: number }> = [];
  const startRe = /silence_start: ([\d.]+)/g;
  const endRe = /silence_end: ([\d.]+)/g;
  let m;
  const starts: number[] = [];
  const ends: number[] = [];
  while ((m = startRe.exec(stderr)) !== null) starts.push(parseFloat(m[1]));
  while ((m = endRe.exec(stderr)) !== null) ends.push(parseFloat(m[1]));
  for (let i = 0; i < starts.length; i++) {
    segments.push({ start: starts[i], end: ends[i] ?? starts[i] + 1 });
  }
  return segments;
}

/** Concat segments of the input into one output (trim then concat). Segments are [start, end] in seconds. */
export async function concatSegments(
  inputPath: string,
  outputPath: string,
  segments: Array<{ start: number; end: number }>
): Promise<void> {
  if (segments.length === 0) {
    throw new Error("At least one segment required");
  }
  const dir = path.dirname(outputPath);
  const base = path.basename(outputPath, path.extname(outputPath));
  const listPath = path.join(dir, `${base}_list.txt`);
  const parts: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const partPath = path.join(dir, `${base}_part${i}.mp4`);
    await execFileAsync(FFMPEG, [
      "-y", "-i", inputPath,
      "-ss", String(seg.start),
      "-to", String(seg.end),
      "-c", "copy",
      partPath,
    ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    parts.push(partPath);
  }
  const listContent = parts.map((p) => `file '${path.basename(p)}'`).join("\n");
  fs.writeFileSync(listPath, listContent, "utf8");
  try {
    await execFileAsync(FFMPEG, [
      "-y", "-f", "concat", "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      outputPath,
    ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, cwd: dir });
  } finally {
    for (const p of parts) try { fs.unlinkSync(p); } catch { /* ignore */ }
    try { fs.unlinkSync(listPath); } catch { /* ignore */ }
  }
}

/**
 * Remove silent parts: detect silence, build speech segments, concat.
 * Returns path to the new file.
 */
export async function removeSilence(
  inputPath: string,
  outputPath: string,
  opts: { noiseDb?: number; minSilenceDuration?: number; padding?: number } = {}
): Promise<{ outputPath: string; segmentsRemoved: number; originalDuration: number; newDuration: number }> {
  const probeResult = await probe(inputPath);
  const originalDuration = probeResult.duration;
  const padding = opts.padding ?? 0.15;

  const silenceSegments = await detectSilence(inputPath, {
    noiseDb: opts.noiseDb ?? -35,
    minDuration: opts.minSilenceDuration ?? 0.5,
  });

  if (silenceSegments.length === 0) {
    await execFileAsync(FFMPEG, ["-y", "-i", inputPath, "-c", "copy", outputPath], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    return { outputPath, segmentsRemoved: 0, originalDuration, newDuration: originalDuration };
  }

  const speechSegments: Array<{ start: number; end: number }> = [];
  let prevEnd = 0;
  for (const seg of silenceSegments) {
    const start = Math.max(0, prevEnd);
    const end = Math.max(seg.start - padding, start);
    if (end > start) speechSegments.push({ start, end });
    prevEnd = seg.end + padding;
  }
  if (prevEnd < originalDuration) {
    speechSegments.push({ start: prevEnd, end: originalDuration });
  }

  await concatSegments(inputPath, outputPath, speechSegments);
  const newProbe = await probe(outputPath);
  return {
    outputPath,
    segmentsRemoved: silenceSegments.length,
    originalDuration,
    newDuration: newProbe.duration,
  };
}

/** Trim single segment to outputPath. */
export async function trim(inputPath: string, outputPath: string, startSec: number, endSec: number): Promise<void> {
  await execFileAsync(FFMPEG, [
    "-y", "-i", inputPath,
    "-ss", String(startSec),
    "-to", String(endSec),
    "-c", "copy",
    outputPath,
  ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
}

/** Format seconds as SRT timestamp (HH:MM:SS,mmm). */
function toSrtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

/** Generate SRT content from word-level timestamps (one subtitle per word for karaoke-style). */
export function wordsToSrt(words: WordTimestamp[]): string {
  return words
    .map((w, i) => {
      const start = toSrtTime(w.start);
      const end = toSrtTime(w.end);
      const text = w.word.replace(/\n/g, " ").trim();
      return `${i + 1}\n${start} --> ${end}\n${text}\n`;
    })
    .join("\n");
}

/**
 * Burn SRT subtitles into video. Writes SRT to srtPath, outputs video to outputPath.
 * Escapes SRT path for FFmpeg subtitles filter (backslashes on Windows).
 */
export async function burnSubtitles(
  inputPath: string,
  srtPath: string,
  outputPath: string,
  opts: { fontSize?: number; fontName?: string } = {}
): Promise<void> {
  const fontSize = opts.fontSize ?? 24;
  const fontName = opts.fontName ?? "Arial";
  // Use forward slashes so FFmpeg accepts path on all platforms; escape single quotes in path for filter.
  const filterEscaped = srtPath.replace(/\\/g, "/").replace(/'/g, "'\\''");
  const style = `FontName=${fontName},FontSize=${fontSize},PrimaryColour=&Hffffff&,OutlineColour=&H000000&,Outline=2`;
  await execFileAsync(FFMPEG, [
    "-y", "-i", inputPath,
    "-vf", `subtitles='${filterEscaped}':force_style='${style}'`,
    "-c:a", "copy",
    outputPath,
  ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
}
