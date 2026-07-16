import React, { useRef, useState } from "react";
import { DivClass } from "../../ui/Div";
import "./textlink-data-styling.css";
import "../frame-size.css";

import { ModificationWindow } from "../../modify-data/ModificationWindow";
import { EditWindow } from "../../modify-data/EditWindow";
import { TextLinkFragment } from "../../ui/TextLink";
import { LinkPeek } from "./LinkPeek";
import { SpanFragment } from "../../ui/spanElement";
import { TextFragment } from "../../ui/LongText";
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";

const TextLink = ({ data }: { data: any }) => {
  const { _id, type, frameSize } = data;
  // Frame-size bucket class. Baseline is "medium" — same rule as Text.tsx.
  const frameSizeClass =
    frameSize === "small"
      ? " frame-size-small"
      : frameSize === "large"
        ? " frame-size-large"
        : " frame-size-medium";
  const {
    modificationWindow,
    selectedComp,
    setSelectedComp,
    editState,
    setModificationWindow,
  } = useModificationContext();

  //Anchor ref for the peek-view hover card. Only used by <LinkPeek/>; the link
  //itself doesn't care that the ref exists, so nothing else changes shape.
  const linkAnchorRef = useRef<HTMLAnchorElement | null>(null);

  //Per-id hover boolean. Each TextLink instance owns its own, so the peek
  //opens for *this* link's id and resets when the mouse leaves *this* link.
  //LinkPeek's effect reacts to this prop flipping — no addEventListener
  //inside the peek, no shared global hover state.
  const [linkHovered, setLinkHovered] = useState<boolean>(false);

  const selectFragmentId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dataFragmentId = String((e.target as HTMLElement).id);
    setSelectedComp({
      dataFragmentId: dataFragmentId,
      type: type,
      info: "",
    });
    return;
  };

  return (
    <>
      {/* UI code implementation works in reverse but the css still displays 
          the context on the right next to the live data which is correct */}
      {modificationWindow && selectedComp.dataFragmentId === _id && (
        <ModificationWindow componentData={data} />
      )}
      {editState && selectedComp.dataFragmentId === _id && (
        <EditWindow componentData={data} />
      )}
      <DivClass className={"textlink-fragment-container" + frameSizeClass}>
        {/* <TextLinkFragmentFragment id={`${_id}`} href={data.href} className={"text-fragment"}> */}
        <TextFragment id={`${_id}`} className={"textlink-fragment"}>
          <SpanFragment
            id={`${data._id}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              selectFragmentId(e);
              setModificationWindow(true);
            }}
            className="i-note-drop-down"
          >
            i
          </SpanFragment>
          {/* below code needs to reference the same view mode capability from the dashboard page*/}
          {/* The target attribute as a custom input will act as the viewMode. */}
          {/* The purpose of viewMode for this link fragment is to toggle between two radio button options per fragmnet components's 
          id when the content is loaded and not when the link is created.This brings more fexibility. */}
          {/*
            viewMode wiring: data.target is "_self" or "_blank" (default "_self").
            When "_self", we intercept the click and scrollIntoView the matching
            fragment within the same canvaspace using block/inline "center" so the
            UI doesn't break around inner/slight-center positions (sidebar, top
            bar, ComponentHub overlays). If the destination id can't be resolved,
            we let the Link navigate as a fallback.
            When "_blank", react-router's Link respects the target attribute and
            opens a new tab as the user expects for external https links.
          */}
          <TextLinkFragment
            id={data._id}
            className="block text-[#FAAA00CC] underline"
            href={data.link}
            text={data.link}
            target={data.target === "_blank" ? "_blank" : "_self"}
            innerRef={linkAnchorRef}
            onMouseEnter={() => setLinkHovered(true)}
            onMouseLeave={() => setLinkHovered(false)}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (data.target === "_blank") return;
              const destinationId =
                (data.link || "").split("#").pop() ||
                (data.link || "").split("/").pop();
              if (!destinationId) return;
              const targetEl = document.getElementById(destinationId);
              if (!targetEl) return;
              e.preventDefault();
              targetEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
              });
            }}
          />
          {data.text}
        </TextFragment>
        {/*
          Peek view: shows a scaled-down clone of the destination fragment on
          hover so the user can preview without committing to the jump. Only
          active for in-canvas (_self) destinations — _blank links go to
          external URLs and have nothing on-page to clone.
        */}
        <LinkPeek
          anchorRef={linkAnchorRef}
          href={data.link}
          hovered={linkHovered}
          enabled={data.target !== "_blank"}
        />
      </DivClass>
    </>
  );
};

export default TextLink;
