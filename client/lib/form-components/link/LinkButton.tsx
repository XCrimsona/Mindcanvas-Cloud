import Button from "../../components/form-elements/Button";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import "../../CanvasHub/comp-hub-data-components.css";
export const LinkButton = () => {
  // Toggles Link state true or false to display or hide link component in DataContainer component.
  const { setTextLinkToggle } = useFormComponentToggle();
  return (
    <Button
      id="textlink-comp"
      onClick={() => setTextLinkToggle(true)}
      className={"textlink-comp"}
    >
      Link
    </Button>
  );
};
