import { GoogleGenAI, Modality } from "@google/genai";

// Lazy-init to avoid requiring API key at startup when running locally
let _ai: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY or AI_INTEGRATIONS_GEMINI_API_KEY must be set for image generation");
    }
    _ai = new GoogleGenAI({
      apiKey,
      httpOptions: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
        ? { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL }
        : undefined,
    });
  }
  return _ai;
}

function isRetryableGeminiError(err: unknown): boolean {
  const e = err as { message?: string; status?: number; statusCode?: number; code?: string };
  if (e?.status === 429 || e?.statusCode === 429) return true;
  if (String(e?.code || "").toLowerCase().includes("resource_exhausted")) return true;
  const msg = String(e?.message ?? err).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("limit: 0")
  );
}

/**
 * Generate image via Fal Nano Banana (standard or Pro).
 * Standard ~$0.039/img. Pro ~$0.15/img, better text rendering.
 */
async function generateImageWithFal(prompt: string, usePro?: boolean): Promise<string> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL_KEY must be set for Fal fallback. Add it to .env or disable Fal.");
  }

  const endpoint = (usePro || process.env.IMAGE_FAL_MODEL === "nano-banana-pro")
    ? "https://fal.run/fal-ai/nano-banana-pro"
    : "https://fal.run/fal-ai/nano-banana";

  const body: Record<string, unknown> = {
    prompt,
    aspect_ratio: "4:5",
    output_format: "png",
  };
  if (endpoint.includes("nano-banana-pro")) {
    (body as Record<string, string>).resolution = "1K";
  }

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = (await res.json()) as { images?: Array<{ url?: string; content_type?: string }> };
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) {
        throw new Error("Fal returned no image URL");
      }
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        throw new Error(`Failed to fetch Fal image: ${imgRes.status}`);
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const base64 = buf.toString("base64");
      const contentType = data.images?.[0]?.content_type || "image/png";
      return `data:${contentType};base64,${base64}`;
    }
    lastErr = new Error(`Fal image gen failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    if (res.status === 429 && attempt === 0) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;

}

/**
 * Generate an image and return as base64 data URL.
 * Uses Gemini (gemini-2.5-flash-image) first; falls back to Fal Nano Banana on quota/429.
 * usePro: use Nano Banana Pro for text-heavy prompts (better text rendering).
 */
export async function generateImage(prompt: string, usePro?: boolean): Promise<string> {
  const hasGemini = !!(process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
  const hasFal = !!process.env.FAL_KEY;
  const useFalFirst = process.env.IMAGE_USE_FAL_FIRST === "true" || process.env.IMAGE_USE_FAL_FIRST === "1";

  const falGen = () => generateImageWithFal(prompt, usePro);

  if (useFalFirst && hasFal) {
    return falGen();
  }

  if (hasGemini) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const ai = getAi();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: prompt,
          config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
          },
        });

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts ?? [];
        const imagePart = parts.find(
          (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData
        );

        if (imagePart?.inlineData?.data) {
          const mimeType = imagePart.inlineData.mimeType || "image/png";
          return `data:${mimeType};base64,${imagePart.inlineData.data}`;
        }

        const textPart = parts.find((p: { text?: string }) => p.text);
        const errMsg = textPart?.text || "No image in response";
        throw new Error(`Gemini image gen failed: ${errMsg.slice(0, 150)}`);
      } catch (err) {
        const retryable = attempt === 0 && isRetryableGeminiError(err);
        if (retryable) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        if (hasFal) {
          console.warn("[image] Gemini failed, falling back to Fal:", (err as Error)?.message);
          try {
            return await falGen();
          } catch (falErr) {
            console.error("[image] Fal fallback failed:", falErr);
            throw falErr;
          }
        }
        throw err;
      }
    }
  }

  if (hasFal) {
    return falGen();
  }

  throw new Error(
    "No image provider configured. Set GEMINI_API_KEY and/or FAL_KEY in .env"
  );
}

