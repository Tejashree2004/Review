import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBuilding,
  FaCamera,
  FaEye,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaStar,
  FaSignOutAlt,
  FaHome,
  FaUserCircle,
} from "react-icons/fa";

import "../styles/OwnerDashboard.css";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // =========================================
  // Get logged-in user
  // =========================================

  const storedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("User data error:", error);
  }

  // =========================================
  // Owner name
  // =========================================

  const ownerName =
    user?.name ||
    user?.Name ||
    user?.fullName ||
    user?.FullName ||
    user?.username ||
    user?.Username ||
    "Owner";

  const ownerInitial = ownerName
    .trim()
    .charAt(0)
    .toUpperCase();

  // =========================================
  // Navigation
  // =========================================

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // =========================================
  // Logout
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    setMenuOpen(false);

    navigate("/login");
  };

  return (
    <div className="owner-dashboard">

      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="owner-navbar">

        {/* LEFT SIDE */}

        <div className="owner-navbar-left">

          {/* Back */}

          <button
            className="owner-back-btn"
            onClick={() => navigate("/role-selection")}
            aria-label="Back to role selection"
            title="Back"
          >
            <FaArrowLeft />
          </button>

          {/* Brand */}

          <div
            className="owner-brand"
            onClick={() => navigate("/owner-dashboard")}
          >
            REVIO
          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="owner-navbar-right">

          {/* Owner name - desktop */}

          <span className="owner-name">
            {ownerName}
          </span>


          {/* Hamburger */}

          <button
            className="owner-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            title="Menu"
          >
            <FaBars />
          </button>


          {/* Profile Avatar */}

          <button
            className="owner-profile"
            onClick={() => goTo("/owner/business")}
            title={ownerName}
            aria-label="Business profile"
          >
            {ownerInitial || <FaUserCircle />}
          </button>

        </div>

      </header>


      {/* =================================================
          OVERLAY
      ================================================= */}

      {menuOpen && (
        <div
          className="owner-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}


      {/* =================================================
          SIDE MENU
      ================================================= */}

      <aside
        className={`owner-side-menu ${
          menuOpen ? "open" : ""
        }`}
      >

        {/* Menu Header */}

        <div className="owner-menu-header">

          <div className="owner-menu-user">

            <div className="owner-menu-avatar">
              {ownerInitial}
            </div>

            <div>
              <strong>{ownerName}</strong>
              <span>Business Owner</span>
            </div>

          </div>


          <button
            className="owner-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

        </div>


        {/* Menu Items */}

        <nav className="owner-menu-nav">

          <button
            onClick={() => goTo("/owner-dashboard")}
          >
            <FaHome />
            <span>Dashboard</span>
          </button>


          <button
            onClick={() => goTo("/owner/business")}
          >
            <FaBuilding />
            <span>Business Profile</span>
          </button>


          <button
            onClick={() => goTo("/owner/photos")}
          >
            <FaCamera />
            <span>Business Photos</span>
          </button>


          <button
            onClick={() => goTo("/owner/reviews")}
          >
            <FaStar />
            <span>Customer Reviews</span>
          </button>


          <button
            onClick={() => goTo("/owner/public-profile")}
          >
            <FaEye />
            <span>Public Profile</span>
          </button>

        </nav>


        {/* Logout */}

        <div className="owner-menu-bottom">

          <button
            className="owner-logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <main className="owner-main">

        {/* PAGE HEADER */}

        <section className="owner-page-header">

          <span className="owner-eyebrow">
            BUSINESS OWNER
          </span>

          <h1>
            Set up your business
          </h1>

          <p>
            Add your business details to start appearing
            on REVIO and reach more customers.
          </p>

        </section>


        {/* =================================================
            PROGRESS
        ================================================= */}

        <section className="setup-progress">

          <div className="progress-top">

            <span>
              Profile setup
            </span>

            <strong>
              0 / 3
            </strong>

          </div>

          <div className="progress-track">

            <div className="progress-fill"></div>

          </div>

        </section>


        {/* =================================================
            SETUP STEPS
        ================================================= */}

        <section className="setup-steps">

          {/* STEP 01 */}

          <div
            className="setup-card active"
            onClick={() => navigate("/owner/business")}
          >

            <div className="setup-number">
              01
            </div>

            <div className="setup-icon">
              <FaBuilding />
            </div>

            <div className="setup-content">

              <span className="setup-label">
                BUSINESS INFORMATION
              </span>

              <h2>
                Add your business
              </h2>

              <p>
                Name, category, address, contact and
                opening hours.
              </p>

            </div>

            <button
              className="setup-arrow"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/owner/business");
              }}
              aria-label="Add business"
            >
              <FaArrowRight />
            </button>

          </div>


          {/* STEP 02 */}

          <div
            className="setup-card"
            onClick={() => navigate("/owner/photos")}
          >

            <div className="setup-number">
              02
            </div>

            <div className="setup-icon">
              <FaCamera />
            </div>

            <div className="setup-content">

              <span className="setup-label">
                BUSINESS PHOTOS
              </span>

              <h2>
                Add photos
              </h2>

              <p>
                Upload photos of your hotel,
                restaurant, salon or shop.
              </p>

            </div>

            <button
              className="setup-arrow"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/owner/photos");
              }}
              aria-label="Add photos"
            >
              <FaArrowRight />
            </button>

          </div>


          {/* STEP 03 */}

          <div
            className="setup-card"
            onClick={() =>
              navigate("/owner/public-profile")
            }
          >

            <div className="setup-number">
              03
            </div>

            <div className="setup-icon">
              <FaEye />
            </div>

            <div className="setup-content">

              <span className="setup-label">
                PUBLIC PROFILE
              </span>

              <h2>
                Preview your profile
              </h2>

              <p>
                See how your business will appear
                to REVIO users.
              </p>

            </div>

            <button
              className="setup-arrow"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/owner/public-profile");
              }}
              aria-label="Preview profile"
            >
              <FaArrowRight />
            </button>

          </div>

        </section>


        {/* =================================================
            DISCOVERY
        ================================================= */}

        <section className="discovery-box">

          <div className="discovery-line"></div>

          <div>

            <h3>
              Get discovered on REVIO
            </h3>

            <p>
              A complete profile helps customers find
              your business, read reviews and learn more
              about your services.
            </p>

          </div>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="owner-footer">

        <strong>
          REVIO
        </strong>

        <span>
          Discover. Review. Trust.
        </span>

      </footer>

    </div>
  );
}

export default OwnerDashboard;