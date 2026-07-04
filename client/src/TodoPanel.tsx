// ─── PURPOSE ─────────────────────────────────────────────────────────
// TodoPanel — the RIGHT (main) area of the Canvaspace Dashboard.
//
// CHANGED IN THIS REVISION (Phase 3 of the Canvaspace Dashboard rework):
//   - Removed the Phase 2 placeholder stub.
//   - Fetches GET /:userid/todo-lists on mount.
//   - Renders a create-list form (title + FIRST item, both required —
//     matches the "at least one item" invariant enforced by the model).
//   - Renders each existing list via <TodoListCard />.
//
// Icons live in /public: shield-tick.svg, shield-cross.svg. Row-action
// glyphs (✎ ✓ ✕ 🗑) match the pattern in Table.tsx.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DivClass } from "../lib/ui/Div";
import TodoListCard from "./TodoListCard";
import { createListSchema } from "./todoSchemas";
import "./style-files/todo-panel.css";

const TodoPanel = () => {
  const { userid } = useParams();
  const [lists, setLists] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [firstItem, setFirstItem] = useState("");

  const fetchLists = async () => {
    if (!userid) return;
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists`,
      { method: "GET", credentials: "include" },
    );
    if (res.ok) {
      const data = await res.json();
      setLists(data.data ?? []);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createListSchema.safeParse({
      title: title.trim(),
      items: [{ text: firstItem.trim() }],
    });
    if (!parsed.success) {
      toast.info(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/todo-lists`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    if (res.ok) {
      toast.success("Todo list created");
      setTitle("");
      setFirstItem("");
      setCreating(false);
      fetchLists();
    } else {
      const err = await res.json();
      toast.error(err.message ?? "Could not create list");
    }
  };

  return (
    <main className="todo-panel-content">
      <DivClass className="todo-panel-toolbar">
        <button
          className="todo-panel-new-list-btn"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Cancel" : "+ New Todo List"}
        </button>
      </DivClass>

      {creating && (
        <form className="todo-panel-create-form" onSubmit={createList}>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={3}
              maxLength={200}
              placeholder="What is this list for?"
            />
          </label>
          <label>
            First item
            <input
              value={firstItem}
              onChange={(e) => setFirstItem(e.target.value)}
              minLength={3}
              maxLength={400}
              placeholder="A list must start with one item"
            />
          </label>
          <button type="submit" className="todo-panel-create-submit">
            Create List
          </button>
        </form>
      )}

      <DivClass className="todo-panel-cards">
        {lists.length === 0 && !creating && (
          <p className="todo-panel-empty-hint">
            No todo lists yet. Click <em>+ New Todo List</em> to create one.
          </p>
        )}
        {lists.map((list) => (
          <TodoListCard
            key={list._id}
            list={list}
            onListChanged={fetchLists}
          />
        ))}
      </DivClass>
    </main>
  );
};

export default TodoPanel;
