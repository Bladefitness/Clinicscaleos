import type { Express } from "express";
import { type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import {
  generateRequestSchema, offerScoreRequestSchema, campaignBlueprintRequestSchema,
  coachChatRequestSchema, iterationRequestSchema,
} from "@shared/schema";
import {
  buildCreativePrompt, buildOfferScoringPrompt, buildAvatarGenerationPrompt,
  buildCampaignBlueprintPrompt, buildDailyPulsePrompt, buildWeeklyBriefPrompt,
  buildAdCoachChatPrompt, buildWinnerVariationPrompt, buildLoserDiagnosisPrompt,
} from "./lib/prompts";
import { generateFallbackCreatives } from "./lib/fallback-creatives";
import { generateDemoMetrics, getDailyPulseData, getWeeklyBriefData } from "./lib/seed-data";
import { generateImage } from "./replit_integrations/image/client";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

function parseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
  }
  return null;
}

async function callAI(prompt: string): Promise<any> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const content = response.content[0];
  if (content.type === "text") {
    return parseJSON(content.text);
  }
  return null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==========================================
  // MODULE 1: OFFER INTELLIGENCE
  // ==========================================
  app.post("/api/offers/score", async (req, res) => {
    const parsed = offerScoreRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });

    try {
      const offer = await storage.createOffer(parsed.data);
      const prompt = buildOfferScoringPrompt(parsed.data);
      const result = await callAI(prompt);

      if (result) {
        const rawScore = result.overall_score;
        const safeScore = typeof rawScore === "number" ? Math.round(rawScore) : parseInt(String(rawScore), 10) || 0;
        const updated = await storage.updateOffer(offer.id, {
          score: safeScore,
          scoreBreakdown: result.breakdown,
          weaknesses: result.weaknesses,
          strengths: result.strengths,
          verdict: result.verdict,
          variations: result.variations,
          competitorData: result.competitor_insights,
          marketTemperature: result.competitor_insights?.market_temperature,
          status: "scored",
        });
        return res.json({ offer: updated, source: "ai" });
      }

      return res.json({ offer, source: "error", error: "AI response parsing failed" });
    } catch (error) {
      console.error("Offer scoring error:", error);
      return res.status(500).json({ error: "Failed to score offer" });
    }
  });

  app.get("/api/offers", async (_req, res) => {
    const offers = await storage.getOffers();
    res.json(offers);
  });

  app.get("/api/offers/:id", async (req, res) => {
    const offer = await storage.getOffer(req.params.id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json(offer);
  });

  app.patch("/api/offers/:id/select-variation", async (req, res) => {
    const { variationIndex } = req.body;
    const updated = await storage.updateOffer(req.params.id, { selectedVariation: variationIndex, status: "accepted" });
    res.json(updated);
  });

  // ==========================================
  // MODULE 2: CREATIVE FACTORY
  // ==========================================
  app.post("/api/avatars/generate", async (req, res) => {
    const { clinicType, service, targetMarket, offer } = req.body;
    if (!clinicType || !service) return res.status(400).json({ error: "clinicType and service required" });

    try {
      const prompt = buildAvatarGenerationPrompt({ clinicType, service, targetMarket: targetMarket || "", offer: offer || "" });
      const result = await callAI(prompt);

      if (result?.avatars) {
        const saved = [];
        for (const a of result.avatars) {
          const avatar = await storage.createAvatar({
            clinicType, service,
            name: a.name, situation: a.situation,
            demographics: a.demographics, psychographics: a.psychographics,
            emotions: a.emotions, hooks: a.hooks,
            objections: a.objections, buyingTriggers: a.buying_triggers,
          });
          saved.push(avatar);
        }
        return res.json({ avatars: saved, source: "ai" });
      }
      return res.json({ avatars: [], source: "error" });
    } catch (error) {
      console.error("Avatar generation error:", error);
      return res.status(500).json({ error: "Failed to generate avatars" });
    }
  });

  app.get("/api/avatars", async (req, res) => {
    const avatars = await storage.getAvatars(req.query.clinicType as string | undefined);
    res.json(avatars);
  });

  app.post("/api/generate", async (req, res) => {
    const parsed = generateRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });

    const { clinicType, service, location, targetAudience, offerDetails, goal } = parsed.data;

    try {
      const allCreatives: any[] = [];
      let anySuccess = false;

      for (let batch = 0; batch < 3; batch++) {
        try {
          const prompt = buildCreativePrompt(
            { clinicType, service, location, targetAudience: targetAudience || "", offerDetails: offerDetails || "", goal },
            batch
          );
          const creatives = await callAI(prompt);
          if (Array.isArray(creatives) && creatives.length > 0) {
            anySuccess = true;
            const offset = allCreatives.length;
            creatives.forEach((c: any, i: number) => { c.id = offset + i + 1; });
            allCreatives.push(...creatives);
          }
        } catch (batchError) {
          console.error(`Batch ${batch + 1} failed:`, batchError);
        }
      }

      if (!anySuccess || allCreatives.length === 0) {
        const fallback = generateFallbackCreatives(clinicType, service, location, offerDetails || "");
        return res.json({ creatives: fallback, source: "fallback" });
      }

      const toSave = allCreatives.map((c: any) => ({
        avatarName: c.avatar || "Unknown",
        emotion: c.emotion || "trust",
        style: c.style || "Direct Offer",
        headline: c.headline || "",
        primaryText: c.primary_text || "",
        imagePrompt: c.image_prompt || "",
        hook: c.hook || "",
        category: c.category || "Avatar Test A",
        copyFormula: c.copy_formula || "",
        clinicType, service, location, status: "pending",
      }));
      await storage.createCreatives(toSave);

      res.json({ creatives: allCreatives, source: "ai" });
    } catch (error) {
      console.error("Generate endpoint error:", error);
      const fallback = generateFallbackCreatives(clinicType, service, location, offerDetails || "");
      res.json({ creatives: fallback, source: "fallback" });
    }
  });

  app.get("/api/creatives", async (_req, res) => {
    const creatives = await storage.getCreatives();
    res.json(creatives);
  });

  app.patch("/api/creatives/:id/status", async (req, res) => {
    const { status } = req.body;
    await storage.updateCreativeStatus(req.params.id, status);
    res.json({ success: true });
  });

  // ==========================================
  // MODULE 3: CAMPAIGN ARCHITECT
  // ==========================================
  app.post("/api/campaigns/blueprint", async (req, res) => {
    const parsed = campaignBlueprintRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });

    try {
      const prompt = buildCampaignBlueprintPrompt(parsed.data);
      const result = await callAI(prompt);

      if (result) {
        const campaign = await storage.createCampaign({
          name: result.campaign_name || `${parsed.data.clinicType} - ${parsed.data.service} Campaign`,
          clinicType: parsed.data.clinicType,
          service: parsed.data.service,
          location: parsed.data.location,
          budget: parsed.data.budget,
          goal: parsed.data.goal,
          objective: result.objective,
          blueprint: result,
          deploymentChecklist: result.deployment_steps,
          status: "draft",
        });
        return res.json({ campaign, source: "ai" });
      }
      return res.status(500).json({ error: "Failed to generate blueprint" });
    } catch (error) {
      console.error("Campaign blueprint error:", error);
      return res.status(500).json({ error: "Failed to generate campaign blueprint" });
    }
  });

  app.get("/api/campaigns", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  });

  // ==========================================
  // MODULE 4: METRICS COMMAND CENTER + AD COACH
  // ==========================================
  app.get("/api/metrics/demo", async (_req, res) => {
    const metrics = generateDemoMetrics();
    res.json(metrics);
  });

  app.get("/api/metrics/daily-pulse", async (_req, res) => {
    const pulse = getDailyPulseData();
    res.json(pulse);
  });

  app.get("/api/metrics/weekly-brief", async (_req, res) => {
    const brief = getWeeklyBriefData();
    res.json(brief);
  });

  app.post("/api/coach/chat", async (req, res) => {
    const parsed = coachChatRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

    try {
      const prompt = buildAdCoachChatPrompt({
        message: parsed.data.message,
        clinicContext: parsed.data.clinicContext || "",
        campaignData: parsed.data.campaignData || "",
      });
      const result = await callAI(prompt);

      if (result) {
        await storage.createCoachingSession({
          sessionType: "chat",
          userMessage: parsed.data.message,
          aiResponse: result.response,
          content: result,
        });
        return res.json(result);
      }
      return res.json({
        response: "I'm having trouble analyzing that right now. Could you rephrase your question or provide more context about your campaigns?",
        data_referenced: [],
        confidence_level: "low",
        follow_up_questions: ["What specific campaign metrics are you concerned about?", "What's your current monthly ad budget?"],
      });
    } catch (error) {
      console.error("Coach chat error:", error);
      return res.json({
        response: "I'm experiencing a temporary issue. Please try again in a moment.",
        data_referenced: [],
        confidence_level: "low",
        follow_up_questions: [],
      });
    }
  });

  // ==========================================
  // MODULE 5: ITERATION ENGINE
  // ==========================================
  app.post("/api/iterations/analyze", async (req, res) => {
    const parsed = iterationRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });

    try {
      const promptBuilder = parsed.data.type === "winner_variation" ? buildWinnerVariationPrompt : buildLoserDiagnosisPrompt;
      const prompt = promptBuilder({
        creativeName: parsed.data.creativeName,
        creativeHeadline: parsed.data.creativeHeadline,
        creativeCopy: parsed.data.creativeCopy,
        performanceData: parsed.data.performanceData || "",
        clinicType: parsed.data.clinicType || "",
        service: parsed.data.service || "",
      });
      const result = await callAI(prompt);

      if (result) {
        await storage.createIteration({
          sourceCreativeId: parsed.data.creativeId || null,
          iterationType: parsed.data.type,
          diagnosis: result,
          newCreatives: result.variations || result.fix_options,
        });
        return res.json({ result, type: parsed.data.type, source: "ai" });
      }
      return res.status(500).json({ error: "AI analysis failed" });
    } catch (error) {
      console.error("Iteration analysis error:", error);
      return res.status(500).json({ error: "Failed to analyze creative" });
    }
  });

  app.get("/api/iterations", async (_req, res) => {
    const iterations = await storage.getIterations();
    res.json(iterations);
  });

  // ==========================================
  // IMAGE GENERATION (Gemini)
  // ==========================================
  app.post("/api/generate-image", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    try {
      const adImagePrompt = `Create a professional, high-quality advertisement image for a healthcare clinic. The image should be clean, modern, and suitable for Facebook/Instagram ads. NO text overlay, NO words, NO letters in the image. Pure visual only.\n\nScene: ${prompt}`;
      const dataUrl = await generateImage(adImagePrompt);
      res.json({ imageUrl: dataUrl });
    } catch (error: any) {
      console.error("Image generation error:", error?.message || error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  return httpServer;
}
