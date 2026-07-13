// ─── PURPOSE ─────────────────────────────────────────────────────────
// CanvasFragmentDataContext — owns everything the LIVE side of the
// canvas cares about: the fetched fragment data, the setter, and the
// re-fetch trigger.
//
// Consumed by: CanvasData, DraggableFragment, and every live-component
// (Text, TextLink, Image, Video, Table, DoughnutChart) that needs to
// read the canvas payload or ask for a refresh after mutation.
//
// Does NOT own: form-component toggles / refs (see
// FormComponentToggleContext) or reposition legacy state (that lives
// on the compat wrapper until Move Fragment is fully retired).
// ─────────────────────────────────────────────────────────────────────
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { redirectToSignIn } from "../auth-redirect/AuthRedirectContext";

interface ICanvasFragmentDataContext {
  canvasData: any | null;
  setCanvasData: React.Dispatch<React.SetStateAction<any | null>>;
  updateCanvasData: () => void;
}

const CanvasFragmentDataContext = createContext<
  ICanvasFragmentDataContext | undefined
>(undefined);

export const CanvasFragmentDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  try {
    const [canvasData, setCanvasData] = useState<{}>({});
    const { userid, canvaid } = useParams();

    const updateCanvasData = async () => {
      const routeResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const response: any = await routeResponse.json();

      if (!response.success) {
        if (response.code === "UNAUTHENTICATED") {
          redirectToSignIn();
        } else {
          console.log("route error");
        }
      } else {
        const latestData = { data: response };
        setCanvasData(latestData);
      }
    };

    return (
      <CanvasFragmentDataContext.Provider
        value={{ canvasData, setCanvasData, updateCanvasData }}
      >
        {children}
      </CanvasFragmentDataContext.Provider>
    );
  } catch (err: any) {
    console.warn(
      "Something went wrong inside CanvasFragmentDataProvider: ",
      err.message,
    );
    return <>{children}</>;
  }
};

export const useCanvasFragmentData = () => {
  const context = useContext(CanvasFragmentDataContext);
  if (!context) {
    throw new Error(
      "useCanvasFragmentData must be used inside CanvasFragmentDataProvider",
    );
  } else {
    return context;
  }
};
