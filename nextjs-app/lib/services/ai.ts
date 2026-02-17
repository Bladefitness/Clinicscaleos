import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Anthropic API key not configured. Add ANTHROPIC_API_KEY to environment variables.");
    }
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

/** Parse AI output — handles markdown code blocks and bare JSON */
export function parseJSON(text: string): any {
  if (!text || typeof text !== "string") return null;
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
  }
  return null;
}

/** Transient failures worth retrying */
function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("overloaded") ||
    msg.includes("503") ||
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("socket hang up")
  );
}

/** Call Anthropic Claude and parse JSON response */
export async function callAI(prompt: string, retries = 2): Promise<any> {
  const anthropic = getAnthropic();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });
      const content = response.content?.[0];
      if (!content || content.type !== "text") return null;
      const text = (content as { text?: string }).text ?? "";
      const parsed = parseJSON(text);
      if (!parsed) {
        console.error("[callAI] JSON parse returned null. Raw text (first 500 chars):", text.slice(0, 500));
      }
      return parsed ?? null;
    } catch (err) {
      const isLast = attempt === retries;
      if (isLast || !isRetryableError(err)) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return null;
}

/** Call Anthropic with system prompt (for Director agent etc) */
export async function callAIWithSystem(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<any> {
  const anthropic = getAnthropic();
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: opts.maxTokens ?? 256,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  const text = (msg.content.find((c) => c.type === "text") as { type: "text"; text: string } | undefined)?.text ?? "";
  return parseJSON(text);
}
