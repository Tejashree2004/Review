import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import DialogBox from "../components/DialogBox";

import { signupUser } from "../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // DIALOG STATE
  // ==========================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    action: null,
  });

  // ==========================================
  // SHOW DIALOG
  // ==========================================

  const showDialog = (
    title,
    message,
    type = "info",
    action = null
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      action,
    });
  };

  // ==========================================
  // CLOSE DIALOG
  // ==========================================

  const closeDialog = () => {
    const action = dialog.action;

    setDialog((previous) => ({
      ...previous,
      isOpen: false,
      action: null,
    }));

    if (action) {
      action();
    }
  };

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!formData.fullName.trim()) {
      showDialog(
        "Required Field",
        "Please enter your full name.",
        "warning"
      );
      return;
    }

    if (!formData.email.trim()) {
      showDialog(
        "Required Field",
        "Please enter your email.",
        "warning"
      );
      return;
    }

    if (!formData.mobileNumber.trim()) {
      showDialog(
        "Required Field",
        "Please enter your mobile number.",
        "warning"
      );
      return;
    }

    if (formData.password.length < 6) {
      showDialog(
        "Invalid Password",
        "Password must contain at least 6 characters.",
        "warning"
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      showDialog(
        "Password Mismatch",
        "Passwords do not match.",
        "warning"
      );
      return;
    }

    if (!formData.terms) {
      showDialog(
        "Terms & Conditions",
        "Please accept Terms & Conditions.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await signupUser({
        fullName:
          formData.fullName.trim(),
        email:
          formData.email.trim(),
        mobileNumber:
          formData.mobileNumber.trim(),
        password:
          formData.password,
        confirmPassword:
          formData.confirmPassword,
      });

      console.log(
        "Signup Response:",
        response.data
      );

      const userId =
        response.data?.Data?.UserId ??
        response.data?.data?.UserId ??
        response.data?.data?.userId ??
        response.data?.Data?.userId;

      const email =
        response.data?.Data?.Email ??
        response.data?.data?.Email ??
        response.data?.data?.email ??
        formData.email;

      if (!userId) {
        showDialog(
          "Signup Completed",
          "Account created, but user information was not returned.",
          "warning"
        );

        return;
      }

      localStorage.setItem(
        "registered",
        "true"
      );

      showDialog(
        "Account Created",
        "Account created successfully! An OTP has been sent to your email.",
        "success",
        () => {
          navigate("/verify-otp", {
            state: {
              userId,
              email,
            },
          });
        }
      );
    } catch (error) {
      console.error(
        "Signup Error:",
        error
      );

      if (error.response) {
        console.log(
          "Backend Error:",
          error.response.data
        );

        const message =
          error.response.data?.message ||
          error.response.data?.Message ||
          "Signup failed.";

        showDialog(
          "Signup Failed",
          message,
          "error"
        );
      } else if (error.request) {
        showDialog(
          "Server Error",
          "Backend server is not responding. Please make sure the backend is running.",
          "error"
        );
      } else {
        showDialog(
          "Signup Failed",
          "Signup failed. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      <div className="signup-container">

        <div className="signup-heading">

          <h1 className="auth-title">
            Create Account
          </h1>

          <p className="auth-subtitle">
            Join REVIO and start sharing
            trusted reviews.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="signup-form"
        >

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            name="fullName"
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            name="email"
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="Enter your mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
            name="mobileNumber"
          />

          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            name="password"
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={
              formData.confirmPassword
            }
            onChange={handleChange}
            name="confirmPassword"
          />

          <label
            className="terms-checkbox"
          >

            <input
              type="checkbox"
              name="terms"
              checked={
                formData.terms
              }
              onChange={
                handleChange
              }
            />

            <span>
              I agree to{" "}
              <strong>
                Terms & Conditions
              </strong>
            </span>

          </label>

          <div className="signup-button-wrapper">

            <Button
              text={
                loading
                  ? "Creating Account..."
                  : "Create Account"
              }
              type="submit"
              disabled={loading}
            />

          </div>

        </form>

        <div className="signup-divider">
          <span>
            Already registered?
          </span>
        </div>

        <p className="bottom-link">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

      {/* DIALOG */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={closeDialog}
      />

    </AuthLayout>
  );
}

export default Signup;