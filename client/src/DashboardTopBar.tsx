// ─── PURPOSE ─────────────────────────────────────────────────────────
// DashboardTopBar — the top strip of the Canvaspace Dashboard.
// NEW FILE (Canvaspace Dashboard rework).
//
// Replaces the old <AuthHeader /> that used to wrap the dashboard.
// The new visual language puts three inline pills at the top-right of
// the right-hand panel:
//
//   Hello, <user>         [Account Info]              [Logout]
//
// Logout logic is inlined here (POST /logout → redirect) instead of
// living inside a shared Header component. Rationale: the design brief
// wants logout available only on specific pages, not everywhere.
// AuthHeader still exists for the /account-info page — do not delete it.
// ─────────────────────────────────────────────────────────────────────

import { useParams } from "react-router-dom";
import RouteLink from "../lib/components/ProductSection/RouteLink";
import { DivClass } from "../lib/ui/Div";

interface Props {
  userLabel?: string;
}

const DashboardTopBar = ({ userLabel = "" }: Props) => {
  const { userid } = useParams();

  const logout = async () => {
    if (!userid) return;
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/account/${userid}/logout`,
      { method: "POST", credentials: "include" },
    );
    if (!res.ok) {
      new Notification("Could not log you out, try again");
      return;
    }
    window.location.assign("/signin-portal");
  };

  return (
    <DivClass className="dashboard-topbar">
      <DivClass className="dashboard-hello">
        Hello {userLabel ? `${userLabel}` : ""}
      </DivClass>
      <DivClass className="dashboard-account-info-pill">
        <RouteLink
          href={`/account/${userid}/account-info`}
          className="dashboard-account-info-link"
        >
          Account Info
        </RouteLink>
      </DivClass>
      <DivClass className="dashboard-logout-pill">
        <button className="dashboard-logout-button" onClick={logout}>
          Logout
        </button>
      </DivClass>
    </DivClass>
  );
};

export default DashboardTopBar;
