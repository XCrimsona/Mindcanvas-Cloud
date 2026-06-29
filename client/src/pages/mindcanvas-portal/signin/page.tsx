import { DivClass } from "../../../../lib/ui/Div";
import Signin from "./Signin";
import "../mind-canvas-portal.css";
import "../mind-canvas-portal-media-queries.css";
import { useEffect } from "react";

const SignInPage = () => {
  //wake up the DB ops for incoming requests
  const signInInit = async () => {
    await fetch("http://localhost:5176/api/signin-portal", {
      method: "GET",
      credentials: "include",
    });
  };

  useEffect(() => {
    document.title = "Signin Page";
    signInInit();
  }, []);

  return (
    <DivClass className={"sign-in-page"}>
      <Signin />
    </DivClass>
  );
};

export default SignInPage;
