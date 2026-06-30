//File currently has no purpose in app
import "./zoom-controls.css";
import { DivClass } from "../../ui/Div";
import { LongText } from "../../ui/LongText";
import SVG from "../../SVG";

const ZoomControls = () => {
  return (
    <DivClass className={"zoom-controls-container"}>
      <DivClass className={"zoom-controls"}>
        <DivClass className={"zoom-in-wrapper"}>
          <SVG
            src="/zoom-in.svg"
            className={"btn-zoom-in"}
            alt="Component Hub Icon"
          />
        </DivClass>
        <DivClass className={"zoom-out-wrapper"}>
          <SVG
            src="/zoom-out.svg"
            className={"btn-zoom-out"}
            alt="Component Hub Icon"
          />
        </DivClass>
      </DivClass>
      <DivClass className={"zoom-controls-text-wrapper"}>
        <LongText className={"zoom-controls-text"}>Zoom controls</LongText>
      </DivClass>
    </DivClass>
  );
};

export default ZoomControls;
