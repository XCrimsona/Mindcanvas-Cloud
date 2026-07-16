// =========================================================================
// AUTH AUDIT — FetchCanvaContext
// Read-side handlers. A failed fetch here means the dashboard / workspace
// can't render, so an auth boundary check is mandatory.
//
//   fetchEssentialData    GET  /account/:userid/canvas-management              auth: YES
//   fetchWorkspaceData    GET  /account/:userid/canvas-management/:workspaceid auth: YES (via UNAUTHENTICATED code)
//
// Pattern: when !response.ok, parse body and call redirectToSignIn() if the
// message/code indicates auth failure.
// =========================================================================
import { createContext, ReactNode, useContext, useState } from "react";
import { redirectToSignIn } from "../auth-redirect/AuthRedirectContext";

//for toggling
interface ICanvaDataContextType {
  canvaData: {};
  setCanvaData: any;
  //function carries data for canva management and canva space
  fetchEssentialData: (userid: string) => {};
  //2nd function
  fetchWorkspaceData: (userid: string, workspaceid: string) => {};
}

// Context for managing shared state across components
const CanvaDataContext = createContext<ICanvaDataContextType | null>(null);

export const CanvaDataProvider = ({ children }: { children: ReactNode }) => {
  const [canvaData, setCanvaData] = useState<any>({});

  //Carry canva data between pages by fetching canva space mandatory data for preview name and description and then the actual data to allow the 2nd functionbelow this one to collect workspace data
  const fetchEssentialData = async (userid: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (response.ok) {
      const data = await response.json();
      // console.log(data);
      // console.log("data from response: ", data);

      setCanvaData(data);
      // console.log("frontend dashboard initial user data: ", data);
    } else {
      const issue = await response.json();
      if (issue.message === "Not Authenticated") redirectToSignIn();
      console.log(issue);
      console.log("frontend dashboard initial user data: ", issue);
    }
  };

  //find the canva data based on the selected canva space

  const fetchWorkspaceData = async (userid: string, workspaceid: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${workspaceid}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (!response.ok) {
      const data = await response.json();
      switch (data.code) {
        case "UNAUTHENTICATED":
          return redirectToSignIn();
        case "NO_WORKSPACE_DATA":
          return {
            status: "empty",
            message: data.message,
          };
        case "NO_USER_DATA":
          return {
            status: "empty",
            message: data.message,
          };
        default:
          console.log("route error");

          return {
            status: "error",
            message: data.message || "Unhandled backend condition.",
          };
      }
    } else {
      const data = await response.json();

      return {
        status: "success",
        data: data.data,
      };
    }
  };
  return (
    <CanvaDataContext.Provider
      value={{
        fetchWorkspaceData,
        fetchEssentialData,
        canvaData,
        setCanvaData,
      }}
    >
      {children}
    </CanvaDataContext.Provider>
  );
};

export const useFetchCanvaContext = () => {
  const context = useContext(CanvaDataContext);
  if (!context) {
    throw new Error(
      "useFetchCanvaContext must be used within CanvaDataProvider ",
    );
  }
  return context;
};
