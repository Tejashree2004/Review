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

  useEffect(() => {
    loadCategories();
    loadTopPlaces();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const loadTopPlaces = async () => {
    try {
      const response = await getTopRatedPlaces();

      console.log("Top Places :", response.data);

      setPlaces(response.data || []);
    } catch (error) {
      console.error("Failed to load top places", error);
    }
  };

  const handleCategoryClick = (category) => {
    console.log("Selected Category :", category);

    // Future
    // navigate(`/search/category/${category.categoryName}`);
  };

  const handlePlaceClick = (place) => {
    console.log("Selected Place :", place);

    // Open Place Details Page
    navigate(`/place/${place.placeId}`);
  };

  return (
    <MainLayout>
      <Navbar />

      <SearchBar />

      {/* Welcome Section */}

      <div className="welcome-section">
        <h2>Welcome 👋</h2>

        <p>
          Find trusted restaurants, cafes, hotels and more around you.
        </p>
      </div>

      {/* Categories */}

      <div className="section-title">
        <span>Categories</span>

        <span>View All</span>
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
          <p>No Categories Found</p>
        )}
      </div>

      {/* Top Rated Places */}

      <div className="section-title">
        <span>Top Rated Places</span>
      </div>

      <div className="places">
        {places.length > 0 ? (
          places.map((place) => (
            <PlaceCard
              key={place.placeId}
              place={place}
              onClick={handlePlaceClick}
            />
          ))
        ) : (
          <p>No Places Found</p>
        )}
      </div>

      {/* AI Review Summary */}

      <div className="section-title">
        <span>AI Review Summary</span>
      </div>

      <AIReviewSummary />

      {/* Bottom Navigation */}

      <BottomNavigation />
    </MainLayout>
  );
}

export default Home;