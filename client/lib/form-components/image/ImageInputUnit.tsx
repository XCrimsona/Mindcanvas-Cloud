import React, { useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import { useCanvasFragmentData } from "../../canvas-data/CanvasFragmentDataContext";
import useFormComponentDrag from "../useFormComponentDrag";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./image.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const ImageInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) {
      return;
    } else {
      //normal path — continue rendering
    }
    const {
      setImageToggle,
      imageInputCompPosRef,
      imageInputCompRef,
      imageToggle,
    } = useFormComponentToggle();
    const { updateCanvasData } = useCanvasFragmentData();

    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useFormComponentDrag({
        elementRef: imageInputCompRef,
        positionRef: imageInputCompPosRef,
        isOpen: imageToggle,
      });

    const [newImageComponent, setNewImageComponent] = useState<any>({
      imageFolderPath: "",
    });

    const imageComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const imageFormData: any = {};
      if (newImageComponent.imageFolderPath) {
        imageFormData.pathtoimages = newImageComponent.imageFolderPath.replace(
          /"/g,
          "",
        );
      } else {
        //no path entered
      }
      imageFormData.type = "Images";

      if (imageInputCompPosRef.current.x >= 0) {
        imageFormData.x = imageInputCompPosRef.current.x;
      } else {
        //negative x
      }
      if (imageInputCompPosRef.current.y >= 0) {
        imageFormData.y = imageInputCompPosRef.current.y;
      } else {
        //negative y
      }

      if (
        !imageFormData.pathtoimages &&
        !imageFormData.type &&
        !imageFormData.x &&
        !imageFormData.y
      ) {
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
          if (response.message === "Not Authenticated") {
            redirectToSignIn();
          } else {
            //non-auth failure — surface toast below
          }
          toast.error("ImageCluster was not added!");
        }
      }
    };

    return (
      imageToggle && (
        <div
          className={"data-image-component"}
          ref={imageInputCompRef}
          style={{
            position: "absolute",
            left: `${imageInputCompPosRef.current.x}px`,
            top: `${imageInputCompPosRef.current.y}px`,
            color: "#fff",
            cursor: "move",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
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
