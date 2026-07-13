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
import "./link.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const TextLinkInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) {
      return;
    } else {
      //normal path — continue rendering
    }
    const {
      setTextLinkToggle,
      textLinkInputCompPosRef,
      textLinkInputCompRef,
      textLinkToggle,
    } = useFormComponentToggle();
    const { updateCanvasData } = useCanvasFragmentData();

    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useFormComponentDrag({
        elementRef: textLinkInputCompRef,
        positionRef: textLinkInputCompPosRef,
        isOpen: textLinkToggle,
      });

    const [newTextLinkComponent, setNewTextLinkComponent] = useState<any>({
      link: "",
      text: "",
    });

    const textLinkComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const textLinkFormData: any = {};
      if (newTextLinkComponent.link) {
        textLinkFormData.link = newTextLinkComponent.link;
      } else {
        //no link entered
      }
      if (newTextLinkComponent.text) {
        textLinkFormData.text = newTextLinkComponent.text;
      } else {
        //no text entered
      }
      textLinkFormData.type = "TextLink";

      if (textLinkInputCompPosRef.current.x >= 0) {
        textLinkFormData.x = textLinkInputCompPosRef.current.x;
      } else {
        //negative x
      }
      if (textLinkInputCompPosRef.current.y >= 0) {
        textLinkFormData.y = textLinkInputCompPosRef.current.y;
      } else {
        //negative y
      }

      if (
        !textLinkFormData.link &&
        !textLinkFormData.text &&
        !textLinkFormData.type &&
        !textLinkFormData.x &&
        !textLinkFormData.y
      ) {
        toast.success("Complete the fields to continue");
        return;
      } else {
        if (!textLinkFormData.link.startsWith("http")) {
          toast.warning("Add http(s):// to your url");
          return;
        } else {
          const link = await fetch(
            `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
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
            if (response.message === "Not Authenticated") {
              redirectToSignIn();
            } else {
              //non-auth failure — surface toast below
            }
            toast.error(response.message, { autoClose: 4000 });
          }
        }
      }
    };

    return (
      textLinkToggle && (
        <div
          className={"data-link-component"}
          ref={textLinkInputCompRef}
          style={{
            position: "absolute",
            left: `${textLinkInputCompPosRef.current.x}px`,
            top: `${textLinkInputCompPosRef.current.y}px`,
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
