
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

  const [loading, setLoading] = useState(false);

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    action: null,
  });

  // SHOW DIALOG
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

  // CLOSE DIALOG
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

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // SAVE VERIFICATION DETAILS AND NAVIGATE
  const goToVerification = (userId, email) => {
    const verificationData = {
      userId: Number(userId),
      email: email.trim(),
    };

    localStorage.setItem(
      "pendingVerification",
      JSON.stringify(verificationData)
    );

    localStorage.setItem("registered", "true");

    navigate("/verify-otp", {
      state: verificationData,
    });
  };

  // GET USER DETAILS FROM API RESPONSE
  const getVerificationDetails = (responseData) => {
    const data =
      responseData?.Data ??
      responseData?.data ??
      responseData;

    const userId =
      data?.UserId ??
      data?.userId ??
      data?.Id ??
      data?.id;

    const email =
      data?.Email ??
      data?.email ??
      formData.email.trim();

    if (!userId || !email) {
      return null;
    }

    return {
      userId: Number(userId),
      email: email.trim(),
    };
  };

  // HANDLE SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

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

    if (formData.password !== formData.confirmPassword) {
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
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      console.log(
        "Signup Response:",
        response.data
      );

      const verification =
        getVerificationDetails(response.data);

      if (!verification) {
        showDialog(
          "Signup Completed",
          "Account information was not returned. Please contact support.",
          "warning"
        );
        return;
      }

      localStorage.setItem(
        "pendingVerification",
        JSON.stringify(verification)
      );

      localStorage.setItem("registered", "true");

      showDialog(
        "Account Created",
        "Account created successfully! Please verify your email using the OTP.",
        "success",
        () => {
          goToVerification(
            verification.userId,
            verification.email
          );
        }
      );

    } catch (error) {
      console.error("Signup Error:", error);

      if (error.response) {
        console.log(
          "Backend Error:",
          error.response.data
        );

        const verification =
          getVerificationDetails(error.response.data);

        // Account created, but OTP email may have failed.
        if (verification) {
          localStorage.setItem(
            "pendingVerification",
            JSON.stringify(verification)
          );

          localStorage.setItem("registered", "true");

          showDialog(
            "Account Created",
            "Your account was created, but the OTP email could not be sent. Continue to verification and try Resend OTP.",
            "warning",
            () => {
              goToVerification(
                verification.userId,
                verification.email
              );
            }
          );

          return;
        }

        const message =
          error.response.data?.message ||
          error.response.data?.Message ||
          "Signup failed. Please try again.";

        showDialog(
          "Signup Failed",
          message,
          "error"
        );

      } else if (error.request) {
        showDialog(
          "Server Error",
          "Backend server is not responding. Please try again.",
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

  // UI
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
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
          />

          <label className="terms-checkbox">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
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
