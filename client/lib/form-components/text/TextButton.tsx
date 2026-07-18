import Button from "../../components/form-elements/Button";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import "../../CanvasHub/comp-hub-data-components.css";
export const TextButton = () => {
  // Toggles Text state true or false to display or hide text component in DataContainer component.
  const { setTextToggle } = useFormComponentToggle();
  return (
    <Button
      id="text-comp"
      onClick={() => setTextToggle(true)}
      className={"fragment-icon-btn text-comp"}
      title="Add text fragment"
    >
      <img src="/Text.svg" alt="Text fragment" className="fragment-icon" />
    </Button>
  );
};
