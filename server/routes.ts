import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { generateRequestSchema } from "@shared/schema";
import { buildPrompt } from "./lib/prompts";
import { generateFallbackCreatives } from "./lib/fallback-creatives";
import type { Creative } from "./lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

function parseCreatives(text: string): Creative[] {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return [];
      }
    }
  }
  return [];
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/generate", async (req, res) => {
    const parsed = generateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { clinicType, service, location, targetAudience, offerDetails, goal } = parsed.data;

    try {
      const allCreatives: Creative[] = [];
      let anySuccess = false;

      for (let batch = 0; batch < 3; batch++) {
        try {
          const prompt = buildPrompt(
            { clinicType, service, location, targetAudience: targetAudience || "", offerDetails: offerDetails || "", goal },
            batch
          );

          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
          });

          const content = response.content[0];
          if (content.type === "text") {
            const creatives = parseCreatives(content.text);
            if (creatives.length > 0) {
              anySuccess = true;
              const offset = allCreatives.length;
              creatives.forEach((c, i) => {
                c.id = offset + i + 1;
              });
              allCreatives.push(...creatives);
            }
          }
        } catch (batchError) {
          console.error(`Batch ${batch + 1} failed:`, batchError);
        }
      }

      if (!anySuccess || allCreatives.length === 0) {
        const fallback = generateFallbackCreatives(clinicType, service, location, offerDetails || "");
        return res.json({ creatives: fallback, source: "fallback" });
      }

      res.json({ creatives: allCreatives, source: "ai" });
    } catch (error) {
      console.error("Generate endpoint error:", error);
      const fallback = generateFallbackCreatives(clinicType, service, location, offerDetails || "");
      res.json({ creatives: fallback, source: "fallback" });
    }
  });

  return httpServer;
}
