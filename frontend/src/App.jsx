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


      {/* =====================================================
          REVIEWER / NORMAL USER MODULE
      ===================================================== */}

      {/* Public Home */}
      <Route
        path="/home"
        element={<Home />}
      />

      {/* Public Search */}
      <Route
        path="/search"
        element={<Search />}
      />

      {/* Public Categories */}
      <Route
        path="/categories"
        element={<Categories />}
      />

      {/* Public Place Details */}
      <Route
        path="/place/:id"
        element={<PlaceDetails />}
      />

      {/* Public Business Details */}
      <Route
        path="/business/:id"
        element={<BusinessDetails />}
      />

      {/* Public Business Reviews */}
      <Route
        path="/business/:businessId/reviews"
        element={<BusinessReviews />}
      />


      {/* =====================================================
          PUBLIC USER PROFILE FROM REVIEW

          Supported URLs:

          /user-profile/:userId/review/:reviewId
          /user-profile/:userId?reviewId=:reviewId
      ===================================================== */}

      <Route
        path="/user-profile/:userId/review/:reviewId"
        element={<UserPublicProfile />}
      />

      <Route
        path="/user-profile/:userId"
        element={<UserPublicProfile />}
      />


      {/* =====================================================
          AUTHENTICATED USER ROUTES
      ===================================================== */}

      {/* Edit Profile */}
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      {/* Favorites */}
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />

      {/* My Reviews */}
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        }
      />

      {/* Write Review - Place */}
      <Route
        path="/write-review/:placeId"
        element={
          <ProtectedRoute>
            <WriteReview />
          </ProtectedRoute>
        }
      />

      {/* Write Review - Business */}
      <Route
        path="/write-review/business/:businessId"
        element={
          <ProtectedRoute>
            <WriteReview />
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />


      {/* =====================================================
          BUSINESS OWNER MODULE
      ===================================================== */}

      {/* Owner Dashboard */}
      <Route
        path="/owner-dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* My Businesses */}
      <Route
        path="/owner/my-businesses"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <MyBusinesses />
          </ProtectedRoute>
        }
      />

      {/* Create New Business */}
      <Route
        path="/owner/business/new"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerBusinessProfile />
          </ProtectedRoute>
        }
      />

      {/* Edit Existing Business */}
      <Route
        path="/owner/business/:businessId"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerBusinessProfile />
          </ProtectedRoute>
        }
      />

      {/* Legacy Business Route */}
      <Route
        path="/owner/business"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerBusinessProfile />
          </ProtectedRoute>
        }
      />

      {/* Business Photos */}
      <Route
        path="/owner/photos"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerPhotos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/photos/:businessId"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerPhotos />
          </ProtectedRoute>
        }
      />

      {/* Owner Reviews */}
      <Route
        path="/owner/reviews"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerReviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/reviews/business/:businessId"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerReviews />
          </ProtectedRoute>
        }
      />

      {/* Owner Public Profile */}
      <Route
        path="/owner/public-profile"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerPublicProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/public-profile/:businessId"
        element={
          <ProtectedRoute
            allowedRoles={["Owner", "BusinessOwner", "owner"]}
          >
            <OwnerPublicProfile />
          </ProtectedRoute>
        }
      />


      {/* =====================================================
          ADMIN MODULE
      ===================================================== */}

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin", "admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Users */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Admin", "admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      {/* Admin Businesses */}
      <Route
        path="/admin/businesses"
        element={
          <ProtectedRoute allowedRoles={["Admin", "admin"]}>
            <AdminBusinesses />
          </ProtectedRoute>
        }
      />

      {/* Admin Reviews */}
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute allowedRoles={["Admin", "admin"]}>
            <AdminReviews />
          </ProtectedRoute>
        }
      />

      {/* Admin Reports */}
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["Admin", "admin"]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;