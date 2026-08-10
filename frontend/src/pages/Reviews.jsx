import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaStar,
  FaMapMarkerAlt,
  FaCommentAlt,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";
import { getMyReviews } from "../services/HomeService";

import "../styles/Reviews.css";

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =============================
  // Get Logged-in User ID
  // =============================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
  };

  // =============================
  // Load My Reviews
  // =============================

  useEffect(() => {
    const loadMyReviews = async () => {
      try {
        const userId = getUserId();

        if (!userId) {
          setError("Please login to view your reviews.");
          setLoading(false);
          return;
        }

        const response = await getMyReviews(userId);

        /*
          Backend returns:
          {
            Success: true,
            Message: "...",
            Data: [...]
          }
        */

        const data = response.data?.data || response.data?.Data || [];

        setReviews(data);
      } catch (error) {
        console.error("Failed to load reviews:", error);

        setError(
          "Unable to load your reviews. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMyReviews();
  }, []);

  // =============================
  // Format Date
  // =============================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =============================
  // Render Stars
  // =============================

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={
          index < rating
            ? "review-star active"
            : "review-star"
        }
      />
    ));
  };

  // =============================
  // Loading
  // =============================

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
            <p>Loading your reviews...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // =============================
  // UI
  // =============================

  return (
    <MainLayout>
      <div className="reviews-page">

        {/* =========================
            Header
        ========================= */}

        <div className="reviews-header">

          <button
            className="reviews-back-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>My Reviews</h1>

            <p>
              Reviews you have shared on REVIO
            </p>
          </div>

        </div>


        {/* =========================
            Error
        ========================= */}

        {error && (
          <div className="reviews-message error">
            <p>{error}</p>

            <button
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        )}


        {/* =========================
            No Reviews
        ========================= */}

        {!error && reviews.length === 0 && (
          <div className="reviews-message">

            <FaCommentAlt className="empty-review-icon" />

            <h2>No Reviews Yet</h2>

            <p>
              You haven't written any reviews yet.
            </p>

            <button
              onClick={() => navigate("/home")}
            >
              Explore Places
            </button>

          </div>
        )}


        {/* =========================
            Reviews List
        ========================= */}

        {!error && reviews.length > 0 && (
          <div className="my-reviews-list">

            {reviews.map((review) => {

              const place = review.place || review.Place;

              const placeName =
                place?.name ||
                place?.Name ||
                "Place";

              const address =
                place?.address ||
                place?.Address ||
                "";

              const city =
                place?.city ||
                place?.City ||
                "";

              const rating =
                Number(review.rating ?? review.Rating ?? 0);

              const comment =
                review.comment ||
                review.Comment ||
                "";

              const createdAt =
                review.createdAt ||
                review.CreatedAt;

              const reviewId =
                review.reviewId ||
                review.ReviewId;

              const placeId =
                review.placeId ||
                review.PlaceId;

              return (
                <div
                  className="my-review-card"
                  key={reviewId}
                >

                  {/* =========================
                      Place Header
                  ========================= */}

                  <div className="review-card-top">

                    <div className="review-place-info">

                      <div className="review-place-icon">
                        <FaCommentAlt />
                      </div>

                      <div>
                        <h2>{placeName}</h2>

                        {(address || city) && (
                          <div className="review-location">
                            <FaMapMarkerAlt />

                            <span>
                              {address}
                              {address && city
                                ? ", "
                                : ""}
                              {city}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>

                    {createdAt && (
                      <span className="review-date">
                        {formatDate(createdAt)}
                      </span>
                    )}

                  </div>


                  {/* =========================
                      Rating
                  ========================= */}

                  <div className="my-review-rating">

                    <div className="stars">
                      {renderStars(rating)}
                    </div>

                    <span>
                      {rating}/5
                    </span>

                  </div>


                  {/* =========================
                      Comment
                  ========================= */}

                  <div className="review-comment">

                    <p>
                      "{comment}"
                    </p>

                  </div>


                  {/* =========================
                      View Place
                  ========================= */}

                  {placeId && (
                    <button
                      className="view-place-btn"
                      onClick={() =>
                        navigate(`/place/${placeId}`)
                      }
                    >
                      View Place
                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Reviews;