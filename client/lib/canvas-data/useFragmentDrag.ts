// ─── PURPOSE ─────────────────────────────────────────────────────────
// useFragmentDrag — imperative pointer-based drag for a single fragment.
//
// Contract (per project-guide/CANVAS-REDESIGN.md §5):
//   1. onPointerDown  → record start position, do NOT capture yet.
//                       Click-through on child elements (e.g. the "i"
//                       menu span) still works because pointer capture
//                       has not been claimed.
//   2. onPointerMove  → once movement exceeds DRAG_THRESHOLD_PX,
//                       claim setPointerCapture, mark dragging,
//                       and write element.style.left/top DIRECTLY
//                       (no React state per frame).
//   3. onPointerUp    → if we crossed the threshold, call onCommit(x, y)
//                       with world-coordinate final position. React state
//                       + API PATCH happen inside onCommit.
//
// Scale awareness:
//   Reads the current viewport zoom from the DOM by walking up to the
//   nearest [data-canvas-world] ancestor and pulling matrix.a off its
//   computed transform. No shared React context, no coupling to
//   CanvasViewport — the viewport just tags its world div.
// ─────────────────────────────────────────────────────────────────────
import { useRef } from "react";

const DRAG_THRESHOLD_PX = 3;

interface IDragOriginState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originWorldX: number;
  originWorldY: number;
  scaleAtStart: number;
  hasCrossedThreshold: boolean;
}

interface IUseFragmentDragArgs {
  worldX: number;
  worldY: number;
  onCommit: (nextX: number, nextY: number) => void;
}

const readViewportScale = (element: HTMLElement): number => {
  const worldEl = element.closest<HTMLElement>("[data-canvas-world]");
  if (!worldEl) {
    //no viewport ancestor — treat as 1:1 (safe default)
    return 1;
  } else {
    const transform = getComputedStyle(worldEl).transform;
    if (!transform || transform === "none") {
      return 1;
    } else {
      try {
        const matrix = new DOMMatrix(transform);
        if (matrix.a > 0) {
          return matrix.a;
        } else {
          return 1;
        }
      } catch (err: any) {
        console.warn(
          "useFragmentDrag: could not parse world transform: ",
          err.message,
        );
        return 1;
      }
    }
  }
};

const useFragmentDrag = ({
  worldX,
  worldY,
  onCommit,
}: IUseFragmentDragArgs) => {
  const dragRef = useRef<IDragOriginState | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = elementRef.current;
    if (!element) {
      return;
    } else {
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originWorldX: worldX,
        originWorldY: worldY,
        scaleAtStart: readViewportScale(element),
        hasCrossedThreshold: false,
      };
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const element = elementRef.current;
    if (!drag || !element) {
      return;
    } else if (drag.pointerId !== event.pointerId) {
      //different pointer, ignore (multi-touch guard)
      return;
    } else {
      const dxScreen = event.clientX - drag.startClientX;
      const dyScreen = event.clientY - drag.startClientY;

      if (!drag.hasCrossedThreshold) {
        const distance = Math.hypot(dxScreen, dyScreen);
        if (distance < DRAG_THRESHOLD_PX) {
          //still a click, not a drag yet
          return;
        } else {
          //crossed the threshold: claim capture and mark as dragging
          element.setPointerCapture(event.pointerId);
          element.classList.add("dragging");
          drag.hasCrossedThreshold = true;
        }
      } else {
        //already dragging; no additional setup needed
      }

      const dxWorld = dxScreen / drag.scaleAtStart;
      const dyWorld = dyScreen / drag.scaleAtStart;
      const nextX = drag.originWorldX + dxWorld;
      const nextY = drag.originWorldY + dyWorld;

      //imperative write — no React state during the drag
      element.style.left = `${nextX}px`;
      element.style.top = `${nextY}px`;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const element = elementRef.current;
    if (!drag || !element) {
      return;
    } else if (drag.pointerId !== event.pointerId) {
      return;
    } else {
      if (drag.hasCrossedThreshold) {
        if (element.hasPointerCapture(event.pointerId)) {
          element.releasePointerCapture(event.pointerId);
        } else {
          //capture already released; nothing to do
        }
        element.classList.remove("dragging");

        const dxScreen = event.clientX - drag.startClientX;
        const dyScreen = event.clientY - drag.startClientY;
        const nextX = drag.originWorldX + dxScreen / drag.scaleAtStart;
        const nextY = drag.originWorldY + dyScreen / drag.scaleAtStart;

        onCommit(nextX, nextY);
      } else {
        //never crossed threshold — treat as a click, do nothing
      }
      dragRef.current = null;
    }
  };

  return {
    elementRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};

export default useFragmentDrag;
