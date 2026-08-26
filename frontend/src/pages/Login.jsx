import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import DialogBox from "../components/DialogBox";

import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // DIALOG
  // =====================================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "REVIO",
    message: "",
    type: "info",
    confirmText: "OK",
    onConfirm: null,
  });

  const showDialog = ({
    title = "REVIO",
    message,
    type = "info",
    confirmText = "OK",
    onConfirm = null,
  }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm,
    });
  };

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const handleDialogConfirm = () => {
    const callback = dialog.onConfirm;

    closeDialog();

    if (callback) {
      callback();
    }
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

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

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =================================================
    // VALIDATION
    // =================================================

    if (!formData.emailOrMobile.trim()) {
      showDialog({
        title: "Required Field",
        message:
          "Please enter your email or mobile number.",
        type: "warning",
      });

      return;
    }

    if (!formData.password.trim()) {
      showDialog({
        title: "Required Field",
        message:
          "Please enter your password.",
        type: "warning",
      });

      return;
    }

    try {
      setLoading(true);

      console.log(
        "Login Data:",
        formData
      );

      // =================================================
      // BACKEND LOGIN
      // =================================================

      const response =
        await loginUser(formData);

      console.log(
        "Backend Response:",
        response.data
      );

      const data = response.data || {};

      // =================================================
      // STORE TOKEN
      // =================================================

      const token =
        data.token ||
        data.Token ||
        "";

      if (token) {
        localStorage.setItem(
          "token",
          token
        );
      }

      // =================================================
      // STORE USER
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // =================================================
      // STORE USER ID
      // =================================================

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

      // =================================================
      // LOGIN STATUS
      // =================================================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // =================================================
      // REMEMBER ME
      // =================================================

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

      // =================================================
      // CLEAR GUEST STATUS
      // =================================================

      localStorage.removeItem(
        "isGuest"
      );

      localStorage.removeItem(
        "userRole"
      );

      // =================================================
      // LOGIN → ROLE SELECTION
      // =================================================

      navigate("/role-selection");

    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data ||
          error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Login failed. Please check your email/mobile and password.";

      showDialog({
        title: "Login Failed",
        message,
        type: "error",
      });

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GUEST LOGIN
  // =====================================================

  const handleGuestLogin = () => {
    localStorage.setItem(
      "userRole",
      "guest"
    );

    localStorage.setItem(
      "isGuest",
      "true"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    navigate("/home");
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = () => {
    showDialog({
      title: "Forgot Password",
      message:
        "Forgot Password functionality will be added soon.",
      type: "info",
    });
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = () => {
    showDialog({
      title: "Google Login",
      message:
        "Google Login will be added soon.",
      type: "info",
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <AuthLayout>

      {/* =================================================
          HEADING
      ================================================= */}

      <h1 className="auth-title">
        Welcome Back 👋
      </h1>

      <p className="auth-subtitle">
        Login to continue using REVIO.
      </p>

      {/* =================================================
          LOGIN FORM
      ================================================= */}

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

        {/* =================================================
            REMEMBER / FORGOT
        ================================================= */}

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
              checked={
                formData.remember
              }
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
            onClick={
              handleForgotPassword
            }
          >
            Forgot Password?
          </span>

        </div>

        {/* =================================================
            LOGIN BUTTON
        ================================================= */}

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

      {/* =================================================
          OR DIVIDER
      ================================================= */}

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

      {/* =================================================
          GOOGLE LOGIN
      ================================================= */}

      <button
        type="button"
        className="google-btn"
        onClick={
          handleGoogleLogin
        }
      >
        Continue with Google
      </button>

      {/* =================================================
          GUEST LOGIN
      ================================================= */}

      <button
        type="button"
        className="google-btn"
        style={{
          marginTop: "12px",
          background: "#222",
          color: "#fff",
          border: "1px solid #333",
        }}
        onClick={
          handleGuestLogin
        }
      >
        Continue as Guest
      </button>

      {/* =================================================
          SIGNUP
      ================================================= */}

      <p className="bottom-link">

        Don't have an account?{" "}

        <Link to="/signup">

          <span>
            Sign Up
          </span>

        </Link>

      </p>

      {/* =================================================
          STANDARD DIALOG
      ================================================= */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        onConfirm={
          handleDialogConfirm
        }
      />

    </AuthLayout>
  );
}

export default Login;