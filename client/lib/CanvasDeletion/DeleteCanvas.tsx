import { DivClass } from "../ui/Div";
import { useCanvasDeletionContext } from "../delete-data/CanvasDeletionOpsContext";
import Button from "../components/form-elements/Button";
import "./deletecanva.css";
import { LongText } from "../ui/LongText";
import { useCanvasContext } from "../form-components/canva-data-provider/CanvasDataContextProvider";

const DeleteCanvas = () => {
  const { canvasDeletionState, hitClickDelete, canvasDeletionToggle } =
    useCanvasDeletionContext();
  const { canvasData } = useCanvasContext();
  // console.log("log from Delete Canvas UI ops: live data: ", canvasData);

  return (
    canvasDeletionState && (
      <DivClass className={"workspace-deletion-interface"}>
        <LongText className={"text-deletion-warning"}>
          You are about to delete your workspace,{" "}
          {canvasData.data?.workspaceNameData?.workspaceTextName}! This
          operation cannot be reversed.
        </LongText>
        <DivClass className={"workspace-caution-ops"}>
          <DivClass className={"cancel-workspace-btn-wrapper"}>
            <Button
              id="cancel-workspace-btn"
              className={"cancel-workspace-btn"}
              onClick={canvasDeletionToggle}
            >
              Cancel
            </Button>
          </DivClass>
          <DivClass className={"delete-workspace-btn-wrapper"}>
            <Button
              id="delete-workspace-btn"
              className={"delete-workspace-btn"}
              onClick={hitClickDelete}
            >
              Delete Canvaspace
            </Button>
          </DivClass>
        </DivClass>
      </DivClass>
    )
  );
};

export default DeleteCanvas;
