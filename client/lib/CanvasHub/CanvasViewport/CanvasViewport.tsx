// ─── PURPOSE ─────────────────────────────────────────────────────────
// CanvasViewport — infinite-canvas viewport for MindCanvas.
//
// Ported from the standalone n8n-category-explainer prototype's
// CanvasViewport pattern. Deliberately content-agnostic: this file
// imports nothing from canvas-data / form-components / live-components,
// so the pan/zoom layer stays decoupled from what it wraps.
//
// WHAT IT DOES:
//   - Renders children inside a single transformed "world" div
//     (transform: translate(x, y) scale(scale))
//   - Wheel on the viewport zooms toward the cursor (not the centre),
//     so the point under the cursor stays put
//   - Pointer-down on empty viewport space pans; pointer-down that
//     lands on a child (an item) is ignored, so item-level drag /
//     click / edit handlers survive the migration unchanged
//
// REPLACES:
//   - The fixed manually-set data-scroll-board width/height
//     (see CanvaContainer.tsx legacy block) — no more 6000x7000
//     stopgap workspace; items just sit at their stored world-coords.
// ─────────────────────────────────────────────────────────────────────
import { ReactNode, useRef, useState } from "react";
import "./canvas-viewport.css";

interface ICanvasViewportState {
  x: number;
  y: number;
  scale: number;
}

interface ICanvasViewportProps {
  children: ReactNode;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.1;

const CanvasViewport = ({ children }: ICanvasViewportProps) => {
  try {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [viewport, setViewport] = useState<ICanvasViewportState>({
      x: 0,
      y: 0,
      scale: 1,
    });
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const panOriginRef = useRef<{
      pointerX: number;
      pointerY: number;
      startX: number;
      startY: number;
    } | null>(null);

    const clampScale = (nextScale: number) => {
      if (nextScale < MIN_SCALE) {
        return MIN_SCALE;
      } else if (nextScale > MAX_SCALE) {
        return MAX_SCALE;
      } else {
        return nextScale;
      }
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const viewportEl = viewportRef.current;
      if (!viewportEl) {
        return;
      } else {
        const rect = viewportEl.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;

        //cursor-anchored zoom: keep the world point under the cursor fixed
        const direction = event.deltaY < 0 ? 1 : -1;
        const nextScale = clampScale(viewport.scale + direction * ZOOM_STEP);
        if (nextScale === viewport.scale) {
          return;
        } else {
          const worldX = (pointerX - viewport.x) / viewport.scale;
          const worldY = (pointerY - viewport.y) / viewport.scale;
          const nextX = pointerX - worldX * nextScale;
          const nextY = pointerY - worldY * nextScale;
          setViewport({ x: nextX, y: nextY, scale: nextScale });
        }
      }
    };

    const isBackgroundTarget = (event: React.PointerEvent<HTMLDivElement>) => {
      //Only start a pan when the pointer is on the viewport background
      //(not on a rendered item). Item drag / click / edit handlers stay
      //untouched because their events are consumed before this fires.
      if (event.target === event.currentTarget) {
        return true;
      } else {
        return false;
      }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isBackgroundTarget(event)) {
        return;
      } else {
        event.currentTarget.setPointerCapture(event.pointerId);
        panOriginRef.current = {
          pointerX: event.clientX,
          pointerY: event.clientY,
          startX: viewport.x,
          startY: viewport.y,
        };
        setIsPanning(true);
      }
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning) {
        return;
      } else {
        const origin = panOriginRef.current;
        if (!origin) {
          return;
        } else {
          const dx = event.clientX - origin.pointerX;
          const dy = event.clientY - origin.pointerY;
          setViewport((previousState) => {
            return {
              x: origin.startX + dx,
              y: origin.startY + dy,
              scale: previousState.scale,
            };
          });
        }
      }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning) {
        return;
      } else {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } else {
          //nothing to release; pointer capture was never taken
        }
        panOriginRef.current = null;
        setIsPanning(false);
      }
    };

    return (
      <div
        ref={viewportRef}
        className={`canvas-viewport ${isPanning ? "is-panning" : ""}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="canvas-viewport-world"
          data-canvas-world="true"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          }}
        >
          {children}
        </div>
      </div>
    );
  } catch (err: any) {
    console.warn("Something went wrong inside CanvasViewport: ", err.message);
  }
};

export default CanvasViewport;
