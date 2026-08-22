import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getBusinessReviews,
} from "../services/reviewService";

import {
  getBusinessDetails,
} from "../services/HomeService";

import {
  FaArrowLeft,
  FaStar,
  FaMapMarkerAlt,
  FaStore,
} from "react-icons/fa";

import "../styles/BusinessReviews.css";

function BusinessReviews() {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // =====================================================
  // LOAD BUSINESS + REVIEWS
  // =====================================================

  useEffect(() => {
    loadBusinessAndReviews();
  }, [businessId]);

  // =====================================================
  // LOAD BUSINESS AND ALL REVIEWS
  // =====================================================

  const loadBusinessAndReviews = async () => {
    try {
      setLoading(true);
      setReviewsLoading(true);

      if (!businessId) {
        return;
      }

      // =================================================
      // LOAD BUSINESS DETAILS
      // =================================================

      const businessResponse =
        await getBusinessDetails(businessId);

      console.log(
        "VIEW ALL BUSINESS DETAILS:",
        businessResponse.data
      );

      const businessData =
        businessResponse.data?.data ||
        businessResponse.data ||
        null;

      setBusiness(businessData);

      // =================================================
      // LOAD ALL BUSINESS REVIEWS
      // =================================================

      const reviewResponse =
        await getBusinessReviews(businessId);

      console.log(
        "VIEW ALL BUSINESS REVIEWS API:",
        reviewResponse.data
      );

      /*
        Backend response:

        {
          Success: true,
          Message: "...",
          Data: [...]
        }

        Also supports:

        {
          success: true,
          data: [...]
        }

        or direct array.
      */

      let reviewData = [];

      if (Array.isArray(reviewResponse.data)) {
        reviewData = reviewResponse.data;
      } else if (
        Array.isArray(reviewResponse.data?.data)
      ) {
        reviewData =
          reviewResponse.data.data;
      } else if (
        Array.isArray(reviewResponse.data?.Data)
      ) {
        reviewData =
          reviewResponse.data.Data;
      }

      console.log(
        "FINAL ALL BUSINESS REVIEWS:",
        reviewData
      );

      setReviews(
        Array.isArray(reviewData)
          ? reviewData
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load business reviews:",
        error
      );

      setBusiness(null);
      setReviews([]);

    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  // =====================================================
  // GET REVIEWER NAME
  // =====================================================

  const getReviewerName = (review) => {

    // Current backend response:
    //
    // User: "gauri"

    if (
      typeof review.User === "string"
    ) {
      return review.User;
    }

    if (
      typeof review.user === "string"
    ) {
      return review.user;
    }

    // Future/object response support

    if (
      review.User?.FullName
    ) {
      return review.User.FullName;
    }

    if (
      review.user?.fullName
    ) {
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
  // GET RATING
  // =====================================================

  const getRating = (review) => {
    return Number(
      review.Rating ??
      review.rating ??
      0
    );
  };

  // =====================================================
  // GET COMMENT
  // =====================================================

  const getComment = (review) => {
    return (
      review.Comment ??
      review.comment ??
      ""
    );
  };

  // =====================================================
  // GET DATE
  // =====================================================

  const getDate = (review) => {
    return (
      review.CreatedAt ??
      review.createdAt ??
      null
    );
  };

  // =====================================================
  // GET REVIEW ID
  // =====================================================

  const getReviewId = (review, index) => {
    return (
      review.ReviewId ??
      review.reviewId ??
      `review-${index}`
    );
  };

  // =====================================================
  // RELATIVE DATE
  // =====================================================

  const getRelativeDate = (dateValue) => {

    if (!dateValue) {
      return "";
    }

    const reviewDate =
      new Date(dateValue);

    if (
      Number.isNaN(
        reviewDate.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      reviewDate.getTime();

    const seconds =
      Math.floor(
        difference / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );

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
  // RENDER STARS
  // =====================================================

  const renderStars = (rating) => {

    const numericRating =
      Number(rating) || 0;

    return (
      <div className="all-review-stars">

        {[1, 2, 3, 4, 5].map(
          (star) => (
            <FaStar
              key={star}
              className={
                star <= numericRating
                  ? "all-review-star-filled"
                  : "all-review-star-empty"
              }
            />
          )
        )}

      </div>
    );
  };

  // =====================================================
  // CALCULATE AVERAGE
  // =====================================================

  const averageRating = () => {

    if (!reviews.length) {
      return Number(
        business?.rating ?? 0
      ).toFixed(1);
    }

    const total =
      reviews.reduce(
        (sum, review) =>
          sum + getRating(review),
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

        <div className="all-business-reviews-page">

          <button
            className="all-reviews-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>

          <div className="all-reviews-loading">
            Loading reviews...
          </div>

        </div>

      </MainLayout>
    );
  }

  // =====================================================
  // BUSINESS NOT FOUND
  // =====================================================

  if (!business) {
    return (
      <MainLayout>

        <div className="all-business-reviews-page">

          <button
            className="all-reviews-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>

          <div className="all-reviews-empty">

            <h2>
              Business Not Found
            </h2>

          </div>

        </div>

      </MainLayout>
    );
  }

  // =====================================================
  // BUSINESS VALUES
  // =====================================================

  const businessName =
    business.businessName ||
    business.BusinessName ||
    business.name ||
    business.Name ||
    "Business";

  const address =
    business.address ||
    business.Address ||
    "";

  const city =
    business.city ||
    business.City ||
    "";

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>

      <div className="all-business-reviews-page">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          className="all-reviews-back-btn"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <FaArrowLeft />
        </button>

        {/* =================================================
            BUSINESS HEADER
        ================================================= */}

        <div className="all-reviews-business-header">

          <div className="all-reviews-business-icon">
            <FaStore />
          </div>

          <div className="all-reviews-business-info">

            <h1>
              {businessName}
            </h1>

            {(address || city) && (
              <div className="all-reviews-location">

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

            <div className="all-reviews-summary">

              <FaStar />

              <strong>
                {averageRating()}
              </strong>

              <span>
                ({reviews.length} Reviews)
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="all-reviews-title">

          <div>

            <h2>
              Customer Reviews
            </h2>

            <p>
              See what customers are saying
              about this business.
            </p>

          </div>

          <strong>
            {reviews.length} Reviews
          </strong>

        </div>

        {/* =================================================
            LOADING REVIEWS
        ================================================= */}

        {reviewsLoading && (
          <div className="all-reviews-loading">
            Loading reviews...
          </div>
        )}

        {/* =================================================
            NO REVIEWS
        ================================================= */}

        {!reviewsLoading &&
          reviews.length === 0 && (

            <div className="all-reviews-empty">

              <FaStore />

              <h2>
                No Reviews Yet
              </h2>

              <p>
                This business does not have
                any customer reviews yet.
              </p>

            </div>
          )}

        {/* =================================================
            ALL REVIEWS
        ================================================= */}

        {!reviewsLoading &&
          reviews.length > 0 && (

            <div className="all-reviews-list">

              {reviews.map(
                (review, index) => {

                  const reviewerName =
                    getReviewerName(
                      review
                    );

                  const rating =
                    getRating(
                      review
                    );

                  const comment =
                    getComment(
                      review
                    );

                  const createdAt =
                    getDate(
                      review
                    );

                  const reviewId =
                    getReviewId(
                      review,
                      index
                    );

                  return (
                    <div
                      className="all-review-card"
                      key={reviewId}
                    >

                      {/* REVIEW TOP */}

                      <div className="all-review-top">

                        <div className="all-review-user">

                          <div className="all-review-avatar">

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
                                createdAt
                              )}
                            </span>

                          </div>

                        </div>

                        {renderStars(
                          rating
                        )}

                      </div>

                      {/* COMMENT */}

                      <p className="all-review-comment">
                        "{comment}"
                      </p>

                      {/* OWNER REPLY */}

                      {(review.OwnerReply ||
                        review.ownerReply) && (

                        <div className="all-review-owner-reply">

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
                }
              )}

            </div>
          )}

      </div>

    </MainLayout>
  );
}

export default BusinessReviews;