/**
 * Research Portal API: pain point research (Claude web search) + Facebook Ad Library (Apify).
 */

import express, { type Express } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import { buildPainPointResearchPrompt } from "./lib/prompts-research";
import { searchAdLibrary, isApifyConfigured } from "./lib/apify-ad-library";
import { painPointSearchRequestSchema, adLibrarySearchRequestSchema } from "@shared/schema";

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

// ==========================================
// PAIN POINT RESEARCH
// ==========================================

router.post("/api/research/pain-points", async (req: any, res: any) => {
  try {
    const parsed = painPointSearchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { query, clinicType, service } = parsed.data;

    // Create a pending session
    const session = await storage.createResearchSession({
      query,
      clinicType: clinicType || null,
      service: service || null,
      source: "web_search",
    });

    const prompt = buildPainPointResearchPrompt({ query, clinicType: clinicType || "", service: service || "" });

    let resultText = "";
    let source: "web_search" | "ai_synthesis" = "web_search";

    try {
      // Try Claude with web search tool
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 4096,
        tools: [{ type: "web_search_20250305" as any, name: "web_search", max_uses: 10 } as any],
        messages: [{ role: "user", content: prompt }],
      });

      // Extract text from response (may include tool use blocks)
      for (const block of response.content) {
        if (block.type === "text") {
          resultText += block.text;
        }
      }
    } catch (webSearchError: any) {
      // Fallback to standard Claude without web search
      console.warn("Web search unavailable, falling back to AI synthesis:", webSearchError.message);
      source = "ai_synthesis";
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      for (const block of response.content) {
        if (block.type === "text") {
          resultText += block.text;
        }
      }
    }

    const parsedResults = parseJSON(resultText);

    // Update session with results
    const updated = await storage.updateResearchSession(session.id, {
      status: parsedResults ? "complete" : "error",
      source,
      results: parsedResults,
      synthesis: parsedResults ? {
        validated_pain_points: (parsedResults as any).validated_pain_points || [],
        emotional_triggers: (parsedResults as any).emotional_triggers || [],
        messaging_angles: (parsedResults as any).messaging_angles || [],
      } : null,
    });

    res.json({ session: updated, source });
  } catch (err: any) {
    console.error("Pain point research error:", err);
    res.status(500).json({ error: err.message || "Research failed" });
  }
});

// ==========================================
// RESEARCH SESSIONS CRUD
// ==========================================

router.get("/api/research/sessions", async (req: any, res: any) => {
  try {
    const clinicType = req.query.clinicType as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const sessions = await storage.getResearchSessions(clinicType, limit);
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/research/sessions/:id", async (req: any, res: any) => {
  try {
    const session = await storage.getResearchSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/api/research/sessions/:id", async (req: any, res: any) => {
  try {
    await storage.deleteResearchSession(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// FACEBOOK AD LIBRARY (APIFY)
// ==========================================

router.post("/api/research/ad-library/search", async (req: any, res: any) => {
  try {
    if (!isApifyConfigured()) {
      return res.json({
        ads: [],
        source: "unavailable",
        fallbackUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(req.body.searchTerms || "")}`,
        message: "Apify not configured. Add APIFY_API_TOKEN to your environment variables.",
      });
    }

    const parsed = adLibrarySearchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const ads = await searchAdLibrary(parsed.data);
    res.json({ ads, source: "apify" });
  } catch (err: any) {
    console.error("Ad library search error:", err);
    res.json({
      ads: [],
      source: "error",
      fallbackUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(req.body.searchTerms || "")}`,
      message: err.message || "Ad library search failed",
    });
  }
});

// ==========================================
// SAVED ADS CRUD
// ==========================================

router.post("/api/research/saved-ads", async (req: any, res: any) => {
  try {
    const ad = await storage.createSavedAd(req.body);
    res.json(ad);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/research/saved-ads", async (req: any, res: any) => {
  try {
    const clinicType = req.query.clinicType as string | undefined;
    const ads = await storage.getSavedAds(clinicType);
    res.json(ads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/api/research/saved-ads/:id", async (req: any, res: any) => {
  try {
    const { notes, tags } = req.body;
    const ad = await storage.updateSavedAd(req.params.id, { notes, tags });
    if (!ad) return res.status(404).json({ error: "Ad not found" });
    res.json(ad);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/api/research/saved-ads/:id", async (req: any, res: any) => {
  try {
    await storage.deleteSavedAd(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// REGISTER
// ==========================================

export function registerResearchRoutes(app: Express) {
  app.use(router);
}
