import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: json("data").notNull(),
  createdAt: text("created_at").notNull(),
});

// Roadmap JSON schema validation
export const roadmapBoxSchema = z.object({
  title: z.string().min(1),
  goal: z.string().min(1),
});

export const roadmapSegmentSchema = z.object({
  name: z.string().min(1),
  weeks: z.number().min(1),
  boxes: z.array(roadmapBoxSchema).min(1),
});

export const roadmapDataSchema = z.object({
  segments: z.array(roadmapSegmentSchema).min(1),
});

export const insertRoadmapSchema = createInsertSchema(roadmaps).pick({
  name: true,
  data: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type RoadmapBox = z.infer<typeof roadmapBoxSchema>;
export type RoadmapSegment = z.infer<typeof roadmapSegmentSchema>;
export type RoadmapData = z.infer<typeof roadmapDataSchema>;
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
