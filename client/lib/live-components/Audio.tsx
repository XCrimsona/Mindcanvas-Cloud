// import React from "react";
import { DivClass } from "../ui/Div";
import { LongText } from "../ui/LongText";
import "./frame-size.css";

export const ImmutableAudio = ({ data }: any) => {
  // Frame-size bucket class. Backend for Audio isn't wired yet, but the CSS
  // hook is in place: as soon as the fragment payload starts carrying
  // frameSize, the container will pick up the right bucket automatically.
  const { frameSize } = data || {};
  const frameSizeClass =
    frameSize === "small"
      ? " frame-size-small"
      : frameSize === "large"
        ? " frame-size-large"
        : " frame-size-medium";

  return (
    <DivClass className={"audio-info" + frameSizeClass}>
      <LongText className={"audio-name"}>{data.name}</LongText>
      <audio src={data.audio.src} className={"audio"} />
    </DivClass>
    // </Div>
  );
};
