import React, { useLayoutEffect, useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./image.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const ImageInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) return;
    //activates image input form
    const {
      dataScrollBoardRef,
      globalDraggingRef,
      imageInputOffSet,
      setImageToggle,
      //useref used to control the element's left with x and top with y canvas coordinates
      imageInputCompPosRef,
      imageInputCompRef,
      hasInitializedPositionRef,
      imageToggle,
      updateCanvasData,
    } = useCanvasContext();

    //Determines the web app width and height as perceived on screen and centers this exact file's UI in the middle of the screen.
    //It also re-centers by collraborating with another useEffect function which checks the boolean value to toggle the UI.
    useLayoutEffect(() => {
      if (
        !imageToggle ||
        hasInitializedPositionRef.current ||
        !dataScrollBoardRef.current ||
        !imageInputCompRef.current
      )
        return;

      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
      const imageInputElementRect =
        imageInputCompRef.current.getBoundingClientRect();

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const canvasX =
        viewportCenterX - boardRect.left - imageInputElementRect.width / 2;
      const canvasY =
        viewportCenterY - boardRect.top - imageInputElementRect.height / 2;

      //clamp to keep the elements inside the canvas
      const boundedX = Math.max(
        0,
        Math.min(canvasX, boardRect.width - imageInputElementRect.width),
      );
      const boundedY = Math.max(
        0,
        Math.min(canvasY, boardRect.height - imageInputElementRect.height),
      );

      const imageInputElement = imageInputCompRef.current as HTMLDivElement;

      //center imageInputUnit
      if (imageInputElement) {
        imageInputElement.style.left = `${boundedX}px`;
        imageInputElement.style.top = `${boundedY}px`;
      }

      hasInitializedPositionRef.current = true;
    }, [imageToggle]);

    // const { newImageComponent, setNewImageComponent } = useNewImageComponent();
    const [newImageComponent, setNewImageComponent] = useState<any>({
      imageFolderPath: "",
    });

    //submit image Data
    const imageComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      //Checks if imageInputCompPosRef,newImageComponent and selectedType are not null
      const imageFormData: any = {};
      if (newImageComponent.imageFolderPath)
        imageFormData.pathtoimages = newImageComponent.imageFolderPath.replace(
          /"/g,
          "",
        );
      //assign dedicated type. usestate is not necessary
      imageFormData.type = "Images";

      if (imageInputCompPosRef.current.x >= 0) {
        imageFormData.x = imageInputCompPosRef.current.x;
      }

      if (imageInputCompPosRef.current.y >= 0) {
        imageFormData.y = imageInputCompPosRef.current.y;
      }

      if (
        !imageFormData.pathtoimages &&
        !imageFormData.type &&
        !imageFormData.x &&
        !imageFormData.y
      ) {
        //fires when the logic breaks
        toast.success("Image input block must be filled with suffcient data");
        return;
      } else {
        const image = await fetch(
          `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(imageFormData),
          },
        );
        if (image.ok) {
          toast.success("ImageCluster created");
          updateCanvasData();
        } else {
          const response = await image.json();
          if (response.message === "Not Authenticated") redirectToSignIn();
          toast.error("ImageCluster was not added!");
        }
      }
    };

    const processImageMouseMove = (event: React.MouseEvent) => {
      if (
        !globalDraggingRef.current ||
        !dataScrollBoardRef.current ||
        !imageInputCompRef.current
      )
        return;

      const imageInputElement = imageInputCompRef.current as HTMLDivElement;
      const imageInputElementRect = imageInputElement.getBoundingClientRect();
      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

      //mouse position inside the board
      const mouseInsideBoardX = event.clientX - boardRect.left;
      const mouseInsideBoardY = event.clientY - boardRect.top;

      //When we first click down, we store how far from the element's left and top the mouse was (imageInputOffSet.current.x/y)
      const newXElementLeft = mouseInsideBoardX - imageInputOffSet.current.x;
      const newYElementTop = mouseInsideBoardY - imageInputOffSet.current.y;

      // set boundaries so draggables dont go outside the drag frame
      const newPosX = Math.max(
        0,
        Math.min(
          newXElementLeft,
          boardRect.width - imageInputElementRect.width,
        ),
      );

      const newPosY = Math.max(
        0,
        Math.min(
          newYElementTop,
          boardRect.height - imageInputElementRect.height,
        ),
      );

      imageInputCompPosRef.current = {
        x: newPosX,
        y: newPosY,
      };

      if (imageInputElement) {
        imageInputElement.style.left = `${imageInputCompPosRef.current.x}px`;
        imageInputElement.style.top = `${imageInputCompPosRef.current.y}px`;
      }
    };
    const processImageMouseUp = () => {
      globalDraggingRef.current = false;
      document.removeEventListener<any>("mousemove", processImageMouseMove);
      document.removeEventListener<any>("mouseup", processImageMouseUp);
      imageInputOffSet.current = {
        x: imageInputCompPosRef.current.x,
        y: imageInputCompPosRef.current.y,
      };
    };
    const processImageMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      globalDraggingRef.current = true;
      const imageElement = imageInputCompRef.current as HTMLDivElement;
      const imageElementRect = imageElement.getBoundingClientRect();
      //Store where inside the element-imageui the click happened
      imageInputOffSet.current = {
        x: event.clientX - imageElementRect.left,
        y: event.clientY - imageElementRect.top,
      };
      document.addEventListener<any>("mousemove", processImageMouseMove);
      document.addEventListener<any>("mouseup", processImageMouseUp);
    };

    //pin feature here has a double toggle bug, issue is not the end of the world altough its irritating

    return (
      imageToggle && (
        // add the pin true false feature
        <div
          className={"data-image-component"}
          ref={imageInputCompRef}
          style={{
            //DO NOT PUT THE PIN FEATURE HERE
            position: "absolute",
            left: `${imageInputCompPosRef.current.x}px`,
            top: `${imageInputCompPosRef.current.y}px`,
            color: "#fff",
          }}
          onMouseDown={processImageMouseDown}
        >
          <div className="absolute top-2 z-11 right-2 h-15 w-5 ">
            <span
              className="block cursor-pointer"
              onClick={() => setImageToggle(false)}
            >
              ✕
            </span>
          </div>
          <form
            className={"image-input-form"}
            onSubmit={imageComponentFormData}
          >
            <DivClass className={"image-label-wrapper"}>
              <Label
                htmlfor="enabled-image-input-field"
                className={"image-label"}
                text="Create Image"
              />
            </DivClass>
            <DivClass className={"image-container"}>
              <DivClass className={"image-input-wrapper"}>
                <EnabledTextAreaInput
                  id="enabled-image-input-field"
                  className={"enabled-image-input-field"}
                  placeholder="OS folder Path to your images..."
                  value={newImageComponent.imageFolderPath}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewImageComponent({
                      ...newImageComponent,
                      imageFolderPath: e.target.value,
                    });
                  }}
                />
                <DivClass className={"image-btn-container"}>
                  <DivClass className={"image-submit-btn-container"}>
                    <Button
                      id="image-btn-clear"
                      className={"image-btn-clear"}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setNewImageComponent({
                          ...newImageComponent,
                          imageFolderPath: "",
                        });
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      id="image-btn-submit"
                      className={"image-btn-submit"}
                    >
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
    console.warn("Error in ImageInputUnit: ", error);
    return (
      <DivClass className={"erro-message"}>
        An error occurred while loading the image input unit.
      </DivClass>
    );
  }
};

export default ImageInputUnit;
