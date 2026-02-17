import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  offers, avatars, creatives, campaigns, metricsSnapshots, coachingSessions, iterations, creativeRuns,
  videoProjects, videoAssets, timelineVersions, renders, agentMessages,
  researchSessions, savedAds,
  type InsertOffer, type Offer,
  type InsertAvatar, type Avatar,
  type InsertCreative, type Creative,
  type InsertCampaign, type Campaign,
  type InsertMetricsSnapshot, type MetricsSnapshot,
  type InsertCoachingSession, type CoachingSession,
  type InsertIteration, type Iteration,
  type InsertCreativeRun, type CreativeRun,
  type InsertVideoProject, type VideoProject,
  type InsertVideoAsset, type VideoAsset,
  type InsertTimelineVersion, type TimelineVersion,
  type InsertRender, type Render,
  type InsertAgentMessage, type AgentMessage,
  type InsertResearchSession, type ResearchSession,
  type InsertSavedAd, type SavedAd,
} from "@shared/schema";

export interface IStorage {
  createOffer(data: InsertOffer): Promise<Offer>;
  updateOffer(id: string, data: Partial<Offer>): Promise<Offer | undefined>;
  getOffer(id: string): Promise<Offer | undefined>;
  getOffers(): Promise<Offer[]>;

  createAvatar(data: InsertAvatar): Promise<Avatar>;
  getAvatars(clinicType?: string): Promise<Avatar[]>;

  createCreative(data: InsertCreative): Promise<Creative>;
  createCreatives(data: InsertCreative[]): Promise<Creative[]>;
  getCreatives(): Promise<Creative[]>;
  getCreative(id: string): Promise<Creative | undefined>;
  updateCreativeStatus(id: string, status: string): Promise<void>;

  createCampaign(data: InsertCampaign): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | undefined>;

  createMetricsSnapshot(data: InsertMetricsSnapshot): Promise<MetricsSnapshot>;
  getMetricsSnapshots(campaignId?: string): Promise<MetricsSnapshot[]>;

  createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession>;
  getCoachingSessions(limit?: number): Promise<CoachingSession[]>;

  createIteration(data: InsertIteration): Promise<Iteration>;
  getIterations(): Promise<Iteration[]>;

  createCreativeRun(data: InsertCreativeRun): Promise<CreativeRun>;
  getCreativeRuns(visibility?: string): Promise<CreativeRun[]>;
  getCreativeRun(id: string): Promise<CreativeRun | undefined>;
  updateCreativeRun(id: string, data: Partial<Pick<CreativeRun, "name" | "visibility">>): Promise<CreativeRun | undefined>;

  createVideoProject(data: InsertVideoProject): Promise<VideoProject>;
  getVideoProject(id: string): Promise<VideoProject | undefined>;
  getVideoProjects(): Promise<VideoProject[]>;
  updateVideoProject(id: string, data: Partial<Pick<VideoProject, "name" | "type" | "timeline" | "updatedAt">>): Promise<VideoProject | undefined>;

  createVideoAsset(data: InsertVideoAsset): Promise<VideoAsset>;
  getVideoAssets(projectId: string): Promise<VideoAsset[]>;

  createTimelineVersion(data: InsertTimelineVersion): Promise<TimelineVersion>;
  getTimelineVersions(projectId: string, limit?: number): Promise<TimelineVersion[]>;

  createRender(data: InsertRender): Promise<Render>;
  getRender(id: string): Promise<Render | undefined>;
  updateRender(id: string, data: Partial<Pick<Render, "status" | "outputUrl" | "progress" | "error" | "startedAt" | "completedAt">>): Promise<Render | undefined>;

  createAgentMessage(data: InsertAgentMessage): Promise<AgentMessage>;
  getAgentMessages(projectId: string, limit?: number): Promise<AgentMessage[]>;

  createResearchSession(data: InsertResearchSession): Promise<ResearchSession>;
  getResearchSessions(clinicType?: string, limit?: number): Promise<ResearchSession[]>;
  getResearchSession(id: string): Promise<ResearchSession | undefined>;
  updateResearchSession(id: string, data: Partial<ResearchSession>): Promise<ResearchSession | undefined>;
  deleteResearchSession(id: string): Promise<void>;

  createSavedAd(data: InsertSavedAd): Promise<SavedAd>;
  getSavedAds(clinicType?: string): Promise<SavedAd[]>;
  getSavedAd(id: string): Promise<SavedAd | undefined>;
  updateSavedAd(id: string, data: Partial<Pick<SavedAd, "notes" | "tags">>): Promise<SavedAd | undefined>;
  deleteSavedAd(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createOffer(data: InsertOffer): Promise<Offer> {
    const [result] = await db.insert(offers).values(data).returning();
    return result;
  }

  async updateOffer(id: string, data: Partial<Offer>): Promise<Offer | undefined> {
    const [result] = await db.update(offers).set(data).where(eq(offers.id, id)).returning();
    return result;
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const [result] = await db.select().from(offers).where(eq(offers.id, id));
    return result;
  }

  async getOffers(): Promise<Offer[]> {
    return db.select().from(offers).orderBy(desc(offers.createdAt));
  }

  async createAvatar(data: InsertAvatar): Promise<Avatar> {
    const [result] = await db.insert(avatars).values(data).returning();
    return result;
  }

  async getAvatars(clinicType?: string): Promise<Avatar[]> {
    if (clinicType) {
      return db.select().from(avatars).where(eq(avatars.clinicType, clinicType)).orderBy(desc(avatars.createdAt));
    }
    return db.select().from(avatars).orderBy(desc(avatars.createdAt));
  }

  async createCreative(data: InsertCreative): Promise<Creative> {
    const [result] = await db.insert(creatives).values(data).returning();
    return result;
  }

  async createCreatives(data: InsertCreative[]): Promise<Creative[]> {
    if (data.length === 0) return [];
    return db.insert(creatives).values(data).returning();
  }

  async getCreatives(): Promise<Creative[]> {
    return db.select().from(creatives).orderBy(desc(creatives.createdAt));
  }

  async getCreative(id: string): Promise<Creative | undefined> {
    const [result] = await db.select().from(creatives).where(eq(creatives.id, id));
    return result;
  }

  async updateCreativeStatus(id: string, status: string): Promise<void> {
    await db.update(creatives).set({ status }).where(eq(creatives.id, id));
  }

  async createCampaign(data: InsertCampaign): Promise<Campaign> {
    const [result] = await db.insert(campaigns).values(data).returning();
    return result;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [result] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result;
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const [result] = await db.update(campaigns).set(data).where(eq(campaigns.id, id)).returning();
    return result;
  }

  async createMetricsSnapshot(data: InsertMetricsSnapshot): Promise<MetricsSnapshot> {
    const [result] = await db.insert(metricsSnapshots).values(data).returning();
    return result;
  }

  async getMetricsSnapshots(campaignId?: string): Promise<MetricsSnapshot[]> {
    if (campaignId) {
      return db.select().from(metricsSnapshots).where(eq(metricsSnapshots.campaignId, campaignId)).orderBy(desc(metricsSnapshots.date));
    }
    return db.select().from(metricsSnapshots).orderBy(desc(metricsSnapshots.date));
  }

  async createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession> {
    const [result] = await db.insert(coachingSessions).values(data).returning();
    return result;
  }

  async getCoachingSessions(limit = 50): Promise<CoachingSession[]> {
    return db.select().from(coachingSessions).orderBy(desc(coachingSessions.createdAt)).limit(limit);
  }

  async createIteration(data: InsertIteration): Promise<Iteration> {
    const [result] = await db.insert(iterations).values(data).returning();
    return result;
  }

  async getIterations(): Promise<Iteration[]> {
    return db.select().from(iterations).orderBy(desc(iterations.createdAt));
  }

  async createCreativeRun(data: InsertCreativeRun): Promise<CreativeRun> {
    const [result] = await db.insert(creativeRuns).values(data).returning();
    return result;
  }

  async getCreativeRuns(visibility?: string): Promise<CreativeRun[]> {
    if (visibility) {
      return db.select().from(creativeRuns).where(eq(creativeRuns.visibility, visibility)).orderBy(desc(creativeRuns.createdAt));
    }
    return db.select().from(creativeRuns).orderBy(desc(creativeRuns.createdAt));
  }

  async getCreativeRun(id: string): Promise<CreativeRun | undefined> {
    const [result] = await db.select().from(creativeRuns).where(eq(creativeRuns.id, id));
    return result;
  }

  async updateCreativeRun(id: string, data: Partial<Pick<CreativeRun, "name" | "visibility">>): Promise<CreativeRun | undefined> {
    const [result] = await db.update(creativeRuns).set(data).where(eq(creativeRuns.id, id)).returning();
    return result;
  }

  async createVideoProject(data: InsertVideoProject): Promise<VideoProject> {
    const [result] = await db.insert(videoProjects).values(data).returning();
    return result;
  }

  async getVideoProject(id: string): Promise<VideoProject | undefined> {
    const [result] = await db.select().from(videoProjects).where(eq(videoProjects.id, id));
    return result;
  }

  async getVideoProjects(): Promise<VideoProject[]> {
    return db.select().from(videoProjects).orderBy(desc(videoProjects.updatedAt));
  }

  async updateVideoProject(id: string, data: Partial<Pick<VideoProject, "name" | "type" | "timeline" | "updatedAt">>): Promise<VideoProject | undefined> {
    const [result] = await db.update(videoProjects).set({ ...data, updatedAt: new Date() }).where(eq(videoProjects.id, id)).returning();
    return result;
  }

  async createVideoAsset(data: InsertVideoAsset): Promise<VideoAsset> {
    const [result] = await db.insert(videoAssets).values(data).returning();
    return result;
  }

  async getVideoAssets(projectId: string): Promise<VideoAsset[]> {
    return db.select().from(videoAssets).where(eq(videoAssets.projectId, projectId)).orderBy(desc(videoAssets.createdAt));
  }

  async createTimelineVersion(data: InsertTimelineVersion): Promise<TimelineVersion> {
    const [result] = await db.insert(timelineVersions).values(data).returning();
    return result;
  }

  async getTimelineVersions(projectId: string, limit = 50): Promise<TimelineVersion[]> {
    return db.select().from(timelineVersions).where(eq(timelineVersions.projectId, projectId)).orderBy(desc(timelineVersions.createdAt)).limit(limit);
  }

  async createRender(data: InsertRender): Promise<Render> {
    const [result] = await db.insert(renders).values(data).returning();
    return result;
  }

  async getRender(id: string): Promise<Render | undefined> {
    const [result] = await db.select().from(renders).where(eq(renders.id, id));
    return result;
  }

  async updateRender(id: string, data: Partial<Pick<Render, "status" | "outputUrl" | "progress" | "error" | "startedAt" | "completedAt">>): Promise<Render | undefined> {
    const [result] = await db.update(renders).set(data).where(eq(renders.id, id)).returning();
    return result;
  }

  async createAgentMessage(data: InsertAgentMessage): Promise<AgentMessage> {
    const [result] = await db.insert(agentMessages).values(data).returning();
    return result;
  }

  async getAgentMessages(projectId: string, limit = 100): Promise<AgentMessage[]> {
    return db.select().from(agentMessages).where(eq(agentMessages.projectId, projectId)).orderBy(desc(agentMessages.createdAt)).limit(limit);
  }

  async createResearchSession(data: InsertResearchSession): Promise<ResearchSession> {
    const [result] = await db.insert(researchSessions).values(data).returning();
    return result;
  }

  async getResearchSessions(clinicType?: string, limit = 20): Promise<ResearchSession[]> {
    if (clinicType) {
      return db.select().from(researchSessions).where(eq(researchSessions.clinicType, clinicType)).orderBy(desc(researchSessions.createdAt)).limit(limit);
    }
    return db.select().from(researchSessions).orderBy(desc(researchSessions.createdAt)).limit(limit);
  }

  async getResearchSession(id: string): Promise<ResearchSession | undefined> {
    const [result] = await db.select().from(researchSessions).where(eq(researchSessions.id, id));
    return result;
  }

  async updateResearchSession(id: string, data: Partial<ResearchSession>): Promise<ResearchSession | undefined> {
    const [result] = await db.update(researchSessions).set(data).where(eq(researchSessions.id, id)).returning();
    return result;
  }

  async deleteResearchSession(id: string): Promise<void> {
    await db.delete(researchSessions).where(eq(researchSessions.id, id));
  }

  async createSavedAd(data: InsertSavedAd): Promise<SavedAd> {
    const [result] = await db.insert(savedAds).values(data).returning();
    return result;
  }

  async getSavedAds(clinicType?: string): Promise<SavedAd[]> {
    if (clinicType) {
      return db.select().from(savedAds).where(eq(savedAds.clinicType, clinicType)).orderBy(desc(savedAds.createdAt));
    }
    return db.select().from(savedAds).orderBy(desc(savedAds.createdAt));
  }

  async getSavedAd(id: string): Promise<SavedAd | undefined> {
    const [result] = await db.select().from(savedAds).where(eq(savedAds.id, id));
    return result;
  }

  async updateSavedAd(id: string, data: Partial<Pick<SavedAd, "notes" | "tags">>): Promise<SavedAd | undefined> {
    const [result] = await db.update(savedAds).set(data).where(eq(savedAds.id, id)).returning();
    return result;
  }

  async deleteSavedAd(id: string): Promise<void> {
    await db.delete(savedAds).where(eq(savedAds.id, id));
  }
}

export const storage = new DatabaseStorage();
