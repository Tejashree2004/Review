import {
  FaHome,
  FaSearch,
  FaPlusCircle,
  FaBell,
} from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";

import "../styles/BottomNavigation.css";

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">

      {/* Home */}
      <div
        className={`nav-item ${
          location.pathname === "/home" ? "active" : ""
        }`}
        onClick={() => handleNavigation("/home")}
      >
        <FaHome />
        <span>Home</span>
      </div>

      {/* Search */}
      <div
        className={`nav-item ${
          location.pathname === "/search" ? "active" : ""
        }`}
        onClick={() => handleNavigation("/search")}
      >
        <FaSearch />
        <span>Search</span>
      </div>

      {/* Review */}
      <div
        className={`nav-item ${
          location.pathname === "/reviews" ? "active" : ""
        }`}
        onClick={() => handleNavigation("/reviews")}
      >
        <FaPlusCircle />
        <span>Review</span>
      </div>

      {/* Alerts */}
      <div
        className={`nav-item ${
          location.pathname === "/notifications" ? "active" : ""
        }`}
        onClick={() => handleNavigation("/notifications")}
      >
        <FaBell />
        <span>Alerts</span>
      </div>

    </nav>
  );
}

export default BottomNavigation;