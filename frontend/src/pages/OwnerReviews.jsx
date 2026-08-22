import { useEffect, useMemo, useState } from "react";

import {
  FaArrowLeft,
  FaFlag,
  FaReply,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";

import MainLayout from "../layouts/MainLayout";

import "../styles/OwnerReviews.css";

const API_BASE = "http://localhost:5213/api";

function OwnerReviews() {
  const navigate = useNavigate();

  const { businessId: routeBusinessId } = useParams();

  // =====================================================
  // STATES
  // =====================================================

  const [businessId, setBusinessId] = useState(
    routeBusinessId || null
  );

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedFilter, setSelectedFilter] =
    useState("all");

  const [replyingTo, setReplyingTo] =
    useState(null);

  const [replyText, setReplyText] =
    useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // NORMALIZE NUMBER
  // =====================================================

  const normalizeNumber = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value)
        ? value
        : null;
    }

    if (typeof value === "string") {
      const cleanedValue =
        value.trim();

      if (!cleanedValue) {
        return null;
      }

      const match =
        cleanedValue.match(
          /(\d+(?:\.\d+)?)/
        );

      if (!match) {
        return null;
      }

      const parsed =
        Number(match[1]);

      return Number.isFinite(parsed)
        ? parsed
        : null;
    }

    return null;
  };

  // =====================================================
  // GET REVIEW RATING
  // =====================================================

  const getReviewRating = (review) => {
    if (
      !review ||
      typeof review !== "object"
    ) {
      return 0;
    }

    const possibleRatings = [
      review?.rating,
      review?.Rating,
      review?.ratingValue,
      review?.RatingValue,
      review?.reviewRating,
      review?.ReviewRating,
      review?.stars,
      review?.Stars,
      review?.starRating,
      review?.StarRating,
      review?.ratingScore,
      review?.RatingScore,
      review?.review?.rating,
      review?.review?.Rating,
      review?.Review?.rating,
      review?.Review?.Rating,
    ];

    for (const value of possibleRatings) {
      const parsedRating =
        normalizeNumber(value);

      if (
        parsedRating !== null &&
        parsedRating >= 0 &&
        parsedRating <= 5
      ) {
        return parsedRating;
      }
    }

    return 0;
  };

  // =====================================================
  // GET REVIEW ID
  // =====================================================

  const getReviewId = (
    review,
    index = 0
  ) => {
    return (
      review?.reviewId ??
      review?.ReviewId ??
      review?.id ??
      review?.Id ??
      `review-${index}`
    );
  };

  // =====================================================
  // GET USER NAME
  // =====================================================

  const getUserName = (review) => {
    return (
      review?.user?.fullName ??
      review?.user?.FullName ??
      review?.user?.name ??
      review?.user?.Name ??
      review?.User?.fullName ??
      review?.User?.FullName ??
      review?.User?.name ??
      review?.User?.Name ??
      review?.fullName ??
      review?.FullName ??
      review?.userName ??
      review?.UserName ??
      review?.name ??
      review?.Name ??
      "REVIO User"
    );
  };

  // =====================================================
  // GET COMMENT
  // =====================================================

  const getReviewComment = (review) => {
    return (
      review?.comment ??
      review?.Comment ??
      review?.reviewText ??
      review?.ReviewText ??
      review?.text ??
      review?.Text ??
      ""
    );
  };

  // =====================================================
  // GET DATE
  // =====================================================

  const getReviewDate = (review) => {
    return (
      review?.createdAt ??
      review?.CreatedAt ??
      review?.reviewDate ??
      review?.ReviewDate ??
      review?.date ??
      review?.Date ??
      ""
    );
  };

  // =====================================================
  // GET OWNER REPLY
  // =====================================================

  const getReply = (review) => {
    return (
      review?.ownerReply ??
      review?.OwnerReply ??
      review?.reply ??
      review?.Reply ??
      review?.ownerResponse ??
      review?.OwnerResponse ??
      ""
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOAD OWNER BUSINESS ID
  //
  // If route contains businessId,
  // use that ID directly.
  //
  // Otherwise get owner's business first.
  // =====================================================

  const getOwnerBusinessId =
    async (config) => {
      if (routeBusinessId) {
        return routeBusinessId;
      }

      console.log(
        "No businessId in URL. Loading owner business..."
      );

      const businessResponse =
        await axios.get(
          `${API_BASE}/owner/business`,
          config
        );

      console.log(
        "OWNER BUSINESS RESPONSE:",
        businessResponse.data
      );

      const businessData =
        businessResponse?.data?.data ??
        businessResponse?.data?.Data ??
        businessResponse?.data;

      const ownerBusiness =
        Array.isArray(businessData)
          ? businessData[0]
          : businessData;

      if (!ownerBusiness) {
        return null;
      }

      const ownerBusinessId =
        ownerBusiness?.businessId ??
        ownerBusiness?.BusinessId;

      console.log(
        "OWNER BUSINESS ID:",
        ownerBusinessId
      );

      return ownerBusinessId || null;
    };

  // =====================================================
  // LOAD BUSINESS REVIEWS
  // =====================================================

  useEffect(() => {
    const loadBusinessReviews =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            getToken();

          if (!token) {
            setError(
              "Please login again to view your reviews."
            );

            setLoading(false);
            return;
          }

          const config = {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          };

          // =================================================
          // GET BUSINESS ID
          // =================================================

          const resolvedBusinessId =
            await getOwnerBusinessId(
              config
            );

          if (!resolvedBusinessId) {
            setReviews([]);

            setError(
              "Business information is missing."
            );

            setLoading(false);
            return;
          }

          setBusinessId(
            resolvedBusinessId
          );

          console.log(
            "FINAL BUSINESS ID FOR REVIEWS:",
            resolvedBusinessId
          );

          // =================================================
          // GET CUSTOMER REVIEWS
          // =================================================

          const response =
            await axios.get(
              `${API_BASE}/Review/business/${resolvedBusinessId}`,
              config
            );

          console.log(
            "Owner Business Reviews API Response:",
            response.data
          );

          const reviewData =
            response?.data?.data ??
            response?.data?.Data ??
            response?.data;

          const finalReviews =
            Array.isArray(reviewData)
              ? reviewData
              : [];

          console.log(
            "FINAL BUSINESS REVIEWS:",
            finalReviews
          );

          // =================================================
          // DEBUG REVIEWS
          // =================================================

          finalReviews.forEach(
            (review, index) => {
              console.log(
                `Review ${index + 1}`,
                {
                  ReviewId:
                    getReviewId(
                      review,
                      index
                    ),

                  Rating:
                    getReviewRating(
                      review
                    ),

                  Comment:
                    getReviewComment(
                      review
                    ),

                  User:
                    getUserName(
                      review
                    ),

                  Date:
                    getReviewDate(
                      review
                    ),

                  OwnerReply:
                    getReply(
                      review
                    ),
                }
              );
            }
          );

          setReviews(
            finalReviews
          );
        } catch (err) {
          console.error(
            "Failed to load business reviews:",
            err
          );

          setReviews([]);

          if (
            err.response?.status ===
            401
          ) {
            setError(
              "Your session has expired. Please login again."
            );
          } else if (
            err.response?.status ===
            404
          ) {
            setError(
              "No reviews found for this business."
            );
          } else {
            setError(
              "Unable to load customer reviews."
            );
          }
        } finally {
          setLoading(false);
        }
      };

    loadBusinessReviews();
  }, [routeBusinessId]);

  // =====================================================
  // FILTER REVIEWS
  // =====================================================

  const filteredReviews =
    useMemo(() => {
      if (
        selectedFilter ===
        "all"
      ) {
        return reviews;
      }

      const filterRating =
        Number(selectedFilter);

      return reviews.filter(
        (review) => {
          const rating =
            getReviewRating(
              review
            );

          return (
            Math.round(rating) ===
            filterRating
          );
        }
      );
    }, [
      reviews,
      selectedFilter,
    ]);

  // =====================================================
  // TOTAL REVIEWS
  // =====================================================

  const totalReviews =
    reviews.length;

  // =====================================================
  // RATED REVIEWS
  // =====================================================

  const ratedReviews =
    useMemo(() => {
      return reviews.filter(
        (review) => {
          return (
            getReviewRating(
              review
            ) > 0
          );
        }
      );
    }, [reviews]);

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const averageRating =
    useMemo(() => {
      if (
        ratedReviews.length ===
        0
      ) {
        return "0.0";
      }

      const totalRating =
        ratedReviews.reduce(
          (sum, review) => {
            return (
              sum +
              getReviewRating(
                review
              )
            );
          },
          0
        );

      return (
        totalRating /
        ratedReviews.length
      ).toFixed(1);
    }, [ratedReviews]);

  // =====================================================
  // RATING COUNT
  // =====================================================

  const getRatingCount =
    (rating) => {
      return reviews.filter(
        (review) => {
          return (
            Math.round(
              getReviewRating(
                review
              )
            ) === rating
          );
        }
      ).length;
    };

  // =====================================================
  // RENDER STARS
  // =====================================================

  const renderStars = (
    rating
  ) => {
    const numericRating =
      normalizeNumber(
        rating
      ) ?? 0;

    const safeRating =
      Math.min(
        Math.max(
          numericRating,
          0
        ),
        5
      );

    return (
      <div
        className="owner-review-stars"
        aria-label={`${safeRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => {
            const isFilled =
              star <=
              Math.round(
                safeRating
              );

            return (
              <FaStar
                key={star}
                className={
                  isFilled
                    ? "star-filled"
                    : "star-empty"
                }
              />
            );
          }
        )}
      </div>
    );
  };

  // =====================================================
  // OPEN REPLY
  // =====================================================

  const handleReplyClick =
    (reviewId) => {
      setReplyingTo(
        reviewId
      );

      setReplyText("");
    };

  // =====================================================
  // CANCEL REPLY
  // =====================================================

  const handleCancelReply =
    () => {
      setReplyingTo(null);
      setReplyText("");
    };

  // =====================================================
  // SUBMIT REPLY
  // =====================================================

  const handleSubmitReply =
    (reviewId) => {
      const trimmedReply =
        replyText.trim();

      if (!trimmedReply) {
        alert(
          "Please enter your reply."
        );

        return;
      }

      const replyTime =
        new Date().toISOString();

      setReviews(
        (previousReviews) =>
          previousReviews.map(
            (review) => {
              const currentReviewId =
                getReviewId(
                  review
                );

              if (
                currentReviewId ===
                reviewId
              ) {
                return {
                  ...review,

                  ownerReply:
                    trimmedReply,

                  OwnerReply:
                    trimmedReply,

                  ownerReplyAt:
                    replyTime,

                  OwnerReplyAt:
                    replyTime,
                };
              }

              return review;
            }
          )
      );

      setReplyingTo(null);
      setReplyText("");

      alert(
        "Reply added successfully."
      );
    };

  // =====================================================
  // REPORT REVIEW
  // =====================================================

  const handleReport =
    (reviewId) => {
      const confirmed =
        window.confirm(
          "Do you want to report this review?"
        );

      if (!confirmed) {
        return;
      }

      console.log(
        "Reported Review ID:",
        reviewId
      );

      alert(
        "Review has been reported to REVIO admin."
      );
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="owner-reviews-page">

          <div className="owner-reviews-header">

            <button
              className="owner-reviews-back"
              onClick={() =>
                navigate(-1)
              }
              title="Go Back"
            >
              <FaArrowLeft />
            </button>

            <div>
              <h1>
                Customer Reviews
              </h1>

              <p>
                Loading customer reviews...
              </p>
            </div>

          </div>

          <div className="owner-review-empty">

            <FaStar />

            <h2>
              Loading Reviews...
            </h2>

            <p>
              Please wait while we
              load customer reviews.
            </p>

          </div>

        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <MainLayout>
        <div className="owner-reviews-page">

          <div className="owner-reviews-header">

            <button
              className="owner-reviews-back"
              onClick={() =>
                navigate(-1)
              }
              title="Go Back"
            >
              <FaArrowLeft />
            </button>

            <div>
              <h1>
                Customer Reviews
              </h1>

              <p>
                See what customers are
                saying about your business.
              </p>
            </div>

          </div>

          <div className="owner-review-empty">

            <FaStar />

            <h2>
              Unable to Load Reviews
            </h2>

            <p>
              {error}
            </p>

            <button
              className="review-filter active"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <MainLayout>

      <div className="owner-reviews-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="owner-reviews-header">

          <button
            className="owner-reviews-back"
            onClick={() =>
              navigate(-1)
            }
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1>
              Customer Reviews
            </h1>

            <p>
              See what customers are
              saying about your business.
            </p>

          </div>

        </div>


        {/* =================================================
            BUSINESS RATING SUMMARY
        ================================================= */}

        <section className="owner-rating-summary">

          <div className="rating-main">

            <div className="rating-number">
              {averageRating}
            </div>

            {renderStars(
              Number(
                averageRating
              )
            )}

            <p>
              Based on {totalReviews}{" "}
              customer{" "}
              {totalReviews === 1
                ? "review"
                : "reviews"}
            </p>

          </div>


          {/* =================================================
              RATING DISTRIBUTION
          ================================================= */}

          <div className="rating-distribution">

            {[5, 4, 3, 2, 1].map(
              (rating) => {

                const count =
                  getRatingCount(
                    rating
                  );

                const percentage =
                  totalReviews > 0
                    ? (count /
                        totalReviews) *
                      100
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
                          width:
                            `${percentage}%`,
                        }}
                      />

                    </div>

                    <span className="rating-count">
                      {count}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </section>


        {/* =================================================
            FILTERS
        ================================================= */}

        {totalReviews > 0 && (
          <div className="review-filters">

            <span className="filter-title">
              Filter:
            </span>

            <button
              className={
                selectedFilter ===
                "all"
                  ? "review-filter active"
                  : "review-filter"
              }
              onClick={() =>
                setSelectedFilter(
                  "all"
                )
              }
            >
              All
            </button>

            {[5, 4, 3, 2, 1].map(
              (rating) => (
                <button
                  key={rating}
                  className={
                    selectedFilter ===
                    String(rating)
                      ? "review-filter active"
                      : "review-filter"
                  }
                  onClick={() =>
                    setSelectedFilter(
                      String(
                        rating
                      )
                    )
                  }
                >
                  {rating}
                  <FaStar />
                </button>
              )
            )}

          </div>
        )}


        {/* =================================================
            REVIEW LIST
        ================================================= */}

        <section className="owner-review-list">

          {filteredReviews.length ===
          0 ? (

            <div className="owner-review-empty">

              <FaStar />

              <h2>
                {totalReviews === 0
                  ? "No Reviews Yet"
                  : "No Reviews Found"}
              </h2>

              <p>
                {totalReviews === 0
                  ? "Customers have not reviewed this business yet."
                  : "There are no reviews for this rating yet."}
              </p>

            </div>

          ) : (

            filteredReviews.map(
              (review, index) => {

                const reviewId =
                  getReviewId(
                    review,
                    index
                  );

                const userName =
                  getUserName(
                    review
                  );

                const rating =
                  getReviewRating(
                    review
                  );

                const comment =
                  getReviewComment(
                    review
                  );

                const date =
                  getReviewDate(
                    review
                  );

                const reply =
                  getReply(
                    review
                  );

                return (
                  <article
                    className="owner-review-card"
                    key={reviewId}
                  >

                    {/* CUSTOMER HEADER */}

                    <div className="review-customer-header">

                      <div className="customer-info">

                        <FaUserCircle
                          className="customer-avatar"
                        />

                        <div>

                          <h3>
                            {userName}
                          </h3>

                          {date && (
                            <span>
                              {formatDate(
                                date
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                      <div className="customer-rating">
                        {renderStars(
                          rating
                        )}
                      </div>

                    </div>


                    {/* RATING NUMBER */}

                    {rating > 0 && (
                      <div
                        style={{
                          marginTop:
                            "7px",
                          fontSize:
                            "11px",
                          color:
                            "#777777",
                          textAlign:
                            "right",
                        }}
                      >
                        {rating}/5
                      </div>
                    )}


                    {/* COMMENT */}

                    {comment && (
                      <p className="customer-comment">
                        "{comment}"
                      </p>
                    )}


                    {/* OWNER REPLY */}

                    {reply && (
                      <div className="owner-reply">

                        <div className="owner-reply-header">

                          <FaReply />

                          <strong>
                            Your response
                          </strong>

                        </div>

                        <p>
                          {reply}
                        </p>

                      </div>
                    )}


                    {/* REPLY FORM */}

                    {replyingTo ===
                      reviewId && (
                      <div className="reply-form">

                        <textarea
                          value={
                            replyText
                          }
                          onChange={(
                            event
                          ) =>
                            setReplyText(
                              event.target
                                .value
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
                                reviewId
                              )
                            }
                          >
                            <FaReply />
                            Submit Reply
                          </button>

                        </div>

                      </div>
                    )}


                    {/* ACTIONS */}

                    <div className="review-actions">

                      {!reply && (
                        <button
                          className="reply-btn"
                          onClick={() =>
                            handleReplyClick(
                              reviewId
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
                            reviewId
                          )
                        }
                      >
                        <FaFlag />
                        Report
                      </button>

                    </div>

                  </article>
                );
              }
            )

          )}

        </section>

      </div>

    </MainLayout>
  );
}

export default OwnerReviews;