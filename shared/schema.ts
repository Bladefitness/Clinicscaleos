import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const generateRequestSchema = z.object({
  clinicType: z.string().min(1, "Clinic type is required"),
  service: z.string().min(1, "Service is required"),
  location: z.string().min(1, "Location is required"),
  targetAudience: z.string().optional().default(""),
  offerDetails: z.string().optional().default(""),
  goal: z.string().min(1, "Campaign goal is required"),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const creativeSchema = z.object({
  id: z.number(),
  avatar: z.string(),
  emotion: z.string(),
  style: z.string(),
  headline: z.string(),
  primary_text: z.string(),
  image_prompt: z.string(),
  hook: z.string(),
  category: z.string(),
});

export type Creative = z.infer<typeof creativeSchema>;
