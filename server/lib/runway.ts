/**
 * Runway API client for image-to-video (animate image).
 * Docs: https://docs.dev.runwayml.com/api
 * Requires RUNWAY_API_KEY or RUNWAYML_API_SECRET in env.
 */

const RUNWAY_BASE = "https://api.dev.runwayml.com/v1";
const VERSION = "2024-11-06";

function getApiKey(): string | null {
  return process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET || null;
}

export interface AnimateImageOptions {
  imageUrl?: string;
  imageBase64?: string;
  promptText?: string;
  duration?: number;
}

export interface AnimateImageResult {
  taskId: string;
  videoUrl?: string;
  status: string;
  error?: string;
}

/** Start image-to-video task; returns task id. */
export async function startImageToVideo(options: AnimateImageOptions): Promise<{ taskId: string }> {
  const key = getApiKey();
  if (!key) throw new Error("RUNWAY_API_KEY or RUNWAYML_API_SECRET not set");

  const promptImage = options.imageBase64
    ? (options.imageBase64.startsWith("data:") ? options.imageBase64 : `data:image/png;base64,${options.imageBase64}`)
    : options.imageUrl;
  if (!promptImage) throw new Error("imageUrl or imageBase64 required");

  const body = {
    model: "gen3a_turbo",
    promptImage,
    promptText: (options.promptText || "Smooth, subtle motion that brings the image to life.").slice(0, 1000),
    ratio: "1280:720",
    duration: Math.min(10, Math.max(2, options.duration ?? 5)),
  };

  const res = await fetch(`${RUNWAY_BASE}/image_to_video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Runway-Version": VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { id?: string };
  const taskId = data?.id;
  if (!taskId) throw new Error("Runway did not return task id");
  return { taskId };
}

/** Get task status and output. */
export async function getTask(taskId: string): Promise<{ status: string; output?: string; error?: string }> {
  const key = getApiKey();
  if (!key) throw new Error("RUNWAY_API_KEY or RUNWAYML_API_SECRET not set");

  const res = await fetch(`${RUNWAY_BASE}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "X-Runway-Version": VERSION,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway task fetch error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { status?: string; output?: string | string[]; failure?: string };
  const status = data?.status ?? "UNKNOWN";
  let output: string | undefined;
  if (data?.output) {
    output = Array.isArray(data.output) ? data.output[0] : (data.output as string);
  }
  return { status, output, error: data?.failure };
}

/** Start image-to-video and poll until done (or timeout). Returns video URL when ready. */
export async function animateImage(options: AnimateImageOptions): Promise<AnimateImageResult> {
  const { taskId } = await startImageToVideo(options);
  const maxAttempts = 40;
  const intervalMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const task = await getTask(taskId);
    if (task.status === "SUCCEEDED" && task.output) {
      return { taskId, videoUrl: task.output, status: task.status };
    }
    if (task.status === "FAILED") {
      return { taskId, status: task.status, error: task.error || "Generation failed" };
    }
  }

  return { taskId, status: "TIMEOUT", error: "Video generation timed out" };
}
