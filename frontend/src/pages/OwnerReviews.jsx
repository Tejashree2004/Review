import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaFlag,
  FaReply,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import "../styles/OwnerReviews.css";

function OwnerReviews() {
  const navigate = useNavigate();

  // =====================================================
  // Temporary Reviews Data
  // Later this will come from Backend API
  // =====================================================

  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: "Rahul Sharma",
      rating: 5,
      comment:
        "Excellent hotel. Rooms were clean and the staff was very helpful. I really enjoyed my stay.",
      date: "2 days ago",
      reply: "",
    },
    {
      id: 2,
      userName: "Priya Patil",
      rating: 4,
      comment:
        "Good service and nice rooms. Food quality was also good. Overall a pleasant experience.",
      date: "5 days ago",
      reply:
        "Thank you Priya for your valuable feedback. We are happy that you enjoyed your stay.",
    },
    {
      id: 3,
      userName: "Amit Joshi",
      rating: 3,
      comment:
        "The hotel was good but the room service was a little slow.",
      date: "1 week ago",
      reply: "",
    },
    {
      id: 4,
      userName: "Sneha Kulkarni",
      rating: 5,
      comment:
        "Amazing experience! Very clean property and friendly staff.",
      date: "2 weeks ago",
      reply: "",
    },
    {
      id: 5,
      userName: "Vikas More",
      rating: 2,
      comment:
        "The location was good but I expected better service.",
      date: "3 weeks ago",
      reply: "",
    },
  ]);

  // =====================================================
  // States
  // =====================================================

  const [selectedFilter, setSelectedFilter] = useState("all");

  const [replyingTo, setReplyingTo] = useState(null);

  const [replyText, setReplyText] = useState("");

  // =====================================================
  // Filter Reviews
  // =====================================================

  const filteredReviews = useMemo(() => {
    if (selectedFilter === "all") {
      return reviews;
    }

    return reviews.filter(
      (review) =>
        review.rating === Number(selectedFilter)
    );
  }, [reviews, selectedFilter]);

  // =====================================================
  // Calculate Rating
  // =====================================================

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  // =====================================================
  // Rating Count
  // =====================================================

  const getRatingCount = (rating) => {
    return reviews.filter(
      (review) => review.rating === rating
    ).length;
  };

  // =====================================================
  // Render Stars
  // =====================================================

  const renderStars = (rating) => {
    return (
      <div className="owner-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={
              star <= rating
                ? "star-filled"
                : "star-empty"
            }
          />
        ))}
      </div>
    );
  };

  // =====================================================
  // Open Reply Box
  // =====================================================

  const handleReplyClick = (reviewId) => {
    setReplyingTo(reviewId);
    setReplyText("");
  };

  // =====================================================
  // Cancel Reply
  // =====================================================

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // =====================================================
  // Submit Reply
  // =====================================================

  const handleSubmitReply = (reviewId) => {
    if (!replyText.trim()) {
      alert("Please enter your reply.");
      return;
    }

    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              reply: replyText.trim(),
            }
          : review
      )
    );

    setReplyingTo(null);
    setReplyText("");

    alert("Reply added successfully.");
  };

  // =====================================================
  // Report Review
  // =====================================================

  const handleReport = (reviewId) => {
    const confirmed = window.confirm(
      "Do you want to report this review?"
    );

    if (confirmed) {
      console.log(
        "Reported Review ID:",
        reviewId
      );

      alert(
        "Review has been reported to REVIO admin."
      );
    }
  };

  return (
    <MainLayout>
      <div className="owner-reviews-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="owner-reviews-header">

          <button
            className="owner-reviews-back"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>Customer Reviews</h1>

            <p>
              See what customers are saying about
              your business.
            </p>
          </div>

        </div>

        {/* =================================================
            BUSINESS SUMMARY
        ================================================= */}

        <section className="owner-rating-summary">

          <div className="rating-main">

            <div className="rating-number">
              {averageRating}
            </div>

            {renderStars(
              Math.round(Number(averageRating))
            )}

            <p>
              Based on {totalReviews} customer{" "}
              {totalReviews === 1
                ? "review"
                : "reviews"}
            </p>

          </div>

          <div className="rating-distribution">

            {[5, 4, 3, 2, 1].map((rating) => {

              const count =
                getRatingCount(rating);

              const percentage =
                totalReviews > 0
                  ? (count / totalReviews) * 100
                  : 0;

              return (
                <div
                  className="rating-row"
                  key={rating}
                >

                  <span className="rating-label">
                    {rating}
                    <FaStar />
                  </span>

                  <div className="rating-bar">
                    <div
                      className="rating-bar-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <span className="rating-count">
                    {count}
                  </span>

                </div>
              );
            })}

          </div>

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="review-filters">

          <span className="filter-title">
            Filter:
          </span>

          <button
            className={
              selectedFilter === "all"
                ? "review-filter active"
                : "review-filter"
            }
            onClick={() =>
              setSelectedFilter("all")
            }
          >
            All
          </button>

          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={
                selectedFilter === String(rating)
                  ? "review-filter active"
                  : "review-filter"
              }
              onClick={() =>
                setSelectedFilter(
                  String(rating)
                )
              }
            >
              {rating} <FaStar />
            </button>
          ))}

        </div>

        {/* =================================================
            REVIEW LIST
        ================================================= */}

        <section className="owner-review-list">

          {filteredReviews.length === 0 ? (

            <div className="owner-review-empty">

              <FaStar />

              <h2>No reviews found</h2>

              <p>
                There are no reviews for this
                rating yet.
              </p>

            </div>

          ) : (

            filteredReviews.map((review) => (

              <article
                className="owner-review-card"
                key={review.id}
              >

                {/* Customer Header */}

                <div className="review-customer-header">

                  <div className="customer-info">

                    <FaUserCircle className="customer-avatar" />

                    <div>
                      <h3>
                        {review.userName}
                      </h3>

                      <span>
                        {review.date}
                      </span>
                    </div>

                  </div>

                  <div className="customer-rating">
                    {renderStars(
                      review.rating
                    )}
                  </div>

                </div>

                {/* Comment */}

                <p className="customer-comment">
                  "{review.comment}"
                </p>

                {/* Existing Owner Reply */}

                {review.reply && (

                  <div className="owner-reply">

                    <div className="owner-reply-header">
                      <FaReply />

                      <strong>
                        Your response
                      </strong>
                    </div>

                    <p>
                      {review.reply}
                    </p>

                  </div>

                )}

                {/* Reply Form */}

                {replyingTo === review.id && (

                  <div className="reply-form">

                    <textarea
                      value={replyText}
                      onChange={(e) =>
                        setReplyText(
                          e.target.value
                        )
                      }
                      placeholder="Write a professional response to this customer..."
                      rows="4"
                    />

                    <div className="reply-actions">

                      <button
                        className="cancel-reply-btn"
                        onClick={
                          handleCancelReply
                        }
                      >
                        Cancel
                      </button>

                      <button
                        className="submit-reply-btn"
                        onClick={() =>
                          handleSubmitReply(
                            review.id
                          )
                        }
                      >
                        <FaReply />
                        Submit Reply
                      </button>

                    </div>

                  </div>

                )}

                {/* Actions */}

                <div className="review-actions">

                  {!review.reply && (
                    <button
                      className="reply-btn"
                      onClick={() =>
                        handleReplyClick(
                          review.id
                        )
                      }
                    >
                      <FaReply />
                      Reply
                    </button>
                  )}

                  <button
                    className="report-btn"
                    onClick={() =>
                      handleReport(
                        review.id
                      )
                    }
                  >
                    <FaFlag />
                    Report
                  </button>

                </div>

              </article>

            ))

          )}

        </section>

      </div>
    </MainLayout>
  );
}

export default OwnerReviews;