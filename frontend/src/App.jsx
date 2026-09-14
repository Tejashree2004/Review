import { Routes, Route } from "react-router-dom";

// =========================
// Authentication / Start
// =========================
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import VerifyOtp from "./pages/VerifyOtp";
import ProtectedRoute from "./routes/ProtectedRoute";

// =========================
// Reviewer / Normal User
// =========================
import Home from "./pages/Home";
import Search from "./pages/Search";
import PlaceDetails from "./pages/PlaceDetails";
import BusinessDetails from "./pages/BusinessDetails";
import BusinessReviews from "./pages/BusinessReviews";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";
import WriteReview from "./pages/WriteReview";
import Notifications from "./pages/Notifications";
import Categories from "./pages/Categories";
import EditProfile from "./pages/EditProfile";
import UserPublicProfile from "./pages/UserPublicProfile";

// =========================
// Business Owner
// =========================
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerBusinessProfile from "./pages/OwnerBusinessProfile";
import OwnerReviews from "./pages/OwnerReviews";
import OwnerPhotos from "./pages/OwnerPhotos";
import OwnerPublicProfile from "./pages/OwnerPublicProfile";
import MyBusinesses from "./pages/MyBusinesses";

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
        path="/verify-otp"
        element={<VerifyOtp />}
      />

      <Route
        path="/role-selection"
        element={<RoleSelection />}
      />

      <Route
        path="/edit-profile"
        element={<EditProfile />}
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
        path="/business/:id"
        element={<BusinessDetails />}
      />

      <Route
        path="/business/:businessId/reviews"
        element={<BusinessReviews />}
      />

      {/* =====================================================
          PUBLIC USER PROFILE FROM REVIEW

          Supported URLs:

          /user-profile/:userId/review/:reviewId

          AND

          /user-profile/:userId?reviewId=:reviewId

          The second route is required because the current
          reviewer profile click is navigating using a query
          parameter.
      ===================================================== */}

      <Route
        path="/user-profile/:userId/review/:reviewId"
        element={<UserPublicProfile />}
      />

      <Route
        path="/user-profile/:userId"
        element={<UserPublicProfile />}
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
        path="/write-review/business/:businessId"
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
  element={
    <ProtectedRoute allowedRoles={["Owner", "BusinessOwner", "owner"]}>
      <OwnerDashboard />
    </ProtectedRoute>
  }
/>


      {/* =====================================================
          MY BUSINESSES

          Shows all businesses owned by logged-in owner

          URL:
          /owner/my-businesses
      ===================================================== */}

      <Route
        path="/owner/my-businesses"
        element={<MyBusinesses />}
      />


      {/* =====================================================
          CREATE NEW BUSINESS

          URL:
          /owner/business/new
      ===================================================== */}

      <Route
        path="/owner/business/new"
        element={<OwnerBusinessProfile />}
      />


      {/* =====================================================
          EDIT EXISTING BUSINESS

          URL:
          /owner/business/2
          /owner/business/3
          etc.
      ===================================================== */}

      <Route
        path="/owner/business/:businessId"
        element={<OwnerBusinessProfile />}
      />


      {/* =====================================================
          LEGACY BUSINESS ROUTE
      ===================================================== */}

      <Route
        path="/owner/business"
        element={<OwnerBusinessProfile />}
      />


      {/* =====================================================
          BUSINESS PHOTOS
      ===================================================== */}

      <Route
        path="/owner/photos"
        element={<OwnerPhotos />}
      />

      <Route
        path="/owner/photos/:businessId"
        element={<OwnerPhotos />}
      />


      {/* =====================================================
          OWNER REVIEWS
      ===================================================== */}

      <Route
        path="/owner/reviews"
        element={<OwnerReviews />}
      />

      <Route
        path="/owner/reviews/business/:businessId"
        element={<OwnerReviews />}
      />


      {/* =====================================================
          OWNER PUBLIC PROFILE
      ===================================================== */}

      <Route
        path="/owner/public-profile"
        element={<OwnerPublicProfile />}
      />

      <Route
        path="/owner/public-profile/:businessId"
        element={<OwnerPublicProfile />}
      />


      {/* =====================================================
          ADMIN MODULE
      ===================================================== */}

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/users"
        element={<AdminUsers />}
      />

      <Route
        path="/admin/businesses"
        element={<AdminBusinesses />}
      />

      <Route
        path="/admin/reviews"
        element={<AdminReviews />}
      />

      <Route
        path="/admin/reports"
        element={<AdminReports />}
      />

    </Routes>
  );
}

export default App;