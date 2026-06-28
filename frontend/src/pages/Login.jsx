import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

// 👉 ADDED: API import (backend connect)
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

    // Temporary Signup Check
    const isRegistered = localStorage.getItem("registered");

    if (!isRegistered) {
      alert("Please Sign Up first to continue.");
      navigate("/signup");
      return;
    }

    console.log(formData);

    // ===========================
    // 👉 REAL BACKEND CALL ADDED
    // ===========================
    try {
      const response = await loginUser(formData);

      // PostgreSQL se aaya data (backend response)
      console.log("Backend Response:", response.data);

      // store token if backend sends it
      localStorage.setItem("token", response.data.token || "dummy-token");
      localStorage.setItem("user", JSON.stringify(response.data.user || formData));
      localStorage.setItem("isLoggedIn", "true");

      alert("Login successful!");

      // redirect to home
      navigate("/home");

    } catch (error) {
      console.log(error);
      alert("Login failed (backend issue)");
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

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            Remember Me
          </label>

          <span style={{
            fontSize: "14px",
            color: "#ddd",
            cursor: "pointer",
          }}>
            Forgot Password?
          </span>

        </div>

        <Button text="Login" type="submit" />

      </form>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "24px 0",
      }}>
        <div style={{ flex: 1, height: "1px", background: "#444" }} />
        <span style={{ color: "#aaa", fontSize: "14px" }}>OR</span>
        <div style={{ flex: 1, height: "1px", background: "#444" }} />
      </div>

      <button className="google-btn">
        Continue with Google
      </button>

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

      <p className="bottom-link">
        Don't have an account?{" "}
        <Link to="/signup">
          <span>Sign Up</span>
        </Link>
      </p>

    </AuthLayout>
  );
}

export default Login;