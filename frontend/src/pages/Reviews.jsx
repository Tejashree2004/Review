import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaStar,
  FaMapMarkerAlt,
  FaCommentAlt,
  FaStore,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";

import { getMyReviews } from "../services/HomeService";

import "../styles/Reviews.css";

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER ID
  // =====================================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
  };

  // =====================================================
  // LOAD MY REVIEWS
  // =====================================================

  useEffect(() => {
    const loadMyReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserId();

        if (!userId) {
          setError(
            "Please login to view your reviews."
          );

          return;
        }

        const response =
          await getMyReviews(userId);

        // Debug response
        console.log(
          "My Reviews API Response:",
          response.data
        );

        /*
          Supports all possible response formats:

          1. Direct array:
             [...]

          2. {
               data: [...]
             }

          3. {
               Data: [...]
             }
        */

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (
          Array.isArray(response.data?.data)
        ) {
          data = response.data.data;
        } else if (
          Array.isArray(response.data?.Data)
        ) {
          data = response.data.Data;
        }

        console.log(
          "My Reviews Data:",
          data
        );

        setReviews(data);
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error
        );

        setError(
          "Unable to load your reviews. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMyReviews();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // RENDER STARS
  // =====================================================

  const renderStars = (rating) => {
    return Array.from(
      { length: 5 },
      (_, index) => (
        <FaStar
          key={index}
          className={
            index < rating
              ? "review-star active"
              : "review-star"
          }
        />
      )
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>

        <div className="reviews-page">

          <button
            className="reviews-back-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div className="reviews-loading">

            <div className="review-loader"></div>

            <p>
              Loading your reviews...
            </p>

          </div>

        </div>

      </MainLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>

      <div className="reviews-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="reviews-header">

          <button
            className="reviews-back-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1>
              My Reviews
            </h1>

            <p>
              Reviews you have shared on REVIO
            </p>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="reviews-message error">

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </div>
        )}

        {/* =================================================
            NO REVIEWS
        ================================================= */}

        {!error &&
          reviews.length === 0 && (
            <div className="reviews-message">

              <FaCommentAlt
                className="empty-review-icon"
              />

              <h2>
                No Reviews Yet
              </h2>

              <p>
                You haven't written any
                reviews yet.
              </p>

              <button
                onClick={() =>
                  navigate("/home")
                }
              >
                Explore Places
              </button>

            </div>
          )}

        {/* =================================================
            REVIEWS LIST
        ================================================= */}

        {!error &&
          reviews.length > 0 && (
            <div className="my-reviews-list">

              {reviews.map(
                (review, index) => {

                  // =================================================
                  // PLACE
                  // =================================================

                  const place =
                    review.place ||
                    review.Place ||
                    null;

                  // =================================================
                  // BUSINESS
                  // =================================================

                  const business =
                    review.business ||
                    review.Business ||
                    null;

                  // =================================================
                  // IDENTIFY REVIEW TYPE
                  // =================================================

                  const placeId =
                    review.placeId ??
                    review.PlaceId ??
                    null;

                  const businessId =
                    review.businessId ??
                    review.BusinessId ??
                    null;

                  const isBusinessReview =
                    !!businessId &&
                    !placeId;

                  // =================================================
                  // NAME
                  // =================================================

                  const placeName =
                    place?.name ||
                    place?.Name ||
                    null;

                  const businessName =
                    business?.name ||
                    business?.Name ||
                    null;

                  const reviewTargetName =
                    isBusinessReview
                      ? businessName ||
                        "Business"
                      : placeName ||
                        "Place";

                  // =================================================
                  // ADDRESS
                  // =================================================

                  const address =
                    place?.address ||
                    place?.Address ||
                    business?.address ||
                    business?.Address ||
                    "";

                  // =================================================
                  // CITY
                  // =================================================

                  const city =
                    place?.city ||
                    place?.City ||
                    business?.city ||
                    business?.City ||
                    "";

                  // =================================================
                  // RATING
                  // =================================================

                  const rating = Number(
                    review.rating ??
                    review.Rating ??
                    0
                  );

                  // =================================================
                  // COMMENT
                  // =================================================

                  const comment =
                    review.comment ||
                    review.Comment ||
                    "";

                  // =================================================
                  // CREATED DATE
                  // =================================================

                  const createdAt =
                    review.createdAt ||
                    review.CreatedAt ||
                    null;

                  // =================================================
                  // REVIEW ID
                  // =================================================

                  const reviewId =
                    review.reviewId ??
                    review.ReviewId ??
                    `review-${index}`;

                  return (
                    <div
                      className="my-review-card"
                      key={reviewId}
                    >

                      {/* ==========================================
                          REVIEW HEADER
                      ========================================== */}

                      <div className="review-card-top">

                        <div className="review-place-info">

                          {/* ICON */}

                          <div className="review-place-icon">

                            {isBusinessReview ? (
                              <FaStore />
                            ) : (
                              <FaCommentAlt />
                            )}

                          </div>

                          {/* NAME + LOCATION */}

                          <div>

                            <h2>
                              {reviewTargetName}
                            </h2>

                            {(address ||
                              city) && (
                              <div className="review-location">

                                <FaMapMarkerAlt />

                                <span>

                                  {address}

                                  {address &&
                                  city
                                    ? ", "
                                    : ""}

                                  {city}

                                </span>

                              </div>
                            )}

                          </div>

                        </div>

                        {/* DATE */}

                        {createdAt && (
                          <span className="review-date">
                            {formatDate(
                              createdAt
                            )}
                          </span>
                        )}

                      </div>

                      {/* ==========================================
                          REVIEW TYPE
                      ========================================== */}

                      <div
                        className="review-type"
                      >
                        {isBusinessReview
                          ? "Business Review"
                          : "Place Review"}
                      </div>

                      {/* ==========================================
                          RATING
                      ========================================== */}

                      <div className="my-review-rating">

                        <div className="stars">

                          {renderStars(
                            rating
                          )}

                        </div>

                        <span>
                          {rating}/5
                        </span>

                      </div>

                      {/* ==========================================
                          COMMENT
                      ========================================== */}

                      <div className="review-comment">

                        <p>
                          "{comment}"
                        </p>

                      </div>

                      {/* ==========================================
                          VIEW PLACE
                      ========================================== */}

                      {placeId && (
                        <button
                          className="view-place-btn"
                          onClick={() =>
                            navigate(
                              `/place/${placeId}`
                            )
                          }
                        >
                          View Place
                        </button>
                      )}

                      {/* ==========================================
                          VIEW BUSINESS
                      ========================================== */}

                      {businessId && (
                        <button
                          className="view-place-btn"
                          onClick={() =>
                            navigate(
                              `/business/${businessId}`
                            )
                          }
                        >
                          View Business
                        </button>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

    </MainLayout>
  );
}

export default Reviews;