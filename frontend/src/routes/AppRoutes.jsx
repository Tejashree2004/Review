import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "../pages/Splash";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyOtp from "../pages/VerifyOtp";

import Home from "../pages/Home";
import PlaceDetails from "../pages/PlaceDetails";
import BusinessDetails from "../pages/BusinessDetails";
import MyReviews from "../pages/MyReviews";

import OwnerDashboard from "../pages/OwnerDashboard";
import OwnerMyBusinesses from "../pages/OwnerMyBusinesses";
import OwnerBusinessProfile from "../pages/OwnerBusinessProfile";
import OwnerPhotos from "../pages/OwnerPhotos";
import OwnerReviews from "../pages/OwnerReviews";
import OwnerPublicProfile from "../pages/OwnerPublicProfile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ======================================
            SPLASH
        ====================================== */}

        <Route
          path="/"
          element={<Splash />}
        />


        {/* ======================================
            AUTH
        ====================================== */}

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


        {/* ======================================
            HOME
        ====================================== */}

        <Route
          path="/home"
          element={<Home />}
        />


        {/* ======================================
            PLACE DETAILS
        ====================================== */}

        <Route
          path="/place/:id"
          element={<PlaceDetails />}
        />


        {/* ======================================
            BUSINESS DETAILS - CUSTOMER
        ====================================== */}

        <Route
          path="/business/:id"
          element={<BusinessDetails />}
        />


        {/* ======================================
            MY REVIEWS
        ====================================== */}

        <Route
          path="/reviews"
          element={<MyReviews />}
        />


        {/* ======================================
            OWNER DASHBOARD
        ====================================== */}

        <Route
          path="/owner-dashboard"
          element={<OwnerDashboard />}
        />


        {/* ======================================
            MY BUSINESSES
        ====================================== */}

        <Route
          path="/owner/my-businesses"
          element={<OwnerMyBusinesses />}
        />


        {/* ======================================
            OWNER BUSINESS
        ====================================== */}

        {/* Existing/backward-compatible route */}

        <Route
          path="/owner/business"
          element={<OwnerBusinessProfile />}
        />


        {/* Create new business */}

        <Route
          path="/owner/business/new"
          element={<OwnerBusinessProfile />}
        />


        {/* Edit selected business */}

        <Route
          path="/owner/business/:businessId"
          element={<OwnerBusinessProfile />}
        />


        {/* ======================================
            OWNER PHOTOS
        ====================================== */}

        {/* Existing/backward-compatible route */}

        <Route
          path="/owner/photos"
          element={<OwnerPhotos />}
        />


        {/* Selected business photos */}

        <Route
          path="/owner/photos/:businessId"
          element={<OwnerPhotos />}
        />


        {/* ======================================
            OWNER REVIEWS
        ====================================== */}

        {/* Existing/backward-compatible route */}

        <Route
          path="/owner/reviews"
          element={<OwnerReviews />}
        />


        {/* Selected business reviews */}

        <Route
          path="/owner/reviews/:businessId"
          element={<OwnerReviews />}
        />


        {/* Old route kept for backward compatibility */}

        <Route
          path="/owner/reviews/business/:businessId"
          element={<OwnerReviews />}
        />


        {/* ======================================
            OWNER PUBLIC PROFILE
        ====================================== */}

        {/* Existing/backward-compatible route */}

        <Route
          path="/owner/public-profile"
          element={<OwnerPublicProfile />}
        />


        {/* Selected business public profile */}

        <Route
          path="/owner/public-profile/:businessId"
          element={<OwnerPublicProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;