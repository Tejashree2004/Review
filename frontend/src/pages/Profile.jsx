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

import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const response = await getProfile(userId);

      console.log("Profile Data:", response.data);

      setProfile(response.data);
    } catch (error) {
      console.error("Failed to load profile:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
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
          <h2>Profile Not Found</h2>

          <button
            className="profile-back-btn"
            onClick={() => navigate("/home")}
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <MainLayout>

      {/* ==========================
          Back Button
      ========================== */}

      <button
        className="profile-back-icon"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>


      {/* ==========================
          Profile Header
      ========================== */}

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


        {/* ==========================
            Personal Information
        ========================== */}

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


        {/* ==========================
            Account Status
        ========================== */}

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


        {/* ==========================
            Future Actions
        ========================== */}

        <div className="profile-actions">

          <button
            className="profile-action-btn"
            onClick={() => alert("Edit Profile coming soon.")}
          >
            Edit Profile
          </button>

          <button
            className="profile-action-btn logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("user");
              localStorage.removeItem("isLoggedIn");

              navigate("/login");
            }}
          >
            Logout
          </button>

        </div>

      </div>

    </MainLayout>
  );
}

export default Profile;