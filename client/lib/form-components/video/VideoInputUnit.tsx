import React, { useLayoutEffect, useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./video.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const VideoInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) return;
    //activates video input form
    const {
      dataScrollBoardRef,
      globalDraggingRef,
      videoInputOffSet,
      setVideoToggle,
      //useref used to control the element's left with x and top with y canvas coordinates
      videoInputCompPosRef,
      videoInputCompRef,
      hasInitializedPositionRef,
      videoToggle,
      updateCanvasData,
    } = useCanvasContext();

    //Determines the web app width and height as perceived on screen and centers this exact file's UI in the middle of the screen.
    //It also re-centers by collraborating with another useEffect function which checks the boolean value to toggle the UI.
    useLayoutEffect(() => {
      if (
        !videoToggle ||
        hasInitializedPositionRef.current ||
        !dataScrollBoardRef.current ||
        !videoInputCompRef.current
      )
        return;

      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
      const videoInputElementRect =
        videoInputCompRef.current.getBoundingClientRect();

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const canvasX =
        viewportCenterX - boardRect.left - videoInputElementRect.width / 2;
      const canvasY =
        viewportCenterY - boardRect.top - videoInputElementRect.height / 2;

      //clamp to keep the elements inside the canvas
      const boundedX = Math.max(
        0,
        Math.min(canvasX, boardRect.width - videoInputElementRect.width),
      );
      const boundedY = Math.max(
        0,
        Math.min(canvasY, boardRect.height - videoInputElementRect.height),
      );

      const videoInputElement = videoInputCompRef.current as HTMLDivElement;

      //center videoInputUnit
      if (videoInputElement) {
        videoInputElement.style.left = `${boundedX}px`;
        videoInputElement.style.top = `${boundedY}px`;
      }

      hasInitializedPositionRef.current = true;
    }, [videoToggle]);

    // const { newVideoComponent, setNewVideoComponent } = useNewVideoComponent();
    const [newVideoComponent, setNewVideoComponent] = useState<any>({
      video: "",
    });

    //submit video Data
    const videoComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      //Checks if videoInputCompPosRef,newVideoComponent and selectedType are not null
      const videoFormData: any = {};
      if (newVideoComponent.video)
        videoFormData.video = newVideoComponent.video.replace(/"/g, "");
      //assign dedicated type. usestate is not necessary
      videoFormData.type = "Video";

      if (videoInputCompPosRef.current.x >= 0) {
        videoFormData.x = videoInputCompPosRef.current.x;
      }

      if (videoInputCompPosRef.current.y >= 0) {
        videoFormData.y = videoInputCompPosRef.current.y;
      }

      if (
        !videoFormData.video &&
        !videoFormData.type &&
        !videoFormData.x &&
        !videoFormData.y
      ) {
        //fires when the logic breaks
        toast.success("Video input block must be filled with suffcient data");
        return;
      } else {
        // console.log(videoFormData);
        // console.log("source data from VideoInputUnit: ", source);
        const video = await fetch(
          `http://localhost:5176/api/account/${userid}/canvas-management/${canvaid}`,
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
          if (response.message === "Not Authenticated") redirectToSignIn();
          toast.error("Video fragment was not added!");
        }
      }
    };

    const processVideoMouseMove = (event: React.MouseEvent) => {
      if (
        !globalDraggingRef.current ||
        !dataScrollBoardRef.current ||
        !videoInputCompRef.current
      )
        return;

      const videoInputElement = videoInputCompRef.current as HTMLDivElement;
      const videoInputElementRect = videoInputElement.getBoundingClientRect();
      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

      //mouse position inside the board
      const mouseInsideBoardX = event.clientX - boardRect.left;
      const mouseInsideBoardY = event.clientY - boardRect.top;

      //When we first click down, we store how far from the element's left and top the mouse was (videoInputOffSet.current.x/y)
      const newXElementLeft = mouseInsideBoardX - videoInputOffSet.current.x;
      const newYElementTop = mouseInsideBoardY - videoInputOffSet.current.y;

      // set boundaries so draggables dont go outside the drag frame
      const newPosX = Math.max(
        0,
        Math.min(
          newXElementLeft,
          boardRect.width - videoInputElementRect.width,
        ),
      );

      const newPosY = Math.max(
        0,
        Math.min(
          newYElementTop,
          boardRect.height - videoInputElementRect.height,
        ),
      );

      videoInputCompPosRef.current = {
        x: newPosX,
        y: newPosY,
      };

      if (videoInputElement) {
        videoInputElement.style.left = `${videoInputCompPosRef.current.x}px`;
        videoInputElement.style.top = `${videoInputCompPosRef.current.y}px`;
      }
    };
    const processVideoMouseUp = () => {
      globalDraggingRef.current = false;
      document.removeEventListener<any>("mousemove", processVideoMouseMove);
      document.removeEventListener<any>("mouseup", processVideoMouseUp);
      videoInputOffSet.current = {
        x: videoInputCompPosRef.current.x,
        y: videoInputCompPosRef.current.y,
      };
    };
    const processVideoMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      globalDraggingRef.current = true;
      const videoElement = videoInputCompRef.current as HTMLDivElement;
      const videoElementRect = videoElement.getBoundingClientRect();
      //Store where inside the element-videoui the click happened
      videoInputOffSet.current = {
        x: event.clientX - videoElementRect.left,
        y: event.clientY - videoElementRect.top,
      };
      document.addEventListener<any>("mousemove", processVideoMouseMove);
      document.addEventListener<any>("mouseup", processVideoMouseUp);
    };

    //pin feature here has a double toggle bug, issue is not the end of the world altough its irritating

    return (
      videoToggle && (
        // add the pin true false feature
        <div
          className={"data-video-component"}
          ref={videoInputCompRef}
          style={{
            //DO NOT PUT THE PIN FEATURE HERE
            position: "absolute",
            left: `${videoInputCompPosRef.current.x}px`,
            top: `${videoInputCompPosRef.current.y}px`,
            color: "#fff",
            zIndex: 4,
          }}
          onMouseDown={processVideoMouseDown}
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
                {/* {selectedType === "Video" ? ( */}
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
