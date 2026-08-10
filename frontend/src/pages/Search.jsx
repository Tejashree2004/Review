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
  // Search Places
  // =====================================

  useEffect(() => {
    if (!keyword.trim()) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(
      `http://localhost:5213/api/Search/place/${encodeURIComponent(
        keyword.trim()
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Search request failed");
        }

        return res.json();
      })
      .then((data) => {
        setPlaces(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Search Error:", error);
        setPlaces([]);
        setLoading(false);
      });
  }, [keyword]);

  // =====================================
  // Place Click
  // =====================================

  const handlePlaceClick = (place) => {
    console.log("Selected Place :", place);

    navigate(`/place/${place.placeId}`);
  };

  // =====================================
  // Filter Results
  // =====================================

  const getFilteredPlaces = () => {
    const result = [...places];

    switch (activeFilter) {
      case "rating":
        return result.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );

      case "reviews":
        return result.sort(
          (a, b) =>
            Number(b.reviewCount || 0) -
            Number(a.reviewCount || 0)
        );

      case "open":
        return result.filter(
          (place) => place.openStatus === true
        );

      default:
        return result;
    }
  };

  const filteredPlaces = getFilteredPlaces();

  // =====================================
  // UI
  // =====================================

  return (
    <MainLayout>

      {/* Back Button */}

      <button
        className="search-back-btn"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>


      {/* =================================
          WORKING SEARCH BAR
      ================================= */}

      <div className="search-page-bar">

        <SearchBar />

      </div>


      {/* =================================
          Horizontal Filters
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
          Results Header
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
          Loading
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
          No Results
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
          Results
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