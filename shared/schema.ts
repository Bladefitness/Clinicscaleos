import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, jsonb, timestamp, date, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  service: text("service").notNull(),
  price: text("price"),
  clinicType: text("clinic_type").notNull(),
  location: text("location").notNull(),
  currentOffer: text("current_offer").notNull(),
  differentiator: text("differentiator"),
  targetMarket: text("target_market"),
  score: integer("score"),
  scoreBreakdown: jsonb("score_breakdown"),
  weaknesses: text("weaknesses").array(),
  strengths: text("strengths").array(),
  verdict: text("verdict"),
  variations: jsonb("variations"),
  competitorData: jsonb("competitor_data"),
  marketTemperature: varchar("market_temperature", { length: 20 }),
  selectedVariation: integer("selected_variation"),
  status: varchar("status", { length: 20 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const avatars = pgTable("avatars", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicType: text("clinic_type").notNull(),
  service: text("service").notNull(),
  name: text("name").notNull(),
  situation: text("situation"),
  demographics: text("demographics"),
  psychographics: text("psychographics"),
  emotions: jsonb("emotions"),
  hooks: jsonb("hooks"),
  objections: text("objections").array(),
  buyingTriggers: text("buying_triggers").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creatives = pgTable("creatives", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  avatarId: uuid("avatar_id"),
  avatarName: text("avatar_name").notNull(),
  emotion: text("emotion").notNull(),
  style: text("style").notNull(),
  headline: text("headline").notNull(),
  primaryText: text("primary_text").notNull(),
  description: text("description"),
  ctaButton: text("cta_button"),
  imagePrompt: text("image_prompt"),
  hook: text("hook"),
  category: text("category"),
  copyFormula: text("copy_formula"),
  clinicType: text("clinic_type"),
  service: text("service"),
  location: text("location"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clinicType: text("clinic_type"),
  service: text("service"),
  location: text("location"),
  budget: text("budget"),
  goal: text("goal"),
  objective: text("objective"),
  blueprint: jsonb("blueprint"),
  deploymentChecklist: jsonb("deployment_checklist"),
  status: varchar("status", { length: 20 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id"),
  date: date("date").notNull(),
  adSetName: text("ad_set_name"),
  creativeId: uuid("creative_id"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  leads: integer("leads").default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0"),
  cpl: decimal("cpl", { precision: 10, scale: 2 }),
  ctr: decimal("ctr", { precision: 5, scale: 2 }),
  cpc: decimal("cpc", { precision: 10, scale: 2 }),
  frequency: decimal("frequency", { precision: 5, scale: 2 }),
  roas: decimal("roas", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachingSessions = pgTable("coaching_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id"),
  sessionType: varchar("session_type", { length: 30 }).notNull(),
  content: jsonb("content"),
  userMessage: text("user_message"),
  aiResponse: text("ai_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const iterations = pgTable("iterations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id"),
  sourceCreativeId: uuid("source_creative_id"),
  iterationType: varchar("iteration_type", { length: 30 }),
  diagnosis: jsonb("diagnosis"),
  newCreatives: jsonb("new_creatives"),
  performanceDelta: jsonb("performance_delta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creativeRuns = pgTable("creative_runs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  payload: jsonb("payload").notNull(),
  visibility: varchar("visibility", { length: 20 }).default("private"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video Studio: projects and assets
export const videoProjects = pgTable("video_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Untitled project"),
  type: varchar("type", { length: 20 }).notNull().default("short_form"), // long_form | short_form
  timeline: jsonb("timeline"), // { tracks: [{ id, type, clips: [{ id, start, end, url, ... }] }], duration }
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoAssets = pgTable("video_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  kind: varchar("kind", { length: 30 }).notNull(), // video | audio | image | caption
  url: text("url"),
  blobPath: text("blob_path"), // relative path if stored on disk
  metadata: jsonb("metadata"), // duration, prompt, model, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Timeline version history (non-destructive)
export const timelineVersions = pgTable("timeline_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  version: integer("version").notNull(),
  timelineState: jsonb("timeline_state").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Render queue (Remotion, FFmpeg, Fal)
export const renders = pgTable("renders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id"),
  status: varchar("status", { length: 20 }).default("queued"), // queued | processing | complete | failed
  type: varchar("type", { length: 30 }).notNull(), // remotion | ffmpeg | fal
  config: jsonb("config").notNull(),
  outputUrl: text("output_url"),
  progress: integer("progress").default(0),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent chat history per project
export const agentMessages = pgTable("agent_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull(),
  agent: varchar("agent", { length: 30 }).notNull(), // director | picasso | dicaprio | scorsese
  role: varchar("role", { length: 20 }).notNull(), // user | assistant
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true, score: true, scoreBreakdown: true, weaknesses: true, strengths: true, verdict: true, variations: true, competitorData: true, marketTemperature: true, selectedVariation: true, status: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

export const insertAvatarSchema = createInsertSchema(avatars).omit({ id: true, createdAt: true });
export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

export const insertCreativeSchema = createInsertSchema(creatives).omit({ id: true, createdAt: true });
export type InsertCreative = z.infer<typeof insertCreativeSchema>;
export type Creative = typeof creatives.$inferSelect;

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const insertMetricsSnapshotSchema = createInsertSchema(metricsSnapshots).omit({ id: true, createdAt: true });
export type InsertMetricsSnapshot = z.infer<typeof insertMetricsSnapshotSchema>;
export type MetricsSnapshot = typeof metricsSnapshots.$inferSelect;

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({ id: true, createdAt: true });
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;

export const insertIterationSchema = createInsertSchema(iterations).omit({ id: true, createdAt: true });
export type InsertIteration = z.infer<typeof insertIterationSchema>;
export type Iteration = typeof iterations.$inferSelect;

export const insertCreativeRunSchema = createInsertSchema(creativeRuns).omit({ id: true, createdAt: true });
export type InsertCreativeRun = z.infer<typeof insertCreativeRunSchema>;
export type CreativeRun = typeof creativeRuns.$inferSelect;

export const insertVideoProjectSchema = createInsertSchema(videoProjects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideoProject = z.infer<typeof insertVideoProjectSchema>;
export type VideoProject = typeof videoProjects.$inferSelect;

export const insertVideoAssetSchema = createInsertSchema(videoAssets).omit({ id: true, createdAt: true });
export type InsertVideoAsset = z.infer<typeof insertVideoAssetSchema>;
export type VideoAsset = typeof videoAssets.$inferSelect;

export const insertTimelineVersionSchema = createInsertSchema(timelineVersions).omit({ id: true, createdAt: true });
export type InsertTimelineVersion = z.infer<typeof insertTimelineVersionSchema>;
export type TimelineVersion = typeof timelineVersions.$inferSelect;

export const insertRenderSchema = createInsertSchema(renders).omit({ id: true, createdAt: true });
export type InsertRender = z.infer<typeof insertRenderSchema>;
export type Render = typeof renders.$inferSelect;

export const insertAgentMessageSchema = createInsertSchema(agentMessages).omit({ id: true, createdAt: true });
export type InsertAgentMessage = z.infer<typeof insertAgentMessageSchema>;
export type AgentMessage = typeof agentMessages.$inferSelect;

export const offerScoreRequestSchema = z.object({
  service: z.string().min(1),
  price: z.string().optional().default(""),
  clinicType: z.string().min(1),
  location: z.string().min(1),
  currentOffer: z.string().min(1),
  differentiator: z.string().optional().default(""),
  targetMarket: z.string().optional().default(""),
});
export type OfferScoreRequest = z.infer<typeof offerScoreRequestSchema>;

export const generateRequestSchema = z.object({
  clinicType: z.string().min(1, "Clinic type is required"),
  service: z.string().min(1, "Service is required"),
  location: z.string().min(1, "Location is required"),
  targetAudience: z.string().optional().default(""),
  offerDetails: z.string().optional().default(""),
  goal: z.string().min(1, "Campaign goal is required"),
  quickMode: z.boolean().optional().default(false),
  inlineImages: z.number().min(0).max(6).optional().default(3),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const adCopierRequestSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  headline: z.string().optional().default(""),
  primaryText: z.string().optional().default(""),
  cta: z.string().optional().default(""),
  clinicType: z.string().min(1),
  service: z.string().min(1),
  location: z.string().optional().default(""),
  offer: z.string().optional().default(""),
  targetAudience: z.string().optional().default(""),
});
export type AdCopierRequest = z.infer<typeof adCopierRequestSchema>;

export const campaignBlueprintRequestSchema = z.object({
  clinicType: z.string().min(1),
  service: z.string().min(1),
  location: z.string().min(1),
  budget: z.string().min(1),
  goal: z.string().min(1),
  audienceInfo: z.string().optional().default(""),
  creativeCount: z.number().optional().default(6),
});
export type CampaignBlueprintRequest = z.infer<typeof campaignBlueprintRequestSchema>;

export const coachChatRequestSchema = z.object({
  message: z.string().min(1),
  clinicContext: z.string().optional().default(""),
  campaignData: z.string().optional().default(""),
});
export type CoachChatRequest = z.infer<typeof coachChatRequestSchema>;

export const iterationRequestSchema = z.object({
  creativeId: z.string().optional(),
  type: z.enum(["winner_variation", "loser_diagnosis"]),
  creativeName: z.string().min(1),
  creativeHeadline: z.string().min(1),
  creativeCopy: z.string().min(1),
  performanceData: z.string().optional().default(""),
  clinicType: z.string().optional().default(""),
  service: z.string().optional().default(""),
});
export type IterationRequest = z.infer<typeof iterationRequestSchema>;

// Phase 3: AI Tools
export const headlineAnalyzeRequestSchema = z.object({
  headline: z.string().min(1),
  offer: z.string().optional().default(""),
  service: z.string().optional().default(""),
});
export type HeadlineAnalyzeRequest = z.infer<typeof headlineAnalyzeRequestSchema>;

export const adCopyToolsRequestSchema = z.object({
  service: z.string().min(1),
  offer: z.string().min(1),
  audience: z.string().min(1),
  clinicType: z.string().optional().default(""),
});
export type AdCopyToolsRequest = z.infer<typeof adCopyToolsRequestSchema>;

export const improveCreativeRequestSchema = z.object({
  headline: z.string().min(1),
  primaryText: z.string().min(1),
  hook: z.string().optional().default(""),
  clinicType: z.string().optional().default(""),
  service: z.string().optional().default(""),
  direction: z.string().optional().default(""),
});
export type ImproveCreativeRequest = z.infer<typeof improveCreativeRequestSchema>;

/** Single layer in the canvas editor (text or shape). */
export const editorLayerSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "rect", "roundRect"]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fill: z.string().optional(),
  opacity: z.number().optional(),
  cornerRadius: z.number().optional(),
});
export type EditorLayer = z.infer<typeof editorLayerSchema>;

/** Editor state per creative index (keyed by string index "0", "1", ...). */
export const editorLayersByIndexSchema = z.record(z.string(), z.array(editorLayerSchema));

export const creativeRunPayloadSchema = z.object({
  offerSummary: z.object({
    clinicType: z.string(),
    service: z.string(),
    location: z.string(),
    offerDetails: z.string().optional(),
  }).nullable(),
  research: z.object({ summary: z.string() }).nullable(),
  avatars: z.array(z.record(z.unknown())),
  creatives: z.array(z.record(z.unknown())),
  imageUrls: z.record(z.string()).optional(),
  editorLayers: editorLayersByIndexSchema.optional(),
}).passthrough();
export type CreativeRunPayload = z.infer<typeof creativeRunPayloadSchema>;

export const createCreativeRunRequestSchema = z.object({
  name: z.string().min(1),
  payload: creativeRunPayloadSchema,
  visibility: z.enum(["private", "shared"]).optional().default("private"),
});
export type CreateCreativeRunRequest = z.infer<typeof createCreativeRunRequestSchema>;

export const animateImageRequestSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  promptText: z.string().max(1000).optional().default("Smooth, subtle motion that brings the image to life."),
  duration: z.number().min(2).max(10).optional().default(5),
  model: z.enum(["kling", "pika", "minimax", "kling3", "veo2"]).optional().default("kling"),
});
export type AnimateImageRequest = z.infer<typeof animateImageRequestSchema>;

// Video Studio
export const videoStudioTranscribeRequestSchema = z.object({
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  fileBase64: z.string().optional(), // base64 audio or video
  mimeType: z.string().optional(),
});
export type VideoStudioTranscribeRequest = z.infer<typeof videoStudioTranscribeRequestSchema>;

export const videoStudioDirectorRequestSchema = z.object({
  projectId: z.string().uuid(),
  prompt: z.string().min(1),
  timeline: z.record(z.unknown()).optional(),
});
export type VideoStudioDirectorRequest = z.infer<typeof videoStudioDirectorRequestSchema>;
