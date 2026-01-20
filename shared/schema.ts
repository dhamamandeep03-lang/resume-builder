import { pgTable, text, serial, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

// Export auth models so they are available
export * from "./models/auth";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  personalInfo: jsonb("personal_info").notNull().$type<{
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  }>(),
  experience: jsonb("experience").notNull().$type<Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>>(),
  education: jsonb("education").notNull().$type<Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>>(),
  skills: jsonb("skills").notNull().$type<string[]>(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));
