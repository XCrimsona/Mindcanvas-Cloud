import { ReactNode, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isloading, setIsLoading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState(false);
  const { userid } = useParams();

  useEffect(() => {
    if (!userid) return;
    fetch(`${import.meta.env.VITE_API_CLOUD_URL}/api/auth-check`, {
      method: "GET",
      credentials: "include", //allow cookies to be sent
    })
      .then((response: any) => response.json())
      .then((data) => {
        if (data.code === "AUTHENTICATED") {
          setIsAuth(true);
        } else {
          setIsAuth(false);
          new Notification("Verify Your Identity", {
            body: "Login to continue",
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsAuth(false);
        setIsLoading(false);
      });
  }, []);

  if (isloading) return <div>...loading</div>;
  if (!isAuth) return <Navigate to={"/signin-portal"} replace />;
  // return <>{children}</>;
  return children;
};

export default ProtectedRoute;
