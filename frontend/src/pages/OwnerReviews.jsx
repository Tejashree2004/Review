import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaFlag,
  FaReply,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import MainLayout from "../layouts/MainLayout";

import "../styles/OwnerReviews.css";

const API_BASE =
  "http://localhost:5213/api";

function OwnerReviews() {
  const navigate = useNavigate();

  const {
    businessId: routeBusinessId,
  } = useParams();

  const [businessId, setBusinessId] =
    useState(
      routeBusinessId || null
    );

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =====================================================
  // RESPONSE DATA
  // =====================================================

  const getResponseData = (
    response
  ) => {
    return (
      response?.data?.data ??
      response?.data?.Data ??
      response?.data
    );
  };

  // =====================================================
  // NORMALIZE NUMBER
  // =====================================================

  const normalizeNumber = (
    value
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (
      typeof value ===
      "number"
    ) {
      return Number.isFinite(
        value
      )
        ? value
        : null;
    }

    if (
      typeof value ===
      "string"
    ) {

      const cleaned =
        value.trim();

      if (!cleaned) {
        return null;
      }

      const match =
        cleaned.match(
          /(\d+(?:\.\d+)?)/
        );

      if (!match) {
        return null;
      }

      const parsed =
        Number(match[1]);

      return Number.isFinite(
        parsed
      )
        ? parsed
        : null;
    }

    return null;
  };

  // =====================================================
  // RATING
  // =====================================================

  const getReviewRating =
    (review) => {

      const values = [
        review?.rating,
        review?.Rating,
        review?.ratingValue,
        review?.RatingValue,
        review?.reviewRating,
        review?.ReviewRating,
        review?.stars,
        review?.Stars,
      ];

      for (
        const value of values
      ) {

        const parsed =
          normalizeNumber(
            value
          );

        if (
          parsed !== null &&
          parsed >= 0 &&
          parsed <= 5
        ) {
          return parsed;
        }

      }

      return 0;
    };

  // =====================================================
  // REVIEW ID
  // =====================================================

  const getReviewId =
    (
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
  // USER NAME
  // =====================================================

  const getUserName =
    (review) => {

      if (
        typeof review?.User ===
        "string"
      ) {
        return review.User;
      }

      if (
        typeof review?.user ===
        "string"
      ) {
        return review.user;
      }

      return (
        review?.user?.fullName ??
        review?.user?.FullName ??
        review?.User?.fullName ??
        review?.User?.FullName ??
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
  // COMMENT
  // =====================================================

  const getReviewComment =
    (review) =>
      review?.comment ??
      review?.Comment ??
      review?.reviewText ??
      review?.ReviewText ??
      "";

  // =====================================================
  // DATE
  // =====================================================

  const getReviewDate =
    (review) =>
      review?.createdAt ??
      review?.CreatedAt ??
      review?.reviewDate ??
      review?.ReviewDate ??
      "";

  // =====================================================
  // OWNER REPLY
  // =====================================================

  const getReply =
    (review) =>
      review?.ownerReply ??
      review?.OwnerReply ??
      review?.reply ??
      review?.Reply ??
      "";

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate =
    (date) => {

      if (!date) {
        return "";
      }

      const parsed =
        new Date(date);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return "";
      }

      return parsed.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

  // =====================================================
  // GET BUSINESS ID
  // =====================================================

  const getOwnerBusinessId =
    async (
      config
    ) => {

      if (
        routeBusinessId
      ) {
        return routeBusinessId;
      }

      const businessResponse =
        await axios.get(
          `${API_BASE}/owner/business`,
          config
        );

      const businessData =
        getResponseData(
          businessResponse
        );

      const ownerBusiness =
        Array.isArray(
          businessData
        )
          ? businessData[0]
          : businessData;

      if (!ownerBusiness) {
        return null;
      }

      return (
        ownerBusiness?.businessId ??
        ownerBusiness?.BusinessId ??
        null
      );
    };

  // =====================================================
  // LOAD REVIEWS
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

            return;
          }

          const config = {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          };

          const resolvedBusinessId =
            await getOwnerBusinessId(
              config
            );

          if (
            !resolvedBusinessId
          ) {

            setReviews([]);

            setError(
              "Business information is missing."
            );

            return;
          }

          setBusinessId(
            resolvedBusinessId
          );

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
            getResponseData(
              response
            );

          const finalReviews =
            Array.isArray(
              reviewData
            )
              ? reviewData
              : [];

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

  }, [
    routeBusinessId,
  ]);

  // =====================================================
  // FILTER
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
        Number(
          selectedFilter
        );

      return reviews.filter(
        (review) =>
          Math.round(
            getReviewRating(
              review
            )
          ) ===
          filterRating
      );

    }, [
      reviews,
      selectedFilter,
    ]);

  // =====================================================
  // TOTAL
  // =====================================================

  const totalReviews =
    reviews.length;

  // =====================================================
  // RATED
  // =====================================================

  const ratedReviews =
    useMemo(
      () =>
        reviews.filter(
          (review) =>
            getReviewRating(
              review
            ) > 0
        ),
      [reviews]
    );

  // =====================================================
  // AVERAGE
  // =====================================================

  const averageRating =
    useMemo(() => {

      if (
        ratedReviews.length ===
        0
      ) {
        return "0.0";
      }

      const total =
        ratedReviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            getReviewRating(
              review
            ),
          0
        );

      return (
        total /
        ratedReviews.length
      ).toFixed(1);

    }, [
      ratedReviews,
    ]);

  // =====================================================
  // COUNT
  // =====================================================

  const getRatingCount =
    (rating) =>
      reviews.filter(
        (review) =>
          Math.round(
            getReviewRating(
              review
            )
          ) === rating
      ).length;

  // =====================================================
  // STARS
  // =====================================================

  const renderStars =
    (rating) => {

      const numeric =
        normalizeNumber(
          rating
        ) ?? 0;

      const safe =
        Math.min(
          Math.max(
            numeric,
            0
          ),
          5
        );

      return (
        <div
          className="owner-review-stars"
        >

          {[1, 2, 3, 4, 5].map(
            (star) => (
              <FaStar
                key={star}
                className={
                  star <=
                  Math.round(
                    safe
                  )
                    ? "star-filled"
                    : "star-empty"
                }
              />
            )
          )}

        </div>
      );
    };

  // =====================================================
  // REPLY
  // =====================================================

  const handleReplyClick =
    (reviewId) => {

      setReplyingTo(
        reviewId
      );

      setReplyText("");

    };

  const handleCancelReply =
    () => {

      setReplyingTo(null);
      setReplyText("");

    };

  const handleSubmitReply =
    (reviewId) => {

      const trimmed =
        replyText.trim();

      if (!trimmed) {

        alert(
          "Please enter your reply."
        );

        return;
      }

      const replyTime =
        new Date().toISOString();

      setReviews(
        (previous) =>
          previous.map(
            (review) => {

              const currentId =
                getReviewId(
                  review
                );

              if (
                currentId ===
                reviewId
              ) {

                return {
                  ...review,

                  ownerReply:
                    trimmed,

                  OwnerReply:
                    trimmed,

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
  // REPORT
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
              Please wait while we load
              customer reviews.
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
            >
              <FaArrowLeft />
            </button>

            <div>

              <h1>
                Customer Reviews
              </h1>

              <p>
                See what customers are saying
                about your business.
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
  // MAIN
  // =====================================================

  return (
    <MainLayout>

      <div className="owner-reviews-page">

        <div className="owner-reviews-header">

          <button
            className="owner-reviews-back"
            onClick={() =>
              navigate(-1)
            }
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1>
              Customer Reviews
            </h1>

            <p>
              See what customers are saying
              about your business.
            </p>

          </div>

        </div>


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
              Based on {totalReviews}
              {" "}
              customer{" "}
              {totalReviews ===
              1
                ? "review"
                : "reviews"}
            </p>

          </div>


          <div className="rating-distribution">

            {[5, 4, 3, 2, 1].map(
              (rating) => {

                const count =
                  getRatingCount(
                    rating
                  );

                const percentage =
                  totalReviews >
                  0
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
                    String(
                      rating
                    )
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


        <section className="owner-review-list">

          {filteredReviews.length ===
          0 ? (

            <div className="owner-review-empty">

              <FaStar />

              <h2>
                {totalReviews ===
                0
                  ? "No Reviews Yet"
                  : "No Reviews Found"}
              </h2>

              <p>
                {totalReviews ===
                0
                  ? "Customers have not reviewed this business yet."
                  : "There are no reviews for this rating yet."}
              </p>

            </div>

          ) : (

            filteredReviews.map(
              (
                review,
                index
              ) => {

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
                    key={
                      reviewId
                    }
                  >

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


                    {comment && (
                      <p className="customer-comment">
                        "{comment}"
                      </p>
                    )}


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
                              event
                                .target
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