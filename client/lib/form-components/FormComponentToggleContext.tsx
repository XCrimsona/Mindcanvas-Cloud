// ─── PURPOSE ─────────────────────────────────────────────────────────
// FormComponentToggleContext — owns everything the FORM side of the
// canvas cares about:
//   - Per-media-type "toggle" booleans (textToggle, imageToggle, ...)
//     that gate whether each form-component is currently mounted onto
//     the Canvaspace.
//   - Per-type DOM refs and positional refs used by each input unit
//     while the user drags it around before submitting.
//   - Shared drag primitives (dataScrollBoardRef, globalDraggingRef,
//     hasInitializedPositionRef) that the current per-file drag
//     handlers still read. These will retire when
//     useFormComponentDrag replaces those handlers.
//
// Consumed by: form-components (TextInputUnit, LinkInputUnit, ...),
// their toggler buttons in CanvasHub, and CanvaContainer for the
// scroll-board ref.
//
// Does NOT own: canvas data (see CanvasFragmentDataContext) or
// reposition legacy state (see the compat wrapper).
// ─────────────────────────────────────────────────────────────────────
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type TypeBooleanContext = true | false;

interface IFormComponentToggleContext {
  hasInitializedPositionRef: MutableRefObject<boolean>;
  dataScrollBoardRef: MutableRefObject<HTMLDivElement | null>;
  globalDraggingRef: MutableRefObject<TypeBooleanContext>;

  //Text
  textInputOffSet: MutableRefObject<{ x: number; y: number }>;
  textToggle: TypeBooleanContext;
  setTextToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  textInputCompRef: MutableRefObject<HTMLDivElement | null>;
  textInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //TextLink
  textLinkInputOffSet: MutableRefObject<{ x: number; y: number }>;
  textLinkToggle: TypeBooleanContext;
  setTextLinkToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  textLinkInputCompRef: MutableRefObject<HTMLDivElement | null>;
  textLinkInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Doughnut Chart
  doughnutChartInputOffSet: MutableRefObject<{ x: number; y: number }>;
  doughnutChartToggle: TypeBooleanContext;
  setDoughnutChartToggle: React.Dispatch<
    React.SetStateAction<TypeBooleanContext>
  >;
  doughnutChartInputCompRef: MutableRefObject<HTMLDivElement | null>;
  doughnutChartInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //List (upcoming)
  listInputOffSet: MutableRefObject<{ x: number; y: number }>;
  listToggle: TypeBooleanContext;
  setListToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  listInputCompRef: MutableRefObject<HTMLDivElement | null>;
  listInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //ListItem (upcoming)
  listItemInputOffSet: MutableRefObject<{ x: number; y: number }>;
  listItemToggle: TypeBooleanContext;
  setListItemToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  listItemInputCompRef: MutableRefObject<HTMLDivElement | null>;
  listItemInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Audio (not functional yet)
  audioInputOffSet: MutableRefObject<{ x: number; y: number }>;
  audioToggle: TypeBooleanContext;
  setAudioToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  audioInputCompRef: MutableRefObject<HTMLDivElement | null>;
  audioInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Image
  imageInputOffSet: MutableRefObject<{ x: number; y: number }>;
  imageToggle: TypeBooleanContext;
  setImageToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  imageInputCompRef: MutableRefObject<HTMLDivElement | null>;
  imageInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Video
  videoInputOffSet: MutableRefObject<{ x: number; y: number }>;
  videoToggle: TypeBooleanContext;
  setVideoToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  videoInputCompRef: MutableRefObject<HTMLDivElement | null>;
  videoInputCompPosRef: MutableRefObject<{ x: number; y: number }>;

  //Table
  tableInputOffSet: MutableRefObject<{ x: number; y: number }>;
  tableToggle: TypeBooleanContext;
  setTableToggle: React.Dispatch<React.SetStateAction<TypeBooleanContext>>;
  tableInputCompRef: MutableRefObject<HTMLDivElement | null>;
  tableInputCompPosRef: MutableRefObject<{ x: number; y: number }>;
}

const FormComponentToggleContext = createContext<
  IFormComponentToggleContext | undefined
>(undefined);

export const FormComponentToggleProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const hasInitializedPositionRef = useRef<TypeBooleanContext>(false);
  const dataScrollBoardRef = useRef<HTMLDivElement>(null);
  const globalDraggingRef = useRef<TypeBooleanContext>(false);

  //Text
  const textInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [textToggle, setTextToggle] = useState<TypeBooleanContext>(false);
  const textInputCompRef = useRef<HTMLDivElement>(null);
  const textInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //TextLink
  const textLinkInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [textLinkToggle, setTextLinkToggle] =
    useState<TypeBooleanContext>(false);
  const textLinkInputCompRef = useRef<HTMLDivElement>(null);
  const textLinkInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Doughnut Chart
  const doughnutChartInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [doughnutChartToggle, setDoughnutChartToggle] =
    useState<TypeBooleanContext>(false);
  const doughnutChartInputCompRef = useRef<HTMLDivElement>(null);
  const doughnutChartInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //List
  const listInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [listToggle, setListToggle] = useState<TypeBooleanContext>(false);
  const listInputCompRef = useRef<HTMLDivElement>(null);
  const listInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //ListItem
  const listItemInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [listItemToggle, setListItemToggle] =
    useState<TypeBooleanContext>(false);
  const listItemInputCompRef = useRef<HTMLDivElement>(null);
  const listItemInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Audio
  const audioInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [audioToggle, setAudioToggle] = useState<TypeBooleanContext>(false);
  const audioInputCompRef = useRef<HTMLDivElement>(null);
  const audioInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Image
  const imageInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [imageToggle, setImageToggle] = useState<TypeBooleanContext>(false);
  const imageInputCompRef = useRef<HTMLDivElement>(null);
  const imageInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Video
  const videoInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [videoToggle, setVideoToggle] = useState<TypeBooleanContext>(false);
  const videoInputCompRef = useRef<HTMLDivElement>(null);
  const videoInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Table
  const tableInputOffSet = useRef<any>({ x: 0, y: 0 });
  const [tableToggle, setTableToggle] = useState<TypeBooleanContext>(false);
  const tableInputCompRef = useRef<HTMLDivElement>(null);
  const tableInputCompPosRef = useRef<any>({ x: 0, y: 0 });

  //Re-centre form-components each time a toggle closes then reopens
  useEffect(() => {
    if (
      !textToggle ||
      !doughnutChartToggle ||
      !textLinkToggle ||
      !imageToggle ||
      !videoToggle ||
      !tableToggle
    ) {
      hasInitializedPositionRef.current = false;
    } else {
      //at least one form-component is open; leave the ref alone
    }
  }, [
    textToggle,
    doughnutChartToggle,
    textLinkToggle,
    imageToggle,
    videoToggle,
    tableToggle,
  ]);

  return (
    <FormComponentToggleContext.Provider
      value={{
        hasInitializedPositionRef,
        dataScrollBoardRef,
        globalDraggingRef,

        textInputOffSet,
        textToggle,
        setTextToggle,
        textInputCompRef,
        textInputCompPosRef,

        textLinkInputOffSet,
        textLinkToggle,
        setTextLinkToggle,
        textLinkInputCompRef,
        textLinkInputCompPosRef,

        doughnutChartInputOffSet,
        doughnutChartToggle,
        setDoughnutChartToggle,
        doughnutChartInputCompRef,
        doughnutChartInputCompPosRef,

        listInputOffSet,
        listToggle,
        setListToggle,
        listInputCompRef,
        listInputCompPosRef,

        listItemInputOffSet,
        listItemToggle,
        setListItemToggle,
        listItemInputCompRef,
        listItemInputCompPosRef,

        audioInputOffSet,
        audioToggle,
        setAudioToggle,
        audioInputCompRef,
        audioInputCompPosRef,

        imageInputOffSet,
        imageToggle,
        setImageToggle,
        imageInputCompRef,
        imageInputCompPosRef,

        videoInputOffSet,
        videoToggle,
        setVideoToggle,
        videoInputCompRef,
        videoInputCompPosRef,

        tableInputOffSet,
        tableToggle,
        setTableToggle,
        tableInputCompRef,
        tableInputCompPosRef,
      }}
    >
      {children}
    </FormComponentToggleContext.Provider>
  );
};

export const useFormComponentToggle = () => {
  const context = useContext(FormComponentToggleContext);
  if (!context) {
    throw new Error(
      "useFormComponentToggle must be used inside FormComponentToggleProvider",
    );
  } else {
    return context;
  }
};
