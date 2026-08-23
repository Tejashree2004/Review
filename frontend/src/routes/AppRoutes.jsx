import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Splash from "../pages/Splash";

import Login from "../pages/Login";

import Signup from "../pages/Signup";

import VerifyOtp from "../pages/VerifyOtp";

import Home from "../pages/Home";

import PlaceDetails from "../pages/PlaceDetails";

import BusinessDetails from "../pages/BusinessDetails";

import MyReviews from "../pages/MyReviews";

import OwnerReviews from "../pages/OwnerReviews";

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
            AUTHENTICATION
        ====================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ======================================
            EMAIL OTP VERIFICATION
        ====================================== */}

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
            BUSINESS DETAILS
        ====================================== */}

        <Route
          path="/business/:id"
          element={<BusinessDetails />}
        />

        {/* ======================================
            REVIEWER - MY REVIEWS
        ====================================== */}

        <Route
          path="/reviews"
          element={<MyReviews />}
        />

        {/* ======================================
            OWNER - BUSINESS REVIEWS
        ====================================== */}

        <Route
          path="/owner/reviews/business/:businessId"
          element={<OwnerReviews />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;