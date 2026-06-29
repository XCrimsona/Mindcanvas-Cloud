import Header from "../components/Header";
import { DivClass } from "../ui/Div";
import { useParams, useNavigate } from "react-router-dom";
import RouteLink from "../components/ProductSection/RouteLink";
import "./auth-workspaceheader.css";
import SVG from "../SVG";

const AuthCanvasHeader = () => {
  const { userid } = useParams();
  const router = useNavigate();
  const logout = async () => {
    const logoutRes = await fetch(
      `http://localhost:5176/api/account/${userid!}/logout`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!logoutRes.ok) {
      new Notification("Could not log you out, try again");
      router("/signin-portal");
    } else {
      router("/signin-portal");
    }
  };
  return (
    <Header id="auth-canva-header" className={"auth-canva-header"}>
      <DivClass className={"auth-canva-route"}>
        <RouteLink
          href={`/account/${userid}/canvas-management`}
          className={"auth-go-back-route"}
        >
          <i className={"auth-route-icon"}>
            <SVG
              src={"/backwards-solid.svg"}
              className={"canva-management-backward-arrow-nav-icon"}
              alt="backward-icon"
            />
          </i>
          Canvas Management
        </RouteLink>
        <div onClick={logout} className="log-out">
          {/*call logout and refresh to take to login */}
          Log out
        </div>
      </DivClass>
    </Header>
  );
};

export default AuthCanvasHeader;
