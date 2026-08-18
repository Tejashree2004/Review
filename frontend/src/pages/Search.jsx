import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaLocationArrow,
  FaStar,
  FaCommentAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";
import SearchBar from "../components/SearchBar";
import PlaceCard from "../components/PlaceCard";

import "../styles/Search.css";

function Search() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("relevance");

  // =====================================
  // SEARCH PLACES + BUSINESSES
  // =====================================

  useEffect(() => {
    const searchKeyword = keyword.trim();

    if (!searchKeyword) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    const searchPlaces = async () => {
      try {
        setLoading(true);

        console.log(
          "Searching for keyword:",
          searchKeyword
        );

        const url =
          `http://localhost:5213/api/Search/place/` +
          encodeURIComponent(searchKeyword);

        console.log("Search URL:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Search request failed: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("Search Response:", data);

        // =====================================
        // PLACES
        // =====================================

        const backendPlaces = Array.isArray(data?.places)
          ? data.places
          : [];

        // =====================================
        // BUSINESSES
        // =====================================

        const backendBusinesses = Array.isArray(
          data?.businesses
        )
          ? data.businesses
          : [];

        // =====================================
        // NORMALIZE PLACES
        // =====================================

        const formattedPlaces = backendPlaces.map(
          (place) => ({
            ...place,

            isBusiness: false,
          })
        );

        // =====================================
        // NORMALIZE BUSINESSES
        // =====================================

        const formattedBusinesses =
          backendBusinesses.map((business) => {
            const primaryPhoto =
              business.photos?.find(
                (photo) => photo.isPrimary
              );

            const firstPhoto =
              business.photos?.[0];

            return {
              ...business,

              placeId: `business-${business.businessId}`,

              name: business.businessName,

              city: business.city,

              imageUrl:
                primaryPhoto?.photoUrl ||
                firstPhoto?.photoUrl ||
                "",

              rating: business.rating,

              reviewCount:
                business.reviewCount,

              openStatus:
                business.isOpen,

              isBusiness: true,
            };
          });

        // =====================================
        // COMBINE
        // =====================================

        const combinedResults = [
          ...formattedPlaces,
          ...formattedBusinesses,
        ];

        console.log(
          "Combined Search Results:",
          combinedResults
        );

        setPlaces(combinedResults);
      } catch (error) {
        console.error(
          "Search Error:",
          error
        );

        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    searchPlaces();
  }, [keyword]);

  // =====================================
  // PLACE / BUSINESS CLICK
  // =====================================

  const handlePlaceClick = (place) => {
    console.log(
      "Selected Search Result:",
      place
    );

    // =====================================
    // OWNER BUSINESS
    // =====================================

    if (place.isBusiness) {
      navigate(
        `/business/${place.businessId}`
      );

      return;
    }

    // =====================================
    // EXISTING PLACE
    // =====================================

    navigate(
      `/place/${place.placeId}`
    );
  };

  // =====================================
  // FILTER RESULTS
  // =====================================

  const getFilteredPlaces = () => {
    const result = [...places];

    switch (activeFilter) {
      // ===================================
      // RELEVANCE
      // ===================================

      case "relevance":
        return result;

      // ===================================
      // NEAR ME
      // ===================================

      case "near":
        return result;

      // ===================================
      // RATING
      // ===================================

      case "rating":
        return result.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );

      // ===================================
      // REVIEWS
      // ===================================

      case "reviews":
        return result.sort(
          (a, b) =>
            Number(b.reviewCount || 0) -
            Number(a.reviewCount || 0)
        );

      // ===================================
      // OPEN NOW
      // ===================================

      case "open":
        return result.filter(
          (place) =>
            place.openStatus === true
        );

      default:
        return result;
    }
  };

  const filteredPlaces =
    getFilteredPlaces();

  // =====================================
  // UI
  // =====================================

  return (
    <MainLayout>

      {/* =================================
          BACK BUTTON
      ================================= */}

      <button
        className="search-back-btn"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* =================================
          SEARCH BAR
      ================================= */}

      <div className="search-page-bar">
        <SearchBar />
      </div>

      {/* =================================
          FILTERS
      ================================= */}

      <div className="search-filters">

        <button
          className={`search-filter ${
            activeFilter === "relevance"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveFilter("relevance")
          }
        >
          <FaStar />
          <span>Relevance</span>
        </button>

        <button
          className={`search-filter ${
            activeFilter === "near"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveFilter("near")
          }
        >
          <FaLocationArrow />
          <span>Near Me</span>
        </button>

        <button
          className={`search-filter ${
            activeFilter === "rating"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveFilter("rating")
          }
        >
          <FaStar />
          <span>Rating</span>
        </button>

        <button
          className={`search-filter ${
            activeFilter === "reviews"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveFilter("reviews")
          }
        >
          <FaCommentAlt />
          <span>Reviews</span>
        </button>

        <button
          className={`search-filter ${
            activeFilter === "open"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveFilter("open")
          }
        >
          <FaClock />
          <span>Open Now</span>
        </button>

      </div>

      {/* =================================
          RESULTS HEADER
      ================================= */}

      <div className="results-header">

        <h2>
          Search Results
        </h2>

        <p>
          {loading
            ? "Searching..."
            : `${filteredPlaces.length} ${
                filteredPlaces.length === 1
                  ? "place"
                  : "places"
              } found for "${keyword}"`}
        </p>

      </div>

      {/* =================================
          LOADING
      ================================= */}

      {loading && (
        <div className="search-loading">

          <div className="loading-spinner"></div>

          <p>
            Finding places...
          </p>

        </div>
      )}

      {/* =================================
          NO RESULTS
      ================================= */}

      {!loading &&
        filteredPlaces.length === 0 && (
          <div className="no-results">

            <FaMapMarkerAlt />

            <h3>
              No places found
            </h3>

            <p>
              Try searching for another
              restaurant, cafe, hotel or place.
            </p>

          </div>
        )}

      {/* =================================
          RESULTS
      ================================= */}

      {!loading &&
        filteredPlaces.length > 0 && (

          <div className="search-results-list">

            {filteredPlaces.map((place) => (

              <div
                className="search-place-card"
                key={place.placeId}
              >

                <PlaceCard
                  place={place}
                  onClick={handlePlaceClick}
                />

              </div>

            ))}

          </div>

        )}

    </MainLayout>
  );
}

export default Search;