import { useEffect } from "react";
import { DivClass } from "../../../../lib/ui/Div";
import "../mind-canvas-portal.css";
import Signup from "./Signup";

const SignUpPage = () => {
  //wake up the DB ops for incoming requests
  const signUpInit = async () => {
    await fetch(`${import.meta.env.VITE_API_CLOUD_URL}/api/signup-portal`);
  };
  useEffect(() => {
    document.title = "Signup Page";
    signUpInit();
  }, []);

  return (
    <DivClass className={"sign-up-page"}>
      <Signup />
    </DivClass>
  );
};

export default SignUpPage;
