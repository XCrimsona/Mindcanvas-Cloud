// ─── PURPOSE ─────────────────────────────────────────────────────────
// InitialDashboardPageComponent — outermost wrapper of the Canvaspace
// Dashboard page (mounted at /account/:userid/canvas-management).
//
// CHANGED IN THIS REVISION:
//   - Removed <AuthHeader /> from this page. The dashboard has its
//     own inline top-row (Hello / Account Info / Logout) rendered by
//     DashboardTopBar inside CanvaspaceManagement.
//   - Kept the essential-data fetch and the ToastContainer.
//
// AuthHeader.tsx is NOT deleted — it's still used by /account-info.
// ─────────────────────────────────────────────────────────────────────

import { DivClass } from "../lib/ui/Div";
import CanvaspaceManagement from "./CanvaspaceManagement";
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
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management`,
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
      if (
        (error.message === "Not Authenticated" && error.status === 404) ||
        (error.message === "User not found" && error.status === 404)
      ) {
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
      <ToastContainer position="top-left" />
      <CanvaspaceManagement source={canvaDataLoad} />
    </DivClass>
  );
};

export default InitialDashboardPageComponent;
