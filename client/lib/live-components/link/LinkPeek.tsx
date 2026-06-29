import React, { useEffect, useRef, useState } from "react";

/**
 * LinkPeek — hover-card "peek view" for TextLink fragments.
 *
 * Coordinate system: stays entirely in canvas space. The peek panel is rendered
 * as an absolutely-positioned child of the link's container, so it inherits the
 * same coordinate space as every other dragged fragment on the board — the
 * stored DB x/y on `.data-component` does the positioning, not a viewport rect.
 *
 * Why not getBoundingClientRect: drag positions round-trip through the DB. For
 * a frame or two after a save, a viewport-derived peek position can disagree
 * with the DB-restored fragment position and the panel looks like it jumps.
 * Reading from `closest('.data-component').style.left/top` is the same source
 * of truth the canvas uses for every other element.
 *
 * Opt-in: mount next to a link, pass href. Every prop is local — no other
 * component has to learn about peek view to keep working.
 */
//Framing strategies decide *how* the destination is presented inside the peek
//panel given its size at the user's chosen scale.
//
//  fit  — fixed panel; shrink scale so the whole destination + breathing room
//         fits inside PEEK_W × PEEK_H. Best when you want a stable hover-card
//         size and don't mind giving up some readability for big fragments.
//  pan  — fixed panel; keep user scale; anchor the destination's top-left
//         near the panel's top-left so the user always sees the *start* of
//         the content. Best when content has a meaningful beginning (text).
//  grow — variable panel; keep user scale; resize the panel to fit the
//         destination plus padding, clamped to [MIN..MAX]. Best when you want
//         to honor the user's preferred zoom regardless of content size.
//
//Defaulting to "grow" — that's the behavior the design just asked for: keep
//the rendered width the user already liked, expand the window to match.
type Framing = "fit" | "pan" | "grow";

interface LinkPeekProps {
  anchorRef: React.RefObject<HTMLElement>;
  href: string;
  //Per-id hover boolean controlled by the parent. The effect opens the peek
  //when this flips true and resets it when it flips false. Driving open/close
  //from external state (rather than addEventListener inside the effect) means
  //every link instance has its own hover signal tied to its own id — exactly
  //what the design needs for rehover behavior.
  hovered: boolean;
  enabled?: boolean;
  openDelayMs?: number;
  //Default lands in the "readable text, still shows surrounding fragments"
  //sweet spot. Clamp range [0.5, 0.9].
  scale?: number;
  framing?: Framing;
}

const PEEK_W = 280; //default panel width — used by fit/pan and as the "fit" target for grow
const PEEK_H = 190; //default panel height — same role
const GROW_MAX_W = 520; //ceiling for grow mode; above this the peek dominates the screen
const GROW_MAX_H = 380; //ceiling for grow mode; above this the peek scrolls off canvas
const GROW_MIN_W = 200; //floor for grow mode; below this the peek loses purpose
const GROW_MIN_H = 140; //floor for grow mode
const GROW_PADDING = 16; //breathing room around the destination inside grow's panel
const FIT_RATIO = 0.8; //how much of the fit-mode panel the destination is allowed to occupy
const PAN_PADDING = 12; //offset of destination top-left inside pan's panel

const DEFAULT_SCALE = 0.7;
const MIN_SCALE = 0.5;
const MAX_SCALE = 0.9;
const FLIP_THRESHOLD_PX = PEEK_H + 16; //if fragment sits closer than this to canvas top, flip peek below

//Pure geometry — what the framer needs and what it returns. Keeping these as
//types (not React state) means the strategy table below is testable in
//isolation and can be reasoned about without rendering anything.
interface FrameInput {
  destX: number;
  destY: number;
  destW: number;
  destH: number;
  userScale: number;
}
interface FrameResult {
  renderScale: number;
  panelW: number;
  panelH: number;
  tx: number;
  ty: number;
  showMarker: boolean;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const FRAMERS: Record<Framing, (i: FrameInput) => FrameResult> = {
  //Fit-the-window: shrink scale until the destination fits. Marker shown
  //because the destination shares the panel with surrounding fragments and
  //needs the highlight to stand out.
  fit: ({ destX, destY, destW, destH, userScale }) => {
    const fitScale = Math.min(
      (PEEK_W * FIT_RATIO) / destW,
      (PEEK_H * FIT_RATIO) / destH,
    );
    const renderScale = Math.min(userScale, fitScale);
    const cx = destX + destW / 2;
    const cy = destY + destH / 2;
    return {
      renderScale,
      panelW: PEEK_W,
      panelH: PEEK_H,
      tx: PEEK_W / 2 - renderScale * cx,
      ty: PEEK_H / 2 - renderScale * cy,
      showMarker: true,
    };
  },

  //Top-left anchor: keep scale, keep panel size, just frame the destination's
  //start. Marker hidden — the destination's own top edge is already aligned
  //with the panel's top edge, so an outline is redundant noise.
  pan: ({ destX, destY, userScale }) => ({
    renderScale: userScale,
    panelW: PEEK_W,
    panelH: PEEK_H,
    tx: PAN_PADDING - userScale * destX,
    ty: PAN_PADDING - userScale * destY,
    showMarker: false,
  }),

  //Grow-to-content: panel sizes itself around the destination at user scale.
  //Marker hidden because the destination IS the panel (minus padding) — the
  //user can't mistake what they're previewing.
  grow: ({ destX, destY, destW, destH, userScale }) => {
    const panelW = clamp(
      userScale * destW + GROW_PADDING * 2,
      GROW_MIN_W,
      GROW_MAX_W,
    );
    const panelH = clamp(
      userScale * destH + GROW_PADDING * 2,
      GROW_MIN_H,
      GROW_MAX_H,
    );
    const cx = destX + destW / 2;
    const cy = destY + destH / 2;
    return {
      renderScale: userScale,
      panelW,
      panelH,
      tx: panelW / 2 - userScale * cx,
      ty: panelH / 2 - userScale * cy,
      showMarker: false,
    };
  },
};

//Mindcanvas TextLink URL shape we care about for peek:
//  <origin>/account/<userid>/canvas-management/<canvaspaceId>/#<fragmentId>
//Anything missing the `canvas-management/<id>` segment is treated as opaque
//and falls through to the right-to-left segment probe (legacy/loose links).
interface ParsedLink {
  canvaspaceId: string | null;
  fragmentId: string | null;
}

const parseMindcanvasLink = (href: string): ParsedLink => {
  if (!href) return { canvaspaceId: null, fragmentId: null };
  const cmMatch = href.match(/canvas-management\/([^/#?]+)/);
  const canvaspaceId = cmMatch ? cmMatch[1] : null;
  const hashIdx = href.indexOf("#");
  const fragmentId = hashIdx >= 0 ? href.slice(hashIdx + 1) || null : null;
  return { canvaspaceId, fragmentId };
};

const currentCanvaspaceId = (): string | null => {
  if (typeof window === "undefined") return null;
  const m = window.location.pathname.match(/canvas-management\/([^/#?]+)/);
  return m ? m[1] : null;
};

//Fallback resolver for links that don't match the Mindcanvas shape: probe the
//hash first, then every path segment right-to-left until something on the
//current DOM matches.
const probeAnyElement = (href: string): HTMLElement | null => {
  if (!href) return null;
  const candidates: string[] = [];
  const [path, hash] = href.split("#");
  if (hash) candidates.push(hash);
  const segments = (path || "").split("/").filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) candidates.push(segments[i]);
  for (const c of candidates) {
    const el = document.getElementById(c);
    if (el) return el;
  }
  return null;
};

//Resolution result tells the panel both *what* to show and *why* it's empty
//when nothing can be cloned, so the user gets a real reason instead of black.
type Resolution =
  | { kind: "element"; el: HTMLElement }
  | { kind: "empty"; reason: string };

const resolvePeekTarget = (href: string): Resolution => {
  const { canvaspaceId, fragmentId } = parseMindcanvasLink(href);
  const here = currentCanvaspaceId();

  //Known Mindcanvas link → judge same-canvaspace vs cross-canvaspace explicitly.
  if (canvaspaceId) {
    if (here && canvaspaceId !== here) {
      return {
        kind: "empty",
        reason: "Destination is on a different canvaspace",
      };
    }
    if (!fragmentId) {
      return {
        kind: "empty",
        reason: "Link points to a canvaspace, not a fragment",
      };
    }
    const el = document.getElementById(fragmentId);

    if (el) return { kind: "element", el };
    return { kind: "empty", reason: "Fragment not found on this canvaspace" };
  }

  //Unknown shape → loose probe.
  const probed = probeAnyElement(href);
  if (probed) return { kind: "element", el: probed };
  return { kind: "empty", reason: "No preview available for this link" };
};

export const LinkPeek = ({
  anchorRef,
  href,
  hovered,
  enabled = true,
  openDelayMs = 220,
  scale = DEFAULT_SCALE,
  framing = "grow",
}: LinkPeekProps) => {
  //Clamp into [MIN_SCALE, MAX_SCALE]. Order matters — Math.max first lifts
  //anything below the floor, Math.min then caps it. Swapped order collapses
  //the result to a single bound.
  const effectiveScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  const [visible, setVisible] = useState<boolean>(false);
  const [placeBelow, setPlaceBelow] = useState<boolean>(true);
  const [emptyReason, setEmptyReason] = useState<string>("");
  //Panel dimensions live in state so the outer div can grow/shrink between
  //hovers. Stored as primitives so React's useState equality check bails out
  //when the framer returns the same numbers — no render churn for static UIs.
  const [panelW, setPanelW] = useState<number>(PEEK_W);
  const [panelH, setPanelH] = useState<number>(PEEK_H);
  const cloneHostRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<number | null>(null);

  //Effect #1: react to the hover signal only.
  //Other props (href, enabled, openDelayMs, scale, anchorRef) are read via
  //closure when the timer fires — they're stable across normal use and don't
  //need to re-tear-down this effect. `hovered` is the only signal that needs
  //to drive open/close, so it's the only thing in the dep list.
  useEffect(() => {
    if (!hovered) {
      //Mouse left → cancel any pending open and hide the panel. The clone
      //teardown is handled by effect #2's cleanup when `visible` flips false.
      if (openTimer.current) {
        window.clearTimeout(openTimer.current);
        openTimer.current = null;
      }
      setVisible(false);
      return;
    }

    //Mouse entered → schedule open after the delay. Decide flip direction
    //here (cheap; doesn't touch the host).
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      const anchor = anchorRef.current;
      if (anchor) {
        const wrapper = anchor.closest(".data-component") as HTMLElement | null;
        const topPx = wrapper ? parseFloat(wrapper.style.top || "0") : 0;
        setPlaceBelow(!wrapper || topPx < FLIP_THRESHOLD_PX);
      }
      setVisible(true);
    }, openDelayMs);

    return () => {
      if (openTimer.current) {
        window.clearTimeout(openTimer.current);
        openTimer.current = null;
      }
    };
  }, [hovered]);

  //Effect #2: mount the minimap clone once React has actually committed the
  //host div to the DOM. Running this in a `useEffect` keyed off `visible`
  //means the ref is guaranteed populated — no rAF gymnastics, no race with
  //React's commit phase. This is the fix for the "sometimes shows, sometimes
  //doesn't" flakiness: rAF doesn't promise React has rendered, but useEffect
  //after a render does.
  useEffect(() => {
    if (!enabled || !visible) return;
    const host = cloneHostRef.current;
    if (!host) return; //defense in depth — should never hit with useEffect timing.
    host.innerHTML = "";

    const resolution = resolvePeekTarget(href);
    if (resolution.kind === "empty") {
      setEmptyReason(resolution.reason);
      return;
    }

    const destWrapper = (
      resolution.el.classList.contains("data-component")
        ? resolution.el
        : resolution.el.closest(".data-component")
    ) as HTMLElement | null;
    if (!destWrapper) {
      setEmptyReason("Destination position not available");
      return;
    }

    const board = destWrapper.parentElement as HTMLElement | null;
    if (!board) {
      setEmptyReason("Canvas board not available");
      return;
    }

    setEmptyReason("");

    const destX = parseFloat(destWrapper.style.left || "0");
    const destY = parseFloat(destWrapper.style.top || "0");
    const destW = destWrapper.offsetWidth;
    const destH = destWrapper.offsetHeight;

    //Strategy dispatch. The framer owns all the geometry decisions; we just
    //apply its output to the DOM. Swapping framing strategies (via the prop
    //or by adding a new entry to FRAMERS) needs no changes here.
    const frame = FRAMERS[framing]({
      destX,
      destY,
      destW,
      destH,
      userScale: effectiveScale,
    });
    setPanelW(frame.panelW);
    setPanelH(frame.panelH);
    const { renderScale, tx, ty, showMarker } = frame;

    const clone = board.cloneNode(true) as HTMLElement;
    //Ids deliberately left intact on the clone — design needs them preserved
    //across rehovers. host.innerHTML clears the previous clone each open so
    //duplicate-id collisions only exist for the lifetime of one open panel.
    clone.style.position = "absolute";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.margin = "0";
    clone.style.pointerEvents = "none";

    clone.style.transformOrigin = "top left";
    clone.style.transform = `translate(${tx}px, ${ty}px) scale(${renderScale})`;
    host.appendChild(clone);

    //Marker only carries information in "fit" framing where the destination
    //shares the panel with neighboring fragments. In pan/grow the panel
    //*is* (or starts at) the destination, so a highlight is just noise.
    if (showMarker) {
      const marker = document.createElement("div");
      marker.style.position = "absolute";
      marker.style.left = `${tx + renderScale * destX}px`;
      marker.style.top = `${ty + renderScale * destY}px`;
      marker.style.width = `${renderScale * destW}px`;
      marker.style.height = `${renderScale * destH}px`;
      marker.style.outline = "1px solid #FAAA00";
      marker.style.boxShadow = "0 0 6px 1px #FAAA0080";
      marker.style.borderRadius = "3px";
      marker.style.pointerEvents = "none";
      host.appendChild(marker);
    }

    return () => {
      if (cloneHostRef.current) cloneHostRef.current.innerHTML = "";
    };
  }, [visible]);

  if (!enabled || !visible) return null;

  //Positioned absolutely inside the link's container. The container itself
  //already lives inside `.data-component` which carries the DB-stored
  //canvas-space x/y, so the peek inherits that coordinate system via CSS —
  //no rect snapshot, no jump on resave.
  const verticalStyle = placeBelow
    ? { top: "calc(100% + 8px)" }
    : { bottom: "calc(100% + 8px)" };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: panelW,
        height: panelH,
        zIndex: 12,
        background: "#000",
        boxShadow: "inset 0 0 4px 2px #FAAA0040, 0 0 6px 0 #FAAA0040",
        borderRadius: 6,
        overflow: "hidden",
        pointerEvents: "none",
        ...verticalStyle,
      }}
    >
      <div
        ref={cloneHostRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />
      {emptyReason && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            fontSize: 11,
            lineHeight: 1.3,
            textAlign: "center",
            color: "#FAAA00CC",
            pointerEvents: "none",
          }}
        >
          {emptyReason}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 6,
          bottom: 4,
          fontSize: 9,
          color: "#FAAA00CC",
          pointerEvents: "none",
        }}
      >
        peek
      </div>
    </div>
  );
};

export default LinkPeek;
