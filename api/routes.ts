import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { roadmapDataSchema, insertRoadmapSchema } from "../shared/schema.js";
import { ZodError } from "zod";

export function registerRoutes(app: Express): void {
  // Validate and parse roadmap JSON
  app.post("/api/roadmap/validate", async (req, res) => {
    try {
      const validatedData = roadmapDataSchema.parse(req.body);
      res.json({ valid: true, data: validatedData });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          valid: false, 
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
        res.status(500).json({ valid: false, message: "Internal server error", error: errorDetails });
      }
    }
  });

  // Save roadmap
  app.post("/api/roadmap", async (req, res) => {
    try {
      const { name, data } = req.body;
      
      // Validate the roadmap data
      const validatedData = roadmapDataSchema.parse(data);
      
      // Create roadmap
      const roadmap = await storage.createRoadmap({
        name: name || `Roadmap ${Date.now()}`,
        data: validatedData
      });
      
      res.json(roadmap);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid roadmap data",
          errors: error.errors
        });
      } else {
        res.status(500).json({ message: "Failed to save roadmap" });
      }
    }
  });

  // Get all roadmaps
  app.get("/api/roadmaps", async (req, res) => {
    try {
      const roadmaps = await storage.getRoadmaps();
      res.json(roadmaps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roadmaps" });
    }
  });

  // Get specific roadmap
  app.get("/api/roadmap/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roadmap = await storage.getRoadmap(id);
      
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }
      
      res.json(roadmap);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roadmap" });
    }
  });


}
