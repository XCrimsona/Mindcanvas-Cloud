import { createContext, ReactNode, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// 1. Create context

interface IInfoContextProps {
  accountData: {};
  fetchUserInfo: () => void;
  requestAccountDeletion: () => void;
}
const InfoContext = createContext<IInfoContextProps | null>(null);

// 2. Provider component
export const InfoProvider = ({ children }: { children: ReactNode }) => {
  const [accountData, setAccountData] = useState<{}>({});
  const { userid } = useParams();
  const router = useNavigate();

  const fetchUserInfo = async () => {
    const response: any = await fetch(
      `http://localhost:5176/api/account/${userid!}/account-info`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (response.ok) {
      const resData: any = await response.json();
      setAccountData(resData);
    } else {
      const resData: any = await response.json();
      if (resData.message === "Failed to retrieve" || resData.status === 404) {
        router("/signin-portal");
      }
    }
  };

  const requestAccountDeletion = async () => {
    const response: any = await fetch(
      `http://localhost:5176/api/account/${userid!}/account-info`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    if (response.ok) {
      const response2 = await response.json();

      if (response2.code === "SINGLE_USER_DATA_DELETED") {
        router("/");
      }
    } else {
      toast.info("Failed to delete Account, try again in 10 minutes");
    }
  };
  return (
    <InfoContext.Provider
      value={{
        accountData,
        fetchUserInfo,
        requestAccountDeletion,
      }}
    >
      {children}
    </InfoContext.Provider>
  );
};

// 3. Custom hook (optional but recommended)
export const useInfo = () => {
  const context = useContext(InfoContext);
  if (!context) {
    throw new Error("useInfo must be used within InfoProvider ");
  }
  return context;
};
