import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  offers, avatars, creatives, campaigns, metricsSnapshots, coachingSessions, iterations,
  type InsertOffer, type Offer,
  type InsertAvatar, type Avatar,
  type InsertCreative, type Creative,
  type InsertCampaign, type Campaign,
  type InsertMetricsSnapshot, type MetricsSnapshot,
  type InsertCoachingSession, type CoachingSession,
  type InsertIteration, type Iteration,
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
}

export const storage = new DatabaseStorage();
