import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getProfile,
  updateProfile,
} from "../services/ProfileService";

import {
  FaArrowLeft,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

import "../styles/Profile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const response = await getProfile(userId);

      console.log(
        "Edit Profile Data:",
        response.data
      );

      const profileData = response.data;

      setProfile(profileData);

      // ========================================
      // Pre-fill form
      // ========================================

      setFormData({
        fullName:
          profileData.fullName || "",

        email:
          profileData.email || "",

        mobileNumber:
          profileData.mobileNumber || "",
      });
    } catch (error) {
      console.error(
        "Failed to load profile:",
        error
      );

      if (error.response?.data?.message) {
        alert(
          error.response.data.message
        );
      } else {
        alert(
          "Failed to load profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // Save Profile
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      const userId = getUserId();

      if (!userId) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      // ======================================
      // Basic Validation
      // ======================================

      if (!formData.fullName.trim()) {
        alert("Full name is required.");
        return;
      }

      if (!formData.email.trim()) {
        alert("Email is required.");
        return;
      }

      if (!formData.mobileNumber.trim()) {
        alert(
          "Mobile number is required."
        );
        return;
      }

      setSaving(true);

      console.log(
        "Updating Profile:",
        formData
      );

      const response =
        await updateProfile(
          userId,
          {
            fullName:
              formData.fullName.trim(),

            email:
              formData.email.trim(),

            mobileNumber:
              formData.mobileNumber.trim(),
          }
        );

      console.log(
        "Profile Updated:",
        response.data
      );

      alert(
        response.data?.message ||
          "Profile updated successfully."
      );

      // ======================================
      // Go back to Profile
      // ======================================

      navigate("/profile");
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      console.error(
        "Profile Update API Error:",
        error.response?.data
      );

      if (
        error.response?.data?.message
      ) {
        alert(
          error.response.data.message
        );
      } else {
        alert(
          "Failed to update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Cancel
  // ==========================================

  const handleCancel = () => {
    navigate("/profile");
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
        onClick={() =>
          navigate("/profile")
        }
        title="Go Back"
      >
        <FaArrowLeft />
      </button>


      {/* ==========================
          Profile Container
      ========================== */}

      <div className="profile-container">


        {/* ==========================
            Profile Header
        ========================== */}

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


        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="profile-card">

          <h2>
            Personal Information
          </h2>

          <form onSubmit={handleSave}>

            <div className="profile-info-grid">


              {/* ========================
                  Full Name
              ======================== */}

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaUserCircle />
                </div>

                <div className="profile-edit-field">

                  <span>
                    Full Name
                  </span>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                  />

                </div>

              </div>


              {/* ========================
                  Email
              ======================== */}

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaEnvelope />
                </div>

                <div className="profile-edit-field">

                  <span>
                    Email
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter email"
                  />

                </div>

              </div>


              {/* ========================
                  Mobile Number
              ======================== */}

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaPhone />
                </div>

                <div className="profile-edit-field">

                  <span>
                    Mobile Number
                  </span>

                  <input
                    type="text"
                    name="mobileNumber"
                    value={
                      formData.mobileNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter mobile number"
                  />

                </div>

              </div>


              {/* ========================
                  Member Since
              ======================== */}

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

          </form>

        </div>


        {/* =================================================
            ACCOUNT STATUS
        ================================================= */}

        <div className="profile-card">

          <h2>
            Account Status
          </h2>

          <div className="account-status">


            {/* ========================
                Account
            ======================== */}

            <div>

              <span>
                Account
              </span>

              <strong>
                Active
              </strong>

            </div>


            {/* ========================
                Email Verification
            ======================== */}

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


        {/* =================================================
            PROFILE INFORMATION
        ================================================= */}

        <div className="profile-card">

          <h2>
            Profile Information
          </h2>

          <div className="account-status">


            {/* ========================
                Profile Status
            ======================== */}

            <div>

              <span>
                Profile Status
              </span>

              <strong>
                Active
              </strong>

            </div>


            {/* ========================
                Member Since
            ======================== */}

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


        {/* =================================================
            SAVE / CANCEL
            EXACTLY BELOW PROFILE INFORMATION
        ================================================= */}

        <div
          className="profile-actions"
          style={{
            marginTop: "10px",
            marginBottom: "30px",
          }}
        >

          <button
            type="button"
            className="profile-action-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>


          <button
            type="button"
            className="profile-action-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>

        </div>


      </div>

    </MainLayout>
  );
}

export default EditProfile;