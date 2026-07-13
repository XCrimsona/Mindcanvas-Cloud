import React, { useState } from "react";
import "./primary-controls.css";
import { DivClass } from "../../ui/Div";
import Button from "../../components/form-elements/Button";
import { InputDisabledText } from "../../components/form-elements/dry-InputFormComponents";
import SVG from "../../SVG";
import { useMaskSensitiveData } from "../MaskSensitiveData";
import { useCanvasFragmentData } from "../../canvas-data/CanvasFragmentDataContext";
import { useCanvasDeletionContext } from "../../delete-data/CanvasDeletionOpsContext";
import { useParams } from "react-router-dom";

const PrimaryControlsAndDetails = () => {
  try {
    const { canvaid } = useParams();
    const { canvasDeletionToggle } = useCanvasDeletionContext();
    const { canvasData, updateCanvasData } = useCanvasFragmentData();
    // console.log("log from Delete Canvas UI ops: live data: ", canvasData);

    //refresh content without reload
    const refresh = async () => {
      updateCanvasData();
    };

    //hides important canva data with wild cards(*)
    const { maskSensitiveData } = useMaskSensitiveData();

    //Clipboard feature - attaches the canva-name to the clipboard
    const copyCanvasName = async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const name = canvasData.data?.workspaceNameData?.workspaceName;
      await window.navigator.clipboard.writeText(name);
      new Notification("Copied to clipboard");
      return;
    };
    //Clipboard feature - attaches the canva-id to the clipboard
    const copycanvaid = async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      await window.navigator.clipboard.writeText(String(canvaid));
      new Notification("Copied to clipboard");
      return;
    };

    //hides senstive data as default
    const [securityVisualToggleName, setSecurityVisualToggleName] =
      useState<boolean>(false);
    const [securityVisualToggleId, setSecurityVisualToggleId] =
      useState<boolean>(false);

    //Eye icon tells hidden or displayed data. Default is masked/hidden eye
    const [toggleCanvasNameEye, setToggleCanvasNameEye] =
      useState<boolean>(false);
    const [togglecanvasidEye, setTogglecanvasidEye] = useState<boolean>(false);

    //The complete sensitive data toggle features for events like screenshare data protetion
    const toggleSenstiveCanvasName = (
      e: React.FormEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();
      setToggleCanvasNameEye(!toggleCanvasNameEye);
      setSecurityVisualToggleName(!securityVisualToggleName);
    };
    const toggleSenstiveCanvasid = (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setTogglecanvasidEye(!togglecanvasidEye);
      setSecurityVisualToggleId(!securityVisualToggleId);
    };

    return (
      <DivClass className={"primary-workspace-controls-and-workspace-details"}>
        <DivClass className={"workspace-details"}>
          <DivClass className={"workspace-name-wrapper"}>
            <InputDisabledText
              id="disabled-workspace-name"
              className={"workspace-name"}
              value={
                canvasData?.data?.workspaceNameData?.workspaceTextName
                  ? `Name: ${
                      securityVisualToggleName
                        ? canvasData?.data?.workspaceNameData?.workspaceTextName
                        : maskSensitiveData(
                            canvasData?.data?.workspaceNameData
                              ?.workspaceTextName,
                          )
                    }`
                  : "You need to login"
              }
            />
            <SVG
              src={
                toggleCanvasNameEye
                  ? "/eye-solid-white.svg"
                  : "/eye-slash-solid-white.svg"
              }
              alt={toggleCanvasNameEye ? "Visible Eye icon" : "Hidden Eye Icon"}
              onClick={toggleSenstiveCanvasName}
              className={"eye-icon"}
            />
            <SVG
              src="/copy-solid-white.svg"
              alt="Clipboard icon"
              onClick={copyCanvasName}
              className={"clipboard-icon"}
            />
          </DivClass>
          <DivClass className={"workspace-id-wrapper"}>
            <InputDisabledText
              id="disabled-workspace-id"
              className={"workspace-id"}
              value={
                canvaid
                  ? `Id: ${
                      securityVisualToggleId
                        ? canvaid
                        : maskSensitiveData(canvaid)
                    }`
                  : "You need to login"
              }
            />
            <SVG
              src={
                togglecanvasidEye
                  ? "/eye-solid-white.svg"
                  : "/eye-slash-solid-white.svg"
              }
              alt={togglecanvasidEye ? "Visible Eye icon" : "Hidden Eye Icon"}
              onClick={toggleSenstiveCanvasid}
              className={"eye-icon"}
            />
            <SVG
              src="/copy-solid-white.svg"
              alt="Clipboard icon"
              onClick={copycanvaid}
              className={"clipboard-icon"}
            />
          </DivClass>
        </DivClass>
        <DivClass className={"primary-workspace-controls"}>
          <DivClass className={"delete-workspace-btn-wrapper"}>
            <Button
              id="delete-workspace-btn"
              className={"delete-workspace-btn"}
              onClick={canvasDeletionToggle}
            >
              DELETE
            </Button>
          </DivClass>
          <DivClass className={"refresh-workspace-btn-wrapper"}>
            <Button
              id="refresh-workspace-btn"
              className={"refresh-workspace-btn"}
              onClick={refresh}
            >
              REFRESH
            </Button>
          </DivClass>
        </DivClass>
      </DivClass>
    );
  } catch (err: any) {
    console.warn("Something went wrong: ", err.message);
  }
};

export default PrimaryControlsAndDetails;
