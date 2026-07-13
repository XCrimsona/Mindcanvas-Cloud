import ComponentHub from "../ComponentHub/ComponentHub";
import { DivClass } from "../../ui/Div";
// import ZoomControls from "./ZoomControls";
import HelpButton from "../help/HelpButton";
import "./canva-core-functionalities.css";
import { ComponentHubProvider } from "../ComponentHubContextProvider";
import ComponentHubToggler from "../ComponentHub/ComponentHubToggler";

const CanvasCoreFunctionality = () => {
  return (
    <DivClass className={"workspace-core-functionalities"}>
      <DivClass className="center-content">
        <ComponentHubProvider>
          {/* <ComponentHubButton /> */}
          <DivClass className={"component-hub-container"}>
            <ComponentHubToggler />
          </DivClass>
          <ComponentHub />
        </ComponentHubProvider>
        <HelpButton />
      </DivClass>
    </DivClass>
  );
};

export default CanvasCoreFunctionality;
