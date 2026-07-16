"use client";
import { DivClass } from "../../../../lib/ui/Div";
import Section from "../../../../lib/ui/Section";
import Label from "../../../../lib/components/form-elements/Label";
import HeadingOne from "../../../../lib/ui/HeadingOne";
import "../mind-canvas-portal.css";
import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  InputConfirmPassword,
  InputEmail,
  InputPassword,
  InputText,
} from "../../../../lib/components/form-elements/dry-InputFormComponents";

import { LongText } from "../../../../lib/ui/LongText";
import Button from "../../../../lib/components/form-elements/Button";
import RouteLink from "../../../../lib/components/ProductSection/RouteLink";
// import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const Signup = () => {
  const router = useNavigate();
  try {
    //Data controls | input containers
    interface formDataInterface {
      firstname: string;
      lastname: string;
      gender?: string | undefined;
      dob?: string | undefined;
      email: string;
      password: string;
      confirmpassword: string;
    }

    const [formData, setFormData] = useState<formDataInterface>({
      firstname: "",
      lastname: "",
      gender: "",
      dob: "",
      email: "",
      password: "",
      confirmpassword: "",
    });

    const processSignup = async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        // console.log(formData);

        //extra sanitation incase devtools manipulate input
        const requiredFields =
          formData.firstname &&
          formData.lastname &&
          formData.email &&
          formData.password &&
          formData.confirmpassword;
        if (!requiredFields) {
          toast.info("please complete required fields for signup!");
          return;
        } else if (formData.confirmpassword !== formData.password) {
          toast.warning("Passwords do not match!");
          return;
        } else {
          //data will be sent to the backend from here
          const response: any = await fetch(
            `${import.meta.env.VITE_API_URL}/api/signup-portal`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            },
          );

          //want to try a new feature: socket.io
          //for real-time notifcations to check login success or failed to verify
          toast.info("Please wait...", { autoClose: 2500 });
          if (response.ok) {
            const data = await response.json();
            // redirect to dashboard
            console.log("data: ", data);

            if (data.message === "Account Name Already Exists") {
              toast.info("Account Name Already Exists", { autoClose: 3000 });
            } else {
              if (data.message === "Account created") {
                router(`/signin-portal`);
              }
            }
          } else {
            const data = await response.json();
            //reload and remain on signup page
            console.warn(data.message);
            toast.error(`Something went wrong: ${data.message}`, {
              autoClose: 4000,
            });
          }
        }
      } catch (err: any) {
        console.warn("Something went wrong");
      }
    };

    const signupCancelled = () => {
      setFormData({
        firstname: "",
        lastname: "",
        gender: "",
        dob: "",
        email: "",
        password: "",
        confirmpassword: "",
      });
    };

    // Disabled for now — gender field structure/input/validation/styling
    // const gender = [
    //   "Prefer not to specify",
    //   "Female",
    //   "Male",
    //   "Transgender Woman",
    //   "Transgender Man",
    //   "Non-binary",
    //   "Other",
    // ];
    return (
      <Section
        id="sign-up-container"
        ariaLabelledBy="sign-up"
        className="sign-up-block"
      >
        <ToastContainer position="top-right"></ToastContainer>
        <HeadingOne id="sign-up" className="heading-one">
          Sign Up
        </HeadingOne>
        <form
          className="form-sign-up"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            processSignup(e);
          }}
          autoSave="off"
          autoCorrect="off"
          autoComplete="off"
          autoFocus={false}
          autoCapitalize="off"
        >
          {/* //fist name */}
          <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="firstname-input"
                className="sign-up-label-firstname"
                text="First Name"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <InputText
                id="firstname-input"
                placeholder="Type in your first name"
                className="firstname-input"
                value={formData.firstname}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, firstname: e.target.value });
                }}
              />
            </DivClass>
          </DivClass>
          {/* //last name */}
          <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="lastname-input"
                className="sign-up-label-lastname"
                text="Last Name"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <InputText
                id="lastname-input"
                placeholder="Type in your last name"
                className="lastname-input"
                value={formData.lastname}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, lastname: e.target.value });
                }}
              />
            </DivClass>
          </DivClass>
          {/* //gender - disabled for now */}
          {/* <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="gender-input"
                className="sign-up-label-gender"
                text="Gender (Optional)"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <InputSelect
                id="gender-input"
                className="gender-input"
                value={formData.gender ? formData.gender : ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, gender: e.target.value });
                }}
              >
                {gender.map((item: any, index: number) => {
                  return (
                    <option id={`option${index}`} key={index} value={item}>
                      {item}
                    </option>
                  );
                })}
              </InputSelect>
            </DivClass>
          </DivClass> */}
          {/* //dob - disabled for now */}
          {/* <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="dob-input"
                className="sign-up-label-dob"
                text="DoB (Optional)"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <input
                type="date"
                id="dob-input"
                className="dob-input"
                value={formData.dob ? formData.dob : ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, dob: e.target.value });
                }}
              />
            </DivClass>
          </DivClass> */}
          {/* //email */}
          <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="email-input"
                className="sign-up-label-email"
                text="Email"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <InputEmail
                id="email-input"
                placeholder="Type in your Email"
                className="email-input"
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
              />
            </DivClass>
          </DivClass>
          {/* //password */}
          <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="password-input"
                className="sign-up-label-password"
                text="Password"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <InputPassword
                isdisabled={false}
                required
                id="password-input"
                placeholder="Type in your new password"
                className="password-input"
                value={formData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, password: e.target.value });
                }}
              />
            </DivClass>
          </DivClass>
          {/* //confirm password */}
          <DivClass className="form-data-container">
            <DivClass className="label-wrapper">
              <Label
                htmlfor="confirm-password-input"
                className="sign-up-label-confirm-password"
                text="Confirm password"
              />
            </DivClass>
            <DivClass className="input-wrapper">
              <InputConfirmPassword
                isdisabled={false}
                required
                id="confirm-password-input"
                placeholder="Confirm your new password"
                className="confirm-password-input"
                value={formData.confirmpassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, confirmpassword: e.target.value });
                }}
              />
            </DivClass>
          </DivClass>
          <DivClass className="submit-btn-wrapper">
            <input
              type="submit"
              autoComplete="off"
              id="submit"
              className="submit"
              value="Sign Up"
            />
          </DivClass>
          <DivClass className="cancel-btn-wrapper">
            <Button
              id="cancel-signup"
              className="cancel-signup"
              onClick={signupCancelled}
            >
              <NavLink to={"/"}>Go Back</NavLink>
            </Button>
          </DivClass>
        </form>
        <DivClass className="may-need-account">
          <LongText className="have-an-account">
            Already have an account?
          </LongText>
          <LongText className="login-access">
            <RouteLink className="login-route-link" href="/signin-portal">
              Sign in
            </RouteLink>
          </LongText>
        </DivClass>
      </Section>
    );
  } catch (err: any) {
    console.warn("Error: ", err.message);
  }
};

export default Signup;
