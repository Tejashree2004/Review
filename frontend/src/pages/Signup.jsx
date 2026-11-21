
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
  });

  const showDialog = (title, message, type = "info") => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save account details and open OTP page directly.
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
      replace: true,
    });
  };

  // Supports both successful and failed API response formats.
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.fullName.trim()) {
      showDialog("Required Field", "Please enter your full name.", "warning");
      return;
    }

    if (!formData.email.trim()) {
      showDialog("Required Field", "Please enter your email.", "warning");
      return;
    }

    if (!formData.mobileNumber.trim()) {
      showDialog("Required Field", "Please enter your mobile number.", "warning");
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
      showDialog("Password Mismatch", "Passwords do not match.", "warning");
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

      console.log("Signup Response:", response.data);

      const verification = getVerificationDetails(response.data);

      if (!verification) {
        showDialog(
          "Signup Response Error",
          "The account response did not contain verification details. Please contact support.",
          "error"
        );
        return;
      }

      // Navigate immediately; do not wait for a popup button.
      goToVerification(
        verification.userId,
        verification.email
      );

    } catch (error) {
      console.error("Signup Error:", error);

      const responseData = error.response?.data;

      console.log("Backend Error:", responseData);

      // Backend may create the account but fail to send the OTP email.
      const verification = getVerificationDetails(responseData);

      if (verification) {
        console.log(
          "Account created, but email delivery failed. Opening OTP page.",
          verification
        );

        goToVerification(
          verification.userId,
          verification.email
        );

        return;
      }

      const message =
        responseData?.message ||
        responseData?.Message ||
        "Signup failed. Please try again.";

      showDialog("Signup Failed", message, "error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="signup-container">
        <div className="signup-heading">
          <h1 className="auth-title">Create Account</h1>

          <p className="auth-subtitle">
            Join REVIO and start sharing trusted reviews.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
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
              I agree to <strong>Terms & Conditions</strong>
            </span>
          </label>

          <div className="signup-button-wrapper">
            <Button
              text={loading ? "Creating Account..." : "Create Account"}
              type="submit"
              disabled={loading}
            />
          </div>
        </form>

        <div className="signup-divider">
          <span>Already registered?</span>
        </div>

        <p className="bottom-link">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
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
