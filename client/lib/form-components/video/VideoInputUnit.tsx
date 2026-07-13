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
import "./video.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const VideoInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) {
      return;
    } else {
      //normal path — continue rendering
    }
    const {
      setVideoToggle,
      videoInputCompPosRef,
      videoInputCompRef,
      videoToggle,
    } = useFormComponentToggle();
    const { updateCanvasData } = useCanvasFragmentData();

    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useFormComponentDrag({
        elementRef: videoInputCompRef,
        positionRef: videoInputCompPosRef,
        isOpen: videoToggle,
      });

    const [newVideoComponent, setNewVideoComponent] = useState<any>({
      video: "",
    });

    const videoComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const videoFormData: any = {};
      if (newVideoComponent.video) {
        videoFormData.video = newVideoComponent.video.replace(/"/g, "");
      } else {
        //no video path entered
      }
      videoFormData.type = "Video";

      if (videoInputCompPosRef.current.x >= 0) {
        videoFormData.x = videoInputCompPosRef.current.x;
      } else {
        //negative x
      }
      if (videoInputCompPosRef.current.y >= 0) {
        videoFormData.y = videoInputCompPosRef.current.y;
      } else {
        //negative y
      }

      if (
        !videoFormData.video &&
        !videoFormData.type &&
        !videoFormData.x &&
        !videoFormData.y
      ) {
        toast.success("Video input block must be filled with suffcient data");
        return;
      } else {
        const video = await fetch(
          `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(videoFormData),
          },
        );
        if (video.ok) {
          toast.success("Video data fragment created");
          updateCanvasData();
        } else {
          const response = await video.json();
          if (response.message === "Not Authenticated") {
            redirectToSignIn();
          } else {
            //non-auth failure — surface toast below
          }
          toast.error("Video fragment was not added!");
        }
      }
    };

    return (
      videoToggle && (
        <div
          className={"data-video-component"}
          ref={videoInputCompRef}
          style={{
            position: "absolute",
            left: `${videoInputCompPosRef.current.x}px`,
            top: `${videoInputCompPosRef.current.y}px`,
            color: "#fff",
            zIndex: 4,
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
              onClick={() => setVideoToggle(false)}
            >
              ✕
            </span>
          </div>
          <form
            className={"video-input-form"}
            onSubmit={videoComponentFormData}
          >
            <DivClass className={"video-label-wrapper"}>
              <Label
                htmlfor="enabled-video-input-field"
                className={"video-label"}
                text="Create Video"
              />
            </DivClass>
            <DivClass className={"video-container"}>
              <DivClass className={"video-input-wrapper"}>
                <EnabledTextAreaInput
                  id="enabled-video-input-field"
                  className={"enabled-video-input-field"}
                  placeholder="Video location/path on your OS..."
                  value={newVideoComponent.video}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewVideoComponent({
                      ...newVideoComponent,
                      video: e.target.value,
                    });
                  }}
                />
                <DivClass className={"video-btn-container"}>
                  <DivClass className={"video-submit-btn-container"}>
                    <Button
                      id="video-btn-clear"
                      className={"video-btn-clear"}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setNewVideoComponent({
                          ...newVideoComponent,
                          video: "",
                        });
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      id="video-btn-submit"
                      className={"video-btn-submit"}
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
    console.warn("Error in VideoInputUnit: ", error);
    return (
      <DivClass className={"erro-message"}>
        An error occurred while loading the video input unit.
      </DivClass>
    );
  }
};

export default VideoInputUnit;
