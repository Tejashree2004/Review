import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaStar,
  FaPaperPlane,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";
import { addReview } from "../services/ReviewService";

import "../styles/WriteReview.css";

function WriteReview() {
  const { placeId, businessId } = useParams();

  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // Determine Review Type
  // =========================

  const isBusinessReview = Boolean(businessId);

  // =========================
  // Get User ID
  // =========================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
  };

  // =========================
  // Submit Review
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = getUserId();

    // =========================
    // Login Check
    // =========================

    if (!userId) {
      alert(
        "Please login first to write a review."
      );

      navigate("/login");

      return;
    }

    // =========================
    // Rating Check
    // =========================

    if (rating === 0) {
      alert("Please select a rating.");

      return;
    }

    // =========================
    // Comment Check
    // =========================

    if (!comment.trim()) {
      alert("Please write your review.");

      return;
    }

    // =========================
    // ID Check
    // =========================

    if (!placeId && !businessId) {
      alert(
        "Unable to identify the place or business."
      );

      return;
    }

    try {
      setLoading(true);

      // =========================
      // REVIEW DATA
      // =========================

      const reviewData = {
        userId: userId,

        rating: rating,

        comment: comment.trim(),

        // Existing Place Review
        ...(placeId && {
          placeId: Number(placeId),
        }),

        // New Business Review
        ...(businessId && {
          businessId: Number(businessId),
        }),
      };

      console.log(
        "Submitting Review:",
        reviewData
      );

      // =========================
      // SAVE REVIEW
      // =========================

      await addReview(reviewData);

      // =========================
      // SUCCESS
      // =========================

      alert(
        "Review added successfully!"
      );

      // =========================
      // NAVIGATE BACK
      // =========================

      if (isBusinessReview) {
        navigate(
          `/business/${businessId}`
        );
      } else {
        navigate(
          `/place/${placeId}`
        );
      }

    } catch (error) {
      console.error(
        "Failed to add review:",
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
          "Failed to add review. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

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
          Write Review Card
      ========================= */}

      <div className="write-review-page">

        <div className="write-review-card">

          <h1>
            Write a Review
          </h1>

          <p className="review-subtitle">
            Share your experience with this{" "}
            {isBusinessReview
              ? "business"
              : "place"}
          </p>

          {/* =========================
              Rating
          ========================= */}

          <div className="rating-section">

            <h3>
              Your Rating
            </h3>

            <div className="star-container">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-button"
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                    onClick={() =>
                      setRating(star)
                    }
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <FaStar
                      className={
                        star <=
                        (hoverRating ||
                          rating)
                          ? "star-active"
                          : "star-inactive"
                      }
                    />
                  </button>
                )
              )}

            </div>

            <span className="rating-text">
              {rating === 0
                ? "Select your rating"
                : `${rating} out of 5`}
            </span>

          </div>

          {/* =========================
              Comment
          ========================= */}

          <form onSubmit={handleSubmit}>

            <div className="comment-section">

              <label htmlFor="comment">
                Your Review
              </label>

              <textarea
                id="comment"
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="Tell others about your experience..."
                maxLength={500}
                rows={7}
              />

              <div className="character-count">
                {comment.length}/500
              </div>

            </div>

            {/* =========================
                Submit
            ========================= */}

            <button
              type="submit"
              className="submit-review-btn"
              disabled={loading}
            >
              <FaPaperPlane />

              <span>
                {loading
                  ? "Submitting..."
                  : "Submit Review"}
              </span>

            </button>

          </form>

        </div>

      </div>

    </MainLayout>
  );
}

export default WriteReview;