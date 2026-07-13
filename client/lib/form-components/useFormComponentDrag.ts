// ─── PURPOSE ─────────────────────────────────────────────────────────
// useFormComponentDrag — pointer-based drag for a form-component
// (TextInputUnit, LinkInputUnit, ImageInputUnit, ...). Sibling of
// useFragmentDrag: same underlying mechanic (pointer capture, 3px
// threshold, scale read via [data-canvas-world]), but the drop side
// differs — form-components don't PATCH a DB record on drop, they
// just keep the world x/y in a caller-owned ref so it can be read
// at submit time.
//
// Also handles "centre on open": when isOpen flips true, the form
// element is positioned so its centre sits at the current screen
// centre translated to world coords. That way it appears at the
// user's current viewport middle regardless of pan/zoom.
//
// No clamp-to-bounds: infinite canvas has no bounds.
// ─────────────────────────────────────────────────────────────────────
import { MutableRefObject, useLayoutEffect, useRef } from "react";

const DRAG_THRESHOLD_PX = 3;

interface IViewportTransform {
  translateX: number;
  translateY: number;
  scale: number;
}

interface IDragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originWorldX: number;
  originWorldY: number;
  scaleAtStart: number;
  hasCrossedThreshold: boolean;
}

interface IUseFormComponentDragArgs {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  positionRef: MutableRefObject<{ x: number; y: number }>;
  isOpen: boolean;
}

const readViewportTransform = (element: HTMLElement): IViewportTransform => {
  const worldEl = element.closest<HTMLElement>("[data-canvas-world]");
  if (!worldEl) {
    //no viewport ancestor — treat as identity
    return { translateX: 0, translateY: 0, scale: 1 };
  } else {
    const transform = getComputedStyle(worldEl).transform;
    if (!transform || transform === "none") {
      return { translateX: 0, translateY: 0, scale: 1 };
    } else {
      try {
        const matrix = new DOMMatrix(transform);
        return {
          translateX: matrix.e,
          translateY: matrix.f,
          scale: matrix.a > 0 ? matrix.a : 1,
        };
      } catch (err: any) {
        console.warn(
          "useFormComponentDrag: could not parse world transform: ",
          err.message,
        );
        return { translateX: 0, translateY: 0, scale: 1 };
      }
    }
  }
};

const useFormComponentDrag = ({
  elementRef,
  positionRef,
  isOpen,
}: IUseFormComponentDragArgs) => {
  //Drag state persists across renders via useRef so pointerdown → move → up
  //share the same object even as the parent re-renders during typing.
  const dragStateRef = useRef<IDragState | null>(null);

  //Centre on open — one-shot per open cycle
  useLayoutEffect(() => {
    if (!isOpen) {
      //form closed; nothing to place
      return;
    } else {
      const element = elementRef.current;
      if (!element) {
        //element not yet mounted
        return;
      } else {
        const { translateX, translateY, scale } =
          readViewportTransform(element);
        const rect = element.getBoundingClientRect();
        const screenCentreX = window.innerWidth / 2;
        const screenCentreY = window.innerHeight / 2;
        //Solve: translateX + worldX * scale + rect.width / 2 = screenCentreX
        //(rect.width is already screen pixels, so we don't multiply by scale)
        const worldX = (screenCentreX - translateX - rect.width / 2) / scale;
        const worldY = (screenCentreY - translateY - rect.height / 2) / scale;
        positionRef.current = { x: worldX, y: worldY };
        element.style.left = `${worldX}px`;
        element.style.top = `${worldY}px`;
      }
    }
  }, [isOpen]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = elementRef.current;
    if (!element) {
      return;
    } else {
      const { scale } = readViewportTransform(element);
      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originWorldX: positionRef.current.x,
        originWorldY: positionRef.current.y,
        scaleAtStart: scale,
        hasCrossedThreshold: false,
      };
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const element = elementRef.current;
    if (!drag || !element) {
      return;
    } else if (drag.pointerId !== event.pointerId) {
      //different pointer — ignore (multi-touch guard)
      return;
    } else {
      const dxScreen = event.clientX - drag.startClientX;
      const dyScreen = event.clientY - drag.startClientY;
      if (!drag.hasCrossedThreshold) {
        const distance = Math.hypot(dxScreen, dyScreen);
        if (distance < DRAG_THRESHOLD_PX) {
          //still a click, not a drag yet — leave inputs interactive
          return;
        } else {
          element.setPointerCapture(event.pointerId);
          element.classList.add("dragging");
          drag.hasCrossedThreshold = true;
        }
      } else {
        //already dragging; nothing to arm
      }
      const dxWorld = dxScreen / drag.scaleAtStart;
      const dyWorld = dyScreen / drag.scaleAtStart;
      const nextX = drag.originWorldX + dxWorld;
      const nextY = drag.originWorldY + dyWorld;
      positionRef.current = { x: nextX, y: nextY };
      element.style.left = `${nextX}px`;
      element.style.top = `${nextY}px`;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
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
          //capture already released — nothing to do
        }
        element.classList.remove("dragging");
      } else {
        //never crossed threshold — a click, not a drag
      }
      dragStateRef.current = null;
    }
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};

export default useFormComponentDrag;
