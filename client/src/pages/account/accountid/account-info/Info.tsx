import { DivClass } from "../../../../../lib/ui/Div";
import HeadingOne from "../../../../../lib/ui/HeadingOne";
// import AuthHeader from "../../../../../auth/auth-partials/AuthHeader";
import "./info-media-queries.css";
import "./info.css";
// import ShortText from "../../../../../src/ui/ShortText";
// import Footer from "../../../../components/Footer";
import {
  InputDate,
  InputDisabledText,
  InputEnabledText,
  InputDisabledEmail,
  InputEnabledEmail,
  InputPassword,
} from "../../../../../lib/components/form-elements/dry-InputFormComponents";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Label from "../../../../../lib/components/form-elements/Label";
import Button from "../../../../../lib/components/form-elements/Button";
import PipeSpan from "../../../../../lib/components/PipeSpan";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useInfo } from "./InfoContext";
interface formDataInterface {
  firstname: string;
  lastname: string;
  gender?: string | undefined;
  dob?: string | undefined;
  email: string;
  ["current-password"]: string;
  ["new-password"]: string;
  ["confirm-new-password"]: string;
}
//used to control which fields are read only and which can be editable with the below interface object and useState
interface formFieldToggleProps {
  firstname: boolean;
  lastname: boolean;
  gender: boolean;
  dob: boolean;
  email: boolean;
  ["current-password"]: boolean;
  ["new-password"]: boolean;
  ["confirm-new-password"]: boolean;
}

const Info = ({ params }: any) => {
  // define form field data types and input
  try {
    const { userid } = useParams();
    const router = useNavigate();
    if (!userid) {
      router("/signin-portal");
    }
    const { fetchUserInfo, requestAccountDeletion } = useInfo();
    const [formData, setNewFormData] = useState<formDataInterface>({
      firstname: "",
      lastname: "",
      gender: "",
      dob: "",
      email: "",
      ["current-password"]: "",
      ["new-password"]: "",
      ["confirm-new-password"]: "",
    });

    //auth controls whether user can update their credentials
    //below code design is temporary
    const [formFieldToggle, setformFieldToggle] =
      useState<formFieldToggleProps>({
        firstname: false,
        lastname: false,
        gender: false,
        dob: false,
        email: false,
        ["current-password"]: false,
        ["new-password"]: false,
        ["confirm-new-password"]: false,
      });

    const gender = [
      "Prefer not to specify",
      "Female",
      "Male",
      "Transgender Woman",
      "Transgender Man",
      "Non-Binary",
      "Other",
    ];
    interface UpdateAccountDataProps {
      firstname?: string;
      lastname?: string;
      gender?: string;
      dob?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
      submitBtnDisabled?: boolean;
    }

    const [touchPasswordField, setTouchPasswordField] =
      useState<boolean>(false);
    const processSubmission = async (e: FormEvent<HTMLInputElement>) => {
      try {
        e.preventDefault();
        if (!formData) {
          toast.info("Please complete required fields");
        } else {
          const updateAccountData: UpdateAccountDataProps = {};

          if (
            formData.firstname?.length === 0 &&
            formData.lastname?.length === 0 &&
            formData.gender?.length === 0 &&
            formData.dob?.length === 0 &&
            formData.email?.length === 0 &&
            formData["current-password"]?.length === 0
          ) {
            updateAccountData.submitBtnDisabled = touchPasswordField;
          }
          if (formData.firstname)
            updateAccountData.firstname = formData.firstname;

          if (formData.lastname) updateAccountData.lastname = formData.lastname;

          if (formData.gender) updateAccountData.gender = formData.gender;

          if (formData.dob) updateAccountData.dob = formData.dob;

          if (formData.email) updateAccountData.email = formData.email;

          if (formData["current-password"])
            updateAccountData["currentPassword"] = formData["current-password"];

          if (formData["new-password"]) {
            updateAccountData["newPassword"] = formData["new-password"];
          }
          if (formData["confirm-new-password"]) {
            updateAccountData["confirmNewPassword"] =
              formData["confirm-new-password"];
          }
          if (formData["confirm-new-password"] !== formData["new-password"]) {
            toast.info("new password and confirm passwords do not match");
          }

          if (
            formData.firstname?.length === 0 &&
            formData.lastname?.length === 0 &&
            formData.gender?.length === 0 &&
            formData.dob?.length === 0 &&
            formData.email?.length === 0 &&
            formData["current-password"]?.length === 0
          ) {
            toast.info("Use at least one field to update your account data", {
              autoClose: 3500,
            });
          } else {
            const updatedData = await fetch(
              `${import.meta.env.VITE_API_URL}/api/account/${userid}/account-info`,
              {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updateAccountData),
              },
            );
            if (updatedData.ok) {
              toast.success("Account Info Has Been Changed", {
                autoClose: 2500,
              });
              setNewFormData({
                firstname: "",
                lastname: "",
                gender: "",
                dob: "",
                email: "",
                ["current-password"]: "",
                ["new-password"]: "",
                ["confirm-new-password"]: "",
              });
              fetchUserInfo();
            } else {
              const error = await updatedData.json();
              toast.error(`Error: ${error.message}`, {
                autoClose: 2500,
              });
            }
          }
        }
      } catch (err: any) {
        console.warn("Something went wrong: ", err.message);
      }
    };

    //lock deisgned to prevent accidental account deletion
    const [islocked, setIslocked] = useState<boolean>(true);
    const toggleDeletionLock = () => {
      setIslocked((prev) => (prev === true ? false : true));
      return;
    };

    useEffect(() => {
      if (islocked === false) {
        toast.warning(
          "Once you click on Delete account, all your Canvaspaces and account itself will be deleted! This operation 'Cannot' be reversed.",
          { autoClose: 12000 },
        );
      }
    }, [islocked]);
    return (
      <>
        <DivClass className={"account-info-content"}>
          <ToastContainer position="top-right"></ToastContainer>
          <div>
            <NavLink
              className="nav-link"
              to={`/account/${userid}/canvas-management`}
            >
              <img
                className="nav-image"
                src="/backwards-solid.svg"
                alt="navigation image"
                height={20}
                width={20}
              />
              Canvas Dashboard
            </NavLink>
            <HeadingOne id="heading-one" className={"heading-one"}>
              Account Info
            </HeadingOne>
            <form id="account-info-form" className={"account-info-form"}>
              <DivClass className={"firstname-container"}>
                <Label
                  htmlfor="firstname"
                  className={"update-firstname"}
                  text="Firstname"
                />
                {formFieldToggle.firstname ? (
                  <DivClass className={"data-control-container"}>
                    <InputEnabledText
                      id="firstname"
                      className={"firstname-input"}
                      placeholder={"Update your First Name"}
                      value={formData.firstname}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        setNewFormData({
                          ...formData,
                          firstname: e.target.value,
                        });
                      }}
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="disable-firstname-editing"
                      className={"disable-firstname-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          firstname: !formFieldToggle.firstname,
                        });
                      }}
                    >
                      View Only
                    </Button>
                  </DivClass>
                ) : (
                  <DivClass className={"data-control-container"}>
                    <InputDisabledText
                      id="firstname"
                      className={"firstname-input"}
                      placeholder={""}
                      value={
                        params.data?.firstname
                          ? params.data.firstname
                          : "Not assigned"
                      }
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="enable-firstname-editing"
                      className={"enable-firstname-editing"}
                      onClick={(e: ChangeEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          firstname: !formFieldToggle.firstname,
                        });
                      }}
                    >
                      Modify
                    </Button>
                  </DivClass>
                )}
              </DivClass>
              <DivClass className={"lastname-container"}>
                <Label
                  htmlfor="lastname"
                  className={"update-lastname"}
                  text="Lastname"
                />
                {formFieldToggle.lastname ? (
                  <DivClass className={"data-control-container"}>
                    <InputEnabledText
                      id="lastname"
                      className={"lastname-input"}
                      placeholder={"Update your Last Name"}
                      value={formData.lastname}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        setNewFormData({
                          ...formData,
                          lastname: e.target.value,
                        });
                      }}
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="disable-firstname-editing"
                      className={"disable-lastname-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          lastname: !formFieldToggle.lastname,
                        });
                      }}
                    >
                      View Only
                    </Button>
                  </DivClass>
                ) : (
                  <DivClass className={"data-control-container"}>
                    <InputDisabledText
                      id="lastname"
                      className={"lastname-input"}
                      placeholder={""}
                      value={
                        params.data?.lastname
                          ? params.data.lastname
                          : "Not assigned"
                      }
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="enable-lastname-editing"
                      className={"enable-lastname-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          lastname: !formFieldToggle.lastname,
                        });
                      }}
                    >
                      Modify
                    </Button>
                  </DivClass>
                )}
              </DivClass>
              <DivClass className={"gender-container"}>
                <Label
                  htmlfor="gender"
                  className={"update-gender"}
                  text="Gender"
                />
                {formFieldToggle.gender ? (
                  <DivClass className={"data-control-container"}>
                    <select
                      id="gender"
                      className={"gender-input"}
                      value={formData.gender ? formData.gender : ""}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        e.preventDefault();
                        setNewFormData({ ...formData, gender: e.target.value });
                      }}
                    >
                      {gender.map((item: any, index: number) => {
                        return (
                          <option
                            id={`option-${index}`}
                            key={index}
                            value={item}
                          >
                            {item}
                          </option>
                        );
                      })}
                    </select>

                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="disable-gender-editing"
                      className={"disable-gender-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          gender: !formFieldToggle.gender,
                        });
                      }}
                    >
                      View Only
                    </Button>
                  </DivClass>
                ) : (
                  <DivClass className={"data-control-container"}>
                    <InputDisabledText
                      id="gender"
                      className={"gender-input-disabled"}
                      placeholder={""}
                      value={
                        params.data?.gender
                          ? params.data.gender
                          : "Not assigned"
                      }
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="enable-gender-editing"
                      className={"enable-gender-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          gender: !formFieldToggle.gender,
                        });
                      }}
                    >
                      Modify
                    </Button>
                  </DivClass>
                )}
              </DivClass>
              <DivClass className={"dob-container"}>
                <Label htmlfor="dob" className={"update-dob"} text="Dob" />
                {formFieldToggle.dob ? (
                  <DivClass className={"data-control-container"}>
                    <InputDate
                      id="dob"
                      className={"dob-input"}
                      value={formData.dob ? formData.dob : ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        setNewFormData({ ...formData, dob: e.target.value });
                      }}
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="disable-dob-editing"
                      className={"disable-dob-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          dob: !formFieldToggle.dob,
                        });
                      }}
                    >
                      View Only
                    </Button>
                  </DivClass>
                ) : (
                  <DivClass className={"data-control-container"}>
                    <InputDisabledText
                      id="dob"
                      className={"dob-input"}
                      placeholder={""}
                      value={
                        params.data?.dob ? params.data.dob : "Not assigned"
                      }
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="enable-dob-editing"
                      className={"enable-dob-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          dob: !formFieldToggle.dob,
                        });
                      }}
                    >
                      Modify
                    </Button>
                  </DivClass>
                )}
              </DivClass>
              <DivClass className={"email-container"}>
                <Label
                  htmlfor="email"
                  className={"update-email"}
                  text="Email"
                />
                {formFieldToggle.email ? (
                  <DivClass className={"data-control-container"}>
                    <InputEnabledEmail
                      id="email"
                      className={"email-input"}
                      placeholder={"Update your Email"}
                      value={formData.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        setNewFormData({ ...formData, email: e.target.value });
                      }}
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="disable-email-editing"
                      className={"disable-email-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          email: !formFieldToggle.email,
                        });
                      }}
                    >
                      View Only
                    </Button>
                  </DivClass>
                ) : (
                  // appear when form field email boolean state is false
                  <DivClass className={"data-control-container"}>
                    <InputDisabledEmail
                      id="email"
                      className={"email-input"}
                      placeholder={""}
                      value={
                        params.data?.email ? params.data.email : "Not assigned"
                      }
                    />
                    <PipeSpan className={"form-pipe-span"} />
                    <Button
                      id="enable-email-editing"
                      className={"enable-email-editing"}
                      onClick={(e: ChangeEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setformFieldToggle({
                          ...formFieldToggle,
                          email: !formFieldToggle.email,
                        });
                      }}
                    >
                      Modify
                    </Button>
                  </DivClass>
                )}
              </DivClass>
              <DivClass className={"current-password-container"}>
                <Label
                  htmlfor="current-password"
                  className={"current-password"}
                  text="Current Password"
                />
                <DivClass className={"data-control-container"}>
                  <input
                    autoComplete="off"
                    id="current-password"
                    className={"current-password-input"}
                    placeholder={"Type in your current password"}
                    value={formData["current-password"]}
                    required
                    onFocus={() => {
                      setTouchPasswordField(true);
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      setNewFormData({
                        ...formData,
                        "current-password": e.target.value,
                      });
                      if (formData["current-password"].length === 0) {
                        setTouchPasswordField(false);
                      }
                      return;
                    }}
                  />
                </DivClass>
              </DivClass>
              <DivClass className={"new-password-container"}>
                <Label
                  htmlfor="new-password"
                  className={"new-password"}
                  text="New Password"
                />
                <DivClass className={"data-control-container"}>
                  <InputPassword
                    id="new-password"
                    className={"new-password-input"}
                    placeholder={"Type in your new password"}
                    value={formData["new-password"]}
                    isdisabled={formData["current-password"].length === 0}
                    required={formData["new-password"].length !== 0}
                    style={{
                      cursor:
                        formData["current-password"]?.length === 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      setNewFormData({
                        ...formData,
                        "new-password": e.target.value,
                      });
                    }}
                  />
                </DivClass>
              </DivClass>
              <DivClass className={"confirm-new-password-container"}>
                <Label
                  htmlfor="confirm-new-password"
                  className={"confirm-new-password"}
                  text="Confirm New Password"
                />
                <DivClass className={"data-control-container"}>
                  <InputPassword
                    id="confirm-new-password"
                    className={"confirm-new-password-input"}
                    placeholder={"Confirm your new password"}
                    value={formData["confirm-new-password"]}
                    style={{
                      cursor:
                        formData["current-password"]?.length === 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                    isdisabled={formData["current-password"].length === 0}
                    required={formData["confirm-new-password"].length !== 0}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      setNewFormData({
                        ...formData,
                        "confirm-new-password": e.target.value,
                      });
                    }}
                  />
                </DivClass>
              </DivClass>
              <DivClass className={"form-processing-btn"}>
                <DivClass className={"cancel-container"}>
                  <Button
                    onClick={(e: FormEvent<HTMLButtonElement>) => {
                      setNewFormData({
                        firstname: "",
                        lastname: "",
                        gender: "",
                        dob: "",
                        email: "",
                        ["current-password"]: "",
                        ["new-password"]: "",
                        ["confirm-new-password"]: "",
                      });
                      e.preventDefault();
                      return;
                    }}
                    id="cancel-submit"
                    className={"cancel-submit"}
                  >
                    Discard
                  </Button>
                </DivClass>
                <DivClass className={"submit-container"}>
                  <input
                    type="submit"
                    id="submit-btn"
                    onClick={(e: React.FormEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      processSubmission(e);
                    }}
                    disabled={
                      formData.firstname?.length === 0 &&
                      formData.lastname?.length === 0 &&
                      formData.gender?.length === 0 &&
                      formData.dob?.length === 0 &&
                      formData.email?.length === 0 &&
                      formData["current-password"]?.length === 0
                    }
                    className={`submit-btn 
                      ${
                        formData.firstname?.length === 0 &&
                        formData.lastname?.length === 0 &&
                        formData.gender?.length === 0 &&
                        formData.dob?.length === 0 &&
                        formData.email?.length === 0 &&
                        formData["current-password"]?.length === 0
                          ? "cursor-not-allowed disabled:opacity-80"
                          : "cursor-pointer"
                      }`}
                    value={"Update"}
                  />
                </DivClass>
              </DivClass>
              <DivClass className={"delete-container"}>
                <DivClass className="toggle-account-deletion-lock-container">
                  <button
                    className={"toggle-account-deletion-lock"}
                    onClick={(e: React.FormEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      toggleDeletionLock();
                    }}
                  >
                    {islocked ? "Unlock" : "Lock"}
                  </button>
                </DivClass>

                <DivClass className={"delete-btn-container"}>
                  <input
                    type="button"
                    disabled={islocked}
                    id="delete-btn"
                    className={`delete-btn
                        ${
                          islocked
                            ? "cursor-not-allowed disabled:opacity-80 "
                            : "cursor-pointer"
                        }`}
                    // style={{
                    //   cursor:
                    // }}
                    autoComplete="off"
                    onClick={(e: React.FormEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      console.log("submit false trigger");
                      requestAccountDeletion();

                      return;
                    }}
                    value="Delete account"
                  />
                </DivClass>
              </DivClass>
            </form>
          </div>
        </DivClass>
        {/* <Footer id="account-info-footer" className={"account-info-footer"}>
          <DivClass className={"project-creator"}>
            <ShortText className={"creator"}>
              Created by Christeen Fabian
            </ShortText>
          </DivClass>
        </Footer> */}
      </>
    );
  } catch (err: any) {
    console.warn("Something went wrong: ", err.message + ", more: ", err.stack);
  }
};

export default Info;
