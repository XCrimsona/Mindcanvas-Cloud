// ─── PURPOSE ─────────────────────────────────────────────────────────
// CanvaspaceManagement — the Canvaspace Dashboard shell (post-rework).
//
// CHANGED IN THIS REVISION:
//   - Removed the old grid-of-editable-cards layout entirely.
//   - Removed rename-in-place (workspaceEdits / currentWorkspacePreEdits
//     state, updateWorkspace PATCH flow, view/edit toggle buttons).
//   - Removed the inline "New Canvaspace" toggle + temp form field UI.
//   - Removed the local `Canvasses` inner component (React anti-pattern
//     we fixed earlier — component identity changed every render).
//
// WHAT THIS FILE NOW DOES:
//   Composes the three dashboard pieces:
//     - CanvaspaceSidebar (left column: search, create, count, list)
//     - DashboardTopBar   (top of right column: hello, account info, logout)
//     - TodoPanel         (main right area — todo lists — Phase 3 stub)
//
// The old CRUD logic (fetchMoreData, updateWorkspace, saveWorkspace,
// toggleASingleWorkspace, workspaceEdits/preEdits state) is either
// gone or moved into the appropriate subcomponent. The search feature
// that was commented-out in the old file is now implemented (client-
// side filter) inside CanvaspaceSidebar.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style-files/management.css";
import { DivClass } from "../lib/ui/Div";
import CanvaspaceSidebar from "./CanvaspaceSidebar";
import DashboardTopBar from "./DashboardTopBar";
import TodoPanel from "./TodoPanel";
import { redirectToSignIn } from "../lib/auth-redirect/AuthRedirectContext";

const CanvaspaceManagement = ({ source }: { source: any }) => {
  const { userid } = useParams();
  const [canvaData, setCanvaData] = useState<any[]>([]);
  const [username, setUserName] = useState<any>({});

  const fetchCanvaspaces = async () => {
    if (!userid) return;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.ok) {
      const data = await response.json();
      data.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      // console.log("data: ", data);
      setUserName(data.user);
      setCanvaData(data.data);
    } else {
      const issue = await response.json();
      if (issue.message === "Not Authenticated") redirectToSignIn();
    }
  };

  useEffect(() => {
    if (source?.data) setCanvaData(source.data);
    fetchCanvaspaces();
  }, []);

  return (
    <DivClass className="canvaspace-dashboard-shell">
      <CanvaspaceSidebar
        canvaData={canvaData}
        onCanvaCreated={fetchCanvaspaces}
      />
      <DivClass className="dashboard-right-column">
        <DashboardTopBar userLabel={username} />
        <TodoPanel />
      </DivClass>
    </DivClass>
  );
};

export default CanvaspaceManagement;
