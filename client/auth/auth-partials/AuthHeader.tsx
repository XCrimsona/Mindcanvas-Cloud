import Header from "../../lib/components/Header";
import { DivClass } from "../../lib/ui/Div";
import { useParams } from "react-router-dom";
import RouteLink from "../../lib/components/ProductSection/RouteLink";
import "../auth-header.css";

const AuthHeader = () => {
  const { userid } = useParams();
  if (!userid) return;
  const logout = async () => {
    const logoutRes = await fetch(
      `http://localhost:5176/api/account/${userid}/logout`,
      {
        method: "POST",
        credentials: "include",
        headers: { "x-active-user": userid },
      },
    );

    if (!logoutRes.ok) {
      new Notification("Could not log you out, try again");
    } else {
      window.location.assign("/signin-portal");
    }
  };
  return (
    <Header id="auth-header" className={"auth-header"}>
      <DivClass className={"account-dashboard-content"}>
        <DivClass className={`${"dashboard-link-component"}`}>
          <RouteLink
            className={"auth-link-component-built-in-app underline"}
            href={`/account/${userid}/account-info`}
          >
            Account Info
          </RouteLink>
          <div onClick={logout} className="log-out">
            {/*call logout and refresh to take to login */}
            Log out
          </div>
        </DivClass>
      </DivClass>
    </Header>
  );
};

export default AuthHeader;
