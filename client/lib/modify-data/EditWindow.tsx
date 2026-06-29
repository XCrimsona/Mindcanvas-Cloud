import { DivClass } from "../ui/Div";
import "./modification-window.css";
import ShortText from "../ui/ShortText";
import Button from "../components/form-elements/Button";
import { useModificationContext } from "./InfoModificationContextProvider";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

// EditWindow component: Allows editing of various data components (e.g., text, links, tables, charts)
// by providing a UI to view current values and input new values. It utilizes the
// InfoModificationContextProvider to manage state updates and context switching between
// modification windows.
export const EditWindow = ({ componentData }: { componentData: any }) => {
  // Destructure props from the parent, containing information about the component to be edited
  // (e.g., owner, ID, workspace, type of data, text content, link URL, and table name for tables)
  const { owner, _id, workspaceId, type, text, link, tableName } =
    componentData;
  // Unbind context functions from InfoModificationContextProvider to manage state updates
  // and window toggling. These are essential for coordinating between different edit
  // windows and ensuring changes propagate correctly to the backend API.
  const {
    setEditWindow,
    setModificationWindow,
    newComponentData,
    setComponentData,
    editLiveDataElement,
    editTableFragment,
  } = useModificationContext();

  // Boolean flag: Checks if the current component type is a "Table"
  const isTable = type === "Table";
  // State for table renaming. Table fragments only support renaming from the edit window — column
  // type changes are deferred until the Postgres migration since they'd require validating every
  // existing row. We use this state to temporarily hold the new table name before saving it.
  const [newTableName, setNewTableName] = useState<string>(tableName || "");

  // useEffect to automatically update the updateType state whenever the component type changes.
  // This helps the validation logic in the "Update" button know what kind of data is being edited.
  useEffect(() => {
    checkUpdateType(type);
  }, [type]);

  // Helper function: Copies text content to clipboard and shows a toast notification if successful.
  const copyToTextClipboard = async (text: string) => {
    if (!text) {
      toast.info("Not copied");
      return;
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied Text");
      return;
    }
  };

  // Helper function: Copies link URL to clipboard and shows a toast notification if successful.
  const copyToLinkClipboard = async (link: string) => {
    if (!text) {
      toast.info("Not copied");
      return; // NOTE: Bug? Should check !link instead of !text since it's checking the link argument
    } else {
      await navigator.clipboard.writeText(link);
      toast.success("Copied Link");
      return;
    }
  };

  // Helper function: Reads all available text from clipboard and pastes it into the `text` field of
  // newComponentData via state updater setComponentData. It's a quick way to fill in long-form text.
  const pasteTextToClipboard = async () => {
    const clipboardData = await navigator.clipboard.readText();

    if (!clipboardData) {
      toast.info("Nothing to paste");
      return;
    } else {
      setComponentData({
        ...newComponentData,
        text: clipboardData,
      });
      return;
    }
  };

  const pasteLinkToClipboard = async () => {
    const clipboardData = await navigator.clipboard.readText();

    if (!clipboardData) {
      toast.info("Nothing to paste");
      return;
    } else {
      setComponentData({
        ...newComponentData,
        link: clipboardData,
      });
      return;
    }
  };

  const currentType = (dataType: string) => {
    switch (dataType) {
      case "Text":
        return "222px";
      case "TextLink":
        return "266px";
      case "DougnutChart":
        return "250px";
      case "Table":
        return "140px";
      default:
        break;
    }
  };

  //Automatically checks which type of fragment is being editted and send that fragment type with other data to the api to make the correct decision on which data is being editted and runs the updates
  const [updateType, setUpdateType] = useState<string>("");
  function checkUpdateType(type: string) {
    switch (type) {
      case "Text":
        setUpdateType("Text");
        break;
      case "TextLink":
        setUpdateType("TextLink");
        break;
      case "DougnutChart":
        setUpdateType("DougnutChart");
        break;
      default:
        break;
    }
  }

  return (
    <DivClass className={"edit-window-container"}>
      <ShortText className={"window-heading"}>You are editing:</ShortText>
      <DivClass className={"update-box"}>
        <DivClass className={"box-one"}>
          <>
            {type === "TextLink" && link && (
              <>
                <div className="dual-data">
                  <input
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoSave="off"
                    id="enabled-link-input-field"
                    placeholder="https://..."
                    className={"box-one-enabled-linkdescription-input-field"}
                    value={link}
                    readOnly
                  />
                  <Button
                    id="change-windows"
                    onClick={() => {
                      copyToLinkClipboard(link);
                      return;
                    }}
                    className={"copy-clipboard-button"}
                  >
                    Copy to Clipboard
                  </Button>
                  <textarea
                    className={"pulled-text"}
                    disabled
                    value={text}
                    readOnly
                  ></textarea>
                </div>
                <Button
                  id="change-windows"
                  onClick={() => {
                    copyToTextClipboard(text);
                    return;
                  }}
                  className={"copy-clipboard-button"}
                >
                  Copy to Clipboard
                </Button>
              </>
            )}
            {type === "Text" && text && (
              <>
                <textarea
                  className={"pulled-text-data"}
                  disabled
                  value={text}
                  readOnly
                ></textarea>
                <Button
                  id="change-windows"
                  onClick={() => {
                    copyToTextClipboard(text);
                    return;
                  }}
                  className={"copy-clipboard-button"}
                >
                  Copy Text
                </Button>
              </>
            )}
            {type === "DoughnutChart" && (
              <>
                <textarea
                  className={"pulled-text-data"}
                  disabled
                  value={text}
                  readOnly
                ></textarea>
                <Button
                  id="change-windows"
                  onClick={() => {
                    copyToTextClipboard(text);
                    return;
                  }}
                  className={"copy-clipboard-button"}
                >
                  Copy Text
                </Button>
              </>
            )}
            {isTable && (
              <>
                <input
                  type="text"
                  className={"pulled-text-data"}
                  value={tableName || ""}
                  readOnly
                />
                <Button
                  id="change-windows"
                  onClick={() => {
                    copyToTextClipboard(tableName || "");
                    return;
                  }}
                  className={"copy-clipboard-button"}
                >
                  Copy Name
                </Button>
              </>
            )}
          </>
          <Button
            id="change-windows"
            onClick={() => {
              setEditWindow(false);
              setModificationWindow(true);
            }}
            className={"change-windows"}
          >
            Back
          </Button>
        </DivClass>
        <div
          className={"style-div"}
          style={{
            height: currentType(type),
          }}
        ></div>
        <DivClass className={"box-two"}>
          {type === "Text" && (
            <DivClass className={"new-text"}>
              <textarea
                id={`${_id}`}
                className={"new-data"}
                rows={8}
                value={newComponentData.text}
                required
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setComponentData({
                    ...newComponentData,
                    text: e.target.value,
                  });
                }}
                placeholder="Your new data"
              />
              <Button
                id="change-windows"
                onClick={() => {
                  pasteTextToClipboard();
                }}
                className={"paste-clipboard-button"}
              >
                Write Text
              </Button>
            </DivClass>
          )}
          {type === "TextLink" && (
            <DivClass className={"new-linktext"}>
              <div className="dual-data">
                <input
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoSave="off"
                  id={`${_id}-enabled-link-input-field`}
                  placeholder="http:// or https://"
                  className={"box-two-enabled-linkdescription-input-field"}
                  value={newComponentData.link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setComponentData({
                      ...newComponentData,
                      link: e.target.value,
                    });
                  }}
                />
                <Button
                  id="change-windows"
                  onClick={() => {
                    pasteLinkToClipboard();
                  }}
                  className={"paste-clipboard-button"}
                >
                  Write link
                </Button>
                <textarea
                  id={`${_id}`}
                  className={"new-data"}
                  rows={8}
                  value={newComponentData.text}
                  required
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setComponentData({
                      ...newComponentData,
                      text: e.target.value,
                    });
                  }}
                  placeholder="Your new data"
                />
                <Button
                  id="change-windows"
                  onClick={() => {
                    pasteTextToClipboard();
                  }}
                  className={"paste-clipboard-button"}
                >
                  Write Text
                </Button>
              </div>
            </DivClass>
          )}
          {type === "DoughnutChart" && (
            <DivClass className={"new-linktext"}>
              <div className="dual-data">
                <input
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoSave="off"
                  id={`${_id}-enabled-link-input-field`}
                  placeholder="https://..."
                  className={"box-two-enabled-linkdescription-input-field"}
                  value={newComponentData.link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setComponentData({
                      ...newComponentData,
                      link: e.target.value,
                    });
                  }}
                />
                <Button
                  id="change-windows"
                  onClick={() => {
                    pasteLinkToClipboard();
                  }}
                  className={"paste-clipboard-button"}
                >
                  Write link
                </Button>
                <textarea
                  id={`${_id}`}
                  className={"new-data"}
                  rows={8}
                  value={newComponentData.text}
                  required
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setComponentData({
                      ...newComponentData,
                      text: e.target.value,
                    });
                  }}
                  placeholder="Your new data"
                />
                <Button
                  id="change-windows"
                  onClick={() => {
                    pasteTextToClipboard();
                  }}
                  className={"paste-clipboard-button"}
                >
                  Write Text
                </Button>
              </div>
            </DivClass>
          )}
          {isTable && (
            <DivClass className={"new-text"}>
              <input
                id={`${_id}-new-table-name`}
                className={"new-data"}
                type="text"
                value={newTableName}
                placeholder="New table name"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTableName(e.target.value)
                }
              />
              <ShortText className="text-[10px] text-[#888] mt-1">
                Column types stay locked until the Postgres migration.
              </ShortText>
            </DivClass>
          )}
          <button
            type="submit"
            className={"update-button"}
            id="edit-button"
            onClick={() => {
              if (isTable) {
                const clean = newTableName.trim();
                if (!clean) {
                  toast.info("Enter a table name to update");
                  return;
                }
                editTableFragment(_id, clean);
                setEditWindow(false);
                return;
              }
              //bugs created on submit creates void content!!!!!!! HIGH PRIORITY FAULT
              // else if (updateType === "textlink") {
              //                 if (!newComponentData.text || !newComponentData.link) {
              //                   toast.info("Enter Link or Link description to update");
              //                 }
              //               }
              if (updateType === "text" && !newComponentData.text) {
                toast.info("Enter text to update");
              } else if (updateType === "textlink") {
                if (!newComponentData.text && !newComponentData.link) {
                  toast.info("Enter Link or Link description to update");
                }
              } else if (
                updateType === "DoughnutChart" &&
                !newComponentData.text
              ) {
                // requires improved conditional flow since chart data is structurely different. for now its void
                toast.info("Complete the doughnut chart form to update");
              } else if (updateType === "Video" && !newComponentData.text) {
                toast.info("Paste video location from OS to update");
              } else if (updateType === "Images" && !newComponentData.text) {
                toast.info(
                  "Paste image folder location/path to update the image cluster ",
                );
              } else {
                // _id is the componont being edited
                editLiveDataElement(
                  owner,
                  _id,
                  workspaceId,
                  type,
                  updateType,
                  newComponentData.text,
                  newComponentData.link,
                );
              }
            }}
          >
            Update
          </button>
        </DivClass>
      </DivClass>
    </DivClass>
  );
};
