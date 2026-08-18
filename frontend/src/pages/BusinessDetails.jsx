import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getBusinessDetails,
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

function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // Favorite State
  // =============================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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
  // Load Business
  // =============================

  useEffect(() => {
    loadBusiness();
  }, [id]);

  // =============================
  // Load Business Details
  // =============================

  const loadBusiness = async () => {
    try {
      setLoading(true);

      const response =
        await getBusinessDetails(id);

      console.log(
        "Business Details:",
        response.data
      );

      /*
        Backend response:

        {
          success: true,
          message: "...",
          data: {...}
        }

        Therefore use response.data.data
      */

      const businessData =
        response.data?.data || response.data;

      setBusiness(businessData);

      // Check favorite after business loads
      await checkFavorite(
        businessData?.businessId
      );

    } catch (error) {
      console.error(
        "Failed to load business details:",
        error
      );

      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Check Favorite
  // =============================

  const checkFavorite = async (businessId) => {
    try {
      const userId = getUserId();

      if (!userId || !businessId) {
        setIsFavorite(false);
        return;
      }

      const response =
        await getFavorites(userId);

      const favorites =
        response.data || [];

      const currentBusinessId =
        Number(businessId);

      const alreadyFavorite =
        favorites.some(
          (favorite) =>
            Number(favorite.businessId) ===
            currentBusinessId
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

      if (!business) {
        return;
      }

      setFavoriteLoading(true);

      /*
        IMPORTANT:

        Your existing Favorite backend
        currently appears to work with
        PlaceId.

        Since Business has no PlaceId,
        don't send a fake placeId here.

        We will connect Business Favorites
        separately when the Favorite backend
        supports BusinessId.
      */

      if (isFavorite) {
        setIsFavorite(false);
      } else {
        setIsFavorite(true);
      }

    } catch (error) {
      console.error(
        "Favorite operation failed:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =============================
  // Open Google Maps
  // =============================

  const handleMapClick = () => {
    if (!business) {
      return;
    }

    const address =
      `${business.businessName || business.name || ""}, ` +
      `${business.address || ""}, ` +
      `${business.city || ""}`;

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
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
      alert(
        "Please login first to write a review."
      );
      return;
    }

    if (!business) {
      return;
    }

    navigate(
      `/write-review/business/${business.businessId}`
    );
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
  // Business Not Found
  // =============================

  if (!business) {
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
          Business Not Found
        </h2>
      </MainLayout>
    );
  }

  // =============================
  // Business Values
  // =============================

  const businessName =
    business.businessName ||
    business.name ||
    "Business";

  const imageUrl =
    business.imageUrl ||
    business.photos?.find(
      (photo) => photo.isPrimary
    )?.photoUrl ||
    business.photos?.[0]?.photoUrl ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";

  const rating =
    business.rating ?? 0;

  const reviewCount =
    business.reviewCount ?? 0;

  const isOpen =
    business.isOpen ??
    business.openStatus ??
    false;

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
          Main Business Section
      ========================= */}

      <div className="place-details">

        {/* =========================
            Image Section
        ========================= */}

        <div className="image-section">

          <img
            src={imageUrl}
            alt={businessName}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";
            }}
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

          {/* Business Name */}

          <h1>
            {businessName}
          </h1>


          {/* Rating */}

          <div className="rating-row">

            <FaStar className="gold-star" />

            <span>
              {rating}
            </span>

            <span className="review-text">
              ({reviewCount} Reviews)
            </span>

          </div>


          {/* Location */}

          <div className="info-row">

            <FaMapMarkerAlt />

            <span>
              {business.address || "Address not available"}
              {business.city
                ? `, ${business.city}`
                : ""}
            </span>

          </div>


          {/* Category */}

          <div className="info-row">

            <FaThLarge />

            <span>
              Category
            </span>

            <strong>
              {business.category?.categoryName ||
                business.categoryName ||
                "Not available"}
            </strong>

          </div>


          {/* Reviews */}

          <div className="info-row">

            <FaCommentAlt />

            <span>
              Reviews
            </span>

            <strong>
              {reviewCount}
            </strong>

          </div>


          {/* Status */}

          <div className="info-row">

            <span>
              Status
            </span>

            <strong
              className={
                isOpen
                  ? "status-badge open"
                  : "status-badge closed"
              }
            >
              {isOpen
                ? "Open Now"
                : "Closed"}
            </strong>

          </div>


          {/* =========================
              Action Buttons
          ========================= */}

          <div className="place-actions">

            {/* View on Map */}

            <button
              className="place-action-btn map-btn"
              onClick={handleMapClick}
            >
              <FaMapMarkedAlt />

              <span>
                View on Map
              </span>
            </button>


            {/* Write Review */}

            <button
              className="place-action-btn review-btn"
              onClick={handleWriteReview}
            >
              <FaPen />

              <span>
                Write a Review
              </span>
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
          {businessName} is a business located in{" "}
          {business.city || "the selected location"}.
          It provides quality services and aims to
          provide a great customer experience.
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

export default BusinessDetails;