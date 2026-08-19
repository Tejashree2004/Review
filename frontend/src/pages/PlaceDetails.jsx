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

  // ==========================================
  // FAVORITE STATE
  // ==========================================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  // ==========================================
  // LOAD PLACE
  // ==========================================

  useEffect(() => {
    loadPlace();
  }, [id]);

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId
      ? Number(userId)
      : null;
  };

  // ==========================================
  // LOAD PLACE DETAILS
  // ==========================================

  const loadPlace = async () => {
    try {
      setLoading(true);

      const response =
        await getPlaceDetails(id);

      console.log(
        "Place Details :",
        response.data
      );

      setPlace(response.data);

      // Check favorite only if a valid Place ID exists
      if (response.data?.placeId) {
        await checkFavorite(
          response.data.placeId
        );
      }
    } catch (error) {
      console.error(
        "Failed to load place details:",
        error
      );

      setPlace(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHECK FAVORITE
  // ==========================================

  const checkFavorite = async (placeId) => {
    try {
      const userId = getUserId();

      if (!userId || !placeId) {
        setIsFavorite(false);
        return;
      }

      const response =
        await getFavorites(userId);

      const favorites =
        response.data || [];

      const currentPlaceId =
        Number(placeId);

      const alreadyFavorite =
        favorites.some(
          (favorite) =>
            Number(favorite.placeId) ===
            currentPlaceId
        );

      setIsFavorite(
        alreadyFavorite
      );
    } catch (error) {
      console.error(
        "Failed to check favorite:",
        error
      );

      setIsFavorite(false);
    }
  };

  // ==========================================
  // TOGGLE FAVORITE
  // ==========================================

  const handleFavorite = async () => {
    try {
      const userId = getUserId();

      if (!userId) {
        alert(
          "Please login first to add favorites."
        );

        return;
      }

      if (!place?.placeId) {
        return;
      }

      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(
          userId,
          place.placeId
        );

        setIsFavorite(false);
      } else {
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

      if (
        error.response?.data?.message
      ) {
        alert(
          error.response.data.message
        );
      } else {
        alert(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ==========================================
  // GOOGLE MAPS
  // ==========================================

  const handleMapClick = () => {
    if (!place) {
      return;
    }

    const address = [
      place.name,
      place.address,
      place.city,
    ]
      .filter(Boolean)
      .join(", ");

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=` +
      encodeURIComponent(address);

    window.open(
      mapUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // WRITE REVIEW
  // ==========================================

  const handleWriteReview = () => {
    const userId = getUserId();

    if (!userId) {
      alert(
        "Please login first to write a review."
      );

      return;
    }

    if (!place?.placeId) {
      return;
    }

    navigate(
      `/write-review/${place.placeId}`
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <MainLayout>
        <h2 style={{ color: "#fff" }}>
          Loading...
        </h2>
      </MainLayout>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!place) {
    return (
      <MainLayout>
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <FaArrowLeft />
        </button>

        <h2 style={{ color: "#fff" }}>
          Place Not Found
        </h2>
      </MainLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <MainLayout>

      {/* ========================================
          BACK BUTTON
      ======================================== */}

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* ========================================
          MAIN PLACE SECTION
      ======================================== */}

      <div className="place-details">

        {/* ======================================
            IMAGE SECTION
        ====================================== */}

        <div className="image-section">

          <img
            src={
              place.imageUrl ||
              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
            }
            alt={
              place.name ||
              "Place"
            }
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";
            }}
          />

          {/* FAVORITE */}

          <button
            className={`heart-btn ${
              isFavorite
                ? "favorite-active"
                : ""
            }`}
            onClick={handleFavorite}
            disabled={
              favoriteLoading
            }
            title={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <FaHeart />
          </button>

        </div>

        {/* ======================================
            DETAILS CARD
        ====================================== */}

        <div className="details-card">

          {/* NAME */}

          <h1>
            {place.name}
          </h1>

          {/* RATING */}

          <div className="rating-row">

            <FaStar className="gold-star" />

            <span>
              {place.rating ?? 0}
            </span>

            <span className="review-text">
              (
              {place.reviewCount ?? 0}
              {" "}
              Reviews)
            </span>

          </div>

          {/* LOCATION */}

          <div className="info-row">

            <FaMapMarkerAlt />

            <span>
              {place.address ||
                "Address not available"}

              {place.city
                ? `, ${place.city}`
                : ""}
            </span>

          </div>

          {/* CATEGORY */}

          <div className="info-row">

            <FaThLarge />

            <span>
              Category
            </span>

            <strong>
              {
                place.category
                  ?.categoryName ||
                "Not available"
              }
            </strong>

          </div>

          {/* REVIEWS */}

          <div className="info-row">

            <FaCommentAlt />

            <span>
              Reviews
            </span>

            <strong>
              {place.reviewCount ?? 0}
            </strong>

          </div>

          {/* STATUS */}

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

          {/* ====================================
              ACTION BUTTONS
          ==================================== */}

          <div className="place-actions">

            {/* MAP */}

            <button
              className="place-action-btn map-btn"
              onClick={handleMapClick}
            >
              <FaMapMarkedAlt />

              <span>
                View on Map
              </span>
            </button>

            {/* REVIEW */}

            <button
              className="place-action-btn review-btn"
              onClick={
                handleWriteReview
              }
            >
              <FaPen />

              <span>
                Write a Review
              </span>
            </button>

          </div>

        </div>
      </div>

      {/* ========================================
          ABOUT
      ======================================== */}

      <div className="info-card">

        <h2>
          About
        </h2>

        <p>
          {place.name} is one of the
          popular places in{" "}
          {place.city || "this area"}.
          Explore its details, reviews
          and location to learn more.
        </p>

      </div>

 

    </MainLayout>
  );
}

export default PlaceDetails;