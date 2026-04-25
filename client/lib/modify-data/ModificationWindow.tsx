import { useModificationContext } from "./InfoModificationContextProvider";
// import StyleDiv from "../../../../../../../src/ui/StylerDiv";
import "./modification-window.css";
import Button from "../components/form-elements/Button";
import { useCanvasContext } from "../form-components/canva-data-provider/CanvasDataContextProvider";
import React from "react";
import ShortText from "../ui/ShortText";
import { InputCheckBox } from "../components/form-elements/dry-InputFormComponents";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { ToastContainer } from "react-toastify";

//When the i round button on the left of a data fragment is clicked, ModificationWindow is an options box
export const ModificationWindow = ({ componentData }: any) => {
  const {
    note,
    setNote,
    isPersonalNote,
    setModificationWindow,
    setEditWindow,
    DeleteDataFragment,
    deleteLiveDataElement,
    antiDeleteLock,
    toggleDeleteLock,
  } = useModificationContext();
  const { userid, canvaid } = useParams();
  const { setRepositionWindow } = useCanvasContext();
  const { owner, _id, workspaceId, type, personalInfo } = componentData;
  async function updateFragmentPrivacy(id: string) {
    console.log(type);
    console.log(personalInfo);
    console.log(id);
    let updateType = "";
    if (!personalInfo || !type || !id) {
      toast.info("", { autoClose: 4000 });
      return;
    } else {
      if (type === "Text") {
        updateType = "Text";
      } else if (type === "TextLink") {
        updateType = "TextLink";
      } else if (type === "Images") {
        updateType = "Images";
      } else if (type === "Video") {
        updateType = "Video";
      } else if (type === "DoughnutChart") {
        updateType = "DoughnutChart";
      }

      const patchPayload: any = {};
      //always check for filled payload even when its always saying always true
      if (type) patchPayload.type = type;
      if (updateType) patchPayload.updateType = updateType;
      if (personalInfo) patchPayload.personalInfo = personalInfo;
      //id or _id for the backend to read the id of the chosen models
      if (id) patchPayload.id = id;

      const setFragmentPriv = await fetch(
        `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        },
      );
      if (setFragmentPriv.ok) {
        toast.success("Fragment share status updated", { autoClose: 4000 });
      } else {
        const fragmentError = await setFragmentPriv.json();
        toast.error("Update not successful: " + fragmentError.message, {
          autoClose: 4000,
        });
      }
    }
  }

  //Pin features shuold appear in the sidebar  to access when complete
  return (
    <div className={"modifications-window-container"}>
      <Button
        className={"close-button"}
        id={`close-button-${_id}`}
        onClick={() => {
          setModificationWindow(false);
        }}
      >
        Close
      </Button>
      <hr
        style={{
          width: "94%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
      <div>
        <p className="ux-note-status">Share fragment data</p>
        <Button
          id={`allow-personal-data-sharing-${_id}`}
          className={
            "allow-personal-data-sharing" +
            ` select-${personalInfo === true ? "true" : "none"}`
          }
          onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
            setNote({ ...note, component_sub: _id, note: true });
            updateFragmentPrivacy(_id);
          }}
        >
          Yes
        </Button>
        {/* MASSIVE SCSS @styles import misconfi detected. Migrate away from scss before sunday */}
        <Button
          id={`prohibit-private-data-sharing-${_id}`}
          className={
            "prohibit-private-data-sharing" +
            ` select-${personalInfo === false ? "false" : "none"}`
          }
          onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
            setNote({ ...note, component_sub: _id, note: false });
            updateFragmentPrivacy(_id);
          }}
        >
          No
        </Button>
      </div>
      <hr
        style={{
          width: "94%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
      <Button
        className={"edit-button"}
        id="edit-button"
        onClick={() => {
          setModificationWindow(false);
          setEditWindow(true);
        }}
      >
        Edit
      </Button>
      <hr
        style={{
          width: "94%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
      <Button
        className={"component-reposition-button"}
        id="component-reposition-button"
        onClick={() => {
          //Collapse the options window
          setModificationWindow(false);
          //Open the interface to move the selected component data to a new x y postion bas on it dragging
          setRepositionWindow(true);
        }}
      >
        Move Fragment
      </Button>
      <hr
        style={{
          width: "94%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
      <div className="delete-container ml-auto mr-auto flex flex-wrap items-center justify-around">
        <div
          className={"toggle-delete flex"}
          onClick={(e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault();
            toggleDeleteLock();
            return;
          }}
        >
          {antiDeleteLock ? (
            <img
              src="/shield-tick.svg"
              alt="Locked"
              height={25}
              width={25}
              className="ml-0 mr-auto block"
            />
          ) : (
            <img
              src="/shield-cross.svg"
              alt="Unlocked"
              height={25}
              className="ml-0 mr-auto block"
              width={25}
            />
          )}
        </div>
        <button
          className={`delete-button inline ${
            antiDeleteLock ? "cursor-not-allowed" : "cursor-pointer"
          } ${antiDeleteLock ? "opacity-80" : "opacity-100"}`}
          disabled={antiDeleteLock}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            DeleteDataFragment(e);
            deleteLiveDataElement(owner, _id, workspaceId, type);
          }}
        >
          Delete
        </button>
        <ShortText className="mt-1 mb-2">{type} Fragment</ShortText>
      </div>
    </div>
  );
};
