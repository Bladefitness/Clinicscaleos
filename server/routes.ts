import type { Express } from "express";
import { type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import {
  generateRequestSchema, offerScoreRequestSchema, campaignBlueprintRequestSchema,
  coachChatRequestSchema, iterationRequestSchema, adCopierRequestSchema,
  headlineAnalyzeRequestSchema, adCopyToolsRequestSchema, improveCreativeRequestSchema,
  createCreativeRunRequestSchema, animateImageRequestSchema,
} from "@shared/schema";
import {
  buildCreativePrompt, buildOfferScoringPrompt, buildAvatarGenerationPrompt, buildAvatarResearchPrompt,
  buildCampaignBlueprintPrompt, buildDailyPulsePrompt, buildWeeklyBriefPrompt,
  buildAdCoachChatPrompt, buildWinnerVariationPrompt, buildLoserDiagnosisPrompt,
  buildAdCopierPrompt, buildHeadlineAnalyzerPrompt, buildAdCopyPrompt, buildImproveCreativePrompt,
  AVATAR_PAIRS,
} from "./lib/prompts";
import { generateFallbackCreatives } from "./lib/fallback-creatives";
import { generateDemoMetrics, getDailyPulseData, getWeeklyBriefData } from "./lib/seed-data";
import { fetchAccountInsights, fetchActiveAdSetsCount } from "./lib/meta-ads";
import passport from "passport";
import { isMetaOAuthConfigured } from "./auth";
import { generateImage } from "./replit_integrations/image/client";
import { animateImage as runwayAnimateImage } from "./lib/runway";
import { animateImageWithFal } from "./lib/fal-animate";
import { registerVideoStudioRoutes } from "./routes-video-studio";
import { registerResearchRoutes } from "./routes-research";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env");
    }
    _anthropic = new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || "https://api.anthropic.com",
    });
  }
  return _anthropic;
}

/** Parse AI output — handles markdown code blocks and bare JSON (AI Wrapper Product pattern) */
function parseJSON(text: string): any {
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

/** Synthesize research on patient emotional triggers for a clinic/service (no web search, AI synthesis) */
async function synthesizeAvatarResearch(opts: {
  clinicType: string;
  service: string;
  targetMarket?: string;
  offer?: string;
}): Promise<{ summary: string; researchText: string } | null> {
  const prompt = buildAvatarResearchPrompt(opts);
  const result = await callAI(prompt);
  if (!result || typeof result !== "object") return null;
  const summary = result.summary || "Research synthesis completed.";
  const researchText = [
    result.summary,
    "Emotional triggers: " + (result.emotional_triggers || []).join("; "),
    "Pain points: " + (result.pain_points || []).join("; "),
    "Buying motivations: " + (result.buying_motivations || []).join("; "),
    "Top segments: " + (result.top_segments || []).join("; "),
    "Messaging angles: " + (result.messaging_angles || []).join("; "),
  ].filter(Boolean).join("\n");
  return { summary, researchText };
}

/** Format avatar list into pair strings for creative batches */
function avatarPairsFromList(avatars: Array<{ name: string; demographics?: string; situation?: string }>): string[] {
  const formatted = avatars.map((a) => {
    const extra = [a.demographics, a.situation].filter(Boolean).join(", ");
    return extra ? `"${a.name} (${extra})"` : `"${a.name}"`;
  });
  const pairs: string[] = [];
  for (let i = 0; i < formatted.length - 1; i += 2) {
    pairs.push(`${formatted[i]} + ${formatted[i + 1]}`);
  }
  if (formatted.length % 2 === 1) pairs.push(formatted[formatted.length - 1]);
  return pairs;
}

/** Emotion → visual expression cues for photorealistic output */
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

/** Build Lovart-level hyperdopamine image prompt with style-specific layouts and text overlays */
function buildHyperdopamineImagePrompt(opts: {
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

  // Text-heavy styles: use Pro for better text rendering
  const headlineText = headline ? headline.toUpperCase().slice(0, 80) : "";
  const subtextText = hook ? hook.slice(0, 60) : "";

  if (s.includes("breaking news")) {
    const ban = headlineText ? `Red "BREAKING NEWS" or "EXCLUSIVE" banner at top. Headline: "${headlineText}". Subtext: "${subtextText}". Gold accent stripe below. ` : "";
    return {
      prompt: `Expert profile news style. Professional broadcast layout. ${ban}Main subject: ${subj}${expr}${prompt}. Dark studio background with bokeh lights. Authority and trust building. ${tech}`,
      usePro: !!headlineText || true,
    };
  }
  if (s.includes("pattern interrupt")) {
    const ban = headlineText ? `Red banner or bold text: "${headlineText}". ` : "";
    const sceneOverride = "CRITICAL: Main scene shows the PROBLEM state (frustrated, stressed, hand on forehead). Circular inset with problem graphic (crossed-out icons or X) or solution contrast. Red arrow pointing from problem to solution. ";
    return {
      prompt: `Pattern interrupt ad style. ${sceneOverride}${ban}Main subject: ${subj}${expr}${prompt}. Scroll-stopping, editorial layout. ${tech}`,
      usePro: !!headlineText || true,
    };
  }
  if (s.includes("direct offer")) {
    const ban = headlineText ? `Headline overlay: "${headlineText}". ` : "";
    return {
      prompt: `Direct offer ad style. Confident professional portrait. ${ban}Main subject: ${subj}${expr}${prompt}. Clean modern clinic background, studio lighting. ${tech}`,
      usePro: !!headlineText || true,
    };
  }
  if (s.includes("native highlight") || s.includes("native social")) {
    return {
      prompt: `Native social post style. ${prompt}. Main subject: ${subj}${expr}Authentic lifestyle photography, warm natural light. NO text overlay. ${tech}`,
      usePro: false,
    };
  }
  if (s.includes("revealed") || s.includes("location")) {
    return {
      prompt: `Local discovery style. ${prompt}. Main subject: ${subj}${expr}Aerial/drone view or map inset. NO text overlay. ${tech}`,
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

/** Transient failures worth retrying: rate limit, overloaded, timeout */
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

async function callAI(prompt: string, retries = 2): Promise<any> {
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
      return parseJSON(text) ?? null;
    } catch (err) {
      const isLast = attempt === retries;
      if (isLast || !isRetryableError(err)) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/health", (_req, res) => {
    const anthropicKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    res.json({
      anthropicConfigured: !!anthropicKey && anthropicKey.length > 10,
      geminiConfigured: !!geminiKey && geminiKey.length > 10,
      databaseUrl: process.env.DATABASE_URL ? "set" : "missing",
    });
  });

  registerVideoStudioRoutes(app);
  registerResearchRoutes(app);

  // ==========================================
  // META FACEBOOK OAUTH
  // ==========================================
  if (isMetaOAuthConfigured()) {
    app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["ads_read", "ads_management"] }));
    app.get(
      "/auth/facebook/callback",
      passport.authenticate("facebook", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }
  app.get("/api/auth/meta/status", (req, res) => {
    const token = (req.session as { metaAccessToken?: string })?.metaAccessToken;
    res.json({
      connected: !!(token && token.length > 20),
      oauthAvailable: isMetaOAuthConfigured(),
    });
  });
  app.post("/api/auth/meta/disconnect", (req, res) => {
    if (req.session) {
      delete (req.session as { metaAccessToken?: string; metaUserId?: string }).metaAccessToken;
      delete (req.session as { metaUserId?: string }).metaUserId;
    }
    res.json({ connected: false });
  });

  // ==========================================
  // MODULE 1: OFFER INTELLIGENCE
  // ==========================================
  app.post("/api/offers/score", async (req, res) => {
    const parsed = offerScoreRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });

    let offer: any = null;
    try {
      offer = await storage.createOffer(parsed.data);
    } catch (dbErr) {
      console.warn("Offer scoring: DB unavailable, scoring without persistence:", (dbErr as Error).message);
    }

    try {
      const prompt = buildOfferScoringPrompt(parsed.data);
      const result = await callAI(prompt);

      if (result) {
        const rawScore = result.overall_score;
        const safeScore = typeof rawScore === "number" ? Math.round(rawScore) : parseInt(String(rawScore), 10) || 0;
        const compInsights = result.competitor_insights || {};
        const rawWeaknesses = result.weaknesses;
        const weaknesses = Array.isArray(rawWeaknesses)
          ? rawWeaknesses.map((w: any) =>
              typeof w === "string"
                ? { issue: w, impact: "medium" as const, fix_suggestion: "" }
                : { issue: w?.issue ?? String(w), impact: w?.impact ?? "medium", fix_suggestion: w?.fix_suggestion ?? "" }
            )
          : [];
        const scoredOffer = {
          score: safeScore,
          scoreBreakdown: result.breakdown,
          weaknesses,
          strengths: result.strengths,
          verdict: result.verdict,
          improvementRoadmap: result.improvement_roadmap,
          marketBenchmarks: result.market_benchmarks,
          variations: Array.isArray(result.variations)
            ? result.variations.map((v: any) => ({ ...v, weaknesses_addressed: v.weaknesses_addressed ?? [] }))
            : [],
          competitorData: { ...compInsights, common_competitor_offers: compInsights.common_competitor_offers ?? [] },
          marketTemperature: compInsights.market_temperature,
          status: "scored",
          ...(offer || {}),
          ...parsed.data,
        };
        if (offer?.id) {
          const updated = await storage.updateOffer(offer.id, scoredOffer).catch(() => scoredOffer);
          return res.json({ offer: updated || scoredOffer, source: "ai" });
        }
        return res.json({ offer: scoredOffer, source: "ai" });
      }

      const fallbackOffer = offer || {
        ...parsed.data,
        score: null,
        status: "error",
      };
      return res.json({ offer: fallbackOffer, source: "error", error: "AI response parsing failed" });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Offer scoring error:", error);
      return res.status(500).json({
        error: err.message || "Failed to score offer",
        message: err.message || "Failed to score offer",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack?.slice(0, 500) }),
      });
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

    const { clinicType, service, location, targetAudience, offerDetails, goal, quickMode, inlineImages } = parsed.data;
    const offer = offerDetails || "Contact us for current specials";
    const imageCount = typeof inlineImages === "number" ? Math.min(6, Math.max(0, inlineImages)) : 3;

    try {
      let research: { summary: string; researchText: string } | null = null;
      let avatarList: Array<{ name: string; situation?: string; demographics?: string; emotions?: object }> = [];
      let avatarPairStrings: string[] | null = null;

      if (quickMode) {
        // Quick Mode: skip research and avatars, use AVATAR_PAIRS directly
        avatarPairStrings = [...AVATAR_PAIRS].slice(0, 2);
      } else {
        // Phase 1: Research first (avatars need it), then avatars
        research = await synthesizeAvatarResearch({ clinicType, service, targetMarket: targetAudience || undefined, offer });
        const avatarPrompt = buildAvatarGenerationPrompt({
          clinicType,
          service,
          targetMarket: targetAudience || "General local audience",
          offer,
          researchFindings: research?.researchText,
        });
        const avatarResult = await callAI(avatarPrompt);
        avatarList = avatarResult?.avatars && Array.isArray(avatarResult.avatars) ? avatarResult.avatars : [];
        avatarPairStrings = avatarList.length >= 4 ? avatarPairsFromList(avatarList) : [...AVATAR_PAIRS].slice(0, 3);
      }

      // Phase 2: Run creative batches in parallel
      const batchCount = avatarPairStrings?.length ?? 3;
      const batchPromises = Array.from({ length: batchCount }, (_, batch) =>
        (async () => {
          const avatarPair = avatarPairStrings?.[batch];
          const prompt = buildCreativePrompt(
            {
              clinicType,
              service,
              location,
              targetAudience: targetAudience || "",
              offerDetails: offer,
              goal,
              avatarPair: avatarPair || undefined,
            },
            batch
          );
          const creatives = await callAI(prompt);
          const arr = Array.isArray(creatives) ? creatives : creatives?.creatives;
          return Array.isArray(arr) ? arr : [];
        })()
      );

      const batchResults = await Promise.allSettled(batchPromises);
      const allCreatives: any[] = [];
      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value.length > 0) {
          const offset = allCreatives.length;
          result.value.forEach((c: any, i: number) => { c.id = offset + i + 1; });
          allCreatives.push(...result.value);
        }
      }

      if (allCreatives.length === 0) {
        const fallback = generateFallbackCreatives(clinicType, service, location, offer);
        return res.json({ creatives: fallback, source: "fallback", research: null, avatars: [], inlineImageUrls: {} });
      }

      // Phase 3: Inline image generation for first N creatives
      const inlineImageUrls: Record<number, string> = {};
      if (imageCount > 0) {
        const BATCH_SIZE = 3;
        const toGenerate = allCreatives.slice(0, imageCount);
        for (let i = 0; i < toGenerate.length; i += BATCH_SIZE) {
          const batch = toGenerate.slice(i, i + BATCH_SIZE);
          const imagePromises = batch.map(async (c: any, idx: number) => {
            const globalIdx = i + idx;
            const { prompt: adImagePrompt, usePro } = buildHyperdopamineImagePrompt({
              prompt: c.image_prompt || "",
              style: c.style,
              avatar: c.avatar,
              emotion: c.emotion,
              headline: c.headline,
              hook: c.hook,
            });
            try {
              const dataUrl = await generateImage(adImagePrompt, usePro);
              return { index: globalIdx, url: dataUrl };
            } catch (imgErr) {
              console.warn(`Inline image ${globalIdx + 1} failed:`, (imgErr as Error).message);
              return { index: globalIdx, url: null };
            }
          });
          const imageResults = await Promise.all(imagePromises);
          for (const { index, url } of imageResults) {
            if (url) inlineImageUrls[index] = url;
          }
          if (i + BATCH_SIZE < toGenerate.length) {
            await new Promise((r) => setTimeout(r, 300));
          }
        }
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
      try {
        await storage.createCreatives(toSave);
      } catch (dbErr) {
        console.warn("Creative save failed (DB may be down):", (dbErr as Error).message);
      }

      res.json({
        creatives: allCreatives,
        source: "ai",
        research: research ? { summary: research.summary } : null,
        avatars: avatarList.map((a: any) => ({ name: a.name, situation: a.situation, emotions: a.emotions })),
        inlineImageUrls,
      });
    } catch (error) {
      console.error("Generate endpoint error:", error);
      const fallback = generateFallbackCreatives(clinicType, service, location, offer);
      res.json({ creatives: fallback, source: "fallback", research: null, avatars: [], inlineImageUrls: {} });
    }
  });

  // ==========================================
  // AD COPIER — Upload ad → AI variations with your branding
  // ==========================================
  app.post("/api/ad-copier/replicate", async (req, res) => {
    const parsed = adCopierRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });

    const { headline, primaryText, cta, clinicType, service, location, offer, targetAudience } = parsed.data;

    try {
      const prompt = buildAdCopierPrompt({
        headline: headline || undefined,
        primaryText: primaryText || undefined,
        cta: cta || undefined,
        clinicType,
        service,
        location: location || "",
        offer: offer || "Contact us for current specials",
        targetAudience: targetAudience || "General local audience",
      });
      const result = await callAI(prompt);
      const creatives = result?.creatives && Array.isArray(result.creatives) ? result.creatives : [];

      if (creatives.length === 0) {
        return res.status(500).json({ error: "AI could not generate variations", creatives: [] });
      }

      creatives.forEach((c: any, i: number) => { c.id = i + 1; c.primary_text = c.primary_text || c.primaryText; });

      res.json({ creatives, source: "ai" });
    } catch (error) {
      console.error("Ad Copier error:", error);
      res.status(500).json({ error: "Ad Copier failed", creatives: [] });
    }
  });

  app.get("/api/creatives", async (_req, res) => {
    const creatives = await storage.getCreatives();
    res.json(creatives);
  });

  // ==========================================
  // PHASE 3: AI TOOLS (Headline Analyzer, Ad Copy, Improve Creative)
  // ==========================================
  app.post("/api/tools/headline-analyze", async (req, res) => {
    const parsed = headlineAnalyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
    try {
      const prompt = buildHeadlineAnalyzerPrompt(parsed.data);
      const result = await callAI(prompt);
      if (!result || typeof result.score !== "number") {
        return res.status(500).json({ error: "Headline analysis failed", message: "AI could not produce a valid response" });
      }
      res.json({
        score: result.score,
        breakdown: result.breakdown ?? {},
        feedback: result.feedback ?? "",
        alternatives: Array.isArray(result.alternatives) ? result.alternatives : [],
      });
    } catch (error) {
      console.error("Headline analyze error:", error);
      res.status(500).json({ error: "Headline analysis failed" });
    }
  });

  app.post("/api/tools/ad-copy", async (req, res) => {
    const parsed = adCopyToolsRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
    try {
      const prompt = buildAdCopyPrompt({
        service: parsed.data.service,
        offer: parsed.data.offer,
        audience: parsed.data.audience,
        clinicType: parsed.data.clinicType || undefined,
      });
      const result = await callAI(prompt);
      const creatives = result?.creatives && Array.isArray(result.creatives) ? result.creatives : [];
      res.json({ creatives, source: "ai" });
    } catch (error) {
      console.error("Ad copy tools error:", error);
      res.status(500).json({ error: "Ad copy generation failed", creatives: [] });
    }
  });

  app.post("/api/tools/improve-creative", async (req, res) => {
    const parsed = improveCreativeRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
    try {
      const prompt = buildImproveCreativePrompt({
        headline: parsed.data.headline,
        primaryText: parsed.data.primaryText,
        hook: parsed.data.hook,
        clinicType: parsed.data.clinicType || undefined,
        service: parsed.data.service || undefined,
        direction: parsed.data.direction || undefined,
      });
      const result = await callAI(prompt);
      if (!result || !result.headline) {
        return res.status(500).json({ error: "Improve creative failed", message: "AI could not produce a valid response" });
      }
      res.json({
        headline: result.headline,
        primary_text: result.primary_text ?? result.primaryText ?? parsed.data.primaryText,
        hook: result.hook ?? parsed.data.hook,
        changes_summary: result.changes_summary ?? "",
      });
    } catch (error) {
      console.error("Improve creative error:", error);
      res.status(500).json({ error: "Improve creative failed" });
    }
  });

  app.post("/api/tools/animate-image", async (req, res) => {
    const parsed = animateImageRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
    const { imageUrl, imageBase64, promptText, duration, model } = parsed.data;
    if (!imageUrl && !imageBase64) return res.status(400).json({ error: "imageUrl or imageBase64 required" });
    const hasFal = !!process.env.FAL_KEY;
    const hasRunway = !!(process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET);
    if (!hasFal && !hasRunway) {
      return res.status(400).json({ error: "Set FAL_KEY (or RUNWAY_API_KEY) in .env for image-to-video." });
    }
    const opts = { imageUrl, imageBase64, promptText, duration };
    const errors: string[] = [];
    const falModel = model as "kling" | "pika" | "minimax" | "kling3" | "veo2";
    try {
      if (hasFal) {
        try {
          const result = await animateImageWithFal({ ...opts, model: falModel });
          if (result.videoUrl) return res.json({ videoUrl: result.videoUrl, status: "SUCCEEDED", provider: falModel });
          if (result.error) errors.push(`${falModel}: ${result.error}`);
        } catch (e) {
          errors.push(`${falModel}: ${(e as Error).message?.slice(0, 80) || "failed"}`);
        }
      }
      if (hasRunway) {
        try {
          const result = await runwayAnimateImage(opts);
          if (result.videoUrl) return res.json({ videoUrl: result.videoUrl, status: result.status, provider: "runway" });
          if (result.error) errors.push(`runway: ${result.error}`);
        } catch (e) {
          errors.push(`runway: ${(e as Error).message?.slice(0, 80) || "failed"}`);
        }
      }
      const msg = errors.length ? `All providers failed. ${errors.join("; ")}` : "No video provider available.";
      return res.status(422).json({ error: msg });
    } catch (err) {
      console.error("Animate image error:", err);
      const msg = (err as Error).message || "Animate image failed";
      return res.status(500).json({ error: msg.includes("FAL_KEY") ? "Add FAL_KEY to .env for image-to-video." : msg });
    }
  });

  app.patch("/api/creatives/:id/status", async (req, res) => {
    const { status } = req.body;
    await storage.updateCreativeStatus(req.params.id, status);
    res.json({ success: true });
  });

  // ==========================================
  // CREATIVE RUNS (library of past runs)
  // ==========================================
  app.post("/api/creative-runs", async (req, res) => {
    const parsed = createCreativeRunRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
    try {
      const run = await storage.createCreativeRun({
        name: parsed.data.name,
        payload: parsed.data.payload as any,
        visibility: parsed.data.visibility ?? "private",
      });
      res.status(201).json(run);
    } catch (err) {
      console.error("Create creative run error:", err);
      res.status(500).json({ error: "Failed to save run" });
    }
  });

  app.get("/api/creative-runs", async (req, res) => {
    try {
      const visibility = req.query.visibility as string | undefined;
      const runs = await storage.getCreativeRuns(visibility);
      res.json(runs);
    } catch (err) {
      console.error("List creative runs error:", err);
      res.status(500).json({ error: "Failed to list runs" });
    }
  });

  app.get("/api/creative-runs/:id", async (req, res) => {
    try {
      const run = await storage.getCreativeRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Run not found" });
      res.json(run);
    } catch (err) {
      console.error("Get creative run error:", err);
      res.status(500).json({ error: "Failed to load run" });
    }
  });

  app.patch("/api/creative-runs/:id", async (req, res) => {
    const { name, visibility } = req.body;
    try {
      const run = await storage.updateCreativeRun(req.params.id, { name, visibility });
      if (!run) return res.status(404).json({ error: "Run not found" });
      res.json(run);
    } catch (err) {
      console.error("Update creative run error:", err);
      res.status(500).json({ error: "Failed to update run" });
    }
  });

  // ==========================================
  // MODULE 3: CAMPAIGN ARCHITECT
  // ==========================================
  app.post("/api/campaigns/blueprint", async (req, res) => {
    const parsed = campaignBlueprintRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors });
    }

    try {
      const prompt = buildCampaignBlueprintPrompt(parsed.data);
      const result = await callAI(prompt);

      if (!result) {
        return res.status(500).json({ error: "Failed to generate blueprint", message: "AI could not produce a valid campaign blueprint" });
      }

      const campaignPayload = {
        name: result.campaign_name || `${parsed.data.clinicType} - ${parsed.data.service} Campaign`,
        clinicType: parsed.data.clinicType,
        service: parsed.data.service,
        location: parsed.data.location,
        budget: parsed.data.budget,
        goal: parsed.data.goal,
        objective: result.objective,
        blueprint: result,
        deploymentChecklist: result.deployment_steps,
        status: "draft" as const,
      };

      let campaign: any;
      try {
        campaign = await storage.createCampaign(campaignPayload);
      } catch (dbErr) {
        console.warn("Campaign blueprint: DB unavailable, returning in-memory blueprint:", (dbErr as Error).message);
        campaign = {
          id: `draft-${Date.now()}`,
          ...campaignPayload,
        };
      }
      return res.json({ campaign, source: "ai" });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Campaign blueprint error:", error);
      return res.status(500).json({
        error: "Campaign blueprint failed",
        message: err.message || "Failed to generate campaign blueprint",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack?.slice(0, 500) }),
      });
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

  /** Dashboard quick stats: real Meta data when configured, else demo fallback */
  app.get("/api/metrics/overview", async (req, res) => {
    const sessionToken = (req.session as { metaAccessToken?: string })?.metaAccessToken;
    const metaCfg = sessionToken && sessionToken.length > 20
      ? { token: sessionToken, accountId: process.env.META_AD_ACCOUNT_ID || undefined }
      : undefined;
    try {
      const [insights, activeAdSets] = await Promise.all([
        fetchAccountInsights(metaCfg),
        fetchActiveAdSetsCount(metaCfg),
      ]);

      if (insights) {
        const cpl = insights.costPerLead ?? (insights.leads > 0 ? insights.spend / insights.leads : 0);
        return res.json({
          source: "meta",
          avgCpl: cpl > 0 ? `$${cpl.toFixed(2)}` : "—",
          leadsThisWeek: insights.leads,
          activeAdSets: activeAdSets ?? 0,
          spend: insights.spend,
          impressions: insights.impressions,
          clicks: insights.clicks,
          ctr: insights.ctr,
          // Trends: compare to previous period would need a second API call; omit for now
          cplTrend: null,
          leadsTrend: null,
          winRateTrend: null,
        });
      }
    } catch (err) {
      console.warn("Meta metrics overview error:", (err as Error).message);
    }

    // Fallback to demo-style static values
    res.json({
      source: "demo",
      avgCpl: "$19.40",
      leadsThisWeek: 89,
      activeAdSets: 8,
      cplTrend: "-12%",
      leadsTrend: "+18%",
      winRateTrend: "+5%",
    });
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
        try {
          await storage.createCoachingSession({
            sessionType: "chat",
            userMessage: parsed.data.message,
            aiResponse: result.response,
            content: result,
          });
        } catch (dbErr) {
          console.warn("Coach session save failed (DB may be down):", (dbErr as Error).message);
        }
        return res.json(result);
      }
      return res.json({
        response: "I'm having trouble analyzing that right now. Could you rephrase your question or provide more context about your campaigns?",
        data_referenced: [],
        confidence_level: "low",
        follow_up_questions: ["What specific campaign metrics are you concerned about?", "What's your current monthly ad budget?"],
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Coach chat error:", errMsg, error instanceof Error ? error.stack : "");
      const hasKey = !!(process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY)?.length;
      // When API is configured, surface the real error instead of demo
      if (hasKey) {
        return res.json({
          response: `The AI service returned an error: ${errMsg}. Check your API key, rate limits, or try again shortly.`,
          data_referenced: [],
          confidence_level: "low",
          follow_up_questions: ["What's a good CPL for a med spa?", "How do I improve my CTR?", "Which audiences should I test?"],
        });
      }
      // Demo mode when no API key
      const msg = (parsed.data.message || "").toLowerCase();
      let demoResponse = "I'm your AI Ad Coach! To get personalized advice, add your Anthropic API key to the .env file. Until then, here are some quick tips: focus on clear CTAs, test 3-5 ad variations, and track CPL by audience segment.";
      if (msg.includes("cpl") || msg.includes("cost")) {
        demoResponse = "For clinic ads, a good CPL (cost per lead) varies by niche: Med Spas typically $30-80, Dental $40-100, IV Therapy $50-120. Your -12% trend is positive! Keep testing audiences and creatives to improve further.";
      } else if (msg.includes("ctr") || msg.includes("click")) {
        demoResponse = "To improve CTR: use strong hooks in the first 3 words, add social proof (reviews, results), and test video vs static. Facebook ads for clinics often see 0.5-2% CTR — aim for the upper range with clear, benefit-focused headlines.";
      } else if (msg.includes("performing") || msg.includes("campaign")) {
        demoResponse = "Based on demo data: your Avg CPL is $19.40 (-12%), Leads This Week 89 (+18%), Win Rate 62% (+5%). Focus on scaling your best-performing ad sets and pausing underperformers to improve ROAS.";
      }
      return res.json({
        response: demoResponse,
        data_referenced: [],
        confidence_level: "low",
        follow_up_questions: [
          "What's a good CPL for a med spa?",
          "How do I improve my CTR?",
          "Which audiences should I test?",
        ],
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
  app.post("/api/build-image-prompt", (req, res) => {
    const { prompt, style, avatar, emotion, headline, hook } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }
    const { prompt: built } = buildHyperdopamineImagePrompt({
      prompt,
      style: typeof style === "string" ? style : undefined,
      avatar: typeof avatar === "string" ? avatar : undefined,
      emotion: typeof emotion === "string" ? emotion : undefined,
      headline: typeof headline === "string" ? headline : undefined,
      hook: typeof hook === "string" ? hook : undefined,
    });
    return res.json({ prompt: built });
  });

  app.post("/api/generate-image", async (req, res) => {
    const { prompt, style, avatar, emotion, headline, hook } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    try {
      const { prompt: adImagePrompt, usePro } = buildHyperdopamineImagePrompt({
        prompt,
        style: typeof style === "string" ? style : undefined,
        avatar: typeof avatar === "string" ? avatar : undefined,
        emotion: typeof emotion === "string" ? emotion : undefined,
        headline: typeof headline === "string" ? headline : undefined,
        hook: typeof hook === "string" ? hook : undefined,
      });
      const provider = process.env.IMAGE_USE_FAL_FIRST === "true" ? (usePro ? "Fal Nano Banana Pro" : "Fal Nano Banana") : "Gemini→Fal fallback";
      console.log("[image] Generating image (provider: %s, usePro: %s)...", provider, usePro);
      const dataUrl = await generateImage(adImagePrompt, usePro);
      res.json({ imageUrl: dataUrl, prompt: adImagePrompt });
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.error("Image generation error:", msg);
      res.status(500).json({ error: "Failed to generate image", details: msg });
    }
  });

  return httpServer;
}
