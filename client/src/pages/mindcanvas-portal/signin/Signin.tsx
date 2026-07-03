import React, { FormEvent, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

//custom built dry components
import { DivClass } from "../../../../lib/ui/Div";
import Section from "../../../../lib/ui/Section";
import Label from "../../../../lib/components/form-elements/Label";
import HeadingOne from "../../../../lib/ui/HeadingOne";
import "../mind-canvas-portal.css";
import {
  InputEmail,
  InputPassword,
  InputSubmit,
} from "../../../../lib/components/form-elements/dry-InputFormComponents";
import { LongText } from "../../../../lib/ui/LongText";
import Button from "../../../../lib/components/form-elements/Button";

//for navigating content
import RouteLink from "../../../../lib/components/ProductSection/RouteLink";
import { toast, ToastContainer } from "react-toastify";

interface formData {
  email: string;
  password: string;
}

const Signin = () => {
  try {
    const location = useLocation();
    const router = useNavigate();

    const [uiPastEmail, setUiPastEmail] = useState<boolean>(false);
    const [accountVerified, setAccountVerified] = useState<boolean>(false);
    const [recoveryFormData, setRecoveryFormData] = useState<formData>({
      email: "",
      password: "",
    });
    const [formData, setFormData] = useState<formData>({
      email: "",
      password: "",
    });
    const [recoverySubmitLock, setRecoverySubmitLock] = useState<boolean>(true);
    const [loginSubmitLock, setLoginSubmitLock] = useState<boolean>(true);

    const verifyUserExistence = async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        toast.info("Please wait...", { autoClose: 2500 });
        const userData: any = {};
        if (recoveryFormData.email) userData.email = recoveryFormData.email;
        if (!userData) {
          toast.info("Complete the email field under account recovery");
        } else {
          //data will be sent to the backend to check for an existing user
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/signin-portal/account-recovery`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            },
          );
          //want to try a new feature: socket.io
          //for real-time notifcations to check login success or failed to verify
          if (response.ok) {
            const data: any = await response.json();
            setAccountVerified(true);
            setUiPastEmail(true);
            toast.info(`${data.message}`);
          } else {
            const error = await response.json();
            toast.error(`${error.message}`, {
              autoClose: 10000,
            });
          }
        }
      } catch (err: any) {
        console.warn("Something went wrong", {
          message: err?.message,
          stack: err?.stack,
          apiUrl: import.meta.env.VITE_API_URL,
          mode: import.meta.env.MODE,
        });
      }
    };

    // controls the availability of the main recovery submit button
    useEffect(() => {
      if (recoveryFormData.email && recoveryFormData.password) {
        setRecoverySubmitLock(false);
      } else {
        setRecoverySubmitLock(true);
      }
    }, [recoverySubmitLock, recoveryFormData.email, recoveryFormData.password]);

    const recoverUserAccount = async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        toast.info("Please wait...", { autoClose: 2500 });
        const userData: any = {};
        if (recoveryFormData.email) userData.email = recoveryFormData.email;
        if (recoveryFormData.password)
          userData.password = recoveryFormData.password;

        if (!userData) {
          toast.info("Complete the form fields under account recovery");
        } else {
          //data will be sent to the backend to check for an existing user
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/signin-portal/account-recovery`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            },
          );
          //want to try a new feature: socket.io
          //for real-time notifcations to check login success or failed to verify
          if (response.ok) {
            const data: any = await response.json();
            toast.info(`${data.message}`);
            toggleSwitchForm();
          } else {
            const error = await response.json();
            toast.error(`error: ${error.message}`, {
              autoClose: 10000,
            });
          }
        }
      } catch (err: any) {
        console.warn("Something went wrong", {
          message: err?.message,
          stack: err?.stack,
          apiUrl: import.meta.env.VITE_API_URL,
          mode: import.meta.env.MODE,
        });
      }
    };

    // controls the availability of the main verify/login submit button
    useEffect(() => {
      if (formData.email && formData.password) {
        setLoginSubmitLock(false);
      } else {
        setLoginSubmitLock(true);
      }
    }, [loginSubmitLock, formData.email, formData.password]);

    const processSignIn = async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        toast.info("Please wait...", { autoClose: 2500 });
        const loginData: any = {};
        if (formData.email) loginData.email = formData.email;
        if (formData.password) loginData.password = formData.password;
        if (!loginData) {
          toast.info("Complete the login fields");
        }

        if (loginSubmitLock === false) {
          //data will be sent to the backend from here
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/signin-portal`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(loginData),
            },
          );
          //want to try a new feature: socket.io
          //for real-time notifcations to check login success or failed to verify
          if (response.ok) {
            const data: any = await response.json();
            // console.log("pulled data", data);

            //checks for saved redirects via the ProtectedRoutes React component
            const from = location.state?.from;
            if (from) {
              router(from, { replace: true });
            } else {
              router(`/account/${data.user}/canvas-management`, {
                replace: true,
              });
            }
          } else {
            const error = await response.json();
            toast.error(`Signin failed: ${error.message}`, { autoClose: 4000 });
          }
        }
      } catch (err: any) {
        console.warn("Something went wrong", {
          message: err?.message,
          stack: err?.stack,
          apiUrl: import.meta.env.VITE_API_URL,
          mode: import.meta.env.MODE,
        });
      }
    };

    const formCancelled = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormData({
        ...formData,
        email: "",
        password: "",
      });
    };

    //change the UI between the login and password resert
    const [switchForms, setSwitchForms] = useState<string>("sign-in");
    const toggleSwitchForm = () => {
      setSwitchForms((prev) =>
        prev === "sign-in" ? "password-reset" : "sign-in",
      );
    };

    return (
      <Section
        id="sign-in-container"
        ariaLabelledBy="sign-in"
        className="sign-in-block"
      >
        <ToastContainer position="top-right"></ToastContainer>
        <HeadingOne id="sign-in" className="heading-one">
          {switchForms === "sign-in" ? "Sign In" : "Account Recovery"}
        </HeadingOne>
        {switchForms === "sign-in" ? (
          <>
            <form
              className="form-sign-in"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                processSignIn(e);
              }}
              autoSave="off"
              autoCorrect="off"
              autoComplete="off"
              autoFocus={false}
              autoCapitalize="off"
            >
              <DivClass className="form-data-container">
                <DivClass className="label-wrapper">
                  <Label
                    htmlfor="email-input"
                    className="sign-in-label"
                    text="Email"
                  />
                </DivClass>
                <DivClass className="input-wrapper">
                  <InputEmail
                    id="email-input"
                    placeholder="Type in your email"
                    className="email-input"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                </DivClass>
              </DivClass>
              <DivClass className="form-data-container">
                <DivClass className="label-wrapper">
                  <div className="flex flex-wrap">
                    <Label
                      htmlfor="password-input"
                      className="sign-in-label"
                      text="Password"
                    />
                    <button
                      onClick={(e: FormEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        toggleSwitchForm();
                      }}
                      className="reset-password cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </DivClass>
                <DivClass className="input-wrapper">
                  <InputPassword
                    required={true}
                    isdisabled={false}
                    id="password-input"
                    placeholder="Type in your password"
                    className="password-input"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                  />
                </DivClass>
              </DivClass>
              <DivClass className="submit-btn-wrapper">
                <InputSubmit
                  isdisabled={loginSubmitLock}
                  id="submit"
                  // onClick={(e: React.FormEvent<HTMLButtonElement>) => {
                  // e.preventDefault();

                  // return;
                  // }}
                  className="submit disabled:opacity-80"
                  style={{
                    cursor:
                      formData.email.length === 0 ||
                      (formData.password.length === 0 &&
                        loginSubmitLock === true)
                        ? "not-allowed"
                        : "pointer",
                  }}
                  value="Verify"
                />
              </DivClass>
            </form>
            <DivClass className="may-need-account">
              <LongText className="no-account">
                Don{"\u2019"}t have an account?
              </LongText>
              <LongText className="register-for-access">
                <RouteLink href="/signup-portal" className="route-link">
                  Create Your Profile
                </RouteLink>
              </LongText>
            </DivClass>
            <DivClass className="cancel-btn-wrapper mb-2">
              <Button
                id="cancel-verification"
                className="cancel-verification"
                // onClick={formCancelled}
                onClick={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  formCancelled(e);
                }}
              >
                <NavLink to="/">Go Back</NavLink>
              </Button>
            </DivClass>
          </>
        ) : (
          <>
            <form
              className="form-sign-in"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                processSignIn(e);
              }}
              autoSave="off"
              autoCorrect="off"
              autoComplete="off"
              autoFocus={false}
              autoCapitalize="off"
            >
              <DivClass className="form-data-container">
                <DivClass className="label-wrapper">
                  <Label
                    htmlfor="email-input"
                    className="sign-in-label"
                    text="Email"
                  />
                </DivClass>
                <DivClass className="input-wrapper">
                  <InputEmail
                    id="email-input"
                    placeholder="Type in your email"
                    className="email-input"
                    value={recoveryFormData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRecoveryFormData({
                        ...recoveryFormData,
                        email: e.target.value,
                      })
                    }
                  />
                </DivClass>
              </DivClass>
              {accountVerified && (
                <DivClass className="form-data-container">
                  <DivClass className="label-wrapper">
                    <Label
                      htmlfor="password-input"
                      className="sign-in-label"
                      text="New Password"
                    />
                  </DivClass>
                  <DivClass className="input-wrapper">
                    <InputPassword
                      required={true}
                      isdisabled={false}
                      id="password-input"
                      placeholder="Type in your password"
                      className="password-input"
                      value={recoveryFormData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRecoveryFormData({
                          ...recoveryFormData,
                          password: e.target.value,
                        })
                      }
                    />
                  </DivClass>
                </DivClass>
              )}
              {uiPastEmail === false && (
                <DivClass className="submit-btn-wrapper">
                  <InputSubmit
                    isdisabled={recoveryFormData.email.length === 0}
                    id="email-verify-submit"
                    className="submit disabled:opacity-80"
                    style={{
                      cursor:
                        recoveryFormData.email.length === 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                    value="Verify Email"
                    onClick={(e: FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      verifyUserExistence(e);
                    }}
                  />
                </DivClass>
              )}
              {accountVerified && (
                <DivClass className="submit-btn-wrapper">
                  <InputSubmit
                    isdisabled={
                      recoveryFormData.email.length === 0 ||
                      recoveryFormData.password.length === 0
                    }
                    id="account-recover-submit"
                    className="submit disabled:opacity-80"
                    style={{
                      cursor:
                        recoveryFormData.email.length === 0 ||
                        recoveryFormData.password.length === 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={(e: FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      recoverUserAccount(e);
                    }}
                    value="Recover Account"
                  />
                </DivClass>
              )}

              <DivClass className="cancel-btn-wrapper">
                <Button
                  id="cancel-verification"
                  className="cancel-verification text-white underline"
                  onClick={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    toggleSwitchForm();
                  }}
                >
                  Back to Login
                </Button>
              </DivClass>
            </form>
          </>
        )}
      </Section>
    );
  } catch (err: any) {
    console.warn("Error: ", err.message);
  }
};

export default Signin;
