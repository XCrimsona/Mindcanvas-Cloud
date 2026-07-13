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
import "./text.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const TextInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) {
      return;
    } else {
      //normal path — continue rendering
    }
    const {
      setTextToggle,
      textInputCompPosRef,
      textInputCompRef,
      textToggle,
    } = useFormComponentToggle();
    const { updateCanvasData } = useCanvasFragmentData();

    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useFormComponentDrag({
        elementRef: textInputCompRef,
        positionRef: textInputCompPosRef,
        isOpen: textToggle,
      });

    const [newTextComponent, setNewTextComponent] = useState<any>({
      text: "",
    });

    //submit text data
    const textComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const textFormData: any = {};
      if (newTextComponent.text) {
        textFormData.text = newTextComponent.text;
      } else {
        //no text entered; leave field unset so the check below fires
      }
      textFormData.type = "Text";

      if (textInputCompPosRef.current.x >= 0) {
        textFormData.x = textInputCompPosRef.current.x;
      } else {
        //negative x — leave unset
      }
      if (textInputCompPosRef.current.y >= 0) {
        textFormData.y = textInputCompPosRef.current.y;
      } else {
        //negative y — leave unset
      }

      if (
        !textFormData.text &&
        !textFormData.type &&
        !textFormData.x &&
        !textFormData.y
      ) {
        toast.success("Text input block must be filled with suffcient data");
        return;
      } else {
        const text = await fetch(
          `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
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
        } else {
          const response = await text.json();
          if (response.message === "Not Authenticated") {
            redirectToSignIn();
          } else {
            //non-auth failure — surface the generic toast below
          }
          toast.error("Text fragment was not added!");
        }
      }
    };

    return (
      textToggle && (
        <div
          className={"data-text-component"}
          ref={textInputCompRef}
          style={{
            position: "absolute",
            left: `${textInputCompPosRef.current.x}px`,
            top: `${textInputCompPosRef.current.y}px`,
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
                    <Button
                      id="text-btn-clear"
                      className={"text-btn-clear"}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setNewTextComponent({
                          ...newTextComponent,
                          text: "",
                        });
                      }}
                    >
                      CLEAR
                    </Button>
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
