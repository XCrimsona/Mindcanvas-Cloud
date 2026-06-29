import { DivClass } from "../lib/ui/Div";
import DataManagement from "./CanvasManagement";
import AuthHeader from "../auth/auth-partials/AuthHeader";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style-files/management.css";
import { ToastContainer } from "react-toastify";

const InitialDashboardPageComponent = () => {
  const [canvaDataLoad, setCanvaDataLoad] = useState<any>({});
  const { userid } = useParams();
  const router = useNavigate();
  if (!userid) return;
  const fetchEssentialData = async () => {
    const response = await fetch(
      `http://localhost:5176/api/account/${userid}/canvas-management`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (response.ok) {
      const data = await response.json();
      setCanvaDataLoad(data);
    } else {
      const error = await response.json();
      if (error.message === "Not Authenticated" && error.status === 404) {
        router("/signin-portal");
      } else if (error.message === "User not found" && error.status === 404) {
        router("/signin-portal");
      }
    }
  };

  useEffect(() => {
    document.title = "Canva Management | MindCanvas";
    fetchEssentialData();
  }, []);
  return (
    <DivClass className={"main-workspace-management-container"}>
      <AuthHeader />
      <ToastContainer position="top-left"></ToastContainer>
      <DataManagement source={canvaDataLoad} />
    </DivClass>
  );
};

export default InitialDashboardPageComponent;
