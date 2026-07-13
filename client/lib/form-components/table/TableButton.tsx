import Button from "../../components/form-elements/Button";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import "../../CanvasHub/comp-hub-data-components.css";

export const TableButton = () => {
  const { setTableToggle } = useFormComponentToggle();
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
