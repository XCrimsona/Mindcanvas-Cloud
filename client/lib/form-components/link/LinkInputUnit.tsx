import React, { useLayoutEffect, useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./link.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const TextLinkInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) return;
    //activates link input form
    const {
      dataScrollBoardRef,
      globalDraggingRef,
      textLinkInputOffSet,
      setTextLinkToggle,
      //useref used to control the element's left with x and top with y canvas coordinates
      textLinkInputCompPosRef,
      textLinkInputCompRef,
      hasInitializedPositionRef,
      textLinkToggle,
      updateCanvasData,
    } = useCanvasContext();

    //Determines the web app width and height as perceived on screen and centers this exact file's UI in the middle of the screen.
    //It also re-centers by collraborating with another useEffect function which checks the boolean value to toggle the UI.
    useLayoutEffect(() => {
      if (
        !textLinkToggle ||
        hasInitializedPositionRef.current ||
        !dataScrollBoardRef.current ||
        !textLinkInputCompRef.current
      )
        return;

      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
      const textLinkInputElementRect =
        textLinkInputCompRef.current.getBoundingClientRect();

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const canvasX =
        viewportCenterX - boardRect.left - textLinkInputElementRect.width / 2;
      const canvasY =
        viewportCenterY - boardRect.top - textLinkInputElementRect.height / 2;

      //clamp to keep the elements inside the canvas
      const boundedX = Math.max(
        0,
        Math.min(canvasX, boardRect.width - textLinkInputElementRect.width),
      );
      const boundedY = Math.max(
        0,
        Math.min(canvasY, boardRect.height - textLinkInputElementRect.height),
      );

      const textLinkInputElement =
        textLinkInputCompRef.current as HTMLDivElement;

      //center textLinkInputUnit
      if (textLinkInputElement) {
        textLinkInputElement.style.left = `${boundedX}px`;
        textLinkInputElement.style.top = `${boundedY}px`;
      }

      hasInitializedPositionRef.current = true;
    }, [textLinkToggle]);

    // const { newTextComponent, setNewTextLinkComponent } = useNewTextLinkComponent();
    const [newTextLinkComponent, setNewTextLinkComponent] = useState<any>({
      link: "",
      text: "",
    });

    const [selectedType, setSelectedType] = useState<string>("TextLink"); //PURPOSE ???

    //submit http link
    const textLinkComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      //Checks if textLinkInputCompPosRef,newTextComponent and selectedType are not null
      const textLinkFormData: any = {};
      if (newTextLinkComponent.link)
        textLinkFormData.link = newTextLinkComponent.link;
      if (newTextLinkComponent.text)
        textLinkFormData.text = newTextLinkComponent.text;

      if (selectedType) textLinkFormData.type = selectedType;

      if (textLinkInputCompPosRef.current.x >= 0) {
        textLinkFormData.x = textLinkInputCompPosRef.current.x;
      }

      if (textLinkInputCompPosRef.current.y >= 0) {
        textLinkFormData.y = textLinkInputCompPosRef.current.y;
      }

      if (
        !textLinkFormData.link &&
        !textLinkFormData.text &&
        !textLinkFormData.type &&
        !textLinkFormData.x &&
        !textLinkFormData.y
      ) {
        //fires when the logic breaks
        toast.success("Complete the fields to continue");
        return;
      } else {
        if (!textLinkFormData.link.startsWith("http")) {
          toast.warning("Add http(s):// to your url");
          return;
        } else {
          const link = await fetch(
            `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(textLinkFormData),
            },
          );
          if (link.ok) {
            const response = await link.json();
            toast.success(response.message, { autoClose: 4000 });
            updateCanvasData();
          } else {
            const response = await link.json();
            if (response.message === "Not Authenticated")
              redirectToSignIn();
            toast.error(response.message, { autoClose: 4000 });
          }
        }
      }
    };

    const processTextLinkMouseMove = (event: React.MouseEvent) => {
      if (
        !globalDraggingRef.current ||
        !dataScrollBoardRef.current ||
        !textLinkInputCompRef.current
      )
        return;

      const textLinkInputElement =
        textLinkInputCompRef.current as HTMLDivElement;
      const textLinkInputElementRect =
        textLinkInputElement.getBoundingClientRect();
      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

      //mouse position inside the board
      const mouseInsideBoardX = event.clientX - boardRect.left;
      const mouseInsideBoardY = event.clientY - boardRect.top;

      //When we first click down, we store how far from the element's left and top the mouse was (textLinkInputOffSet.current.x/y)
      const newXElementLeft = mouseInsideBoardX - textLinkInputOffSet.current.x;
      const newYElementTop = mouseInsideBoardY - textLinkInputOffSet.current.y;

      // set boundaries so draggables dont go outside the drag frame
      const newPosX = Math.max(
        0,
        Math.min(
          newXElementLeft,
          boardRect.width - textLinkInputElementRect.width,
        ),
      );

      const newPosY = Math.max(
        0,
        Math.min(
          newYElementTop,
          boardRect.height - textLinkInputElementRect.height,
        ),
      );

      textLinkInputCompPosRef.current = {
        x: newPosX,
        y: newPosY,
      };

      if (textLinkInputElement) {
        textLinkInputElement.style.left = `${textLinkInputCompPosRef.current.x}px`;
        textLinkInputElement.style.top = `${textLinkInputCompPosRef.current.y}px`;
      }
    };
    const processTextLinkMouseUp = () => {
      globalDraggingRef.current = false;
      document.removeEventListener<any>("mousemove", processTextLinkMouseMove);
      document.removeEventListener<any>("mouseup", processTextLinkMouseUp);
      textLinkInputOffSet.current = {
        x: textLinkInputCompPosRef.current.x,
        y: textLinkInputCompPosRef.current.y,
      };
    };
    const processTextLinkMouseDown = (
      event: React.MouseEvent<HTMLDivElement>,
    ) => {
      globalDraggingRef.current = true;
      const textLinkElement = textLinkInputCompRef.current as HTMLDivElement;
      const textLinkElementRect = textLinkElement.getBoundingClientRect();
      //Store where inside the element-textLinkui the click happened
      textLinkInputOffSet.current = {
        x: event.clientX - textLinkElementRect.left,
        y: event.clientY - textLinkElementRect.top,
      };
      document.addEventListener<any>("mousemove", processTextLinkMouseMove);
      document.addEventListener<any>("mouseup", processTextLinkMouseUp);
    };

    //pin feature here has a double toggle bug, issue is not the end of the world altough its irritating

    return (
      textLinkToggle && (
        // add the pin true false feature
        <div
          className={"data-link-component"}
          ref={textLinkInputCompRef}
          style={{
            //DO NOT PUT THE PIN FEATURE HERE
            left: `${textLinkInputCompPosRef.current.x}px`,
            top: `${textLinkInputCompPosRef.current.y}px`,
            color: "#fff",
          }}
          onMouseDown={processTextLinkMouseDown}
        >
          <div className="absolute top-2 z-11 right-2 h-15 w-5 ">
            <span
              className="block cursor-pointer"
              onClick={() => setTextLinkToggle(false)}
            >
              ✕
            </span>
          </div>
          <form
            className={"link-input-form"}
            onSubmit={textLinkComponentFormData}
          >
            <DivClass className={"link-label-wrapper"}>
              <Label
                htmlfor="enabled-link-input-field"
                className={"link-label"}
                text="Create Link"
              />
            </DivClass>
            <DivClass className={"link-container"}>
              <DivClass className={"link-input-wrapper"}>
                <input
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoSave="off"
                  id="enabled-link-input-field"
                  placeholder="https://..."
                  className={"enabled-linkdescription-input-field"}
                  value={newTextLinkComponent.link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewTextLinkComponent({
                      ...newTextLinkComponent,
                      link: e.target.value,
                    });
                  }}
                />
                <EnabledTextAreaInput
                  id="enabled-linktext-input-field"
                  className={"enabled-link-input-field"}
                  value={newTextLinkComponent.text}
                  placeholder="What is the is about"
                  // href={newTextLinkComponent.link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewTextLinkComponent({
                      ...newTextLinkComponent,
                      text: e.target.value,
                    });
                  }}
                />
                <DivClass className={"link-btn-container"}>
                  <DivClass className={"link-submit-btn-container"}>
                    <Button
                      id="link-btn-clear"
                      className={"link-btn-clear"}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setNewTextLinkComponent({
                          ...newTextLinkComponent,
                          link: "",
                          text: "",
                        });
                      }}
                    >
                      CLEAR
                    </Button>
                    <Button id="link-btn-submit" className={"link-btn-submit"}>
                      SAVE
                    </Button>
                  </DivClass>
                  {/* <DivClass className={"link-selection-wrapper"}>
                    <div className="radio-group">
                      <input
                        type="radio"
                        checked
                        id="link-type-option-one"
                        className={"link-type-option-one"}
                        value={"TextLink"}
                        onChange={() => {
                          setSelectedType("TextLink");
                        }}
                        name="layout-format"
                      />
                      <label
                        className="link-type-label"
                        htmlFor="link-type-option-one"
                      >
                        Link
                      </label>
                    </div>
                  </DivClass> */}
                </DivClass>
              </DivClass>
            </DivClass>
          </form>
        </div>
      )
    );
  } catch (error) {
    console.warn("Error in LinkInputUnit: ", error);
    return (
      <DivClass className={"erro-message"}>
        An error occurred while loading the link input unit.
      </DivClass>
    );
  }
};

export default TextLinkInputUnit;
