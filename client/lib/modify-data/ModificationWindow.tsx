// @ts-nocheck

import { useModificationContext } from "./InfoModificationContextProvider";
// import StyleDiv from "../../../../../../../src/ui/StylerDiv";
import "./modification-window.css";
import Button from "../components/form-elements/Button";
import React from "react";
import ShortText from "../ui/ShortText";
// import { InputCheckBox } from "../components/form-elements/dry-InputFormComponents";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { ToastContainer } from "react-toastify";

/**
 * ModificationWindow Component
 * This component is responsible for displaying a dropdown or context menu when the 'i' button on a data fragment is clicked.
 * It provides a range of modification options for editing, deleting, repositioning, and changing privacy settings of the selected fragment.
 */
export const ModificationWindow = ({ componentData }: any) => {
  // Destructure state functions and callbacks from the modification context provider
  const {
    setModificationWindow, // Function to close or open the modification window
    setEditWindow, // Callback for switching to edit mode
    updateFragmentPrivacy, // Updates privacy settings for the fragment
    updateFragmentFrameSize, // Updates rendered frame width bucket (small/medium/large)
    DeleteDataFragment, // General callback for deleting fragments
    updateTextLinkViewMode, // Toggles TextLink target between _self and _blank
    deleteLiveDataElement, // Deletes live data elements (Text, etc.)
    deleteTableFragment, // Deletes table fragments specifically
    antiDeleteLock, // Flag indicating if deletion is locked for safety
    toggleDeleteLock, // Toggles the deletion lock state
    openReadingPage, // Callback to open a reading page (A4 view)
  } = useModificationContext();

  // Extract data from the componentData object passed as props
  const { owner, _id, workspaceId, type, personalInfo, frameSize } =
    componentData;
  // Baseline is "medium" — matches the default we chose in the fragment schemas,
  // so a fragment that predates this feature (frameSize === undefined) still
  // shows the correct option in the dropdown without an implicit React state.
  const currentFrameSize: "small" | "medium" | "large" =
    frameSize === "small" || frameSize === "large" ? frameSize : "medium";

  // Flag used to differentiate between Table and other element types for deletion handling
  const isTable = type === "Table";

  // Pin features shuold appear in the sidebar  to access when complete
  return (
    <div className={"modifications-window-container"}>
      {/*
        Close Button: Closes the modification window and hides the context menu.
        It's the primary way for users to dismiss the options after making changes or inspection.
      */}
      <Button
        className={"close-button"}
        id={`close-button-${_id}`}
        onClick={() => {
          setModificationWindow(false); // Close the window when clicked
        }}
      >
        Close
      </Button>

      {/* Visual separator after the close button */}
      <hr
        style={{
          width: "94%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />

      {/*
        Data Sharing Controls Section: Allows users to set privacy preferences for the fragment.
        Displays Yes/No buttons that trigger a function call in the parent component's context to update the fragment's privacy status.
      */}
      <div className="data-sharing-buttons-container">
        <p className="ux-note-status">Share fragment data</p>

        {/* "Yes" Button: Enables sharing of personal/fragment data associated with this element */}
        <Button
          id={`allow-personal-data-sharing-${_id}`}
          className={
            "allow-personal-data-sharing" +
            ` select-${personalInfo === true ? true : "none"}`
          }
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            // Triggers the parent's privacy update function with current values
            updateFragmentPrivacy(e, _id, type, personalInfo);
          }}
        >
          Yes
        </Button>

        {/* "No" Button: Disables sharing of personal/fragment data associated with this element */}
        <Button
          id={`prohibit-private-data-sharing-${_id}`}
          className={
            "prohibit-private-data-sharing" +
            ` select-${personalInfo === false ? false : "none"}`
          }
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            updateFragmentPrivacy(e, _id, type, personalInfo);
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
      {/*
        Resize frame controls: mirrors the Share fragment section but is a
        <select> instead of two buttons because there are three exclusive
        buckets. Chosen value is passed straight to updateFragmentFrameSize —
        no React state assignment in between — and the server PATCH response
        triggers updateCanvasData() which ripples frameSize back to the live
        component so the CSS bucket applies without a manual reload.
      */}
      <div className="frame-size-controls-container">
        <p className="ux-note-status">Resize frame</p>
        {/*
          Uncontrolled by design. If we used `value={currentFrameSize}`, React
          would snap the visible option back to the prop-derived value the
          instant onChange fired — before the PATCH round-trip and canvas
          refetch have swapped `componentData.frameSize` — and the dropdown
          would appear frozen. `defaultValue` + `key={currentFrameSize}`
          reseats the select whenever the DB truth changes: the browser
          keeps whatever the user just picked visible immediately, and once
          updateCanvasData() lands the new frameSize the key change cleanly
          remounts the select with the fresh baseline.
        */}
        <select
          id={`frame-size-select-${_id}`}
          key={`frame-size-select-${_id}-${currentFrameSize}`}
          className={`frame-size-select select-${currentFrameSize}`}
          defaultValue={currentFrameSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const frameSize = e.currentTarget.value as
              | "small"
              | "medium"
              | "large";
            console.log(frameSize);

            updateFragmentFrameSize(_id, type, frameSize);
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
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
      {type === "Text" && (
        <>
          <Button
            className={"open-a4-view-button"}
            id={`open-a4-view-${_id}`}
            onClick={() => {
              openReadingPage(_id, componentData);
              setModificationWindow(false);
            }}
          >
            Open as A4 view
          </Button>
          <hr
            style={{
              width: "94%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </>
      )}
      {/*
        TextLink ViewMode toggle: only rendered for TextLink fragments. Two radio
        inputs share the same `name` so the browser enforces single-select. Picking
        a value PATCHes the fragment's `target` field server-side; the live
        TextLink then reads that target to decide between scrollIntoView (_self)
        and opening a new tab (_blank).
      */}
      {type === "TextLink" && (
        <>
          <div className="textlink-viewmode-toggle">
            <p className="textlink-viewmode-heading">Link View Mode</p>
            <div className="textlink-viewmode-options">
              <label className="textlink-viewmode-option">
                <input
                  type="radio"
                  name={`textlink-viewmode-${_id}`}
                  value="_self"
                  defaultChecked={componentData.target !== "_blank"}
                  onChange={() => updateTextLinkViewMode(_id, "_self")}
                />
                <span>_self</span>
              </label>
              <label className="textlink-viewmode-option">
                <input
                  type="radio"
                  name={`textlink-viewmode-${_id}`}
                  value="_blank"
                  defaultChecked={componentData.target === "_blank"}
                  onChange={() => updateTextLinkViewMode(_id, "_blank")}
                />
                <span>_blank</span>
              </label>
            </div>
          </div>
          <hr
            style={{
              width: "94%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </>
      )}
      {/*
        Copy fragment anchor: writes `#<_id>` to the clipboard so the user can
        paste it into an http link as the anchor segment without having to dig
        through the dev tools to grab the id. The leading `#` matches the
        TextLink URL shape the peek/jump resolver already understands.
      */}
      <Button
        className={"copy-fragment-anchor-button"}
        id={`copy-fragment-anchor-${_id}`}
        onClick={async () => {
          const anchor = `#${_id}`;
          try {
            await navigator.clipboard.writeText(anchor);
            toast.success(`Copied ${anchor}`, { autoClose: 2000 });
          } catch {
            toast.error("Could not copy fragment anchor");
          }
        }}
      >
        Copy Fragment Id
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
            if (isTable) {
              deleteTableFragment(_id);
            } else {
              deleteLiveDataElement(owner, _id, workspaceId, type);
            }
          }}
        >
          Delete
        </button>
        <ShortText className="mt-1 mb-2">{type} Fragment</ShortText>
      </div>
    </div>
  );
};
