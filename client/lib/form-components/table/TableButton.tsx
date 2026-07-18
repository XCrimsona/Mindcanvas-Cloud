import Button from "../../components/form-elements/Button";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import "../../CanvasHub/comp-hub-data-components.css";

export const TableButton = () => {
  const { setTableToggle } = useFormComponentToggle();
  return (
    <Button
      id="table-comp"
      onClick={() => setTableToggle(true)}
      className={"fragment-icon-btn table-comp"}
      title="Add table fragment"
    >
      <img src="/Table.svg" alt="Table fragment" className="fragment-icon" />
    </Button>
  );
};
