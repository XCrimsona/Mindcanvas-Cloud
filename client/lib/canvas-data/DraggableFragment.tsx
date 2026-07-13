// ─── PURPOSE ─────────────────────────────────────────────────────────
// DraggableFragment — the per-fragment wrapper div on the infinite
// canvas. Positions the fragment at its stored world (x, y) and hosts
// the pointer-based direct-drag replacing the legacy "Move fragment"
// button flow.
//
// Sends the same XY_POSITIONS PATCH the old flow used, so no server
// change is needed. On success, updateCanvasData() re-hydrates the
// tree; on failure, a toast fires and the next refresh snaps the
// element back to the DB value.
// ─────────────────────────────────────────────────────────────────────
import { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useFragmentDrag from "./useFragmentDrag";
import { useCanvasFragmentData } from "./CanvasFragmentDataContext";
import "./draggable-fragment.css";

interface IDraggableFragmentProps {
  data: any;
  children: ReactNode;
}

const DraggableFragment = ({ data, children }: IDraggableFragmentProps) => {
  try {
    const { _id, type } = data;
    const worldX = Number(data?.position?.x) || 0;
    const worldY = Number(data?.position?.y) || 0;
    const { userid, canvaid } = useParams();
    const { updateCanvasData } = useCanvasFragmentData();

    const persistPosition = async (nextX: number, nextY: number) => {
      if (!userid || !canvaid) {
        toast.warning("Missing user or canvas id — position not saved.");
        return;
      } else {
        const payload = {
          _id: _id,
          type: type,
          updateType: "XY_POSITIONS",
          x: Math.round(nextX),
          y: Math.round(nextY),
        };
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
        if (response.ok) {
          updateCanvasData();
        } else {
          const errBody = await response.json();
          toast.error(
            `Fragment position not saved: ${errBody?.message || "unknown error"}`,
          );
        }
      }
    };

    const { elementRef, handlePointerDown, handlePointerMove, handlePointerUp } =
      useFragmentDrag({
        worldX: worldX,
        worldY: worldY,
        onCommit: (nextX: number, nextY: number) => {
          persistPosition(nextX, nextY);
        },
      });

    return (
      <div
        ref={elementRef}
        className="data-component"
        data-fragment-id={String(_id)}
        style={{
          left: `${worldX}px`,
          top: `${worldY}px`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </div>
    );
  } catch (err: any) {
    console.warn(
      "Something went wrong inside DraggableFragment: ",
      err.message,
    );
  }
};

export default DraggableFragment;
