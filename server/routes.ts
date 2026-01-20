import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Resume Routes
  
  // List
  app.get(api.resumes.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const resumes = await storage.getResumes(userId);
    res.json(resumes);
  });

  // Get
  app.get(api.resumes.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const resume = await storage.getResume(Number(req.params.id));
    
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    if (resume.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(resume);
  });

  // Create
  app.post(api.resumes.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.resumes.create.input.parse(req.body);
      const resume = await storage.createResume(userId, input);
      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Update
  app.patch(api.resumes.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.resumes.update.input.parse(req.body);
      const resume = await storage.updateResume(Number(req.params.id), userId, input);
      res.json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // Handle "not found" from storage
      res.status(404).json({ message: "Resume not found or unauthorized" });
    }
  });

  // Delete
  app.delete(api.resumes.delete.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    await storage.deleteResume(Number(req.params.id), userId);
    res.status(204).send();
  });

  return httpServer;
}
