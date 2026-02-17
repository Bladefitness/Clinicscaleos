import { GoogleGenAI, Modality } from "@google/genai";

let _ai: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY must be set for image generation");
    }
    _ai = new GoogleGenAI({ apiKey });
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

/** Generate image via Fal Nano Banana (standard or Pro). */
async function generateImageWithFal(prompt: string, usePro?: boolean): Promise<string> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL_KEY must be set for Fal image generation.");
  }

  const endpoint = usePro
    ? "https://fal.run/fal-ai/nano-banana-pro"
    : "https://fal.run/fal-ai/nano-banana";

  const body: Record<string, unknown> = {
    prompt,
    aspect_ratio: "4:5",
    output_format: "png",
  };
  if (usePro) {
    body.resolution = "1K";
  }

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
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
      // Return the Fal CDN URL directly (no base64 conversion needed)
      return imageUrl;
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
 * Generate an image and return a URL.
 * Uses Gemini first; falls back to Fal Nano Banana on quota/429.
 * Returns a URL (Fal CDN URL or base64 data URL from Gemini).
 */
export async function generateImage(prompt: string, usePro?: boolean): Promise<string> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasFal = !!process.env.FAL_KEY;
  const useFalFirst = process.env.IMAGE_USE_FAL_FIRST === "true";

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
          return falGen();
        }
        throw err;
      }
    }
  }

  if (hasFal) {
    return falGen();
  }

  throw new Error("No image provider configured. Set GEMINI_API_KEY and/or FAL_KEY.");
}

/** Emotion -> visual expression cues for photorealistic output */
const EMOTION_EXPRESSIONS: Record<string, string> = {
  frustration: "furrowed brow, tense posture, hand near forehead, stressed or weary expression",
  hope: "soft expression, slight hopeful smile, relaxed shoulders, optimistic demeanor",
  fear: "worried brow, concerned expression, tense posture, anxious body language",
  trust: "warm smile, steady eye contact, calm demeanor, open relaxed posture",
  empowerment: "confident smile, straight posture, arms crossed or open, commanding presence",
  curiosity: "leaning forward, engaged expression, raised eyebrow, thoughtful look",
  urgency: "alert posture, focused expression, slight tension, attentive stance",
  envy: "longing gaze, subtle desire, looking at desired outcome",
};

/** Build enhanced image prompt with style-specific layouts */
export function buildHyperdopamineImagePrompt(opts: {
  prompt: string;
  style?: string;
  avatar?: string;
  emotion?: string;
  headline?: string;
  hook?: string;
}): { prompt: string; usePro: boolean } {
  const { prompt, style = "", avatar = "", emotion = "", headline = "", hook = "" } = opts;
  const s = style.toLowerCase();
  const subj = avatar ? `${avatar}, ` : "";
  const expr = emotion && EMOTION_EXPRESSIONS[emotion.toLowerCase()]
    ? `Conveying ${emotion} through ${EMOTION_EXPRESSIONS[emotion.toLowerCase()]}. `
    : "";
  const tech = "Photorealistic, editorial quality, high detail, professional photography, 4:5 aspect ratio for Facebook/Instagram feed.";

  const headlineText = headline ? headline.toUpperCase().slice(0, 80) : "";
  const subtextText = hook ? hook.slice(0, 60) : "";

  if (s.includes("breaking news")) {
    const ban = headlineText ? `Red "BREAKING NEWS" or "EXCLUSIVE" banner at top. Headline: "${headlineText}". Subtext: "${subtextText}". Gold accent stripe below. ` : "";
    return {
      prompt: `Expert profile news style. Professional broadcast layout. ${ban}Main subject: ${subj}${expr}${prompt}. Dark studio background with bokeh lights. Authority and trust building. ${tech}`,
      usePro: true,
    };
  }
  if (s.includes("pattern interrupt")) {
    const ban = headlineText ? `Red banner or bold text: "${headlineText}". ` : "";
    const sceneOverride = "CRITICAL: Main scene shows the PROBLEM state (frustrated, stressed, hand on forehead). Circular inset with problem graphic (crossed-out icons or X) or solution contrast. Red arrow pointing from problem to solution. ";
    return {
      prompt: `Pattern interrupt ad style. ${sceneOverride}${ban}Main subject: ${subj}${expr}${prompt}. Scroll-stopping, editorial layout. ${tech}`,
      usePro: true,
    };
  }
  if (s.includes("direct offer")) {
    const ban = headlineText ? `Headline overlay: "${headlineText}". ` : "";
    return {
      prompt: `Direct offer ad style. Confident professional portrait. ${ban}Main subject: ${subj}${expr}${prompt}. Clean modern clinic background, studio lighting. ${tech}`,
      usePro: true,
    };
  }
  if (s.includes("native") || s.includes("social")) {
    return {
      prompt: `Native social post style. ${prompt}. Main subject: ${subj}${expr}Authentic lifestyle photography, warm natural light. NO text overlay. ${tech}`,
      usePro: false,
    };
  }
  if (s.includes("testimonial") || s.includes("social proof")) {
    return {
      prompt: `Testimonial/social proof style. ${prompt}. Main subject: ${subj}${expr}Warm candid feel, genuine expression. NO text overlay. ${tech}`,
      usePro: false,
    };
  }
  if (s.includes("before") && s.includes("after")) {
    return {
      prompt: `Before/after transformation style. CRITICAL: Vertical split. Left side labeled "BEFORE": tired, stressed, or distressed subject. Right side labeled "AFTER": confident, transformed subject. Red arrow from before to after. Main subject: ${subj}${expr}${prompt}. ${tech}`,
      usePro: true,
    };
  }
  if (s.includes("educational") || s.includes("infographic")) {
    return {
      prompt: `Educational layout. ${prompt}. Main subject: ${subj}${expr}Clean professional design. NO text overlay. ${tech}`,
      usePro: false,
    };
  }

  return {
    prompt: `Professional healthcare ad. ${prompt}. Main subject: ${subj}${expr}NO text overlay. ${tech}`,
    usePro: false,
  };
}
