/**
 * fal.ai image-to-video: Kling 2.5 Turbo, Pika Turbo, MiniMax Video 01, Kling 3.0 O3, Veo 2.
 */

const FAL_BASE = "https://fal.run";

function getApiKey(): string | null {
  return process.env.FAL_KEY || null;
}

export type FalAnimateModel = "kling" | "pika" | "minimax" | "kling3" | "veo2";

const MODEL_ENDPOINTS: Record<FalAnimateModel, string> = {
  kling: "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
  pika: "fal-ai/pika/v2/turbo/image-to-video",
  minimax: "fal-ai/minimax/video-01/image-to-video",
  kling3: "fal-ai/kling-video/o3/standard/image-to-video",
  veo2: "fal-ai/veo2/image-to-video",
};

export interface FalAnimateOptions {
  imageUrl?: string;
  imageBase64?: string;
  promptText?: string;
  duration?: number;
  model?: FalAnimateModel;
}

export interface FalAnimateResult {
  videoUrl?: string;
  error?: string;
}

function toImageInput(opts: FalAnimateOptions): string {
  if (opts.imageUrl) {
    if (opts.imageUrl.startsWith("data:")) return opts.imageUrl;
    if (opts.imageUrl.startsWith("http://") || opts.imageUrl.startsWith("https://")) return opts.imageUrl;
  }
  if (opts.imageBase64) {
    return opts.imageBase64.startsWith("data:") ? opts.imageBase64 : `data:image/png;base64,${opts.imageBase64}`;
  }
  throw new Error("imageUrl or imageBase64 required");
}

function buildBody(model: FalAnimateModel, imageInput: string, prompt: string, durationSec: number): Record<string, unknown> {
  const duration = durationSec <= 5 ? 5 : 10;
  switch (model) {
    case "kling":
      return { prompt, image_url: imageInput, duration: String(duration), negative_prompt: "blur, distort, and low quality", cfg_scale: 0.5 };
    case "pika":
      return { prompt, image_url: imageInput, duration: durationSec, resolution: "720p" };
    case "minimax":
      return { prompt, image_url: imageInput, prompt_optimizer: true };
    case "kling3":
      return { prompt, image_url: imageInput, duration: String(Math.min(15, Math.max(3, durationSec))) };
    case "veo2":
      return { prompt, image_url: imageInput, aspect_ratio: "auto", duration: durationSec <= 6 ? "5s" : durationSec <= 7 ? "6s" : durationSec <= 8 ? "7s" : "8s" };
    default:
      return { prompt, image_url: imageInput };
  }
}

export async function animateImageWithFal(options: FalAnimateOptions): Promise<FalAnimateResult> {
  const key = getApiKey();
  if (!key) throw new Error("FAL_KEY not set. Add it to environment variables for image-to-video.");

  const model = options.model ?? "kling";
  if (!MODEL_ENDPOINTS[model]) throw new Error(`Unknown fal animate model: ${model}`);
  const endpoint = MODEL_ENDPOINTS[model];
  const imageInput = toImageInput(options);
  const prompt = (options.promptText || "Smooth, subtle motion that brings the image to life.").slice(0, 1000);
  const durationSec = Math.min(10, Math.max(5, options.duration ?? 5));
  const body = buildBody(model, imageInput, prompt, durationSec);

  const res = await fetch(`${FAL_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal animate failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { video?: { url?: string }; video_url?: string };
  const videoUrl = data.video?.url ?? data.video_url;
  if (!videoUrl) throw new Error("fal returned no video URL");
  return { videoUrl };
}
