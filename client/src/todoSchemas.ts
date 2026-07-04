// ─── PURPOSE ─────────────────────────────────────────────────────────
// Client-side Zod schemas for todo lists / items.
// NEW FILE (Canvaspace Dashboard rework — Phase 3).
//
// These MUST stay in sync with the schemas in
// server/api/routes/canvas-management/todo-list.js. Because this repo
// has no shared package, the schemas are duplicated. If you change one
// side, change the other.
// ─────────────────────────────────────────────────────────────────────

import { z } from "zod";

export const todoItemSchema = z.object({
  _id: z.string().optional(),
  text: z.string().min(3, "Item must be at least 3 characters").max(400, "Item is too long"),
  reason: z.string().max(400).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  done: z.boolean().optional(),
  antiDeleteLocked: z.boolean().optional(),
});

export const createListSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  listStyle: z.enum(["ordered", "unordered"]).optional(),
  items: z.array(todoItemSchema.omit({ _id: true })).min(1, "Add at least one item"),
});

export type TodoItem = z.infer<typeof todoItemSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
