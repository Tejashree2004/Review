
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getBusinessDetails,
  getFavorites,
} from "../services/HomeService";

import {
  getBusinessReviews,
} from "../services/reviewService";

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
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // =====================================================
  // FAVORITE
  // =====================================================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
  };

  // =====================================================
  // LOAD BUSINESS
  // =====================================================

  useEffect(() => {
    loadBusiness();
  }, [id]);

  // =====================================================
  // LOAD BUSINESS DETAILS
  // =====================================================

  const loadBusiness = async () => {
    try {
      setLoading(true);

      const response =
        await getBusinessDetails(id);

      console.log(
        "Business Details:",
        response.data
      );

      const businessData =
        response.data?.data ||
        response.data;

      setBusiness(businessData);

      const businessId =
        businessData?.businessId ||
        businessData?.id;

      if (businessId) {
        await Promise.all([
          loadBusinessReviews(businessId),
          checkFavorite(businessId),
        ]);
      }
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

  // =====================================================
  // LOAD BUSINESS REVIEWS
  // =====================================================

  const loadBusinessReviews = async (businessId) => {
    try {
      setReviewsLoading(true);

      const response =
        await getBusinessReviews(businessId);

      console.log(
        "Business Reviews:",
        response.data
      );

      const reviewData =
        response.data?.data ||
        response.data ||
        [];

      const finalReviews =
        Array.isArray(reviewData)
          ? reviewData
          : [];

      console.log(
        "FINAL BUSINESS DETAILS REVIEWS:",
        finalReviews
      );

      setReviews(finalReviews);
    } catch (error) {
      console.error(
        "Failed to load business reviews:",
        error
      );

      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // =====================================================
  // CHECK FAVORITE
  // =====================================================

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

  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

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
        Business Favorite backend is not yet
        connected with BusinessId.

        Therefore we only update the UI here.
      */

      setIsFavorite(
        (previous) => !previous
      );
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

  // =====================================================
  // GOOGLE MAP
  // =====================================================

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

  // =====================================================
  // WRITE REVIEW
  // =====================================================

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

    const businessId =
      business.businessId ||
      business.id;

    navigate(
      `/write-review/business/${businessId}`
    );
  };

  // =====================================================
  // VIEW ALL REVIEWS
  // =====================================================

  const handleViewAllReviews = () => {
    const businessId =
      business?.businessId ||
      business?.id;

    if (!businessId) {
      return;
    }

    navigate(
      `/business/${businessId}/reviews`
    );
  };

  // =====================================================
  // FORMAT REVIEW DATE
  // =====================================================

  const getRelativeDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const reviewDate =
      new Date(dateValue);

    if (Number.isNaN(reviewDate.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      reviewDate.getTime();

    const seconds =
      Math.floor(difference / 1000);

    const minutes =
      Math.floor(seconds / 60);

    const hours =
      Math.floor(minutes / 60);

    const days =
      Math.floor(hours / 24);

    if (days < 1) {
      if (hours < 1) {
        return "Just now";
      }

      if (hours === 1) {
        return "1 hour ago";
      }

      return `${hours} hours ago`;
    }

    if (days === 1) {
      return "1 day ago";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    if (days < 14) {
      return "1 week ago";
    }

    if (days < 30) {
      return `${Math.floor(days / 7)} weeks ago`;
    }

    if (days < 365) {
      return `${Math.floor(days / 30)} months ago`;
    }

    return `${Math.floor(days / 365)} years ago`;
  };

  // =====================================================
  // RATING STARS
  // =====================================================

  const renderStars = (rating) => {
    const numericRating =
      Number(rating) || 0;

    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <FaStar
              key={star}
              className={
                star <= numericRating
                  ? "review-star-filled"
                  : "review-star-empty"
              }
            />
          )
        )}
      </div>
    );
  };

  // =====================================================
  // GET REVIEW USER NAME
  // =====================================================

  const getReviewerName = (review) => {
    /*
      Your current API response is:

      {
        ReviewId: 13,
        Rating: 3,
        Comment: "good hotel",
        User: "gauri",
        CreatedAt: "..."
      }

      So first use User.

      We also support object-style User
      in case backend changes later.
    */

    if (typeof review.User === "string") {
      return review.User;
    }

    if (typeof review.user === "string") {
      return review.user;
    }

    if (review.User?.FullName) {
      return review.User.FullName;
    }

    if (review.user?.fullName) {
      return review.user.fullName;
    }

    if (review.FullName) {
      return review.FullName;
    }

    if (review.fullName) {
      return review.fullName;
    }

    return "Anonymous User";
  };

  // =====================================================
  // GET REVIEW RATING
  // =====================================================

  const getReviewRating = (review) => {
    return Number(
      review.Rating ??
      review.rating ??
      0
    );
  };

  // =====================================================
  // GET REVIEW COMMENT
  // =====================================================

  const getReviewComment = (review) => {
    return (
      review.Comment ??
      review.comment ??
      ""
    );
  };

  // =====================================================
  // GET REVIEW DATE
  // =====================================================

  const getReviewDate = (review) => {
    return (
      review.CreatedAt ??
      review.createdAt ??
      null
    );
  };

  // =====================================================
  // GET REVIEW ID
  // =====================================================

  const getReviewId = (review) => {
    return (
      review.ReviewId ??
      review.reviewId
    );
  };

  // =====================================================
  // CALCULATE RATING
  // =====================================================

  const calculateAverageRating = () => {
    if (!reviews.length) {
      return Number(
        business?.rating ?? 0
      ).toFixed(1);
    }

    const total =
      reviews.reduce(
        (sum, review) =>
          sum +
          getReviewRating(review),
        0
      );

    return (
      total / reviews.length
    ).toFixed(1);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>
        <h2 style={{ color: "#fff" }}>
          Loading...
        </h2>
      </MainLayout>
    );
  }

  // =====================================================
  // BUSINESS NOT FOUND
  // =====================================================

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

  // =====================================================
  // BUSINESS VALUES
  // =====================================================

  const businessName =
    business.businessName ||
    business.name ||
    "Business";

  const imageUrl =
    business.imageUrl ||
    business.photos?.find(
      (photo) =>
        photo.isPrimary
    )?.photoUrl ||
    business.photos?.[0]?.photoUrl ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";

  const rating =
    calculateAverageRating();

  const reviewCount =
    reviews.length ||
    business.reviewCount ||
    0;

  const isOpen =
    business.isOpen ??
    business.openStatus ??
    false;

  const description =
    business.description ||
    business.businessDescription ||
    `${businessName} provides quality services and aims to provide a great customer experience.`;

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* =================================================
          BUSINESS DETAILS
      ================================================= */}

      <div className="place-details">

        {/* IMAGE */}

        <div className="image-section">

          <img
            src={imageUrl}
            alt={businessName}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";
            }}
          />

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

        {/* DETAILS */}

        <div className="details-card">

          <h1>
            {businessName}
          </h1>

          {/* RATING */}

          <div className="rating-row">

            <FaStar className="gold-star" />

            <span>
              {rating}
            </span>

            <span className="review-text">
              ({reviewCount} Reviews)
            </span>

          </div>

          {/* LOCATION */}

          <div className="info-row">

            <FaMapMarkerAlt />

            <span>
              {business.address ||
                "Address not available"}

              {business.city
                ? `, ${business.city}`
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
              {business.category
                ?.categoryName ||
                business.categoryName ||
                "Not available"}
            </strong>

          </div>

          {/* REVIEWS */}

          <div className="info-row">

            <FaCommentAlt />

            <span>
              Reviews
            </span>

            <strong>
              {reviewCount}
            </strong>

          </div>

          {/* STATUS */}

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

          {/* ACTION BUTTONS */}

          <div className="place-actions">

            <button
              className="place-action-btn map-btn"
              onClick={handleMapClick}
            >
              <FaMapMarkedAlt />

              <span>
                View on Map
              </span>
            </button>

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

      {/* =================================================
          ABOUT
      ================================================= */}

      <div className="info-card">

        <h2>
          About
        </h2>

        <p>
          {description}
        </p>

      </div>

      {/* =================================================
          CUSTOMER REVIEWS
      ================================================= */}

      <div className="customer-reviews-card">

        {/* HEADER */}

        <div className="customer-reviews-header">

          <div>

            <h2>
              Customer Reviews
            </h2>

            <span>
              {reviewCount} Reviews
            </span>

          </div>

        </div>

        {/* REVIEWS LOADING */}

        {reviewsLoading && (
          <div className="reviews-loading">
            Loading reviews...
          </div>
        )}

        {/* NO REVIEWS */}

        {!reviewsLoading &&
          reviews.length === 0 && (

            <div className="no-reviews">

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first customer to
                review this business.
              </p>

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
          )}

        {/* =================================================
            REVIEW LIST
        ================================================= */}

        {!reviewsLoading &&
          reviews.length > 0 && (

            <div className="reviews-list">

              {reviews
                .slice(0, 3)
                .map((review) => {

                  const reviewerName =
                    getReviewerName(review);

                  const reviewRating =
                    getReviewRating(review);

                  const reviewComment =
                    getReviewComment(review);

                  const reviewDate =
                    getReviewDate(review);

                  const reviewId =
                    getReviewId(review);

                  return (
                    <div
                      className="customer-review-item"
                      key={reviewId}
                    >

                      {/* REVIEW HEADER */}

                      <div className="customer-review-top">

                        <div className="reviewer-info">

                          <div className="reviewer-avatar">

                            {reviewerName
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <h3>
                              {reviewerName}
                            </h3>

                            <span>
                              {getRelativeDate(
                                reviewDate
                              )}
                            </span>

                          </div>

                        </div>

                        {/* STARS */}

                        {renderStars(
                          reviewRating
                        )}

                      </div>

                      {/* COMMENT */}

                      <p className="customer-review-comment">
                        "{reviewComment}"
                      </p>

                      {/* OWNER REPLY */}

                      {(review.OwnerReply ||
                        review.ownerReply) && (

                        <div className="owner-reply">

                          <strong>
                            Business Owner Reply
                          </strong>

                          <p>
                            {review.OwnerReply ||
                              review.ownerReply}
                          </p>

                        </div>
                      )}

                    </div>
                  );
                })}

            </div>
          )}

        {/* VIEW ALL */}

        {!reviewsLoading &&
          reviews.length > 3 && (

            <div className="view-all-reviews-wrapper">

              <button
                className="view-all-reviews-btn"
                onClick={
                  handleViewAllReviews
                }
              >
                View All Reviews
              </button>

            </div>
          )}

      </div>

    </MainLayout>
  );
}

export default BusinessDetails;

