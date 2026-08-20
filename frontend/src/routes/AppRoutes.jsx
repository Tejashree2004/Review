import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "../pages/Splash";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
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

        {/* ======================================
            HOME
        ====================================== */}

        <Route
          path="/home"
          element={<Home />}
        />

        {/* ======================================
            EXISTING PLACE DETAILS
        ====================================== */}

        <Route
          path="/place/:id"
          element={<PlaceDetails />}
        />

        {/* ======================================
            OWNER BUSINESS DETAILS
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