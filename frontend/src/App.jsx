import { Routes, Route } from "react-router-dom";

// =========================
// Authentication / Start
// =========================
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// =========================
// Main Pages
// =========================
import Home from "./pages/Home";
import Search from "./pages/Search";
import PlaceDetails from "./pages/PlaceDetails";

// =========================
// User Pages
// =========================
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";
import WriteReview from "./pages/WriteReview";
import Notifications from "./pages/Notifications";

// =========================
// Other Pages
// =========================
import Categories from "./pages/Categories";

function App() {
  return (
    <Routes>

      {/* =========================
          Splash
      ========================= */}
      <Route
        path="/"
        element={<Splash />}
      />

      {/* =========================
          Authentication
      ========================= */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* =========================
          Home
      ========================= */}
      <Route
        path="/home"
        element={<Home />}
      />

      {/* =========================
          Search
      ========================= */}
      <Route
        path="/search"
        element={<Search />}
      />

      {/* =========================
          Categories
      ========================= */}
      <Route
        path="/categories"
        element={<Categories />}
      />

      {/* =========================
          Favorites
      ========================= */}
      <Route
        path="/favorites"
        element={<Favorites />}
      />

      {/* =========================
          My Reviews
          Reviews written by
          logged-in user
      ========================= */}
      <Route
        path="/reviews"
        element={<Reviews />}
      />

      {/* =========================
          Write Review
          For specific place
      ========================= */}
      <Route
        path="/write-review/:placeId"
        element={<WriteReview />}
      />

      {/* =========================
          Notifications
      ========================= */}
      <Route
        path="/notifications"
        element={<Notifications />}
      />

      {/* =========================
          Place Details
      ========================= */}
      <Route
        path="/place/:id"
        element={<PlaceDetails />}
      />

      {/* =========================
          Profile
      ========================= */}
      <Route
        path="/profile"
        element={<Profile />}
      />

    </Routes>
  );
}

export default App;