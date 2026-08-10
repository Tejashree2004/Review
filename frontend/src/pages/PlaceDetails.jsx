import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getPlaceDetails,
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../services/HomeService";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaStar,
  FaHeart,
  FaThLarge,
  FaCommentAlt,
  FaMapMarkedAlt,
  FaPen,
} from "react-icons/fa";

import "../styles/PlaceDetails.css";

function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // Favorite State
  // =============================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // =============================
  // Load Place
  // =============================

  useEffect(() => {
    loadPlace();
  }, [id]);

  // =============================
  // Get User ID
  // =============================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
  };

  // =============================
  // Load Place Details
  // =============================

  const loadPlace = async () => {
    try {
      const response = await getPlaceDetails(id);

      setPlace(response.data);

      // Check favorite
      await checkFavorite(response.data.placeId);
    } catch (error) {
      console.error(
        "Failed to load place details:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Check Favorite
  // =============================

  const checkFavorite = async (placeId) => {
    try {
      const userId = getUserId();

      if (!userId) {
        setIsFavorite(false);
        return;
      }

      const response = await getFavorites(userId);

      const favorites = response.data || [];

      const currentPlaceId = Number(placeId);

      const alreadyFavorite = favorites.some(
        (favorite) =>
          Number(favorite.placeId) === currentPlaceId
      );

      setIsFavorite(alreadyFavorite);
    } catch (error) {
      console.error(
        "Failed to check favorite:",
        error
      );

      setIsFavorite(false);
    }
  };

  // =============================
  // Toggle Favorite
  // =============================

  const handleFavorite = async () => {
    try {
      const userId = getUserId();

      if (!userId) {
        alert(
          "Please login first to add favorites."
        );
        return;
      }

      if (!place) {
        return;
      }

      setFavoriteLoading(true);

      if (isFavorite) {
        // Remove Favorite

        await removeFavorite(
          userId,
          place.placeId
        );

        setIsFavorite(false);
      } else {
        // Add Favorite

        await addFavorite({
          userId: userId,
          placeId: place.placeId,
        });

        setIsFavorite(true);
      }
    } catch (error) {
      console.error(
        "Favorite operation failed:",
        error
      );

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =============================
  // Open Google Maps
  // =============================

  const handleMapClick = () => {
    if (!place) {
      return;
    }

    const address = `${place.name}, ${place.address}, ${place.city}`;

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;

    window.open(
      mapUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =============================
  // Write Review
  // =============================

  const handleWriteReview = () => {
    const userId = getUserId();

    if (!userId) {
      alert("Please login first to write a review.");
      return;
    }

    navigate(`/write-review/${place.placeId}`);
  };

  // =============================
  // Loading
  // =============================

  if (loading) {
    return (
      <MainLayout>
        <h2 style={{ color: "#fff" }}>
          Loading...
        </h2>
      </MainLayout>
    );
  }

  // =============================
  // Place Not Found
  // =============================

  if (!place) {
    return (
      <MainLayout>
        <h2 style={{ color: "#fff" }}>
          Place Not Found
        </h2>
      </MainLayout>
    );
  }

  // =============================
  // UI
  // =============================

  return (
    <MainLayout>

      {/* =========================
          Back Button
      ========================= */}

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* =========================
          Main Place Section
      ========================= */}

      <div className="place-details">

        {/* =========================
            Image Section
        ========================= */}

        <div className="image-section">

          <img
            src={place.imageUrl}
            alt={place.name}
          />

          {/* Favorite Button */}

          <button
            className={`heart-btn ${
              isFavorite
                ? "favorite-active"
                : ""
            }`}
            onClick={handleFavorite}
            disabled={favoriteLoading}
            title={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <FaHeart />
          </button>

        </div>

        {/* =========================
            Right Details
        ========================= */}

        <div className="details-card">

          {/* Place Name */}

          <h1>
            {place.name}
          </h1>

          {/* Rating */}

          <div className="rating-row">

            <FaStar className="gold-star" />

            <span>
              {place.rating}
            </span>

            <span className="review-text">
              ({place.reviewCount} Reviews)
            </span>

          </div>

          {/* Location */}

          <div className="info-row">

            <FaMapMarkerAlt />

            <span>
              {place.address}, {place.city}
            </span>

          </div>

          {/* Category */}

          <div className="info-row">

            <FaThLarge />

            <span>
              Category
            </span>

            <strong>
              {place.category?.categoryName}
            </strong>

          </div>

          {/* Reviews */}

          <div className="info-row">

            <FaCommentAlt />

            <span>
              Reviews
            </span>

            <strong>
              {place.reviewCount}
            </strong>

          </div>

          {/* Status */}

          <div className="info-row">

            <span>
              Status
            </span>

            <strong
              className={
                place.openStatus
                  ? "status-badge open"
                  : "status-badge closed"
              }
            >
              {place.openStatus
                ? "Open Now"
                : "Closed"}
            </strong>

          </div>

          {/* =========================
              Action Buttons
          ========================= */}

          <div className="place-actions">

            {/* Map */}

            <button
              className="place-action-btn map-btn"
              onClick={handleMapClick}
            >
              <FaMapMarkedAlt />
              <span>View on Map</span>
            </button>

            {/* Write Review */}

            <button
              className="place-action-btn review-btn"
              onClick={handleWriteReview}
            >
              <FaPen />
              <span>Write a Review</span>
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          About
      ========================= */}

      <div className="info-card">

        <h2>
          About
        </h2>

        <p>
          {place.name} is one of the most popular
          places in {place.city}. It offers excellent
          service, premium quality, clean environment,
          and a wonderful customer experience.
        </p>

      </div>

      {/* =========================
          AI Review Summary
      ========================= */}

      <div className="info-card">

        <h2>
          AI Review Summary
        </h2>

        <div className="summary-grid">

          <div>
            ☕ Excellent Quality
          </div>

          <div>
            😊 Friendly Staff
          </div>

          <div>
            ✨ Clean & Hygienic
          </div>

          <div>
            🌟 Great Ambience
          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default PlaceDetails;