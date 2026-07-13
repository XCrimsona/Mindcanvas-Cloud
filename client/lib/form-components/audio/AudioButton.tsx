import Button from "../../components/form-elements/Button";
import "../../CanvasHub/comp-hub-data-components.css";
import { useFormComponentToggle } from "../FormComponentToggleContext";

export const AudioButton = () => {
  //Toggles Audio state true or false to display or hide audio component in DataContainer component.
  const { setAudioToggle } = useFormComponentToggle();
  return (
    <Button
      id="audio-comp"
      onClick={() => setAudioToggle(true)}
      className={"audio-comp"}
    >
      Audio
    </Button>
  );
};
