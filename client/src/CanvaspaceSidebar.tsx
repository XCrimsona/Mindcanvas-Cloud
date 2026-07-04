// ─── PURPOSE ─────────────────────────────────────────────────────────
// CanvaspaceSidebar — the LEFT column of the Canvaspace Dashboard.
// NEW FILE (Canvaspace Dashboard rework).
//
// Owns three responsibilities, top-to-bottom, per the Figma mockup:
//   1. "Find a Canvaspace" search field (client-side filter for now)
//   2. Create-canvaspace form: name input + Save button
//   3. Count header  ─  "(N) Canvaspace(s)"
//   4. Vertical list of canvaspace cards, each with a single "Open" button
//
// Deliberately DOES NOT include the rename-in-place UI that was in the
// old CanvaspaceManagement.tsx. Rename moves to a deeper page (per
// design brief). Every card has one action: Open.
// ─────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DivClass } from "../lib/ui/Div";
import { InputText } from "../lib/components/form-elements/dry-InputFormComponents";
import Button from "../lib/components/form-elements/Button";
import RouteLink from "../lib/components/ProductSection/RouteLink";
import { redirectToSignIn } from "../lib/auth-redirect/AuthRedirectContext";

interface Props {
  canvaData: any[];
  onCanvaCreated: () => void;
}

const CanvaspaceSidebar = ({ canvaData, onCanvaCreated }: Props) => {
  const { userid } = useParams();

  // Client-side search — instant, no debounce needed at dashboard scale.
  // If canvaspace counts grow past a few hundred, swap for the commented
  // server-side search that lived in the old CanvaspaceManagement.tsx.
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return canvaData;
    const q = query.trim().toLowerCase();
    return canvaData.filter((c: any) =>
      (c.workspacename || "").toLowerCase().includes(q),
    );
  }, [canvaData, query]);

  // Create form
  const [newName, setNewName] = useState("");
  const createCanvaspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userid || newName.trim().length < 3) {
      toast.info("Canvaspace name must be at least 3 characters");
      return;
    }
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sub: userid,
          workspacename: newName.trim(),
          // description kept minimal — filled inside the canvaspace, not here
          workspacedescription: newName.trim(),
        }),
      },
    );
    if (res.ok) {
      toast.success("Canvaspace created");
      setNewName("");
      onCanvaCreated();
    } else {
      const err = await res.json();
      if (err.message === "Not Authenticated") return redirectToSignIn();
      toast.error(`Failed to create Canvaspace: ${err.message}`);
    }
  };

  return (
    <aside className="canvaspace-sidebar">
      {/* 1. Search */}
      <DivClass className="canvaspace-search-wrapper">
        <InputText
          id="canvaspace-search"
          className="canvaspace-search-input"
          placeholder="Find a Canvaspace"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
        />
      </DivClass>

      {/* 2. Create */}
      <form className="canvaspace-create-form" onSubmit={createCanvaspace}>
        <label htmlFor="new-canvaspace-name" className="canvaspace-create-label">
          Name of Canvaspace
        </label>
        <InputText
          id="new-canvaspace-name"
          className="canvaspace-create-input"
          placeholder=""
          value={newName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewName(e.target.value)
          }
        />
        <Button
          id="canvaspace-create-save"
          className="canvaspace-create-save"
          disabled={newName.trim().length < 3}
          title={
            newName.trim().length < 3
              ? "Name must be at least 3 characters"
              : "Save new canvaspace"
          }
          onClick={createCanvaspace}
        >
          Save
        </Button>
      </form>

      {/* 3. Count */}
      <DivClass className="canvaspace-count-header">
        ({filtered.length}) Canvaspace{filtered.length === 1 ? "" : "s"}
      </DivClass>

      {/* 4. Card list */}
      <DivClass className="canvaspace-list">
        {filtered.map((cs: any) => (
          <DivClass key={cs._id} className="canvaspace-card">
            <div className="canvaspace-card-title">{cs.workspacename}</div>
            <RouteLink
              href={`/account/${userid}/canvas-management/${cs._id}`}
              className="canvaspace-card-open"
            >
              Open
            </RouteLink>
          </DivClass>
        ))}
      </DivClass>
    </aside>
  );
};

export default CanvaspaceSidebar;
