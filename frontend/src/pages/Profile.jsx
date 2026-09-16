import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { getProfile } from "../services/ProfileService";

import {
  FaArrowLeft,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

import DialogBox from "../components/DialogBox";

import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // DIALOG STATE
  // ==========================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
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
      confirmText: "OK",
      action,
    });
  };

  // ==========================================
  // CLOSE DIALOG
  // ==========================================

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  // ==========================================
  // HANDLE DIALOG CONFIRM
  // ==========================================

  const handleDialogConfirm = () => {
    const action = dialog.action;

    closeDialog();

    if (action) {
      action();
    }
  };

  // ==========================================
  // Get User ID
  // ==========================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
  };

  // ==========================================
  // Load Profile
  // ==========================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = getUserId();

      if (!userId) {
        showDialog(
          "Login Required",
          "Please login first.",
          "warning",
          () => navigate("/login")
        );

        setLoading(false);

        return;
      }

      const response = await getProfile(userId);

      console.log(
        "Profile Data:",
        response.data
      );

      setProfile(response.data);
    } catch (error) {
      console.error(
        "Failed to load profile:",
        error
      );

      if (
        error.response?.data?.message
      ) {
        showDialog(
          "Error",
          error.response.data.message,
          "error"
        );
      } else {
        showDialog(
          "Error",
          "Failed to load profile.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Logout
  // ==========================================

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("accessToken");

  localStorage.removeItem("userId");
  localStorage.removeItem("UserId");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isGuest");

  navigate("/login");
};

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <MainLayout>
        <div className="profile-loading">
          Loading Profile...
        </div>

        <DialogBox
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          confirmText={dialog.confirmText}
          onConfirm={handleDialogConfirm}
        />
      </MainLayout>
    );
  }

  // ==========================================
  // Profile Not Found
  // ==========================================

  if (!profile) {
    return (
      <MainLayout>

        <div className="profile-not-found">

          <h2>
            Profile Not Found
          </h2>

          <button
            className="profile-back-btn"
            onClick={() =>
              navigate("/home")
            }
          >
            Go Back
          </button>

        </div>

        <DialogBox
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          confirmText={dialog.confirmText}
          onConfirm={handleDialogConfirm}
        />

      </MainLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <MainLayout>

      {/* Back Button */}

      <button
        className="profile-back-icon"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>


      {/* Profile Header */}

      <div className="profile-container">

        <div className="profile-header">

          <div className="profile-avatar">
            <FaUserCircle />
          </div>

          <div className="profile-header-info">

            <h1>
              {profile.fullName}
            </h1>

            <p>
              {profile.email}
            </p>

            {profile.isEmailVerified && (
              <span className="verified-badge">

                <FaCheckCircle />

                Email Verified

              </span>
            )}

          </div>

        </div>


        {/* Personal Information */}

        <div className="profile-card">

          <h2>
            Personal Information
          </h2>

          <div className="profile-info-grid">


            {/* Full Name */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FaUserCircle />
              </div>

              <div>

                <span>
                  Full Name
                </span>

                <strong>
                  {profile.fullName}
                </strong>

              </div>

            </div>


            {/* Email */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FaEnvelope />
              </div>

              <div>

                <span>
                  Email
                </span>

                <strong>
                  {profile.email}
                </strong>

              </div>

            </div>


            {/* Mobile */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FaPhone />
              </div>

              <div>

                <span>
                  Mobile Number
                </span>

                <strong>
                  {profile.mobileNumber}
                </strong>

              </div>

            </div>


            {/* Created Date */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FaCalendarAlt />
              </div>

              <div>

                <span>
                  Member Since
                </span>

                <strong>
                  {new Date(
                    profile.createdAt
                  ).toLocaleDateString()}
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* Account Status */}

        <div className="profile-card">

          <h2>
            Account Status
          </h2>

          <div className="account-status">

            <div>

              <span>
                Account
              </span>

              <strong>
                Active
              </strong>

            </div>


            <div>

              <span>
                Email Verification
              </span>

              <strong
                className={
                  profile.isEmailVerified
                    ? "status-verified"
                    : "status-pending"
                }
              >
                {profile.isEmailVerified
                  ? "Verified"
                  : "Not Verified"}
              </strong>

            </div>

          </div>

        </div>


        {/* Actions */}

        <div className="profile-actions">

          <button
            className="profile-action-btn"
            onClick={() =>
              navigate("/edit-profile")
            }
          >
            Edit Profile
          </button>


          <button
            className="profile-action-btn logout-btn"
            onClick={() =>
              showDialog(
                "Logout",
                "Are you sure you want to logout?",
                "warning",
                handleLogout
              )
            }
          >
            Logout
          </button>

        </div>

      </div>


      {/* DIALOG */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        onConfirm={handleDialogConfirm}
      />

    </MainLayout>
  );
}

export default Profile;