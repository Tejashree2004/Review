import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";

import {
  sendEmailOtp,
  verifyEmailOtp,
} from "../api/auth";

import DialogBox from "../components/DialogBox";

import "../styles/VerifyOtp.css";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    userId,
    email,
  } = location.state || {};

  const [otp, setOtp] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(0);

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
  // PAGE LOAD
  // ==========================================

  useEffect(() => {
    if (!userId || !email) {
      console.log(
        "Missing OTP verification information."
      );

      return;
    }

    console.log(
      "Verify OTP page opened."
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Email:",
      email
    );
  }, [userId, email]);

  // ==========================================
  // RESEND TIMER
  // ==========================================

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(
        (previous) =>
          previous > 0
            ? previous - 1
            : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [resendTimer]);

  // ==========================================
  // OTP INPUT
  // ==========================================

  const handleOtpChange = (e) => {
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!userId || !email) {
      showDialog(
        "Verification Information Missing",
        "Verification information is missing. Please signup again.",
        "warning",
        () => navigate("/signup")
      );

      return;
    }

    if (otp.length !== 6) {
      showDialog(
        "Invalid OTP",
        "Please enter the complete 6-digit OTP.",
        "warning"
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "======================================"
      );

      console.log(
        "VERIFY OTP REQUEST"
      );

      console.log(
        "UserId:",
        userId
      );

      console.log(
        "OTP length:",
        otp.length
      );

      console.log(
        "======================================"
      );

      const response =
        await verifyEmailOtp({
          userId: Number(userId),
          otp: otp.trim(),
        });

      console.log(
        "Verify OTP Response:",
        response.data
      );

      const success =
        response.data?.success ??
        response.data?.Success ??
        false;

      if (!success) {
        const message =
          response.data?.message ||
          response.data?.Message ||
          "OTP verification failed.";

        showDialog(
          "Verification Failed",
          message,
          "error"
        );

        return;
      }

      setVerified(true);

      setOtp("");

      setResendTimer(0);

      showDialog(
        "Email Verified",
        "Email verified successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "======================================"
      );

      console.error(
        "VERIFY OTP ERROR"
      );

      console.error(
        "Axios Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend Response:",
        error.response?.data
      );

      console.error(
        "======================================"
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Invalid or expired OTP. Please try again.";

      showDialog(
        "Verification Failed",
        message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOtp = async () => {
    if (!userId || !email) {
      showDialog(
        "Information Missing",
        "Verification information is missing.",
        "warning"
      );

      return;
    }

    if (resendTimer > 0) {
      return;
    }

    try {
      setSendingOtp(true);

      console.log(
        "Sending new OTP..."
      );

      const response =
        await sendEmailOtp({
          userId: Number(userId),
          email,
        });

      console.log(
        "Resend OTP Response:",
        response.data
      );

      const success =
        response.data?.success ??
        response.data?.Success ??
        false;

      if (!success) {
        const message =
          response.data?.message ||
          response.data?.Message ||
          "Failed to send OTP.";

        showDialog(
          "Resend Failed",
          message,
          "error"
        );

        return;
      }

      setOtp("");

      setResendTimer(60);

      showDialog(
        "OTP Sent",
        "A new OTP has been sent to your email.",
        "success"
      );
    } catch (error) {
      console.error(
        "Resend OTP Error:",
        error
      );

      console.error(
        "Backend Response:",
        error.response?.data
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Unable to send a new OTP.";

      showDialog(
        "Resend Failed",
        message,
        "error"
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // ==========================================
  // CONTINUE TO LOGIN
  // ==========================================

  const handleContinue = () => {
    navigate("/login");
  };

  // ==========================================
  // MISSING INFORMATION UI
  // ==========================================

  if (!userId || !email) {
    return (
      <AuthLayout>

        <div className="otp-page">

          <div className="otp-card">

            <div className="otp-icon error">
              !
            </div>

            <h1>
              Verification Information Missing
            </h1>

            <p className="otp-description">
              We couldn't find your signup
              information. Please create
              your account again.
            </p>

            <button
              className="otp-primary-button"
              type="button"
              onClick={() =>
                navigate("/signup")
              }
            >
              Back to Signup
            </button>

          </div>

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

  // ==========================================
  // VERIFIED UI
  // ==========================================

  if (verified) {
    return (
      <AuthLayout>

        <div className="otp-page">

          <div className="otp-card">

            <div className="otp-icon verified">
              ✓
            </div>

            <h1>
              Email Verified!
            </h1>

            <p className="otp-description">
              Your email address has been
              successfully verified.
            </p>

            <p className="otp-email">
              {email}
            </p>

            <p className="otp-expiry">
              Your REVIO account is now
              ready to use.
            </p>

            <button
              className="otp-primary-button"
              type="button"
              onClick={
                handleContinue
              }
            >
              Continue to Login
            </button>

          </div>

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

  // ==========================================
  // MAIN OTP UI
  // ==========================================

  return (
    <AuthLayout>

      <div className="otp-page">

        <div className="otp-card">

          {/* ICON */}

          <div className="otp-icon">
            ✉
          </div>

          {/* TITLE */}

          <h1>
            Verify Your Email
          </h1>

          {/* DESCRIPTION */}

          <p className="otp-description">
            We've sent a 6-digit
            verification code to
          </p>

          <p className="otp-email">
            {email}
          </p>

          <p className="otp-expiry">
            The code is valid for
            <strong>
              {" "}10 minutes
            </strong>
          </p>

          {/* VERIFY FORM */}

          <form
            onSubmit={handleVerify}
            className="otp-form"
          >

            <label htmlFor="otp">
              Enter verification code
            </label>

            <input
              id="otp"
              className="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={
                handleOtpChange
              }
              disabled={loading}
              autoFocus
            />

            {/* OTP DOTS */}

            <div className="otp-dots">

              {[0, 1, 2, 3, 4, 5].map(
                (index) => (
                  <span
                    key={index}
                    className={
                      index < otp.length
                        ? "active"
                        : ""
                    }
                  />
                )
              )}

            </div>

            {/* VERIFY BUTTON */}

            <button
              className="otp-primary-button"
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>

          </form>

          {/* RESEND OTP */}

          <div className="otp-resend">

            <span>
              Didn't receive the code?
            </span>

            {resendTimer > 0 ? (

              <span className="otp-timer">
                Resend in{" "}
                {resendTimer}s
              </span>

            ) : (

              <button
                type="button"
                onClick={
                  handleResendOtp
                }
                disabled={
                  sendingOtp ||
                  loading
                }
              >
                {sendingOtp
                  ? "Sending..."
                  : "Resend OTP"}
              </button>

            )}

          </div>

          {/* SECURITY MESSAGE */}

          <div className="otp-help">

            <span>
              🔒
            </span>

            <p>
              Never share your OTP
              with anyone.
            </p>

          </div>

        </div>

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

export default VerifyOtp;