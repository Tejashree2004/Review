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

  // =====================================================
  // SHOW ALL CATEGORIES
  // =====================================================

  const [showAllCategories, setShowAllCategories] =
    useState(false);

  // =====================================================
  // LOAD HOME DATA
  // =====================================================

  useEffect(() => {
    loadCategories();
    loadTopPlaces();
  }, []);

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      console.log(
        "Categories:",
        response.data
      );

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      setCategories([]);
    }
  };

  // =====================================================
  // LOAD TOP PLACES + BUSINESSES
  // =====================================================

  const loadTopPlaces = async () => {
    try {
      const response =
        await getTopRatedPlaces();

      console.log(
        "Top Places + Businesses:",
        response.data
      );

      setPlaces(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load top places:",
        error
      );

      setPlaces([]);
    }
  };

  // =====================================================
  // CATEGORY CLICK
  // =====================================================

  const handleCategoryClick = (category) => {
    console.log(
      "Selected Category:",
      category
    );

    // Existing flow kept unchanged.
  };

  // =====================================================
  // VIEW ALL / SHOW LESS CATEGORIES
  // =====================================================

  const handleViewAllCategories = () => {
    setShowAllCategories(
      (previous) => !previous
    );
  };

  // =====================================================
  // PLACE / BUSINESS CLICK
  // =====================================================

  const handlePlaceClick = (place) => {
    console.log(
      "Selected Place / Business:",
      place
    );

    // OWNER BUSINESS
    if (place?.businessId) {
      navigate(
        `/business/${place.businessId}`
      );

      return;
    }

    // EXISTING PLACE
    if (place?.placeId) {
      navigate(
        `/place/${place.placeId}`
      );

      return;
    }

    console.warn(
      "No PlaceId or BusinessId found:",
      place
    );
  };

  // =====================================================
  // VISIBLE CATEGORIES
  //
  // Initially: only 4
  // View All: all categories
  // =====================================================

  const visibleCategories =
    showAllCategories
      ? categories
      : categories.slice(0, 4);

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>

      {/* ======================================
          NAVBAR
      ====================================== */}

      <Navbar />

      {/* ======================================
          SEARCH
      ====================================== */}

      <SearchBar />

      {/* ======================================
          WELCOME
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
          CATEGORIES HEADER
      ====================================== */}

      <div className="section-title">

        <span>
          Categories
        </span>

        <button
          type="button"
          className="categories-view-all-btn"
          onClick={
            handleViewAllCategories
          }
        >
          {showAllCategories
            ? "Show Less"
            : "View All"}
        </button>

      </div>

      {/* ======================================
          CATEGORIES
      ====================================== */}

      <div
        className={
          showAllCategories
            ? "categories categories-scrollable"
            : "categories"
        }
      >

        {visibleCategories.length > 0 ? (

          visibleCategories.map(
            (category) => (

              <CategoryCard
                key={
                  category.categoryId
                }
                category={
                  category
                }
                onClick={
                  handleCategoryClick
                }
              />

            )
          )

        ) : (

          <p>
            No Categories Found
          </p>

        )}

      </div>

      {/* ======================================
          TOP RATED PLACES
      ====================================== */}

      <div className="section-title">

        <span>
          Top Rated Places
        </span>

      </div>

      <div className="places">

        {places.length > 0 ? (

          places.map(
            (place, index) => (

              <PlaceCard
                key={
                  place?.businessId
                    ? `business-${place.businessId}`
                    : `place-${
                        place?.placeId ||
                        index
                      }`
                }
                place={place}
                onClick={
                  handlePlaceClick
                }
              />

            )
          )

        ) : (

          <p>
            No Places Found
          </p>

        )}

      </div>

      {/* ======================================
          BOTTOM NAVIGATION
      ====================================== */}

      <BottomNavigation />

    </MainLayout>
  );
}

export default Home;