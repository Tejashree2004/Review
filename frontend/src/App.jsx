import { Routes, Route } from "react-router-dom";


import Splash from "./pages/Splash";

import Login from "./pages/Login";
import Signup from "./pages/Signup";


import Home from "./pages/Home";
import Search from "./pages/Search";

import PlaceDetails from "./pages/PlaceDetails";

import Profile from "./pages/Profile";


// New Pages

import Categories from "./pages/Categories";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";
import Notifications from "./pages/Notifications";



function App() {


return (

<Routes>


{/* =========================
      Splash Page
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
      Reviews
========================= */}

<Route

path="/reviews"

element={<Reviews />}

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