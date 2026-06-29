// =========================================================================
// AUTH AUDIT — InfoModificationContextProvider
// Every async handler below that hits the API must redirect on auth expiry.
// When you add a new handler, append it to this list. If a row says "no",
// the user will be stranded on a dead session.
//
//   updateFragmentPrivacy   PATCH  /account/:userid/canvas-management/:canvaid   auth: YES
//   editLiveDataElement     PATCH  /account/:userid/canvas-management/:canvaid   auth: YES
//   deleteLiveDataElement   DELETE /account/:userid/canvas-management/:canvaid   auth: YES
//
// Pattern: in the `else` branch, parse the body and:
//   if (body.message === "Not Authenticated") { redirectToSignIn(); return; }
// =========================================================================
//
//This file is used to toggle the element based on its id and location selected on the canvas workspace
//double click or doubletap to toggle the window to view or modify data
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCanvasContext } from "../form-components/canva-data-provider/CanvasDataContextProvider";
// import canvaNotification_Edit from "../notifications/fragment-updates/CanvaNotification_Edit";
// import canvaNotification_EditFailed from "../notifications/fragment-updates/CanvaNotification_EditFailed";
// // import canvaNotification_Delete from "../notifications/canva-deletes/CanvaNotification_Delete";
// import canvaNotification_TextFragmentDeleted from "../notifications/fragment-deletes/CanvaNotification_TextFragmentDeleted";
// import canvaNotification_TextFragmentDeletedFailed from "../notifications/fragment-deletes/CanvaNotification_TextFragmentDeleteFailed";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { redirectToSignIn } from "../auth-redirect/AuthRedirectContext";

type TypeModificationContext = true | false;
interface IModificationUseStateContextType {
  //state being toggled. This toggles the modification window that carries the edit and
  //delete component which is activated when a live db tsx component is double clicked in the browser
  modificationWindow: TypeModificationContext;
  setModificationWindow: React.Dispatch<
    React.SetStateAction<TypeModificationContext>
  >;
  //toggle modification window

  //tracks which component is being double clciked and
  //its is designed to pass objects of data to other functions that compile different pieces of
  //data and is used the component hub built in components that enables dynamic data creation
  dataComponent: Record<string, number>;
  setDataComponent: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;

  //this component has three items and acts as an object-useState
  // selectedComp: object;
  selectedComp: { dataFragmentId: string; type: string; info: string };
  //so how do i define this?
  setSelectedComp: React.Dispatch<
    React.SetStateAction<{ dataFragmentId: string; type: string; info: string }>
  >;
  updateSelectedComp: (id: any, type: any, info: any) => void;

  moveFragment: (
    e: React.MouseEvent<HTMLButtonElement>,
    // top: string,
    // left: string,
  ) => void;
  DeleteDataFragment: (e: React.MouseEvent<HTMLButtonElement>) => void;

  //state being toggled
  editState: TypeModificationContext;
  setEditWindow: React.Dispatch<React.SetStateAction<TypeModificationContext>>;

  //tracks which component is being double clciked and
  // only work with the toggled element for editing data
  newComponentData: { text: string; link: string };
  setComponentData: React.Dispatch<
    React.SetStateAction<{ text: string; link: string }>
  >;

  //state for the personal note checkbox
  note: { component_sub: string; isSharing: boolean };
  setNote: React.Dispatch<
    React.SetStateAction<{ component_sub: string; isSharing: boolean }>
  >;

  //isPersonalNote is a tester function
  isPersonalNote: () => void;
  updateFragmentPrivacy: (
    e: React.MouseEvent<HTMLButtonElement>,
    _id: string,
    type: string,
    personalInfo: boolean,
  ) => void;

  //TextLink viewMode (_self | _blank) — toggled from the ModificationWindow
  updateTextLinkViewMode: (_id: string, target: "_self" | "_blank") => Promise<void>;

  editLiveDataElement: (
    _id: string,
    userid: string,
    canvaid: string,
    type: string,
    updateType: string,
    text: string,
    link: string,
  ) => void;

  deleteLiveDataElement: (
    userid: string,
    _id: string,
    canvaid: string,
    // workspacename: string,
    componentType: string,
  ) => void;

  //Table fragment uses dedicated endpoints under /table-management.
  //These bypass the canvas-management dispatcher so the embedded rows + columns
  //don't collide with the generic fragment update path.
  editTableFragment: (_id: string, tableName: string) => Promise<void>;
  deleteTableFragment: (_id: string) => Promise<void>;

  updateComponentData: (text: string, link: string) => void;

  //prevents accidental deletion of data fragments by locking the delete button in the modification window until the user clicks the delete button a second time to unlock it and allow deletion of the data fragment
  antiDeleteLock: boolean;
  setAntiDeleteLock: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDeleteLock: () => void;

  //pin feature- not yet integrated
  //Pin feature to mount below data-fragments onto the canvas
  pinnedText: boolean;
  setPinnedText: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTextPin: () => void;
  PinToScreen: (e: React.MouseEvent<HTMLButtonElement>) => void;

  //A4 reading page — data is written to a ref synchronously so the first
  //render of ReadingPage already has the payload (no second-click race).
  readingPageOpen: boolean;
  readingPageDataRef: React.MutableRefObject<{ id: string; data: any } | null>;
  openReadingPage: (id: string, data: any) => void;
  closeReadingPage: () => void;

  // pinnedAudio: Record<string, boolean>;
  // setPinnedAudio: React.Dispatch<React.SetStateAction<string>>;
  // toggleAudioPin: (id: string) => void;

  // pinnedImage: Record<string, boolean>;
  // setPinnedImage: React.Dispatch<React.SetStateAction<string>>;
  // toggleImagePin: (id: string) => void;

  // pinnedVideo: Record<string, boolean>;
  // setPinnedVideo: React.Dispatch<React.SetStateAction<string>>;
  // toggleVideoPin: (id: string) => void;
}

const ModificationContext = createContext<
  IModificationUseStateContextType | undefined
>(undefined);

const InfoModificationContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  //modification state controller. context boolean state determines when the modification window appear by user interaction
  const [modificationWindow, setModificationWindow] =
    useState<TypeModificationContext>(false);
  //update the boolean value of the modificationState to improve selection flow of the live data component and the modification window

  //edit context
  const [editState, setEditWindow] = useState<TypeModificationContext>(false);

  //above component needs an updating function
  const [dataComponent, setDataComponent] = useState<Record<string, number>>(
    {},
  );

  //live data component's element id is stored inside and updated based on the click
  // to set it and reset its value is empty string when the user clicks delete inside the
  // InfoModification window that deletes the component
  const [selectedComp, setSelectedComp] = useState<{
    dataFragmentId: string;
    type: string;
    info: string;
  }>({
    dataFragmentId: "",
    type: "",
    info: "",
  });
  const updateSelectedComp = (id: string, type: string, info: string) => {
    setSelectedComp({
      ...selectedComp,
      dataFragmentId: id,
      type: type,
      info: info,
    });
  };
  //From the WorkspaceContextProvider, it refreshes the displayed data after
  // data has been deleted using deleteLiveDataElement.
  const { updateCanvasData, setRepositionData } = useCanvasContext();

  const [note, setNote] = useState<{
    component_sub: string;
    isSharing: boolean;
  }>({
    component_sub: "",
    isSharing: false,
  });
  function isPersonalNote() {
    console.log(note);
  }

  const { userid, canvaid } = useParams();

  async function updateFragmentPrivacy(
    e: React.MouseEvent<HTMLButtonElement>,
    _id: string,
    type: string,
    personalInfo: boolean,
  ) {
    e.preventDefault();
    // console.log(type);
    // console.log(personalInfo);
    // console.log(_id);
    let updateType = "SharingSettings";
    if (!_id) {
      toast.info("Insufficient data to update fragment privacy", {
        autoClose: 4000,
      });
      return;
    } else {
      const patchPayload: any = {};
      //always check for filled payload even when its always saying always true
      if (type) patchPayload.type = type;
      if (updateType) patchPayload.updateType = updateType;
      //boolean value stored in class for css and selected logic reference and updates
      const isSharing = e.currentTarget.textContent;
      // console.log(isSharing);

      if (personalInfo === false || personalInfo === true)
        patchPayload.personalInfo = isSharing;
      //id or _id for the backend to read the id of the chosen models
      if (_id) patchPayload._id = _id;
      // console.log(patchPayload);

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
        updateCanvasData();
        const fragmentresp = await setFragmentPriv.json();
        toast.success(fragmentresp.message, { autoClose: 4000 });
      } else {
        const fragmentError = await setFragmentPriv.json();
        if (fragmentError.message === "Not Authenticated") {
          redirectToSignIn();
          return;
        }
        toast.error("Update not successful: " + fragmentError.message, {
          autoClose: 4000,
        });
      }
    }
  }

  //Toggle TextLink viewMode. Hits the dedicated ViewMode dispatcher and refreshes
  //canvas data so the live TextLink picks up the new target on next render.
  const updateTextLinkViewMode = async (
    _id: string,
    target: "_self" | "_blank",
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id,
            type: "TextLink",
            updateType: "ViewMode",
            target,
          }),
        },
      );
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.success(json.message || `Link viewMode → ${target}`, {
          autoClose: 2500,
        });
        updateCanvasData();
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.message === "Not Authenticated") {
          redirectToSignIn();
          return;
        }
        toast.error(err.message || "ViewMode update failed", { autoClose: 4000 });
      }
    } catch (error: any) {
      console.warn("updateTextLinkViewMode error: ", error.message);
    }
  };

  // const { updateWorkspaceData } = useWorkspaceContext();
  //find the double clicked element and modify data
  const editLiveDataElement = async (
    userid: string,
    _id: string,
    canvaid: string,
    type: string,
    updateType: string,
    text: string,
    link: string,
  ) => {
    try {
      const editedRequest = await fetch(
        `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            // _id is the information component primary key
            _id: _id,
            type,
            updateType,
            text,
            link,
          }),
        },
      );
      if (editedRequest.ok) {
        toast.warning(`${type} fragment has been updated!`);
        updateCanvasData();
      } else {
        const response = await editedRequest.json();
        if (response.message === "Not Authenticated") {
          redirectToSignIn();
          return;
        }
        toast.error(`${type} fragment was not updated: ${response.message}`);
      }
    } catch (error: any) {
      console.log("edit error: ", error.message);
      return;
    }
  };

  const [antiDeleteLock, setAntiDeleteLock] = useState<boolean>(true);
  const toggleDeleteLock = () => {
    setAntiDeleteLock((prev) => (prev === true ? false : true));
    return;
  };

  //lock fail safe
  useEffect(() => {
    if (antiDeleteLock === false && modificationWindow === false) {
      setAntiDeleteLock(true);
    }
  }, [antiDeleteLock, modificationWindow]);

  //deleteLiveDataElement deletes data by finding the id of the
  //data stored in the database
  const deleteLiveDataElement = async (
    userid: string,
    _id: string,
    canvaid: string,
    type: string,
  ) => {
    try {
      const deleteRequest = await fetch(
        `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            // _id is the id information of the component
            _id,
            //component type
            type,
          }),
        },
      );
      if (deleteRequest.ok) {
        const succMessage = await deleteRequest.json();
        toast.success(`${succMessage.message}`);
        updateCanvasData();
      } else {
        const err = await deleteRequest.json();
        if (err.message === "Not Authenticated") {
          redirectToSignIn();
          return;
        }
        toast.error(err.message, { autoClose: 4000 });
      }
    } catch (error: any) {
      console.warn("Delete error: ", error.message);
      return;
    }
  };

  //Table fragment uses its own router. Both handlers refresh canvas data on success
  //so the live list reflects the change without a manual reload.
  const editTableFragment = async (_id: string, tableName: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/account/${userid}/table-management/${canvaid}/${_id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableName }),
        },
      );
      if (res.ok) {
        toast.warning("Table fragment has been updated!");
        updateCanvasData();
      } else {
        const response = await res.json().catch(() => ({}));
        if (response.message === "Not Authenticated") {
          redirectToSignIn();
          return;
        }
        toast.error(`Table fragment was not updated: ${response.message || ""}`);
      }
    } catch (error: any) {
      console.warn("editTableFragment error: ", error.message);
    }
  };

  const deleteTableFragment = async (_id: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/account/${userid}/table-management/${canvaid}/${_id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.success(json.message || "Table deleted");
        updateCanvasData();
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.message === "Not Authenticated") {
          redirectToSignIn();
          return;
        }
        toast.error(err.message || "Could not delete table", { autoClose: 4000 });
      }
    } catch (error: any) {
      console.warn("deleteTableFragment error: ", error.message);
    }
  };

  const [newComponentData, setComponentData] = useState<{
    text: string;
    link: string;
  }>({
    text: "",
    link: "",
  });
  const updateComponentData = (text: string, link: string = "") => {
    setComponentData({
      ...newComponentData,
      text,
      link,
    });
    return;
  };

  //PIN FEATURES
  const [mainFragmentXYCoorindates, setMainFragmentXYCoorindates] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  function updateOriginalFragmentXYCoorindates(x: number, y: number) {
    setMainFragmentXYCoorindates({ x, y });
  }

  const [pinnedText, setPinnedText] = useState<boolean>(false);
  const toggleTextPin = () => {
    setPinnedText((prev) => (prev === false ? true : false));
  };

  const PinToScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    //you need to create conditional code to add a pin feature here
    const sourceOfClickedId = (e.target as HTMLElement).id;
    const dataComponentDiv = (e.target as HTMLElement).closest(
      ".data-component",
    ) as HTMLDivElement;

    //you need to create conditional code to add a pin feature here
    // console.log(
    //   "mainFragmentContainer2: ",
    //   parseFloat(dataComponentDiv.style.left),
    // );
    localStorage.setItem("ComponentId", sourceOfClickedId);
    localStorage.setItem("Value", sourceOfClickedId);
    localStorage.setItem("Pinned", "true");
    // console.log(
    //   "mainFragmentContainer2: ",
    //   parseFloat(dataComponentDiv.style.top),
    // );
    updateOriginalFragmentXYCoorindates(
      parseFloat(dataComponentDiv.style.left),
      parseFloat(dataComponentDiv.style.top),
    );
    //^save pin feature original xy values befor the click overwrites the current values^^^^

    if (dataComponentDiv) {
      if (pinnedText === false) {
        console.log(dataComponentDiv.style.position);
        dataComponentDiv.style.position = "fixed";
        dataComponentDiv.style.left = "70px";
        dataComponentDiv.style.top = "100px";
        dataComponentDiv.style.zIndex = "20";
        setPinnedText(true);
      } else {
        dataComponentDiv.style.left = `${mainFragmentXYCoorindates.x}px`;
        dataComponentDiv.style.top = `${mainFragmentXYCoorindates.y}px`;
        dataComponentDiv.style.position = "absolute";
        setPinnedText(false);
      }
    }
    return;
  };

  //A4 reading page — imperative open. Writes payload to ref first (synchronous),
  //then flips the visibility flag in the same event so the first render of
  //<ReadingPage /> already has data — no extra click, no stale state.
  const readingPageDataRef = useRef<{ id: string; data: any } | null>(null);
  const [readingPageOpen, setReadingPageOpen] = useState<boolean>(false);
  const openReadingPage = (id: string, data: any) => {
    readingPageDataRef.current = { id, data };
    setReadingPageOpen(true);
  };
  const closeReadingPage = () => {
    setReadingPageOpen(false);
    readingPageDataRef.current = null;
  };

  //executes when the user interacts with the i icon and passes data to the next function
  const moveFragment = (e: React.MouseEvent<HTMLButtonElement>) => {
    // const dataFragmentId = String((e.target as HTMLElement).id);
    const dataFragmentId = String(selectedComp.dataFragmentId);
    const fragmentText = (e.target as HTMLElement).parentElement?.childNodes[1]
      .textContent;

    //provides the elemtn id to capture data and pass references
    setRepositionData({
      dataFragmentId,
      fragmentText,
      selectedComp: dataFragmentId,
    });

    //enables the menu and bring up forward
    return;
  };

  //this mouse click event is fired when a live data element is already selected
  // and then removed from the selectedComp that has been stored when the mouse
  // double click event was fired.
  const DeleteDataFragment = (e: React.MouseEvent<HTMLButtonElement>) => {
    const clickedElement = (e.target as HTMLElement).id;
    if (clickedElement) {
      setSelectedComp({ dataFragmentId: "", type: "", info: "" });
    }
    setModificationWindow(false);
  };

  return (
    <ModificationContext.Provider
      value={{
        editState,
        setEditWindow,

        dataComponent,
        setDataComponent,

        newComponentData,
        setComponentData,

        modificationWindow,
        setModificationWindow,

        note,
        setNote,
        isPersonalNote,
        updateFragmentPrivacy,
        updateTextLinkViewMode,
        editLiveDataElement,

        deleteLiveDataElement,
        editTableFragment,
        deleteTableFragment,
        updateComponentData,

        selectedComp,
        setSelectedComp,
        updateSelectedComp,

        PinToScreen,

        moveFragment,
        DeleteDataFragment,

        antiDeleteLock,
        setAntiDeleteLock,
        toggleDeleteLock,

        pinnedText,
        setPinnedText,
        toggleTextPin,

        readingPageOpen,
        readingPageDataRef,
        openReadingPage,
        closeReadingPage,
      }}
    >
      {children}
    </ModificationContext.Provider>
  );
};
export default InfoModificationContextProvider;

export const useModificationContext = () => {
  const context = useContext(ModificationContext);
  if (!context) {
    throw new Error(
      "useModificationContext must be used within ModificationContext",
    );
  }
  return context;
};
