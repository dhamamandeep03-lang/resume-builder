import { db } from "./db";
import { resumes, type Resume, type InsertResume } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth";

export interface IStorage extends IAuthStorage {
  getResumes(userId: string): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(userId: string, resume: InsertResume): Promise<Resume>;
  updateResume(id: number, userId: string, updates: Partial<InsertResume>): Promise<Resume>;
  deleteResume(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  getUser(id: string) {
    return authStorage.getUser(id);
  }
  upsertUser(user: any) {
    return authStorage.upsertUser(user);
  }

  async getResumes(userId: string): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createResume(userId: string, resume: InsertResume): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values({ ...resume, userId })
      .returning();
    return newResume;
  }

  async updateResume(id: number, userId: string, updates: Partial<InsertResume>): Promise<Resume> {
    const [updated] = await db
      .update(resumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .returning();
    
    if (!updated) {
      throw new Error("Resume not found or unauthorized");
    }
    
    return updated;
  }

  async deleteResume(id: number, userId: string): Promise<void> {
    await db
      .delete(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
