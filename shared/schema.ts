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
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

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
