import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

// API import
import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===========================
    // Temporary Signup Check
    // ===========================

    const isRegistered = localStorage.getItem("registered");

    if (!isRegistered) {
      alert("Please Sign Up first to continue.");
      navigate("/signup");
      return;
    }

    console.log("Login Data:", formData);

    // ===========================
    // REAL BACKEND CALL
    // ===========================

    try {
      const response = await loginUser(formData);

      console.log("Backend Response:", response.data);

      // ===========================
      // Store Token
      // ===========================

      localStorage.setItem(
        "token",
        response.data.token || ""
      );

      // ===========================
      // Store User
      // ===========================

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      // ===========================
      // Store User ID
      // Backend sends:
      // UserId = user.Id
      // ===========================

      const userId =
        response.data.userId ||
        response.data.UserId;

      console.log("Logged In User ID:", userId);

      if (userId) {
        localStorage.setItem(
          "userId",
          userId.toString()
        );
      }

      // ===========================
      // Login Status
      // ===========================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      alert("Login successful!");

      // ===========================
      // Redirect Home
      // ===========================

      navigate("/home");

    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Login failed. Please check your email/mobile and password."
      );
    }
  };

  return (
    <AuthLayout>

      <h1 className="auth-title">
        Welcome Back 👋
      </h1>

      <p className="auth-subtitle">
        Login to continue using Review.
      </p>

      <form onSubmit={handleSubmit}>

        <Input
          label="Email or Mobile"
          placeholder="Enter email or mobile"
          value={formData.emailOrMobile}
          onChange={handleChange}
          name="emailOrMobile"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          name="password"
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >

            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />

            Remember Me

          </label>

          <span
            style={{
              fontSize: "14px",
              color: "#ddd",
              cursor: "pointer",
            }}
          >
            Forgot Password?
          </span>

        </div>

        <Button
          text="Login"
          type="submit"
        />

      </form>

      {/* ===========================
          OR Divider
      =========================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "24px 0",
        }}
      >

        <div
          style={{
            flex: 1,
            height: "1px",
            background: "#444",
          }}
        />

        <span
          style={{
            color: "#aaa",
            fontSize: "14px",
          }}
        >
          OR
        </span>

        <div
          style={{
            flex: 1,
            height: "1px",
            background: "#444",
          }}
        />

      </div>

      {/* Google Login */}

      <button className="google-btn">
        Continue with Google
      </button>

      {/* Guest Login */}

      <button
        className="google-btn"
        style={{
          marginTop: "12px",
          background: "#222",
          color: "#fff",
        }}
        onClick={() => navigate("/home")}
      >
        Continue as Guest
      </button>

      {/* Signup */}

      <p className="bottom-link">

        Don't have an account?{" "}

        <Link to="/signup">
          <span>
            Sign Up
          </span>
        </Link>

      </p>

    </AuthLayout>
  );
}

export default Login;