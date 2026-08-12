import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // Handle Input Change
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Login
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =========================
    // Validation
    // =========================

    if (!formData.emailOrMobile.trim()) {
      alert("Please enter your email or mobile number.");
      return;
    }

    if (!formData.password.trim()) {
      alert("Please enter your password.");
      return;
    }

    // =========================
    // Temporary Signup Check
    // =========================

    const isRegistered = localStorage.getItem("registered");

    if (!isRegistered) {
      alert("Please Sign Up first to continue.");
      navigate("/signup");
      return;
    }

    try {
      setLoading(true);

      console.log("Login Data:", formData);

      // =========================
      // Backend Login
      // =========================

      const response = await loginUser(formData);

      console.log("Backend Response:", response.data);

      const data = response.data;

      // =========================
      // Store Token
      // =========================

      const token =
        data.token ||
        data.Token ||
        "";

      if (token) {
        localStorage.setItem("token", token);
      }

      // =========================
      // Store User
      // =========================

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // =========================
      // Store User ID
      // =========================

      const userId =
        data.userId ||
        data.UserId ||
        data.id ||
        data.Id;

      console.log(
        "Logged In User ID:",
        userId
      );

      if (userId) {
        localStorage.setItem(
          "userId",
          userId.toString()
        );
      }

      // =========================
      // Login Status
      // =========================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // =========================
      // Remember Me
      // =========================

      if (formData.remember) {
        localStorage.setItem(
          "rememberMe",
          "true"
        );
      } else {
        localStorage.removeItem(
          "rememberMe"
        );
      }

      // =========================
      // IMPORTANT
      // LOGIN → ROLE SELECTION
      // =========================

      alert("Login successful!");

      navigate("/role-selection");

    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Login failed. Please check your email/mobile and password.";

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Guest Login
  // =========================

  const handleGuestLogin = () => {
    localStorage.setItem(
      "userRole",
      "guest"
    );

    localStorage.setItem(
      "isGuest",
      "true"
    );

    navigate("/home");
  };

  return (
    <AuthLayout>

      {/* =========================
          Heading
      ========================= */}

      <h1 className="auth-title">
        Welcome Back 👋
      </h1>

      <p className="auth-subtitle">
        Login to continue using REVIO.
      </p>

      {/* =========================
          Login Form
      ========================= */}

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

        {/* =========================
            Remember / Forgot
        ========================= */}

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
              color: "#ffffff",
              cursor: "pointer",
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
              color: "#cccccc",
              cursor: "pointer",
            }}
            onClick={() =>
              alert(
                "Forgot Password functionality will be added soon."
              )
            }
          >
            Forgot Password?
          </span>

        </div>

        {/* =========================
            Login Button
        ========================= */}

        <Button
          text={
            loading
              ? "Logging in..."
              : "Login"
          }
          type="submit"
          disabled={loading}
        />

      </form>

      {/* =========================
          OR Divider
      ========================= */}

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

      {/* =========================
          Google Login
      ========================= */}

      <button
        type="button"
        className="google-btn"
        onClick={() =>
          alert(
            "Google Login will be added soon."
          )
        }
      >
        Continue with Google
      </button>

      {/* =========================
          Guest Login
      ========================= */}

      <button
        type="button"
        className="google-btn"
        style={{
          marginTop: "12px",
          background: "#222",
          color: "#fff",
          border: "1px solid #333",
        }}
        onClick={handleGuestLogin}
      >
        Continue as Guest
      </button>

      {/* =========================
          Signup
      ========================= */}

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