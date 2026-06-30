// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home.tsx";
import SignInPage from "./pages/mindcanvas-portal/signin/page.tsx";
import SignUpPage from "./pages/mindcanvas-portal/signup/page.tsx";
import "./main.css";
import InitialDashboardPageComponent from "./InitialDashboardPageComponent.tsx";
import CanvaPage from "./pages/account/accountid/canvas-management/CanvaPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import AccountPage from "./pages/account/accountid/account-info/AccountPage.tsx";
import { InfoProvider } from "./pages/account/accountid/account-info/InfoContext.tsx";
import LearnToUseMindCanvas from "./pages/account/accountid/canvas-management/academy/LearnToUseMindCanvas.tsx";
import Trust from "./pages/trust/Trust.tsx";
import About from "./pages/about/About.tsx";
import { AuthRedirectProvider } from "../lib/auth-redirect/AuthRedirectContext.tsx";

createRoot(document.getElementById("root") as HTMLDivElement).render(
  <BrowserRouter>
    <AuthRedirectProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trust" element={<Trust />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin-portal" element={<SignInPage />} />
        <Route path="/signup-portal" element={<SignUpPage />} />
        <Route
          path="/account/:userid/canvas-management"
          element={
            <ProtectedRoute>
              <InitialDashboardPageComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:userid/canvas-management/:canvaid"
          element={
            <ProtectedRoute>
              <CanvaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:userid/canvas-management/:canvaid/academy"
          element={
            <ProtectedRoute>
              <LearnToUseMindCanvas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:userid/account-info"
          element={
            <ProtectedRoute>
              <InfoProvider>
                <AccountPage />
              </InfoProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthRedirectProvider>
  </BrowserRouter>,
);
