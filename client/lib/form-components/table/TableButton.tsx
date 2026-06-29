import Button from "../../components/form-elements/Button";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import "../../CanvasHub/comp-hub-data-components.css";

export const TableButton = () => {
  const { setTableToggle } = useCanvasContext();
  return (
    <Button
      id="table-comp"
      onClick={() => setTableToggle(true)}
      className={"text-comp"}
    >
      Table
    </Button>
  );
};
