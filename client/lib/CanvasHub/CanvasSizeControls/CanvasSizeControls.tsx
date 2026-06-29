import {
  InputDisabledText,
  InputEnabledText,
  InputSubmit,
} from "../../components/form-elements/dry-InputFormComponents";
import { DivClass } from "../../ui/Div";
import "./canva-controls.css";
import { LongText } from "../../ui/LongText";
import { useCanvasContext } from "../../form-components/canva-data-provider/CanvasDataContextProvider";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

//Dynamic canvas width and height
const CanvasSizeControls = () => {
  try {
    const {
      canvasData,
      updateCanvasData,
      canvasHeight,
      canvasWidth,
      setCanvasSizeHeight,
      setCanvasSizeWidth,
      canvasSizePropertiesToggle,
      setCanvasSizePropertiesToggle,
    } = useCanvasContext();
    const [updatedHeight, setUpdatedHeight] = useState<string>("");
    const [updatedWidth, setUpdatedWidth] = useState<string>("");
    const { userid, canvaid } = useParams();
    if (!userid) return;

    const sendcanvasPropertyUpdate = async () => {
      if (!updatedHeight || !updatedWidth) {
        toast.info("Update at least the heigh/width/both");
        return;
      } else {
        const newData: any = {};
        if (updatedHeight) newData.newHeight = updatedHeight;
        if (updatedWidth) newData.newWidth = updatedWidth;
        newData.type = "Canvaspace";
        newData.updateType = "size";
        const response = await fetch(
          `http://localhost:5176/api/account/${userid}/canvas-management/${canvaid}`,
          {
            method: "PATCH",
            credentials: "include",

            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
          },
        );
        if (response.ok) {
          updateCanvasData();
        } else {
          const error = await response.json();
          toast.warning(`canvas properties NOT updated: ${error.message}`);
        }
      }
    };
    return (
      <form
        className={"canvas-size-controls"}
        onSubmit={(e) => {
          e.preventDefault();
          if (!canvasHeight || !canvasWidth) {
            toast.info("Complete the canvas size fields");
            return;
          } else {
            sendcanvasPropertyUpdate();
          }
        }}
      >
        <LongText className={"canvas-controls-text"}>Resize Canvas</LongText>
        {/* make height and width editable and immutable */}
        <DivClass className={"height-container"}>
          {canvasSizePropertiesToggle ? (
            <>
              <span className="y-label">Height:</span>
              <InputEnabledText
                id="mutable-height"
                className={"mutable-height"}
                value={canvasHeight ? canvasHeight : ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setCanvasSizeHeight(event.target.value);
                  setUpdatedHeight(event.target.value);
                }}
                placeholder="Update height"
              />
            </>
          ) : (
            <>
              <span className="y-label">Height:</span>
              <InputDisabledText
                id="immutable-height"
                className={"immutable-height"}
                placeholder={
                  canvasData.data?.workspaceNameData?.canvaspace?.size
                    ?.height || "Not available"
                }
                value={
                  canvasData.data?.workspaceNameData?.canvaspace?.size
                    ?.height || ""
                }
              />
            </>
          )}
        </DivClass>
        <DivClass className={"width-container"}>
          {canvasSizePropertiesToggle ? (
            <>
              <label className="x-label">Width:</label>
              <InputEnabledText
                id="mutable-width"
                className={"mutable-width"}
                value={canvasWidth ? canvasWidth : ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  event.preventDefault();
                  setCanvasSizeWidth(event.target.value);
                  setUpdatedWidth(event.target.value);
                }}
                placeholder="Update width"
              />
            </>
          ) : (
            <>
              <span className="x-label">Width:</span>
              <InputDisabledText
                id="immutable-width"
                className={"immutable-width"}
                placeholder={
                  canvasData.data?.workspaceNameData?.canvaspace?.size?.width ||
                  "Not available"
                }
                value={
                  canvasData.data?.workspaceNameData?.canvaspace?.size?.width ||
                  ""
                }
              />
            </>
          )}
        </DivClass>
        <DivClass className={"toggle-visual-ops-wrapper"}>
          <div
            id="toggle-visual-ops"
            className={"toggle-visual-ops"}
            onClick={(e) => {
              e.preventDefault();
              setCanvasSizePropertiesToggle(!canvasSizePropertiesToggle);
            }}
          >
            {canvasSizePropertiesToggle ? "View Properies" : "Edit Properies"}
          </div>
        </DivClass>
        <DivClass className={"update-spacing-btn-wrapper opacity-80"}>
          {/* cursor-not-allowed */}
          <InputSubmit
            isdisabled={false}
            id="update"
            // style={{
            //   cursor:
            //     canvasWidth?.length === 0 || canvasHeight?.length === 0
            //       ? "cursor-not-allowed"
            //       : "cursor-pointer",
            // }}
            className={`update-spacing-btn ${
              canvasSizePropertiesToggle === false ||
              canvasWidth?.length === 0 ||
              canvasHeight?.length === 0
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            value="Update"
          />
        </DivClass>
      </form>
    );
  } catch (err: any) {
    console.warn(
      "Something went wrong inside canvasSizeControls: ",
      err.message,
    );
  }
};

export default CanvasSizeControls;

//update height and width for entire canvas
// const updatecanvasSizeProperties = async (
//   e: React.FormEvent<HTMLInputElement>
// ) => {
//   e.preventDefault();
//   const canvasSizeData: any = {};
//   if (canvasHeight) canvasSizeData.height = canvasHeight;
//   if (canvasWidth) canvasSizeData.width = canvasWidth;
//   if (!canvasSizeData.height || !canvasSizeData.width) {
//     alert("Please fill the canvas size property fields!");
//     return;
//   } else {
// const text = await fetch(
//   `http://localhost:3000/api/account/${source.accountid}/dashboard/canvas-management/canvas/${source.canvasid}/${source.canvasname}`,
//   {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(canvasSizeData),
//   }
// );
//   if (text.ok) {
//     //notification ok response
//     alert("Your text data has been saved!");
//   } else {
//     //notification failed response
//     alert("Failed to save your text data!");
//   }
// }
// console.log("demo ok");
