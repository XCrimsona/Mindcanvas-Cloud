import Button from "../../components/form-elements/Button";
import "../../CanvasHub/comp-hub-data-components.css";

import { useFormComponentToggle } from "../FormComponentToggleContext";

export const ImageButton = () => {
  // Toggles Text state true or false to display or hide text component in DataContainer component.
  const { setImageToggle } = useFormComponentToggle();
  return (
    <Button
      id="image-comp"
      onClick={() => setImageToggle(true)}
      className={"image-comp"}
    >
      Image
    </Button>
  );
};
