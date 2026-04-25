import React, { useLayoutEffect, useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./text.css";

const TextInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) return;
    //activates text input form
    const {
      dataScrollBoardRef,
      globalDraggingRef,
      textInputOffSet,
      setTextToggle,
      //useref used to control the element's left with x and top with y canvas coordinates
      textInputCompPosRef,
      textInputCompRef,
      hasInitializedPositionRef,
      textToggle,
      updateCanvasData,
    } = useCanvasContext();

    //Determines the web app width and height as perceived on screen and centers this exact file's UI in the middle of the screen.
    //It also re-centers by collraborating with another useEffect function which checks the boolean value to toggle the UI.
    useLayoutEffect(() => {
      if (
        !textToggle ||
        hasInitializedPositionRef.current ||
        !dataScrollBoardRef.current ||
        !textInputCompRef.current
      )
        return;

      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
      const textInputElementRect =
        textInputCompRef.current.getBoundingClientRect();

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const canvasX =
        viewportCenterX - boardRect.left - textInputElementRect.width / 2;
      const canvasY =
        viewportCenterY - boardRect.top - textInputElementRect.height / 2;

      //clamp to keep the elements inside the canvas
      const boundedX = Math.max(
        0,
        Math.min(canvasX, boardRect.width - textInputElementRect.width),
      );
      const boundedY = Math.max(
        0,
        Math.min(canvasY, boardRect.height - textInputElementRect.height),
      );

      const textInputElement = textInputCompRef.current as HTMLDivElement;

      //center textInputUnit
      if (textInputElement) {
        textInputElement.style.left = `${boundedX}px`;
        textInputElement.style.top = `${boundedY}px`;
      }

      hasInitializedPositionRef.current = true;
    }, [textToggle]);

    // const { newTextComponent, setNewTextComponent } = useNewTextComponent();
    const [newTextComponent, setNewTextComponent] = useState<any>({
      text: "",
    });

    //submit text Data
    const textComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      //Checks if textInputCompPosRef,newTextComponent and selectedType are not null
      const textFormData: any = {};
      if (newTextComponent.text) textFormData.text = newTextComponent.text;
      //assign dedicated type. usestate is not necessary
      textFormData.type = "Text";

      if (textInputCompPosRef.current.x >= 0) {
        textFormData.x = textInputCompPosRef.current.x;
      }

      if (textInputCompPosRef.current.y >= 0) {
        textFormData.y = textInputCompPosRef.current.y;
      }

      if (
        !textFormData.text &&
        !textFormData.type &&
        !textFormData.x &&
        !textFormData.y
      ) {
        //fires when the logic breaks
        toast.success("Text input block must be filled with suffcient data");
        return;
      } else {
        const text = await fetch(
          `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(textFormData),
          },
        );
        if (text.ok) {
          toast.success("Text data fragment created");
          updateCanvasData();
          setNewTextComponent({
            ...newTextComponent,
            text: "",
          });
        } else {
          toast.success("Text fragment was not added!");
        }
      }
    };

    const processTextMouseMove = (event: React.MouseEvent) => {
      if (
        !globalDraggingRef.current ||
        !dataScrollBoardRef.current ||
        !textInputCompRef.current
      )
        return;

      const textInputElement = textInputCompRef.current as HTMLDivElement;
      const textInputElementRect = textInputElement.getBoundingClientRect();
      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

      //mouse position inside the board
      const mouseInsideBoardX = event.clientX - boardRect.left;
      const mouseInsideBoardY = event.clientY - boardRect.top;

      //When we first click down, we store how far from the element's left and top the mouse was (textInputOffSet.current.x/y)
      const newXElementLeft = mouseInsideBoardX - textInputOffSet.current.x;
      const newYElementTop = mouseInsideBoardY - textInputOffSet.current.y;

      // set boundaries so draggables dont go outside the drag frame
      const newPosX = Math.max(
        0,
        Math.min(newXElementLeft, boardRect.width - textInputElementRect.width),
      );

      const newPosY = Math.max(
        0,
        Math.min(
          newYElementTop,
          boardRect.height - textInputElementRect.height,
        ),
      );

      textInputCompPosRef.current = {
        x: newPosX,
        y: newPosY,
      };

      if (textInputElement) {
        textInputElement.style.left = `${textInputCompPosRef.current.x}px`;
        textInputElement.style.top = `${textInputCompPosRef.current.y}px`;
      }
    };
    const processTextMouseUp = () => {
      globalDraggingRef.current = false;
      document.removeEventListener<any>("mousemove", processTextMouseMove);
      document.removeEventListener<any>("mouseup", processTextMouseUp);
      textInputOffSet.current = {
        x: textInputCompPosRef.current.x,
        y: textInputCompPosRef.current.y,
      };
    };
    const processTextMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      globalDraggingRef.current = true;
      const textElement = textInputCompRef.current as HTMLDivElement;
      const textElementRect = textElement.getBoundingClientRect();
      //Store where inside the element-textui the click happened
      textInputOffSet.current = {
        x: event.clientX - textElementRect.left,
        y: event.clientY - textElementRect.top,
      };
      document.addEventListener<any>("mousemove", processTextMouseMove);
      document.addEventListener<any>("mouseup", processTextMouseUp);
    };

    return (
      textToggle && (
        <div
          className={"data-text-component"}
          ref={textInputCompRef}
          style={{
            //DO NOT PUT THE PIN FEATURE HERE
            position: "absolute",
            left: `${textInputCompPosRef.current.x}px`,
            top: `${textInputCompPosRef.current.y}px`,
            color: "#fff",
          }}
          onMouseDown={processTextMouseDown}
        >
          <div className="absolute top-2 z-11 right-2 h-15 w-5 ">
            <span
              className="block cursor-pointer"
              onClick={() => setTextToggle(false)}
            >
              ✕
            </span>
          </div>
          <form className={"text-input-form"} onSubmit={textComponentFormData}>
            <DivClass className={"text-label-wrapper"}>
              <Label
                htmlfor="enabled-text-input-field"
                className={"text-label"}
                text="Create Text"
              />
            </DivClass>
            <DivClass className={"text-container"}>
              <DivClass className={"text-input-wrapper"}>
                <EnabledTextAreaInput
                  id="enabled-text-input-field"
                  className={"enabled-text-input-field"}
                  placeholder="Your new text..."
                  value={newTextComponent.text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewTextComponent({
                      ...newTextComponent,
                      text: e.target.value,
                    });
                  }}
                />
                <DivClass className={"text-btn-container"}>
                  <DivClass className={"text-submit-btn-container"}>
                    <Button id="text-btn-submit" className={"text-btn-submit"}>
                      SAVE
                    </Button>
                  </DivClass>
                </DivClass>
              </DivClass>
            </DivClass>
          </form>
        </div>
      )
    );
  } catch (error) {
    console.warn("Error in TextInputUnit: ", error);
    return (
      <DivClass className={"erro-message"}>
        An error occurred while loading the text input unit.
      </DivClass>
    );
  }
};

export default TextInputUnit;
