import {
  FaHome,
  FaSearch,
  FaPlusCircle,
  FaBell,
  FaUser,
} from "react-icons/fa";

function BottomNavigation() {
  return (
    <div className="bottom-nav">

      <div className="nav-item active">
        <FaHome />
        <span>Home</span>
      </div>

      <div className="nav-item">
        <FaSearch />
        <span>Search</span>
      </div>

      <div className="nav-item">
        <FaPlusCircle />
        <span>Review</span>
      </div>

      <div className="nav-item">
        <FaBell />
        <span>Alerts</span>
      </div>

   

    </div>
  );
}

export default BottomNavigation;