import Button from "../../components/form-elements/Button";
import "../../CanvasHub/comp-hub-data-components.css";

import { useFormComponentToggle } from "../FormComponentToggleContext";

export const VideoButton = () => {
  // Toggles Video state true or false to display or hide video component in DataContainer component.
  const { setVideoToggle } = useFormComponentToggle();
  return (
    <Button
      id="video-comp"
      onClick={() => setVideoToggle(true)}
      className={"video-comp"}
    >
      Video
    </Button>
  );
};
