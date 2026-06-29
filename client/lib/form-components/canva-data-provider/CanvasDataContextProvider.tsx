//
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

//component hub button toggling core definitions
//component hub text button toggler values
type TypeBooleanContext = true | false;

//Canvas data text input component types
type TypeCanvasInputContext = string | null;

//This interface is used to define the context type for the canvas data provider. It includes various references and state variables that are used throughout the application.
interface ICanvasContextType {
  hasInitializedPositionRef: MutableRefObject<boolean>;
  dataScrollBoardRef: MutableRefObject<HTMLDivElement | null>;
  globalDraggingRef: MutableRefObject<TypeBooleanContext>;

  //Global Text component for text data input from the user
  textInputOffSet: MutableRefObject<{ x: number; y: number }>;
  textToggle: TypeBooleanContext;
  setTextToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  textInputCompRef: MutableRefObject<HTMLDivElement | null>;
  textInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global TextLink component for text link data input from the user
  textLinkInputOffSet: MutableRefObject<{ x: number; y: number }>;
  textLinkToggle: TypeBooleanContext;
  setTextLinkToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  textLinkInputCompRef: MutableRefObject<HTMLDivElement | null>;
  textLinkInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global Doughnut Chart component for doughnut chart data input from the user
  doughnutChartInputOffSet: MutableRefObject<{ x: number; y: number }>;
  doughnutChartToggle: TypeBooleanContext;
  setDoughnutChartToggle: React.Dispatch<
    React.SetStateAction<TypeBooleanContext>
  >;
  //componenthub toggler
  doughnutChartInputCompRef: MutableRefObject<HTMLDivElement | null>;
  doughnutChartInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //upcoming list feature
  //Global List component for list data input from the user
  listInputOffSet: MutableRefObject<{ x: number; y: number }>;
  listToggle: TypeBooleanContext;
  setListToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  listInputCompRef: MutableRefObject<HTMLDivElement | null>;
  listInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global ListItem component for list data input from the user
  listItemInputOffSet: MutableRefObject<{ x: number; y: number }>;
  listItemToggle: TypeBooleanContext;
  setListItemToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  listItemInputCompRef: MutableRefObject<HTMLDivElement | null>;
  listItemInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global Audio Component for audio data input from the user
  audioInputOffSet: MutableRefObject<{ x: number; y: number }>;
  audioToggle: TypeBooleanContext;
  setAudioToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  audioInputCompRef: MutableRefObject<HTMLDivElement | null>;
  audioInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global Image Component for image data input from the user
  imageInputOffSet: MutableRefObject<{ x: number; y: number }>;
  imageToggle: TypeBooleanContext;
  setImageToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  imageInputCompPosRef: MutableRefObject<{ x: number; y: number }>;
  imageInputCompRef: MutableRefObject<HTMLDivElement | null>;

  //Global Video Component for video data input from the user
  videoInputOffSet: MutableRefObject<{ x: number; y: number }>;
  videoToggle: TypeBooleanContext;
  setVideoToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  videoInputCompRef: MutableRefObject<HTMLDivElement | null>;
  videoInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global Table Component for table data input from the user
  tableInputOffSet: MutableRefObject<{ x: number; y: number }>;
  tableToggle: TypeBooleanContext;
  setTableToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  tableInputCompRef: MutableRefObject<HTMLDivElement | null>;
  tableInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Global Data Component
  //Element used to carry database and responsible for mapping
  canvasData: any | null;
  setCanvasData: React.Dispatch<React.SetStateAction<any | null>>;
  updateCanvasData: () => void;

  //Global Canvas Size Properties Component
  canvasSizePropertiesToggle: boolean;
  setCanvasSizePropertiesToggle: React.Dispatch<React.SetStateAction<boolean>>;
  canvasWidth: string | null;
  setCanvasSizeHeight: React.Dispatch<React.SetStateAction<string | null>>;
  canvasHeight: string | null;
  setCanvasSizeWidth: React.Dispatch<React.SetStateAction<string | null>>;

  //Global Reposition Component for moving existing user data to a new position on the canvas.
  repositionInputOffSet: MutableRefObject<{ x: number; y: number }>;
  repositionData: any;
  setRepositionData: React.Dispatch<React.SetStateAction<{}>>;
  repositionWindow: TypeBooleanContext;
  setRepositionWindow: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;

  repositionInputCompRef: MutableRefObject<HTMLDivElement | null>;
  repositionInputCompPosRef: MutableRefObject<{ x: number; y: number }>;
}

const CanvasContextType = createContext<ICanvasContextType | undefined>(
  undefined,
);

const CanvasDataContextProvider = ({
  // source,
  children,
}: {
  // source: any;
  children: ReactNode;
}) => {
  const hasInitializedPositionRef = useRef<TypeBooleanContext>(false);
  //globally canvas div component that holds the users data
  const dataScrollBoardRef = useRef<HTMLDivElement>(null);
  //used as failsafe to prevent accidental dragging that pairs up with the context file from CanvasContextProvider.tsx

  const globalDraggingRef = useRef<TypeBooleanContext>(false);

  //Text Component
  //Canvas Text Button toggle logic on the ComponentHub popup box
  const textInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [textToggle, setTextToggle] = useState<TypeBooleanContext>(false);
  //find text input component's dom reference and x,y position under the
  //data-scroll-board component as absolute value
  const textInputCompRef = useRef<HTMLDivElement>(null);
  //for position reference
  let textInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //we are creating  link commponent where whole https links will open via a _blank page when clicked on.
  //Canvas Text Button toggle logic on the ComponentHub popup box
  const textLinkInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [textLinkToggle, setTextLinkToggle] =
    useState<TypeBooleanContext>(false);
  const textLinkInputCompRef = useRef<HTMLDivElement>(null);
  let textLinkInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Doughnut Chart Component
  //Canvas Doughnut Chart Button toggle logic on the ComponentHub popup box
  const doughnutChartInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [doughnutChartToggle, setDoughnutChartToggle] =
    useState<TypeBooleanContext>(false);
  const doughnutChartInputCompRef = useRef<HTMLDivElement>(null);
  //for position reference
  let doughnutChartInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //upcoming list feature
  //List Component
  const listInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [listToggle, setListToggle] = useState<TypeBooleanContext>(false);
  const listInputCompRef = useRef<HTMLDivElement>(null);
  let listInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //ListItem Component
  const listItemInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [listItemToggle, setListItemToggle] =
    useState<TypeBooleanContext>(false);
  const listItemInputCompRef = useRef<HTMLDivElement>(null);
  let listItemInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Audio Component---PLANNED COMPONENT NOT INTEGRATED
  //Canvas Audio Button toggle logic on the ComponentHub popup box
  const audioInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [audioToggle, setAudioToggle] = useState<TypeBooleanContext>(false);
  //find audio input component's dom reference and x,y position under the
  //data-scroll-board component as absolute value
  const audioInputCompRef = useRef<HTMLDivElement>(null);
  //for position reference
  const audioInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //IMAGE Component
  //Canvas Image Button toggle logic on the ComponentHub popup box
  const imageInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [imageToggle, setImageToggle] = useState<TypeBooleanContext>(false);
  //find text input component's dom reference and x,y position under the
  //data-scroll-board component as absolute value
  const imageInputCompRef = useRef<HTMLDivElement>(null);
  //for position reference
  const imageInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //VIDEO Component
  //Canvas Image Button toggle logic on the ComponentHub popup box
  const videoInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [videoToggle, setVideoToggle] = useState<TypeBooleanContext>(false);
  //find text input component's dom reference and x,y position under the
  //data-scroll-board component as absolute value
  const videoInputCompRef = useRef<HTMLDivElement>(null);
  //for position reference
  let videoInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //TABLE Component
  //Canvas Table Button toggle logic on the ComponentHub popup box
  const tableInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [tableToggle, setTableToggle] = useState<TypeBooleanContext>(false);
  const tableInputCompRef = useRef<HTMLDivElement>(null);
  let tableInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Element used to carry database user data and responsible for mapping with an addtional
  //'data' object to ensure the data is mappable from all fetches since the backend uses a
  //data object when returning mutiple types of data that the frontend requires.
  const [canvasData, setCanvasData] = useState<{}>({});
  const { userid, canvaid } = useParams();
  const router = useNavigate();

  const updateCanvasData = async () => {
    const routeResponse = await fetch(
      `http://localhost:5176/api/account/${userid}/canvas-management/${canvaid}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const response: any = await routeResponse.json();

    if (!response.success) {
      switch (response.code) {
        case "UNAUTHENTICATED":
          return redirectToSignIn();
        // break;
        default:
          console.log("route error");

          return {
            status: "error",
            message: response.message || "Unhandled backend condition.",
          };
      }
    } else {
      const latestData = {
        data: response,
      };
      setCanvasData(latestData);
    }
  };

  //Canvas height and width above Canvas Size Properties
  //toggle view and edit buttons
  const [canvasSizePropertiesToggle, setCanvasSizePropertiesToggle] =
    useState<TypeBooleanContext>(false);

  /////////////////HEIGHT + WIDTH/////////////////////////////
  //to adjust the data-scroll-board div element's width
  //both fields must be filled to update the canvas size
  const [canvasHeight, setCanvasSizeHeight] =
    useState<TypeCanvasInputContext>(""); //updates in real time per user request
  //to adjust the canvas-board div element's height
  const [canvasWidth, setCanvasSizeWidth] =
    useState<TypeCanvasInputContext>(""); //updates in real time per user request

  //Reposition Component state manager
  const [repositionWindow, setRepositionWindow] =
    useState<TypeBooleanContext>(false);
  const repositionInputOffSet = useRef<any>({ x: 0, y: 0 });
  const repositionInputCompRef = useRef<HTMLDivElement>(null);
  const repositionInputCompPosRef = useRef<any>({ x: 0, y: 0 });
  //data-scroll-board component as absolute value and is used to update the position of a fragment.
  //purpose of compoent??????? --carrie x amount of data for the media draggable
  const [repositionData, setRepositionData] = useState<{}>({});

  //latest version
  //Center draggable Input and reposition UIs when they appear.
  useEffect(() => {
    if (textToggle === false) {
      hasInitializedPositionRef.current = false;
    }
    if (doughnutChartToggle === false) {
      hasInitializedPositionRef.current = false;
    }
    if (textLinkToggle === false) {
      hasInitializedPositionRef.current = false;
    }
    if (imageToggle === false) {
      hasInitializedPositionRef.current = false;
    }
    if (videoToggle === false) {
      hasInitializedPositionRef.current = false;
    }
    if (tableToggle === false) {
      hasInitializedPositionRef.current = false;
    }
    if (repositionWindow === false) {
      hasInitializedPositionRef.current = false;
    }
  }, [
    textToggle,
    doughnutChartToggle,
    textLinkToggle,
    imageToggle,
    videoToggle,
    tableToggle,
    repositionWindow,
  ]);
  return (
    <CanvasContextType.Provider
      value={{
        hasInitializedPositionRef,
        dataScrollBoardRef,
        globalDraggingRef,

        //Text Button toggle functions
        textInputOffSet,
        textToggle,
        setTextToggle,
        textInputCompPosRef,
        textInputCompRef,

        //Text Button toggle functions
        textLinkInputOffSet,
        textLinkToggle,
        setTextLinkToggle,
        textLinkInputCompPosRef,
        textLinkInputCompRef,

        //Doughnut Chart Button toggle functions
        doughnutChartInputOffSet,
        doughnutChartToggle,
        setDoughnutChartToggle,
        doughnutChartInputCompRef,
        doughnutChartInputCompPosRef,

        //upcoming list feature
        listInputOffSet,
        listToggle,
        setListToggle,
        listInputCompRef,
        listInputCompPosRef,

        //upcoming list item feature
        listItemInputOffSet,
        listItemToggle,
        setListItemToggle,
        listItemInputCompRef,
        listItemInputCompPosRef,

        //Audio Button toggle functions
        audioInputOffSet,
        audioToggle,
        setAudioToggle,
        audioInputCompRef,
        audioInputCompPosRef,

        //Image Button toggle functions
        imageInputOffSet,
        imageToggle,
        setImageToggle,
        imageInputCompRef,
        imageInputCompPosRef,

        //Video Button toggle functions
        videoInputOffSet,
        videoToggle,
        setVideoToggle,
        videoInputCompRef,
        videoInputCompPosRef,

        //Table Button toggle functions
        tableInputOffSet,
        tableToggle,
        setTableToggle,
        tableInputCompRef,
        tableInputCompPosRef,

        //data
        canvasData,
        setCanvasData,
        updateCanvasData,

        //Canvas size height and width
        canvasSizePropertiesToggle,
        setCanvasSizePropertiesToggle,
        canvasHeight,
        setCanvasSizeHeight,
        canvasWidth,
        setCanvasSizeWidth,

        //reposition component
        repositionData,
        setRepositionData,
        repositionWindow,
        setRepositionWindow,
        repositionInputOffSet,
        repositionInputCompRef,
        repositionInputCompPosRef,
      }}
    >
      {children}
    </CanvasContextType.Provider>
  );
};

export default CanvasDataContextProvider;

export const useCanvasContext = () => {
  const context = useContext(CanvasContextType);
  if (!context)
    throw new Error(
      "useCanvasContext must be used inside CanvasDataContextProvider",
    );
  return context;
};
