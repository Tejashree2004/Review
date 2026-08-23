import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!formData.mobileNumber.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (formData.password.length < 6) {
      alert(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      alert(
        "Please accept Terms & Conditions."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await signupUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber:
          formData.mobileNumber.trim(),
        password: formData.password,
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
        alert(
          "Account created, but user information was not returned."
        );
        return;
      }

      localStorage.setItem(
        "registered",
        "true"
      );

      alert(
        "Account created successfully! An OTP has been sent to your email."
      );

      navigate("/verify-otp", {
        state: {
          userId,
          email,
        },
      });
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

        alert(message);
      } else if (error.request) {
        alert(
          "Backend server is not responding. Please make sure the backend is running."
        );
      } else {
        alert(
          "Signup failed. Please try again."
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
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
          />

          <label
            className="terms-checkbox"
          >
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />

            <span>
              I agree to the{" "}
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
          <span>Already registered?</span>
        </div>

        <p className="bottom-link">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Signup;