import { DivClass } from "../../ui/Div";
// import ZoomControls from "./ZoomControls";
import HelpButton from "../help/HelpButton";
import "./canva-core-functionalities.css";

// Data Fragment buttons (Text/Link/Image/Table/Video) used to live in a
// togglable Component Hub window here. They now render permanently in
// CreationFragments.tsx, beneath the hamburger icon.
const CanvasCoreFunctionality = () => {
  return (
    <DivClass className={"workspace-core-functionalities"}>
      <DivClass className="center-content">
        <HelpButton />
      </DivClass>
    </DivClass>
  );
};

export default CanvasCoreFunctionality;
