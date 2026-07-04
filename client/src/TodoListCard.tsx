// ─── PURPOSE ─────────────────────────────────────────────────────────
// TodoListCard — a single retractable to-do list card in the Todo Panel.
// NEW FILE (Canvaspace Dashboard rework — Phase 3).
//
// Responsibilities:
//   - Header: "+ Add" button (top-left), title, retract/expand caret,
//     anti-delete shield toggle, delete-list button
//   - Body: draggable, reorderable items. Each item has inline edit (✎),
//     done-checkbox, anti-delete shield toggle, delete button (🗑)
//   - Save button at bottom — only enabled when local edits (title,
//     item text, item order) diverge from the server-side snapshot.
//     Immediate ops (add-item, delete, lock toggle) POST/DELETE/PATCH
//     the server directly; batched ops (text edits, reorder) wait.
//
// Icons follow the pattern established in Table.tsx (Unicode glyphs)
// and ModificationWindow.tsx (shield-tick.svg / shield-cross.svg).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DivClass } from "../lib/ui/Div";
import { todoItemSchema, TodoItem } from "./todoSchemas";

interface Props {
  list: any;
  onListChanged: () => void; // parent re-fetch trigger
}

const TodoListCard = ({ list, onListChanged }: Props) => {
  const { userid } = useParams();
  const listId = list._id;

  const [isOpen, setIsOpen] = useState(true);
  const [titleDraft, setTitleDraft] = useState<string>(list.title);
  const [itemsDraft, setItemsDraft] = useState<TodoItem[]>(list.items ?? []);
  // Inline "add item" state — modeled on the Table.tsx pattern
  // (adding + newRowDraft). Replaces the old window.prompt call.
  const [adding, setAdding] = useState(false);
  const [newItemDraft, setNewItemDraft] = useState("");

  // Re-sync local draft when parent re-fetch replaces the list.
  useEffect(() => {
    setTitleDraft(list.title);
    setItemsDraft(list.items ?? []);
  }, [list]);

  const isDirty = useMemo(() => {
    if (titleDraft !== list.title) return true;
    if ((itemsDraft?.length ?? 0) !== (list.items?.length ?? 0)) return true;
    for (let i = 0; i < itemsDraft.length; i++) {
      const a = itemsDraft[i];
      const b = list.items[i];
      if (!b) return true;
      if (a._id !== b._id || a.text !== b.text || a.done !== b.done) return true;
    }
    return false;
  }, [titleDraft, itemsDraft, list]);

  // ─── Immediate ops (server calls) ─────────────────────────────────

  // Toggle the inline add-item row on/off. Header "+ Add" button
  // flips this; the row itself renders a small form with Save + Cancel.
  const startAddItem = () => {
    setNewItemDraft("");
    setAdding(true);
  };

  const cancelAddItem = () => {
    setAdding(false);
    setNewItemDraft("");
  };

  const commitAddItem = async () => {
    const parsed = todoItemSchema
      .omit({ _id: true })
      .safeParse({ text: newItemDraft.trim() });
    if (!parsed.success) {
      toast.info(parsed.error.issues[0]?.message ?? "Invalid item");
      return;
    }
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists/${listId}/items`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    if (res.ok) {
      toast.success("Item added");
      cancelAddItem();
      onListChanged();
    } else {
      const err = await res.json();
      toast.error(err.message ?? "Could not add item");
    }
  };

  const toggleListLock = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists/${listId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antiDeleteLocked: !list.antiDeleteLocked }),
      },
    );
    if (res.ok) onListChanged();
    else toast.error("Could not toggle lock");
  };

  const deleteList = async () => {
    if (list.antiDeleteLocked) {
      toast.info("Disable the shield first");
      return;
    }
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists/${listId}`,
      { method: "DELETE", credentials: "include" },
    );
    if (res.ok) {
      toast.success("List deleted");
      onListChanged();
    } else {
      const err = await res.json();
      toast.error(err.message ?? "Could not delete list");
    }
  };

  const toggleItemLock = async (itemId: string, currentlyLocked: boolean) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists/${listId}/items/${itemId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antiDeleteLocked: !currentlyLocked }),
      },
    );
    if (res.ok) onListChanged();
    else toast.error("Could not toggle item lock");
  };

  const deleteItem = async (itemId: string, currentlyLocked: boolean) => {
    if (currentlyLocked) {
      toast.info("Disable the shield on this item first");
      return;
    }
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists/${listId}/items/${itemId}`,
      { method: "DELETE", credentials: "include" },
    );
    if (res.ok) {
      toast.success("Item deleted");
      onListChanged();
    } else {
      const err = await res.json();
      toast.error(err.message ?? "Could not delete item");
    }
  };

  // ─── Batched Save (title + items text + reorder) ─────────────────

  const saveDraft = async () => {
    // Send only what changed to keep the payload minimal.
    const body: any = {};
    if (titleDraft !== list.title) body.title = titleDraft;
    const orderOrTextChanged = (() => {
      if (itemsDraft.length !== list.items.length) return true;
      for (let i = 0; i < itemsDraft.length; i++) {
        if (itemsDraft[i]._id !== list.items[i]._id) return true;
        if (itemsDraft[i].text !== list.items[i].text) return true;
      }
      return false;
    })();
    if (orderOrTextChanged) body.items = itemsDraft;

    if (Object.keys(body).length === 0) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists/${listId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (res.ok) {
      toast.success("Changes saved");
      onListChanged();
    } else {
      const err = await res.json();
      toast.error(err.message ?? "Save failed");
    }
  };

  // ─── Drag-reorder (HTML5 native) ─────────────────────────────────

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const onDragStart = (i: number) => setDragIndex(i);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setItemsDraft((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  // ─── Inline text edit ────────────────────────────────────────────

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const updateItemTextLocal = (id: string, text: string) => {
    setItemsDraft((prev) =>
      prev.map((it) => (it._id === id ? { ...it, text } : it)),
    );
  };

  // ─── Render ──────────────────────────────────────────────────────

  const shieldSrc = list.antiDeleteLocked ? "/shield-tick.svg" : "/shield-cross.svg";

  return (
    <DivClass className="todo-card">
      <DivClass className="todo-card-header">
        <button
          className="todo-card-add"
          onClick={startAddItem}
          title="Add item"
          disabled={adding}
        >
          + Add
        </button>
        <input
          className="todo-card-title-input"
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          minLength={3}
          maxLength={200}
        />
        <button
          className="todo-card-shield"
          onClick={toggleListLock}
          title={list.antiDeleteLocked ? "Anti-delete ON" : "Anti-delete OFF (delete enabled)"}
        >
          <img src={shieldSrc} alt="anti-delete toggle" width={20} height={20} />
        </button>
        <button
          className="todo-card-delete"
          onClick={deleteList}
          title="Delete list"
          disabled={list.antiDeleteLocked}
        >
          🗑
        </button>
        <button
          className="todo-card-collapse"
          onClick={() => setIsOpen((v) => !v)}
          title={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? "▾" : "▸"}
        </button>
      </DivClass>

      {isOpen && (
        <>
          {adding && (
            <DivClass className="todo-card-add-row">
              <input
                className="todo-card-add-input"
                value={newItemDraft}
                onChange={(e) => setNewItemDraft(e.target.value)}
                minLength={3}
                maxLength={400}
                placeholder="New item text (min 3 characters)"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitAddItem();
                  } else if (e.key === "Escape") {
                    cancelAddItem();
                  }
                }}
              />
              <button
                className="todo-card-add-save"
                onClick={commitAddItem}
                title="Save item"
                disabled={newItemDraft.trim().length < 3}
              >
                ✓
              </button>
              <button
                className="todo-card-add-cancel"
                onClick={cancelAddItem}
                title="Cancel"
              >
                ✕
              </button>
            </DivClass>
          )}
          <DivClass className="todo-card-items">
            {itemsDraft.map((it, i) => {
              const itemShieldSrc = it.antiDeleteLocked
                ? "/shield-tick.svg"
                : "/shield-cross.svg";
              const editing = editingItemId === it._id;
              return (
                <div
                  className="todo-item"
                  key={it._id ?? i}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(i)}
                >
                  <span className="todo-item-handle" title="Drag to reorder">
                    ⋮⋮
                  </span>
                  {editing ? (
                    <input
                      className="todo-item-text-input"
                      value={it.text}
                      onChange={(e) =>
                        updateItemTextLocal(it._id!, e.target.value)
                      }
                      minLength={3}
                      maxLength={400}
                      autoFocus
                      onBlur={() => setEditingItemId(null)}
                    />
                  ) : (
                    <span className="todo-item-text">{it.text}</span>
                  )}
                  <button
                    className="todo-item-edit"
                    title="Edit item"
                    onClick={() => setEditingItemId(it._id ?? null)}
                  >
                    ✎
                  </button>
                  <button
                    className="todo-item-shield"
                    title={it.antiDeleteLocked ? "Anti-delete ON" : "Anti-delete OFF"}
                    onClick={() =>
                      toggleItemLock(it._id!, !!it.antiDeleteLocked)
                    }
                  >
                    <img src={itemShieldSrc} alt="" width={16} height={16} />
                  </button>
                  <button
                    className="todo-item-delete"
                    title="Delete item"
                    disabled={it.antiDeleteLocked}
                    onClick={() => deleteItem(it._id!, !!it.antiDeleteLocked)}
                  >
                    🗑
                  </button>
                </div>
              );
            })}
          </DivClass>

          <DivClass className="todo-card-footer">
            <button
              className="todo-card-save"
              onClick={saveDraft}
              disabled={!isDirty}
              title={isDirty ? "Save changes" : "No changes to save"}
            >
              Save
            </button>
          </DivClass>
        </>
      )}
    </DivClass>
  );
};

export default TodoListCard;
