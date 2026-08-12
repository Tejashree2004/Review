import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaBriefcase,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";

import RoleCard from "../components/RoleCard";

import "../styles/RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  // =========================
  // Role Selection
  // =========================

  const handleRoleSelect = (role) => {
    // Save selected role
    localStorage.setItem("userRole", role);

    // Remove guest status if user selects a role
    localStorage.removeItem("isGuest");

    // =========================
    // Reviewer / Normal User
    // =========================

    if (role === "reviewer") {
      navigate("/home");
      return;
    }

    // =========================
    // Business Owner
    // =========================

    if (role === "owner") {
      navigate("/owner-dashboard");
      return;
    }

    // =========================
    // Admin
    // =========================

    if (role === "admin") {
      navigate("/admin-dashboard");
      return;
    }
  };

  // =========================
  // Go Back
  // =========================

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="role-container">

      {/* =========================
          Back Button
      ========================= */}

      <button
        type="button"
        className="role-back-btn"
        onClick={handleBack}
        title="Go Back"
        aria-label="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* =========================
          Header
      ========================= */}

      <div className="role-header">

        <div className="role-logo">
          REVIO
        </div>

        <h1>Select Your Role</h1>

        <p>
          Choose the type of account you want to continue with.
        </p>

      </div>

      {/* =========================
          Role Cards
      ========================= */}

      <div className="role-cards">

        {/* =========================
            Reviewer / User
        ========================= */}

        <RoleCard
          icon={<FaUser />}
          title="Reviewer / User"
          description="Search places, read reviews, write reviews, add favorites and explore businesses."
          buttonText="Continue as User"
          role="reviewer"
          onClick={handleRoleSelect}
        />

        {/* =========================
            Business Owner
        ========================= */}

        <RoleCard
          icon={<FaBriefcase />}
          title="Business Owner"
          description="Manage your business profile, photos, customer reviews and business information."
          buttonText="Continue as Owner"
          role="owner"
          onClick={handleRoleSelect}
        />

        {/* =========================
            Admin
        ========================= */}

        <RoleCard
          icon={<FaShieldAlt />}
          title="Admin"
          description="Manage users, businesses, reviews, reports and overall REVIO platform activity."
          buttonText="Continue as Admin"
          role="admin"
          onClick={handleRoleSelect}
        />

      </div>

      {/* =========================
          Footer
      ========================= */}

      <div className="role-footer">

        <span>REVIO</span>

        <p>
          Discover. Review. Trust.
        </p>

      </div>

    </div>
  );
}

export default RoleSelection;