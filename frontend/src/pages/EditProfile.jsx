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

import DialogBox from "../components/DialogBox";

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
  // DIALOG
  // ==========================================

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

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId
      ? Number(userId)
      : null;
  };

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        showDialog({
          title: "Login Required",
          message: "Please login first.",
          type: "warning",
          onConfirm: () => {
            navigate("/login");
          },
        });

        return;
      }

      const response =
        await getProfile(userId);

      console.log(
        "Edit Profile Data:",
        response.data
      );

      const profileData =
        response.data;

      setProfile(profileData);

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

      if (
        error.response?.data?.message
      ) {
        showDialog({
          title: "Profile Error",
          message:
            error.response.data.message,
          type: "error",
        });
      } else {
        showDialog({
          title: "Profile Error",
          message:
            "Failed to load profile.",
          type: "error",
        });
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (saving) {
      return;
    }

    try {
      const userId = getUserId();

      if (!userId) {
        showDialog({
          title: "Login Required",
          message: "Please login first.",
          type: "warning",
          onConfirm: () => {
            navigate("/login");
          },
        });

        return;
      }

      // ======================================
      // BASIC VALIDATION
      // ======================================

      if (!formData.fullName.trim()) {
        showDialog({
          title: "Validation Error",
          message:
            "Full name is required.",
          type: "warning",
        });

        return;
      }

      if (!formData.email.trim()) {
        showDialog({
          title: "Validation Error",
          message:
            "Email is required.",
          type: "warning",
        });

        return;
      }

      if (
        !formData.mobileNumber.trim()
      ) {
        showDialog({
          title: "Validation Error",
          message:
            "Mobile number is required.",
          type: "warning",
        });

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

      showDialog({
        title: "Profile Updated",
        message:
          response.data?.message ||
          "Profile updated successfully.",
        type: "success",
        onConfirm: () => {
          navigate("/profile");
        },
      });

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
        showDialog({
          title: "Update Failed",
          message:
            error.response.data.message,
          type: "error",
        });
      } else {
        showDialog({
          title: "Update Failed",
          message:
            "Failed to update profile.",
          type: "error",
        });
      }

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    navigate("/profile");
  };

  // ==========================================
  // LOADING
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
          confirmText={
            dialog.confirmText
          }
          onConfirm={
            handleDialogConfirm
          }
        />

      </MainLayout>
    );
  }

  // ==========================================
  // PROFILE NOT FOUND
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
          confirmText={
            dialog.confirmText
          }
          onConfirm={
            handleDialogConfirm
          }
        />

      </MainLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <MainLayout>

      {/* ==========================================
          BACK BUTTON
      ========================================== */}

      <button
        className="profile-back-icon"
        onClick={() =>
          navigate("/profile")
        }
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* ==========================================
          PROFILE CONTAINER
      ========================================== */}

      <div className="profile-container">

        {/* ==========================================
            PROFILE HEADER
        ========================================== */}

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

        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <div className="profile-card">

          <h2>
            Personal Information
          </h2>

          <form onSubmit={handleSave}>

            <div className="profile-info-grid">

              {/* FULL NAME */}

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
                    disabled={saving}
                  />

                </div>

              </div>

              {/* EMAIL */}

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
                    disabled={saving}
                  />

                </div>

              </div>

              {/* MOBILE NUMBER */}

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
                    disabled={saving}
                  />

                </div>

              </div>

              {/* MEMBER SINCE */}

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

        {/* ==========================================
            ACCOUNT STATUS
        ========================================== */}

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

        {/* ==========================================
            PROFILE INFORMATION
        ========================================== */}

        <div className="profile-card">

          <h2>
            Profile Information
          </h2>

          <div className="account-status">

            <div>

              <span>
                Profile Status
              </span>

              <strong>
                Active
              </strong>

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

        {/* ==========================================
            SAVE / CANCEL
            ALWAYS AT THE BOTTOM
        ========================================== */}

        <div
          className="profile-actions"
          style={{
            marginTop: "25px",
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
            onClick={
              handleCancel
            }
            disabled={saving}
          >
            Cancel
          </button>

        </div>

      </div>

      {/* ==========================================
          STANDARD DIALOG
      ========================================== */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={
          dialog.confirmText
        }
        onConfirm={
          handleDialogConfirm
        }
      />

    </MainLayout>
  );
}

export default EditProfile;