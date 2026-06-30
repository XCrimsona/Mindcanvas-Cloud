import Button from "../../components/form-elements/Button";
import "../../CanvasHub/comp-hub-data-components.css";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";

export const AudioButton = () => {
  //Toggles Audio state true or false to display or hide audio component in DataContainer component.
  const { setAudioToggle } = useCanvasContext();
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
