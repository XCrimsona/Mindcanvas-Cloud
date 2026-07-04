// ─── PURPOSE ─────────────────────────────────────────────────────────
// todo-list.js — CRUD API for the user's To-Do lists.
//
// Separation-of-concern: kept out of canvas-management.js because
// mixing two resources' handlers in one file makes both harder to
// maintain. Same mount point (`/api/account`, gated by isAuthenticated
// upstream in server.js), different resource path (`todo-lists`).
//
// ENDPOINTS
//   GET    /:userid/todo-lists                       — list all lists for user
//   POST   /:userid/todo-lists                       — create a new list (title only)
//   PATCH  /:userid/todo-lists/:listid               — update list-level fields OR replace items[] (reorder / edit in bulk)
//   DELETE /:userid/todo-lists/:listid               — delete list. Blocked while antiDeleteLocked === true.
//   POST   /:userid/todo-lists/:listid/items         — append a new item
//   PATCH  /:userid/todo-lists/:listid/items/:itemid — patch a single item
//   DELETE /:userid/todo-lists/:listid/items/:itemid — delete a single item. Blocked while item.antiDeleteLocked === true.
//
// VALIDATION
// Zod schemas defined at the top of the file. Same schemas can be
// duplicated on the client to validate before the network hop.
// (Zod runs in the browser too — no runtime gymnastics needed.)
// ─────────────────────────────────────────────────────────────────────

import Router from "express";
import { z } from "zod";
import getDB from "../../../lib/connnections/Connections.js";
import UserModel from "../../../models/userModel.js";
import todoListModel from "../../../models/TodoListModel.js";

const todoListRouter = Router();

// ─── Zod schemas ─────────────────────────────────────────────────────
// Kept intentionally identical to the Mongoose constraints so a value
// that passes Zod is guaranteed to also pass Mongoose validation.

const todoItemSchema = z.object({
  _id: z.string().optional(), // present on existing items, absent on new
  text: z.string().min(3, "Todo item must be at least 3 characters").max(400, "Todo item is too long"),
  reason: z.string().max(400).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  done: z.boolean().optional(),
  antiDeleteLocked: z.boolean().optional(),
});

const createListSchema = z.object({
  title: z.string().min(3).max(200),
  listStyle: z.enum(["ordered", "unordered"]).optional(),
  // A list must ship with at least one item — an empty list is not a
  // meaningful entity. Enforced here so both the network layer and
  // the DB reject the empty-list case.
  items: z
    .array(todoItemSchema.omit({ _id: true }))
    .min(1, "A todo list must have at least one item"),
});

const patchListSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  listStyle: z.enum(["ordered", "unordered"]).optional(),
  antiDeleteLocked: z.boolean().optional(),
  // Full items[] replacement — the client sends the reordered / edited
  // array and the server persists it as-is. Simpler than diffing.
  items: z.array(todoItemSchema).optional(),
});

const createItemSchema = todoItemSchema.omit({ _id: true });

const patchItemSchema = z.object({
  text: z.string().min(3).max(400).optional(),
  reason: z.string().max(400).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  done: z.boolean().optional(),
  antiDeleteLocked: z.boolean().optional(),
});

// ─── Helper: resolve the authenticated user ──────────────────────────
const findUser = async (sub) => {
  const user = await UserModel.findOne({ _id: sub });
  return user || null;
};

// ─── Routes ──────────────────────────────────────────────────────────
todoListRouter
  // GET all lists for the authenticated user
  .get("/:userid/todo-lists", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const lists = await todoListModel
        .find({ createdBy: user._id })
        .sort({ createdAt: 1 });

      return response.status(200).json({
        success: true,
        code: "RECEIVED_TODO_LISTS",
        status: 200,
        data: lists,
      });
    } catch (err) {
      console.warn("GET todo-lists error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: "The server side todo list has issues",
      });
    }
  })

  // CREATE a new empty list
  .post("/:userid/todo-lists", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const parsed = createListSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          success: false,
          code: "INVALID_TODO_LIST_INPUT",
          status: 400,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        });
      }

      const created = await todoListModel.create({
        ...parsed.data,
        createdBy: user._id,
      });

      return response.status(201).json({
        success: true,
        code: "CREATED_TODO_LIST",
        status: 201,
        data: created,
      });
    } catch (err) {
      console.warn("POST todo-lists error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: err.message,
      });
    }
  })

  // PATCH a list — title, listStyle, antiDeleteLocked, or full items[] replacement (reorder / bulk edit)
  .patch("/:userid/todo-lists/:listid", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const parsed = patchListSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          success: false,
          code: "INVALID_TODO_LIST_INPUT",
          status: 400,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        });
      }

      // Build $set from ONLY the fields the client sent — same "only
      // update what actually changed" pattern we settled on for
      // canvaspace PATCH.
      const updatedPayload = {};
      for (const [key, value] of Object.entries(parsed.data)) {
        if (value !== undefined) updatedPayload[key] = value;
      }

      if (Object.keys(updatedPayload).length === 0) {
        return response.status(200).json({
          success: true,
          code: "NO_CHANGES_DETECTED",
          status: 200,
          message: "Nothing to update",
        });
      }

      const updated = await todoListModel.findOneAndUpdate(
        { _id: request.params.listid, createdBy: user._id },
        { $set: updatedPayload },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return response.status(404).json({
          success: false,
          code: "MISSING_TODO_LIST",
          status: 404,
          message: "Todo list not found",
        });
      }

      return response.status(200).json({
        success: true,
        code: "TODO_LIST_PATCHED",
        status: 200,
        data: updated,
      });
    } catch (err) {
      console.warn("PATCH todo-list error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: err.message,
      });
    }
  })

  // DELETE a whole list — blocked while antiDeleteLocked === true
  .delete("/:userid/todo-lists/:listid", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const list = await todoListModel.findOne({
        _id: request.params.listid,
        createdBy: user._id,
      });

      if (!list) {
        return response.status(404).json({
          success: false,
          code: "MISSING_TODO_LIST",
          status: 404,
          message: "Todo list not found",
        });
      }

      // Anti-delete gate: shield-tick (true) blocks the real delete.
      // The client must PATCH antiDeleteLocked=false first (shield-cross).
      if (list.antiDeleteLocked) {
        return response.status(409).json({
          success: false,
          code: "TODO_LIST_LOCKED",
          status: 409,
          message: "Disable anti-delete on this list before deleting",
        });
      }

      await todoListModel.deleteOne({ _id: list._id });

      return response.status(200).json({
        success: true,
        code: "TODO_LIST_DELETED",
        status: 200,
        message: "Todo list deleted",
      });
    } catch (err) {
      console.warn("DELETE todo-list error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: err.message,
      });
    }
  })

  // APPEND a new item to a list
  .post("/:userid/todo-lists/:listid/items", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const parsed = createItemSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          success: false,
          code: "INVALID_TODO_ITEM_INPUT",
          status: 400,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        });
      }

      const updated = await todoListModel.findOneAndUpdate(
        { _id: request.params.listid, createdBy: user._id },
        { $push: { items: parsed.data } },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return response.status(404).json({
          success: false,
          code: "MISSING_TODO_LIST",
          status: 404,
          message: "Todo list not found",
        });
      }

      return response.status(201).json({
        success: true,
        code: "CREATED_TODO_ITEM",
        status: 201,
        data: updated,
      });
    } catch (err) {
      console.warn("POST todo-item error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: err.message,
      });
    }
  })

  // PATCH a single item — text, done, priority, reason, or antiDeleteLocked
  .patch("/:userid/todo-lists/:listid/items/:itemid", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const parsed = patchItemSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          success: false,
          code: "INVALID_TODO_ITEM_INPUT",
          status: 400,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        });
      }

      // Mongo's positional operator ($) uses the item id matched in the query.
      const setPayload = {};
      for (const [key, value] of Object.entries(parsed.data)) {
        if (value !== undefined) setPayload[`items.$.${key}`] = value;
      }

      if (Object.keys(setPayload).length === 0) {
        return response.status(200).json({
          success: true,
          code: "NO_CHANGES_DETECTED",
          status: 200,
          message: "Nothing to update",
        });
      }

      const updated = await todoListModel.findOneAndUpdate(
        {
          _id: request.params.listid,
          createdBy: user._id,
          "items._id": request.params.itemid,
        },
        { $set: setPayload },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return response.status(404).json({
          success: false,
          code: "MISSING_TODO_ITEM",
          status: 404,
          message: "Todo list or item not found",
        });
      }

      return response.status(200).json({
        success: true,
        code: "TODO_ITEM_PATCHED",
        status: 200,
        data: updated,
      });
    } catch (err) {
      console.warn("PATCH todo-item error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: err.message,
      });
    }
  })

  // DELETE a single item — blocked while item.antiDeleteLocked === true
  .delete("/:userid/todo-lists/:listid/items/:itemid", async (request, response) => {
    try {
      await getDB();
      const user = await findUser(request.user?.sub);
      if (!user) {
        return response.status(404).json({
          success: false,
          code: "NO_USER_DATA",
          status: 404,
          message: "User not found",
        });
      }

      const list = await todoListModel.findOne({
        _id: request.params.listid,
        createdBy: user._id,
      });

      if (!list) {
        return response.status(404).json({
          success: false,
          code: "MISSING_TODO_LIST",
          status: 404,
          message: "Todo list not found",
        });
      }

      const item = list.items.id(request.params.itemid);
      if (!item) {
        return response.status(404).json({
          success: false,
          code: "MISSING_TODO_ITEM",
          status: 404,
          message: "Todo item not found",
        });
      }

      if (item.antiDeleteLocked) {
        return response.status(409).json({
          success: false,
          code: "TODO_ITEM_LOCKED",
          status: 409,
          message: "Disable anti-delete on this item before deleting",
        });
      }

      // Mongoose subdoc removal
      list.items.pull({ _id: request.params.itemid });
      await list.save();

      return response.status(200).json({
        success: true,
        code: "TODO_ITEM_DELETED",
        status: 200,
        data: list,
      });
    } catch (err) {
      console.warn("DELETE todo-item error:", err.message);
      return response.status(500).json({
        success: false,
        code: "SERVER_TODO_ERROR",
        status: 500,
        message: err.message,
      });
    }
  });

export default todoListRouter;
