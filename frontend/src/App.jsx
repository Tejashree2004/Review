import { Routes, Route } from "react-router-dom";

// =========================
// Authentication / Start
// =========================
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";

// =========================
// Reviewer / Normal User
// =========================
import Home from "./pages/Home";
import Search from "./pages/Search";
import PlaceDetails from "./pages/PlaceDetails";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";
import WriteReview from "./pages/WriteReview";
import Notifications from "./pages/Notifications";
import Categories from "./pages/Categories";

// =========================
// Business Owner
// =========================
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerBusinessProfile from "./pages/OwnerBusinessProfile";
import OwnerReviews from "./pages/OwnerReviews";
import OwnerPhotos from "./pages/OwnerPhotos";
import OwnerPublicProfile from "./pages/OwnerPublicProfile";

// =========================
// Admin
// =========================
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminBusinesses from "./pages/AdminBusinesses";
import AdminReviews from "./pages/AdminReviews";
import AdminReports from "./pages/AdminReports";


function App() {
  return (
    <Routes>

      {/* =====================================================
          AUTHENTICATION / START
      ===================================================== */}

      <Route
        path="/"
        element={<Splash />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/role-selection"
        element={<RoleSelection />}
      />


      {/* =====================================================
          REVIEWER / NORMAL USER MODULE
      ===================================================== */}

      <Route
        path="/home"
        element={<Home />}
      />

      <Route
        path="/search"
        element={<Search />}
      />

      <Route
        path="/categories"
        element={<Categories />}
      />

      <Route
        path="/place/:id"
        element={<PlaceDetails />}
      />

      <Route
        path="/favorites"
        element={<Favorites />}
      />

      <Route
        path="/reviews"
        element={<Reviews />}
      />

      <Route
        path="/write-review/:placeId"
        element={<WriteReview />}
      />

      <Route
        path="/notifications"
        element={<Notifications />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />


      {/* =====================================================
          BUSINESS OWNER MODULE
      ===================================================== */}

      {/* Owner Dashboard */}

      <Route
        path="/owner-dashboard"
        element={<OwnerDashboard />}
      />

      {/* Business Information */}

      <Route
        path="/owner/business"
        element={<OwnerBusinessProfile />}
      />

      {/* Business Photos */}

      <Route
        path="/owner/photos"
        element={<OwnerPhotos />}
      />

      {/* Customer Reviews */}

      <Route
        path="/owner/reviews"
        element={<OwnerReviews />}
      />

      {/* Public Profile */}

      <Route
        path="/owner/public-profile"
        element={<OwnerPublicProfile />}
      />


      {/* =====================================================
          ADMIN MODULE
      ===================================================== */}

      {/* Admin Dashboard */}

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      {/* Manage Users */}

      <Route
        path="/admin/users"
        element={<AdminUsers />}
      />

      {/* Manage Businesses */}

      <Route
        path="/admin/businesses"
        element={<AdminBusinesses />}
      />

      {/* Moderate Reviews */}

      <Route
        path="/admin/reviews"
        element={<AdminReviews />}
      />

      {/* Reports */}

      <Route
        path="/admin/reports"
        element={<AdminReports />}
      />

    </Routes>
  );
}

export default App;