/**
 * Runway ML API client for video generation
 */

const RUNWAY_BASE_URL = "https://api.runwayml.com/v1";

function getApiKey(): string {
  const key = process.env.RUNWAY_API_KEY;
  if (!key) {
    throw new Error("RUNWAY_API_KEY not set. Add it to environment variables.");
  }
  return key;
}

export interface RunwayGenerateOptions {
  promptText: string;
  imageUrl?: string;
  duration?: number;
  model?: string;
}

export interface RunwayGenerateResult {
  videoUrl?: string;
  taskId?: string;
  error?: string;
}

export async function generateVideoWithRunway(
  options: RunwayGenerateOptions
): Promise<RunwayGenerateResult> {
  const key = getApiKey();
  const { promptText, imageUrl, duration = 5, model = "gen3a_turbo" } = options;

  const payload: Record<string, unknown> = {
    text_prompt: promptText,
    duration_seconds: duration,
    model,
  };

  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  const res = await fetch(`${RUNWAY_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway generation failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { video_url?: string; task_id?: string };

  return {
    videoUrl: data.video_url,
    taskId: data.task_id,
  };
}

export async function checkRunwayTaskStatus(taskId: string): Promise<RunwayGenerateResult> {
  const key = getApiKey();

  const res = await fetch(`${RUNWAY_BASE_URL}/tasks/${taskId}`, {
    headers: {
      "Authorization": `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway task check failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    status?: string;
    video_url?: string;
    error?: string;
  };

  return {
    videoUrl: data.video_url,
    taskId,
    error: data.error,
  };
}

export interface AnimateImageResult {
  videoUrl?: string;
  status?: string;
  error?: string;
}

export async function animateImage(options: {
  imageUrl?: string;
  imageBase64?: string;
  promptText?: string;
  duration?: number;
}): Promise<AnimateImageResult> {
  try {
    const result = await generateVideoWithRunway({
      promptText: options.promptText || "Animate this image naturally",
      imageUrl: options.imageUrl,
      duration: options.duration || 3,
    });

    if (result.videoUrl) {
      return { videoUrl: result.videoUrl, status: "SUCCEEDED" };
    }

    if (result.taskId) {
      // Poll for completion (simplified - in production, use a queue)
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const status = await checkRunwayTaskStatus(result.taskId);
        if (status.videoUrl) {
          return { videoUrl: status.videoUrl, status: "SUCCEEDED" };
        }
        if (status.error) {
          return { error: status.error, status: "FAILED" };
        }
      }
      return { error: "Timeout waiting for video generation", status: "FAILED" };
    }

    return { error: result.error || "Unknown error", status: "FAILED" };
  } catch (err) {
    return { error: (err as Error).message, status: "FAILED" };
  }
}
