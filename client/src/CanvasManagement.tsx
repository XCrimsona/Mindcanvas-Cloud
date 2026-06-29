import { DivClass, DivId } from "../lib/ui/Div";
import "./style-files/management.css";
import "./style-files/canva-board-sheet-wrapper.css";
import Button from "../lib/components/form-elements/Button";
import {
  InputDisabledText,
  InputSubmit,
  InputText,
} from "../lib/components/form-elements/dry-InputFormComponents";
import RouteLink from "../lib/components/ProductSection/RouteLink";
import React, { useEffect, useState } from "react";
import SVG from "../lib/SVG";
import { EnabledTextAreaInput } from "../lib/components/media-retrieved-components/MediaInputComponents";
import { useParams } from "react-router-dom";
import HeadingOne from "../lib/ui/HeadingOne";
import { toast } from "react-toastify";
import { redirectToSignIn } from "../lib/auth-redirect/AuthRedirectContext";
const DataManagement = ({ source }: { source: any }) => {
  //pull latest data from the cloud
  const { userid } = useParams();
  //NOTE: the workspace data usestate variable needs to change to canva data
  const [canvaData, setCanvaData] = useState<any>([]);

  const fetchMoreData = async () => {
    const response = await fetch(
      `http://localhost:5176/api/account/${userid!}/canvas-management`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      data.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCanvaData(data.data);

      return {
        status: "success",
        message: data,
      };
    } else {
      const issue = await response.json();
      // setCanvaData(issue);
      if (issue.message === "Not Authenticated") redirectToSignIn();
      return {
        status: "false",
        message: issue,
      };
    }
  };

  useEffect(() => {
    //source data from parent component InitialDashboardPageComponent as props object "I think"
    setCanvaData(source.data);
    fetchMoreData();
  }, []);

  // ?
  // const [query, setQuery] = useState("");
  // can be replaced with canvaData
  // const [results, setResults] = useState([]);

  // useEffect(() => {
  //   const delay = setTimeout(async () => {
  //     if (!query.trim()) return;

  //     const res = await fetch(
  //       `/api/account/${userid}/canvas-management/search`,
  //       {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           query,
  //           page: 0,
  //           limit: 10,
  //           userId: userid,
  //         }),
  //       },
  //     );

  //     if (!res.ok) {
  //       const data = await res.json();
  //       setResults(data.results);
  //     } else {
  //       const data = await res.json();
  //       if (data.message === "Not Authenticated") redirectToSignIn();
  //       setResults(data.results);
  //     }
  //   }, 800);

  //   return () => clearTimeout(delay);
  // }, [query]);

  // function to toggle a single workspace view mode
  const toggleASingleWorkspace = (id: string) => {
    setCanvaData((prev: any) =>
      prev.map((workspace: any) =>
        workspace._id === id
          ? { ...workspace, viewMode: !workspace.viewMode }
          : workspace,
      ),
    );
  };

  interface IWorkspaceProps {
    sub?: string;
    workspacename: string;
    description: string;
  }

  //used to capture the data to update the actual specified workspace
  const [workspaceEdits, setWorkspaceEdits] = useState<
    Record<string, IWorkspaceProps>
  >({});
  //db data before edits
  const [currentWorkspacePreEdits, setCurrentWorkspacePreEdits] = useState<
    Record<string, IWorkspaceProps>
  >({});

  const updateWorkspace = async (e: any, workspaceId: string) => {
    console.log(workspaceId);

    try {
      e.preventDefault();
      const updateFields: any = {};
      // const edited = workspaceEdits[workspaceId];
      // const original = canvaData?.find((w: any) => w._id === workspaceId);
      // console.log("workspaceEdits: ", workspaceEdits);
      // console.log("currentWorkspacePreEdits: ", currentWorkspacePreEdits);

      if (userid) {
        updateFields.sub = userid;
        updateFields.workspaceid = workspaceId;
      }

      // if (workspaceEdits.workspacename)
      updateFields.workspacename = workspaceEdits[workspaceId].workspacename;

      // if (workspaceEdits.description)
      updateFields.description = workspaceEdits[workspaceId].description;

      // if (currentWorkspacePreEdits.workspacename)
      updateFields.currentworkspacename =
        currentWorkspacePreEdits[workspaceId].workspacename;

      // if (currentWorkspacePreEdits.description)
      updateFields.currentworkspacedescription =
        currentWorkspacePreEdits[workspaceId].description;

      // console.log("updateFields: ", updateFields);

      const response = await fetch(
        `http://localhost:5176/api/account/${userid!}/canvas-management`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateFields),
        },
      );

      if (response.ok) {
        const data = await response.json();
        fetchMoreData();
        toast.success("Canvaspace rename update detected", { autoClose: 3000 });

        setWorkspaceEdits({
          ...workspaceEdits,
          [workspaceId]: { workspacename: "", description: "" },
        });
        return {
          status: "success",
          message: data.data,
        };
      } else {
        const data = await response.json();
        if (!data.success) {
          switch (data.code) {
            case "UNAUTHENTICATED":
              return redirectToSignIn();
            case "MISSING_WORKSPACE_DATA":
              toast.info(data.code);
              return {
                status: "missing-workspace-data",
                message: data.message,
              };
            case "WORKSPACE_MANAGEMENT_DATA_PATCHED":
              toast.info(data.code);
              return {
                status: "no-user-data",
                message: data.message,
              };
            case "SERVER_WORKSPACE_ERROR":
              toast.info(data.code);
              return {
                status: "server-error",
                message: data.message,
              };
            default:
              return {
                status: "error",
                message: data.message || "Unhandled backend condition.",
              };
          }
        }
        toast.error("Canva update attempt detected", { autoClose: 3000 });
      }
    } catch (err: any) {
      console.warn("Management Update Error: ", err.message);
    }
  };

  //displays temporary field when plus button is clicked
  const [displayNewWorkspace, setDisplayNewWorkspace] =
    useState<Boolean>(false);

  //used to add a temporary workspace field until saved
  const [newWorkspace, setNewWorkspace] = useState<IWorkspaceProps>({
    workspacename: "",
    description: "",
  });

  //create new workspace locally
  const addNewWorkspace = async (): Promise<void> => {
    try {
      setDisplayNewWorkspace((prev) => !prev);
    } catch (err: any) {
      console.warn("Error on temporary canva form field : ", err.message);
    }
  };

  //scroll to the form field that creates  a new workspace(canva space)
  useEffect(() => {
    if (displayNewWorkspace) {
      const element = document.getElementById("tempCanvaCreationFormElement");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [displayNewWorkspace]);

  //remember to implement a boolean lock to avoid the CtrlKey + Enter multi-submission spam looking affect. (not good for scaling up cpu)
  //send data to cloud
  const saveWorkspace = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent,
  ): Promise<any> => {
    e.preventDefault();
    setNewWorkspace({
      ...newWorkspace,
      workspacename: newWorkspace.workspacename,
      description: newWorkspace.description,
    });

    interface formDataProps {
      sub: string;
      workspacename: string;
      workspacedescription: string;
    }
    //compile form submission structure
    const formData: formDataProps = {
      sub: String(userid),
      workspacename: newWorkspace.workspacename,
      workspacedescription: newWorkspace.description,
    };
    // console.log(formData);

    if (!formData) {
      toast.info("Fill all the fields!");
    } else {
      const response = await fetch(
        `http://localhost:5176/api/account/${userid}/canvas-management`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        toast.success("New Canvaspace detected!");
        fetchMoreData();
        setDisplayNewWorkspace((prev) => !prev);
      } else {
        const getError = await response.json();
        if (getError.message === "Not Authenticated") redirectToSignIn();
        toast.error(`Failed to create Canvaspace: ${getError.message}`);
      }
    }
  };

  // const [canvaCreateSubmitLock, setCanvaCreateSubmitLock] =
  //   useState<boolean>(true);

  // useEffect(() => {
  //   if (newWorkspace.workspacename && newWorkspace.description) {
  //     setCanvaCreateSubmitLock(false);
  //   } else {
  //     setCanvaCreateSubmitLock(true);
  //   }
  // }, [
  //   canvaCreateSubmitLock,
  //   newWorkspace.workspacename,
  //   newWorkspace.description,
  // ]);

  const Canvasses = ({ Canvases }: { Canvases: any[] }) => {
    return (
      <>
        {Canvases &&
          Canvases.map((canvaSpace: any) => {
            return (
              <DivId
                id={canvaSpace.id}
                key={canvaSpace._id}
                className={"workspace-sheet-wrapper"}
              >
                <form className={"workspace-sheet"}>
                  <DivClass className={"workspace-sheet-forefront-data"}>
                    <button>
                      <RouteLink
                        href={`/account/${userid}/canvas-management/${canvaSpace._id}`}
                        className={"dynamic-workspace-route"}
                      >
                        <SVG
                          src="/backwards-solid.svg"
                          alt="double forward icon"
                          className={"forward-to-workspace-icon"}
                        />
                      </RouteLink>
                    </button>
                    {canvaSpace.viewMode === true ? (
                      <InputText
                        id={`new-temp-update-name-field-${canvaSpace._id}`}
                        value={
                          workspaceEdits[canvaSpace._id]?.workspacename || ""
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.preventDefault();
                          // updating a specific workspace description
                          // setCurrentWorkspacePreEdits((previous: any) => ({
                          //   ...previous,
                          //   [canvaSpace._id]: {
                          //     ...previous[canvaSpace._id],
                          //     workspacename: canvaSpace.workspacename,
                          //   },
                          // }));
                          setWorkspaceEdits((previous: any) => ({
                            ...previous,
                            [canvaSpace._id]: {
                              ...previous,
                              workspacename: e.target.value,
                            },
                          }));
                        }}
                        placeholder={"New Canvaspace name"}
                        className={
                          "new-temp-update-description-field-workspace-name"
                        }
                      />
                    ) : (
                      <InputDisabledText
                        id={canvaSpace._id}
                        value={canvaSpace.workspacename}
                        className={"workspace-name"}
                      />
                    )}

                    {canvaSpace.viewMode === true ? (
                      <InputText
                        id={`new-temp-update-description-field-${canvaSpace._id}`}
                        value={
                          workspaceEdits[canvaSpace._id]?.description || ""
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          // updating a specific workspace description
                          setCurrentWorkspacePreEdits((previous: any) => ({
                            ...previous,
                            [canvaSpace._id]: {
                              ...previous[canvaSpace._id],
                              description: canvaSpace.description,
                            },
                          }));
                          setWorkspaceEdits((previous: any) => ({
                            ...previous,
                            [canvaSpace._id]: {
                              ...previous[canvaSpace._id],
                              description: e.target.value,
                            },
                          }));
                        }}
                        placeholder={"New Canvaspace description"}
                        className={
                          "new-temp-update-description-field-workspace-description"
                        }
                      />
                    ) : (
                      <textarea
                        cols={12}
                        id={canvaSpace.name}
                        readOnly
                        value={canvaSpace.description}
                        placeholder={"Update workspace description"}
                        className={"workspace-description"}
                      />
                    )}
                  </DivClass>
                  <DivClass className={"workspace-buttons-container"}>
                    <DivClass className={"workspace-toggle-edit-btns"}>
                      {canvaSpace.viewMode === true ? (
                        <Button
                          id="view-mode"
                          className={"view-mode"}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleASingleWorkspace(canvaSpace._id);
                          }}
                        >
                          View
                        </Button>
                      ) : (
                        <Button
                          id="edit-mode"
                          className={"edit-mode"}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleASingleWorkspace(canvaSpace._id);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </DivClass>
                    <DivClass className={"workspace-sheet-forefront-data"}>
                      <Button
                        id="update-workspace-sheet"
                        className={"update-workspace-sheet"}
                        onClick={(e) => {
                          e.preventDefault();
                          updateWorkspace(e, canvaSpace._id);
                          canvaSpace.viewMode = false;
                        }}
                      >
                        Update
                      </Button>
                    </DivClass>
                  </DivClass>
                </form>
              </DivId>
            );
          })}
      </>
    );
  };

  return (
    <DivClass className={"workspace-dashboard"}>
      <DivClass className={"workspace-sheets-wrapper"}>
        <DivClass className={"page-info-container"}>
          <HeadingOne
            id="canva-management-heading-one"
            className={"canva-management-heading-one"}
          >
            Canvas Management
          </HeadingOne>

          {/* <div className="add-canvaspace">Search your canvaspaces</div> */}

          <div className="new-canvaspace" onClick={addNewWorkspace}>
            New Canvaspace
          </div>
        </DivClass>
        <DivClass className={"workspace-sheets"}>
          {/* {params.data.firstname} */}
          <Canvasses Canvases={canvaData} />

          {displayNewWorkspace && (
            <DivClass className={"workspace-sheet-wrapper"}>
              <form
                className={"workspace-sheet-temp-field"}
                id="tempCanvaCreationFormElement"
                onSubmit={saveWorkspace}
              >
                <DivClass className={"workspace-sheet-forefront-data"}>
                  <InputText
                    id="workspace-name"
                    value={newWorkspace.workspacename}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      setNewWorkspace({
                        ...newWorkspace,
                        workspacename: e.target.value,
                      });
                    }}
                    placeholder={"Canvaspace Name"}
                    className={"workspace-name"}
                  />
                  {/* based on boolean expression for onfocus and off focus */}
                  <EnabledTextAreaInput
                    id="workspace-description"
                    value={newWorkspace.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setNewWorkspace({
                        ...newWorkspace,
                        description: e.target.value,
                      });
                    }}
                    placeholder={"Canvaspace Description"}
                    className={"workspace-description"}
                  />
                </DivClass>
                <DivClass className={"workspace-sheet-forefront-data"}>
                  <InputSubmit
                    isdisabled={
                      newWorkspace.workspacename.length === 0 ||
                      newWorkspace.description.length === 0
                    }
                    style={{
                      cursor:
                        newWorkspace.workspacename.length === 0 ||
                        newWorkspace.description.length === 0
                          ? "cursor-not-allowed"
                          : "cursor-pointer",
                    }}
                    value="Save Workspace"
                    id="create-workspace-sheet"
                    className={`create-workspace-sheet disabled:opacity-80 ${
                      newWorkspace.workspacename.length === 0 ||
                      newWorkspace.description.length === 0
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  />
                </DivClass>
              </form>
            </DivClass>
          )}
        </DivClass>
      </DivClass>
    </DivClass>
  );
};

export default DataManagement;
