// ─── PURPOSE ─────────────────────────────────────────────────────────
// TodoListModel — represents a single To-Do LIST for a user.
// Multiple lists per user are expected (e.g. "Morning routine",
// "Deep-work tasks", "Errands"). Each list embeds its items so
// reordering is a single-document write.
//
// Shape at a glance:
//   TodoList {
//     title, listStyle, antiDeleteLocked,
//     items[]: { text, reason, priority, done, antiDeleteLocked, ... }
//     createdBy → users
//   }
//
// antiDeleteLocked defaults to `true` on both the list and each item.
// The client must flip it to `false` (shield-cross UI) before the
// DELETE route will actually remove data. This matches the pattern
// used in ModificationWindow.tsx on the deeper canvas pages.
// ─────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const todoItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: [3, "Todo item must be at least 3 characters"],
      maxlength: [400, "Todo item is too long"],
    },
    // "audit" fields — kept optional so quick todos ("buy milk")
    // don't require ceremony, while high-signal todos can capture WHY
    reason: {
      type: String,
      maxlength: [400, "Reason is too long"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    done: {
      type: Boolean,
      default: false,
    },
    antiDeleteLocked: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const todoListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: [3, "Todo list title must be at least 3 characters"],
      maxlength: [200, "Todo list title is too long"],
    },
    listStyle: {
      type: String,
      enum: ["ordered", "unordered"],
      default: "unordered",
    },
    // items[] order in the array IS the display order — reordering is
    // done by rewriting the array (single-doc atomic write).
    items: {
      type: [todoItemSchema],
      default: [],
    },
    antiDeleteLocked: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const todoListModel = mongoose.model("todoLists", todoListSchema);
export default todoListModel;

// Index for the primary query pattern: "give me this user's lists".
todoListSchema.index({ createdBy: 1 });
