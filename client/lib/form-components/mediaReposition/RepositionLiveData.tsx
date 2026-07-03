import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import "./repositionUnit.css";
import Button from "../../components/form-elements/Button";
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { SpanFragment } from "../../../../../../ui/spanElement";
import { useLayoutEffect, useState } from "react";

//reposition live data
//repositionInputOffSet,repositionInputCompPosRef,repositionInputCompRef,repositionWindowToggle
const RepositionLiveData = () => {
  const {
    dataScrollBoardRef,
    globalDraggingRef,

    repositionWindow,
    repositionInputOffSet,
    repositionInputCompPosRef,
    repositionInputCompRef,
    repositionData,
    hasInitializedPositionRef,
    setRepositionWindow,
    updateCanvasData,
  } = useCanvasContext();

  const [repositionFragmentData, setMediaFragmentData] = useState<any>({
    type: "",
    updateType: "",
    x: Number,
    y: Number,
  });
  const { userid, canvaid } = useParams();
  if (!userid) return;
  const { setModificationWindow, selectedComp } = useModificationContext();

  useLayoutEffect(() => {
    if (
      !dataScrollBoardRef.current ||
      !repositionWindow ||
      !repositionInputCompRef.current ||
      hasInitializedPositionRef.current
    )
      return;

    const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
    const repositionInputElementRect =
      repositionInputCompRef.current.getBoundingClientRect();

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    const canvasX =
      viewportCenterX - boardRect.left - repositionInputElementRect.width / 2;
    const canvasY =
      viewportCenterY - boardRect.top - repositionInputElementRect.height / 2;

    //clamp to keep the elements inside the canvas
    const boundedX = Math.max(
      0,
      Math.min(canvasX, boardRect.width - repositionInputElementRect.width),
    );
    const boundedY = Math.max(
      0,
      Math.min(canvasY, boardRect.height - repositionInputElementRect.height),
    );

    const textInputElement = repositionInputCompRef.current as HTMLDivElement;

    //center textInputUnit
    if (textInputElement) {
      textInputElement.style.left = `${boundedX}px`;
      textInputElement.style.top = `${boundedY}px`;
    }

    hasInitializedPositionRef.current = true;
  }, [repositionWindow]);

  const processMediaMouseMove = (event: React.MouseEvent) => {
    if (
      !globalDraggingRef.current ||
      !dataScrollBoardRef.current ||
      !repositionInputCompRef.current
    )
      return;

    const repositionInputElement =
      repositionInputCompRef.current as HTMLDivElement;
    const textInputElementRect = repositionInputElement.getBoundingClientRect();
    const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

    //mouse position inside the board
    const mouseInsideBoardX = event.clientX - boardRect.left;
    const mouseInsideBoardY = event.clientY - boardRect.top;

    //When we first click down, we store how far from the element's left and top the mouse was (textInputOffSet.current.x/y)
    const newXElementLeft = mouseInsideBoardX - repositionInputOffSet.current.x;
    const newYElementTop = mouseInsideBoardY - repositionInputOffSet.current.y;

    // set boundaries so draggables dont go outside the drag frame
    const newPosX = Math.max(
      0,
      Math.min(newXElementLeft, boardRect.width - textInputElementRect.width),
    );
    const newPosY = Math.max(
      0,
      Math.min(newYElementTop, boardRect.height - textInputElementRect.height),
    );

    repositionInputCompPosRef.current = {
      x: newPosX,
      y: newPosY,
    };

    if (repositionInputElement) {
      repositionInputElement.style.left = `${repositionInputCompPosRef.current.x}px`;
      repositionInputElement.style.top = `${repositionInputCompPosRef.current.y}px`;
    }
  };
  const processMediaMouseUp = () => {
    globalDraggingRef.current = false;
    document.removeEventListener<any>("mousemove", processMediaMouseMove);
    document.removeEventListener<any>("mouseup", processMediaMouseUp);
    repositionInputOffSet.current = {
      x: repositionInputCompPosRef.current.x,
      y: repositionInputCompPosRef.current.y,
    };
    setMediaFragmentData({
      ...repositionFragmentData,
      x: repositionInputCompPosRef.current.x,
      y: repositionInputCompPosRef.current.y,
    });
  };
  const processMediaMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    globalDraggingRef.current = true;
    const repositionElement = repositionInputCompRef.current as HTMLDivElement;
    const repositionElementRect = repositionElement.getBoundingClientRect();
    //Store where inside the element-textui the click happened
    repositionInputOffSet.current = {
      x: event.clientX - repositionElementRect.left,
      y: event.clientY - repositionElementRect.top,
    };
    document.addEventListener<any>("mousemove", processMediaMouseMove);
    document.addEventListener<any>("mouseup", processMediaMouseUp);
  };

  const elementId = selectedComp.dataFragmentId;

  let info: any = {};
  if (repositionData.fragmentText) {
    info.text = repositionData.fragmentText;
  }
  const position: any = { x: 0, y: 0 };
  if (repositionInputCompPosRef.current.x >= 0) {
    position.x = Number(repositionInputCompPosRef.current.x);
  }
  if (repositionInputCompPosRef.current.y >= 0) {
    position.y = Number(repositionInputCompPosRef.current.y);
  }

  //submit Data
  const updateMediaFragmentCoordinates = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    //Checks if textInputCompPosRef,newTextComponent and selectedType are not null
    const repositionData: any = {
      _id: selectedComp.dataFragmentId,
      type: selectedComp.type,
      updateType: "XY_POSITIONS",
      x: position.x,
      y: position.y,
    };

    if (repositionData.x === 0 && repositionData.y === 0) {
      toast.info("Move your data to a new location inside the current canvas", {
        autoClose: 10000,
      });
    } else if (
      !repositionData._id &&
      !repositionData.type &&
      !repositionData.updateType
    ) {
      //fires if the logic is broken
      toast.warning("Media data is missing, investigate anomaly!");
      return;
    } else {
      const repositionUpdateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(repositionData),
        },
      );
      if (repositionUpdateResponse.ok) {
        //notification ok response
        updateCanvasData();
        //resets the element value
      } else {
        const res = await repositionUpdateResponse.json();
        toast.error(`Fragment XY data not updated: ${res.message}`);
        return;
      }
    }
  };

  return (
    repositionWindow && (
      <div
        className={"reposition-fragment-container"}
        ref={repositionInputCompRef}
        style={{
          position: "absolute",
          color: "#fff",
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={processMediaMouseDown}
      >
        <p id={elementId} className="reposition-fragment">
          {info.text}
          {info.link}
        </p>
        <Button
          id={String(elementId)}
          onClick={updateMediaFragmentCoordinates}
          className="reposition-fragment-button"
        >
          Update Coordinates
        </Button>
        <Button
          id={String(elementId)}
          onClick={() => {
            setRepositionWindow(false);
            hasInitializedPositionRef.current = false;
            repositionInputCompPosRef.current.x = 0;
            repositionInputCompPosRef.current.y = 0;
            setModificationWindow(true);
          }}
          className="reposition-fragment-button"
        >
          I'm done
        </Button>
      </div>
    )
  );
};

export default RepositionLiveData;
