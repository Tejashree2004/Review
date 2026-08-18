import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import CategoryCard from "../components/CategoryCard";
import PlaceCard from "../components/PlaceCard";
import AIReviewSummary from "../components/AIReviewSummary";
import BottomNavigation from "../components/BottomNavigation";

import {
  getCategories,
  getTopRatedPlaces,
} from "../services/HomeService";

import "../styles/Home.css";
import "../styles/CategoryCard.css";
import "../styles/PlaceCard.css";
import "../styles/BottomNavigation.css";
import "../styles/SearchBar.css";
import "../styles/Global.css";
import "../styles/Navbar.css";

function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);

  // ==========================================
  // Load Home Data
  // ==========================================

  useEffect(() => {
    loadCategories();
    loadTopPlaces();
  }, []);

  // ==========================================
  // Load Categories
  // ==========================================

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      console.log("Categories:", response.data);

      setCategories(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      setCategories([]);
    }
  };

  // ==========================================
  // Load Top Places + Businesses
  // ==========================================

  const loadTopPlaces = async () => {
    try {
      const response = await getTopRatedPlaces();

      console.log(
        "Top Places + Businesses:",
        response.data
      );

      setPlaces(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load top places:",
        error
      );

      setPlaces([]);
    }
  };

  // ==========================================
  // Category Click
  // ==========================================

  const handleCategoryClick = (category) => {
    console.log(
      "Selected Category:",
      category
    );

    // Future category navigation
    // navigate(`/search/category/${category.categoryId}`);
  };

  // ==========================================
  // Place / Business Click
  // ==========================================

  const handlePlaceClick = (place) => {
    console.log(
      "Selected Place / Business:",
      place
    );

    // ========================================
    // OWNER BUSINESS
    // ========================================

    if (place.businessId) {
      navigate(
        `/business/${place.businessId}`
      );

      return;
    }

    // ========================================
    // EXISTING PLACE
    // ========================================

    if (place.placeId) {
      navigate(
        `/place/${place.placeId}`
      );

      return;
    }

    // ========================================
    // Safety
    // ========================================

    console.warn(
      "No PlaceId or BusinessId found:",
      place
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <MainLayout>

      {/* ======================================
          Navbar
      ====================================== */}

      <Navbar />

      {/* ======================================
          Search
      ====================================== */}

      <SearchBar />

      {/* ======================================
          Welcome
      ====================================== */}

      <div className="welcome-section">

        <h2>
          Welcome 👋
        </h2>

        <p>
          Find trusted restaurants, cafes, hotels
          and more around you.
        </p>

      </div>

      {/* ======================================
          Categories
      ====================================== */}

      <div className="section-title">

        <span>
          Categories
        </span>

        <span
          onClick={() => navigate("/categories")}
          style={{ cursor: "pointer" }}
        >
          View All
        </span>

      </div>

      <div className="categories">

        {categories.length > 0 ? (

          categories.map((category) => (

            <CategoryCard
              key={category.categoryId}
              category={category}
              onClick={handleCategoryClick}
            />

          ))

        ) : (

          <p>
            No Categories Found
          </p>

        )}

      </div>

      {/* ======================================
          Top Rated Places
      ====================================== */}

      <div className="section-title">

        <span>
          Top Rated Places
        </span>

      </div>

      <div className="places">

        {places.length > 0 ? (

          places.map((place, index) => (

            <PlaceCard
              key={
                place.businessId
                  ? `business-${place.businessId}`
                  : `place-${place.placeId || index}`
              }
              place={place}
              onClick={handlePlaceClick}
            />

          ))

        ) : (

          <p>
            No Places Found
          </p>

        )}

      </div>

      {/* ======================================
          AI Review Summary
      ====================================== */}

      <div className="section-title">

        <span>
          AI Review Summary
        </span>

      </div>

      <AIReviewSummary />

      {/* ======================================
          Bottom Navigation
      ====================================== */}

      <BottomNavigation />

    </MainLayout>
  );
}

export default Home;