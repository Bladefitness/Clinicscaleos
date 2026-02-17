import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, jsonb, timestamp, date, uuid, boolean, index } from "drizzle-orm/pg-core";
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
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  createdAtIdx: index("offers_created_at_idx").on(table.createdAt),
}));

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
  avatarId: uuid("avatar_id").references(() => avatars.id, { onDelete: "set null" }),
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
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  avatarIdIdx: index("creatives_avatar_id_idx").on(table.avatarId),
  statusIdx: index("creatives_status_idx").on(table.status),
}));

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
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("campaigns_status_idx").on(table.status),
}));

export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
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
}, (table) => ({
  campaignIdIdx: index("metrics_snapshots_campaign_id_idx").on(table.campaignId),
  dateIdx: index("metrics_snapshots_date_idx").on(table.date),
}));

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
}, (table) => ({
  visibilityIdx: index("creative_runs_visibility_idx").on(table.visibility),
}));

export const videoProjects = pgTable("video_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Untitled project"),
  type: varchar("type", { length: 20 }).notNull().default("short_form"),
  timeline: jsonb("timeline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoAssets = pgTable("video_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => videoProjects.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 30 }).notNull(),
  url: text("url"),
  blobPath: text("blob_path"),
  storagePath: text("storage_path"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdIdx: index("video_assets_project_id_idx").on(table.projectId),
}));

export const timelineVersions = pgTable("timeline_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => videoProjects.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  timelineState: jsonb("timeline_state").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const renders = pgTable("renders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => videoProjects.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("queued"),
  type: varchar("type", { length: 30 }).notNull(),
  config: jsonb("config").notNull(),
  outputUrl: text("output_url"),
  progress: integer("progress").default(0),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentMessages = pgTable("agent_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => videoProjects.id, { onDelete: "cascade" }),
  agent: varchar("agent", { length: 30 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdIdx: index("agent_messages_project_id_idx").on(table.projectId),
}));

// Research Portal: pain point research sessions
export const researchSessions = pgTable("research_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  clinicType: text("clinic_type"),
  service: text("service"),
  source: varchar("source", { length: 20 }).default("web_search"),
  status: varchar("status", { length: 20 }).default("pending"),
  results: jsonb("results"),
  rawSources: jsonb("raw_sources"),
  synthesis: jsonb("synthesis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Research Portal: saved competitor ads from Facebook Ad Library
export const savedAds = pgTable("saved_ads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: text("ad_id"),
  advertiserName: text("advertiser_name").notNull(),
  pageId: text("page_id"),
  adBody: text("ad_body"),
  adTitle: text("ad_title"),
  adCreativeUrl: text("ad_creative_url"),
  adSnapshotUrl: text("ad_snapshot_url"),
  platform: text("platform"),
  startDate: date("start_date"),
  isActive: boolean("is_active"),
  category: text("category"),
  notes: text("notes"),
  tags: text("tags").array(),
  clinicType: text("clinic_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas and types
export const insertOfferSchema = createInsertSchema(offers);
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
export type Creative = typeof creatives.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Avatar = typeof avatars.$inferSelect;

export const insertResearchSessionSchema = createInsertSchema(researchSessions).omit({ id: true, createdAt: true, status: true, results: true, rawSources: true, synthesis: true });
export type InsertResearchSession = z.infer<typeof insertResearchSessionSchema>;
export type ResearchSession = typeof researchSessions.$inferSelect;

export const insertSavedAdSchema = createInsertSchema(savedAds).omit({ id: true, createdAt: true });
export type InsertSavedAd = z.infer<typeof insertSavedAdSchema>;
export type SavedAd = typeof savedAds.$inferSelect;

export const painPointSearchRequestSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  clinicType: z.string().optional().default(""),
  service: z.string().optional().default(""),
});
export type PainPointSearchRequest = z.infer<typeof painPointSearchRequestSchema>;

export const adLibrarySearchRequestSchema = z.object({
  searchTerms: z.string().min(1, "Search terms are required"),
  country: z.string().optional().default("US"),
  adType: z.string().optional().default("all"),
  activeStatus: z.string().optional().default("active"),
});
export type AdLibrarySearchRequest = z.infer<typeof adLibrarySearchRequestSchema>;

export const offerScoreRequestSchema = z.object({
  service: z.string(),
  price: z.string().optional(),
  clinicType: z.string(),
  location: z.string(),
  currentOffer: z.string(),
  differentiator: z.string().optional(),
  targetMarket: z.string().optional(),
});

export const generateRequestSchema = z.object({
  clinicType: z.string(),
  service: z.string(),
  location: z.string(),
  currentOffer: z.string().optional(),
  differentiator: z.string().optional(),
  targetMarket: z.string().optional(),
  count: z.number().min(1).max(10).default(5),
});

export const adCopierRequestSchema = z.object({
  avatarId: z.string().uuid(),
  emotion: z.string(),
  style: z.string(),
  count: z.number().min(1).max(10).default(3),
});

export const campaignBlueprintRequestSchema = z.object({
  clinicType: z.string(),
  service: z.string(),
  location: z.string(),
  budget: z.string(),
  goal: z.string(),
  audienceInfo: z.string(),
  creativeCount: z.number().min(1).max(10).default(5),
});

export const coachChatRequestSchema = z.object({
  message: z.string(),
  clinicContext: z.string().optional(),
  campaignData: z.string().optional(),
});

export const iterationRequestSchema = z.object({
  type: z.enum(["winner_variation", "loser_diagnosis"]),
  creativeId: z.string().optional(),
  creativeName: z.string(),
  creativeHeadline: z.string(),
  creativeCopy: z.string(),
  performanceData: z.string().optional(),
  clinicType: z.string().optional(),
  service: z.string().optional(),
});

export const headlineAnalyzeRequestSchema = z.object({
  headline: z.string().min(1),
  offer: z.string().optional(),
  service: z.string().optional(),
});

export const adCopyToolsRequestSchema = z.object({
  service: z.string(),
  offer: z.string(),
  audience: z.string(),
  clinicType: z.string().optional(),
});

export const improveCreativeRequestSchema = z.object({
  headline: z.string(),
  primaryText: z.string(),
  hook: z.string(),
  clinicType: z.string().optional(),
  service: z.string().optional(),
  direction: z.string().optional(),
});

export const editorLayerSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "image", "text", "audio"]),
  source: z.string().optional(),
  startTime: z.number(),
  duration: z.number(),
  track: z.number(),
  properties: z.record(z.string(), z.any()).optional(),
});

export type EditorLayer = z.infer<typeof editorLayerSchema>;
export const editorLayersByIndexSchema = z.record(z.string(), editorLayerSchema);

export const creativeRunPayloadSchema = z.object({
  layers: editorLayersByIndexSchema,
  duration: z.number(),
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
});

export const createCreativeRunRequestSchema = z.object({
  name: z.string(),
  payload: creativeRunPayloadSchema,
  visibility: z.enum(["private", "public"]).default("private"),
});

export const animateImageRequestSchema = z.object({
  imageUrl: z.string().optional(),
  imageBase64: z.string().optional(),
  promptText: z.string().optional(),
  duration: z.number().min(1).max(10).default(3),
  model: z.enum(["kling", "pika", "minimax", "kling3", "veo2"]).default("kling"),
});

export const videoStudioTranscribeRequestSchema = z.object({
  videoUrl: z.string().url(),
});

export const videoStudioDirectorRequestSchema = z.object({
  projectId: z.string().uuid(),
  instruction: z.string(),
  context: z.object({
    currentTimeline: z.any().optional(),
    availableAssets: z.array(z.any()).optional(),
  }).optional(),
});

// Inferred request types
export type OfferScoreRequest = z.infer<typeof offerScoreRequestSchema>;
export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type AdCopierRequest = z.infer<typeof adCopierRequestSchema>;
export type CampaignBlueprintRequest = z.infer<typeof campaignBlueprintRequestSchema>;
export type CoachChatRequest = z.infer<typeof coachChatRequestSchema>;
export type IterationRequest = z.infer<typeof iterationRequestSchema>;
export type HeadlineAnalyzeRequest = z.infer<typeof headlineAnalyzeRequestSchema>;
export type AdCopyToolsRequest = z.infer<typeof adCopyToolsRequestSchema>;
export type ImproveCreativeRequest = z.infer<typeof improveCreativeRequestSchema>;
