import {
  useEffect,
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

import DialogBox from "../components/DialogBox";

import "../styles/OwnerReviews.css";

const API_BASE =
  "http://localhost:5213/api";

const PAGE_SIZE = 10;

function OwnerReviews() {
  const navigate = useNavigate();

  const {
    businessId: routeBusinessId,
  } = useParams();

  const [businessId, setBusinessId] =
    useState(routeBusinessId || null);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  const [replyingTo, setReplyingTo] =
    useState(null);

  const [replyText, setReplyText] =
    useState("");

  // =====================================================
  // DIALOG STATE
  // =====================================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    action: null,
  });

  // =====================================================
  // SHOW DIALOG
  // =====================================================

  const showDialog = (
    title,
    message,
    type = "info",
    action = null,
    options = {}
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText:
        options.confirmText || "OK",
      cancelText:
        options.cancelText || "Cancel",
      showCancel:
        options.showCancel || false,
      action,
    });
  };

  // =====================================================
  // CLOSE DIALOG
  // =====================================================

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  // =====================================================
  // HANDLE DIALOG CONFIRM
  // =====================================================

  const handleDialogConfirm = () => {
    const action = dialog.action;

    closeDialog();

    if (action) {
      action();
    }
  };

  // =====================================================
  // REVIEW SUMMARY
  // =====================================================

  const [reviewSummary, setReviewSummary] =
    useState({
      averageRating: "0.0",
      totalReviews: 0,
      ratingCounts: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    });

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

  const getResponseData = (response) => {
    return (
      response?.data?.data ??
      response?.data?.Data ??
      response?.data
    );
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
      const cleaned = value.trim();

      if (!cleaned) {
        return null;
      }

      const match = cleaned.match(
        /(\d+(?:\.\d+)?)/
      );

      if (!match) {
        return null;
      }

      const parsed = Number(match[1]);

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

    for (const value of values) {
      const parsed =
        normalizeNumber(value);

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
  // USER NAME
  // =====================================================

  const getUserName = (review) => {
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

  const getReviewComment = (review) => {
    return (
      review?.comment ??
      review?.Comment ??
      review?.reviewText ??
      review?.ReviewText ??
      ""
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const getReviewDate = (review) => {
    return (
      review?.createdAt ??
      review?.CreatedAt ??
      review?.reviewDate ??
      review?.ReviewDate ??
      ""
    );
  };

  // =====================================================
  // OWNER REPLY
  // =====================================================

  const getReply = (review) => {
    return (
      review?.ownerReply ??
      review?.OwnerReply ??
      review?.reply ??
      review?.Reply ??
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

    const parsed = new Date(date);

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
  // GET OWNER BUSINESS ID
  // =====================================================

  const getOwnerBusinessId = async (
    config
  ) => {
    if (routeBusinessId) {
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
  // GET PAGINATION INFO
  // =====================================================

  const getPaginationInfo = (
    data,
    currentPage,
    receivedCount
  ) => {
    const pagination =
      data?.pagination ??
      data?.Pagination ??
      data;

    const responsePage =
      Number(
        pagination?.page ??
        pagination?.Page ??
        currentPage
      );

    const responsePageSize =
      Number(
        pagination?.pageSize ??
        pagination?.PageSize ??
        PAGE_SIZE
      );

    const responseTotal =
      Number(
        pagination?.totalReviews ??
        pagination?.TotalReviews ??
        pagination?.totalCount ??
        pagination?.TotalCount ??
        0
      );

    const responseHasMore =
      pagination?.hasMore ??
      pagination?.HasMore;

    if (
      typeof responseHasMore ===
      "boolean"
    ) {
      return responseHasMore;
    }

    if (responseTotal > 0) {
      return (
        responsePage *
          responsePageSize <
        responseTotal
      );
    }

    return (
      receivedCount >=
      responsePageSize
    );
  };

  // =====================================================
  // UPDATE BACKEND SUMMARY
  // =====================================================

  const updateReviewSummary = (
    responseData
  ) => {
    const backendAverage =
      responseData?.averageRating ??
      responseData?.AverageRating;

    const backendTotal =
      responseData?.totalReviews ??
      responseData?.TotalReviews ??
      responseData?.totalCount ??
      responseData?.TotalCount;

    const backendCounts =
      responseData?.ratingCounts ??
      responseData?.RatingCounts;

    if (
      backendAverage !== undefined ||
      backendTotal !== undefined ||
      backendCounts
    ) {
      setReviewSummary(
        (previous) => ({
          averageRating:
            backendAverage !==
            undefined
              ? Number(
                  backendAverage
                ).toFixed(1)
              : previous.averageRating,

          totalReviews:
            backendTotal !==
            undefined
              ? Number(
                  backendTotal
                )
              : previous.totalReviews,

          ratingCounts:
            backendCounts
              ? {
                  1: Number(
                    backendCounts[1] ??
                    backendCounts["1"] ??
                    0
                  ),

                  2: Number(
                    backendCounts[2] ??
                    backendCounts["2"] ??
                    0
                  ),

                  3: Number(
                    backendCounts[3] ??
                    backendCounts["3"] ??
                    0
                  ),

                  4: Number(
                    backendCounts[4] ??
                    backendCounts["4"] ??
                    0
                  ),

                  5: Number(
                    backendCounts[5] ??
                    backendCounts["5"] ??
                    0
                  ),
                }
              : previous.ratingCounts,
        })
      );
    }
  };

  // =====================================================
  // LOAD BUSINESS REVIEWS
  // =====================================================

  const loadBusinessReviews = async ({
    targetPage = 1,
    append = false,
    filter = selectedFilter,
  } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      const token = getToken();

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

      if (!resolvedBusinessId) {
        setReviews([]);
        setError(
          "Business information is missing."
        );
        return;
      }

      setBusinessId(
        resolvedBusinessId
      );

      const rating =
        filter === "all"
          ? null
          : Number(filter);

      const params = {
        page: targetPage,
        pageSize: PAGE_SIZE,
        ...(rating
          ? { rating }
          : {}),
      };

      const response =
        await axios.get(
          `${API_BASE}/Review/business/${resolvedBusinessId}`,
          {
            ...config,
            params,
          }
        );

      console.log(
        "Owner Business Reviews API Response:",
        response.data
      );

      const responseData =
        getResponseData(response);

      // =================================================
      // EXTRACT REVIEWS
      // =================================================

      let reviewData = [];

      if (
        Array.isArray(
          responseData
        )
      ) {
        reviewData =
          responseData;
      } else if (
        Array.isArray(
          responseData?.reviews
        )
      ) {
        reviewData =
          responseData.reviews;
      } else if (
        Array.isArray(
          responseData?.Reviews
        )
      ) {
        reviewData =
          responseData.Reviews;
      } else if (
        Array.isArray(
          responseData?.items
        )
      ) {
        reviewData =
          responseData.items;
      } else if (
        Array.isArray(
          responseData?.Items
        )
      ) {
        reviewData =
          responseData.Items;
      }

      // =================================================
      // BACKEND SUMMARY
      // =================================================

      updateReviewSummary(
        responseData
      );

      // =================================================
      // APPEND / REPLACE
      // =================================================

      setReviews(
        (previous) => {
          if (!append) {
            return reviewData;
          }

          const existingIds =
            new Set(
              previous.map(
                (
                  review,
                  index
                ) =>
                  String(
                    getReviewId(
                      review,
                      index
                    )
                  )
              )
            );

          const newReviews =
            reviewData.filter(
              (
                review,
                index
              ) =>
                !existingIds.has(
                  String(
                    getReviewId(
                      review,
                      index
                    )
                  )
                )
            );

          return [
            ...previous,
            ...newReviews,
          ];
        }
      );

      // =================================================
      // PAGINATION
      // =================================================

      setPage(
        targetPage
      );

      setHasMore(
        getPaginationInfo(
          responseData,
          targetPage,
          reviewData.length
        )
      );
    } catch (err) {
      console.error(
        "Failed to load business reviews:",
        err
      );

      if (!append) {
        setReviews([]);
      }

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
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // INITIAL LOAD + FILTER CHANGE
  // =====================================================

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setReviews([]);

    loadBusinessReviews({
      targetPage: 1,
      append: false,
      filter: selectedFilter,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    routeBusinessId,
    selectedFilter,
  ]);

  // =====================================================
  // LOAD MORE
  // =====================================================

  const handleLoadMore = async () => {
    if (
      loading ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    await loadBusinessReviews({
      targetPage: page + 1,
      append: true,
      filter: selectedFilter,
    });
  };

  // =====================================================
  // TOTAL REVIEWS
  // =====================================================

  const totalReviews =
    Number(
      reviewSummary.totalReviews
    ) || 0;

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const averageRating =
    reviewSummary.averageRating ||
    "0.0";

  // =====================================================
  // RATING COUNT
  // =====================================================

  const getRatingCount = (
    rating
  ) => {
    return Number(
      reviewSummary
        .ratingCounts?.[
        rating
      ] || 0
    );
  };

  // =====================================================
  // STARS
  // =====================================================

  const renderStars = (
    rating
  ) => {
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
      <div className="owner-review-stars">
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

  const handleReplyClick = (
    reviewId
  ) => {
    setReplyingTo(
      reviewId
    );

    setReplyText("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const handleSubmitReply = (
    reviewId
  ) => {
    const trimmed =
      replyText.trim();

    if (!trimmed) {
      showDialog(
        "Reply Required",
        "Please enter your reply.",
        "warning"
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

    showDialog(
      "Reply Added",
      "Reply added successfully.",
      "success"
    );
  };

  // =====================================================
  // REPORT
  // =====================================================

  const handleReport = (
    reviewId
  ) => {
    showDialog(
      "Report Review",
      "Do you want to report this review?",
      "warning",
      () => {
        console.log(
          "Reported Review ID:",
          reviewId
        );

        showDialog(
          "Report Submitted",
          "Review has been reported to REVIO admin.",
          "success"
        );
      },
      {
        confirmText: "Report",
        cancelText: "Cancel",
        showCancel: true,
      }
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
              Please wait while we
              load customer reviews.
            </p>
          </div>
        </div>

        <DialogBox
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          confirmText={
            dialog.confirmText
          }
          onConfirm={
            handleDialogConfirm
          }
        />
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

        <DialogBox
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          confirmText={
            dialog.confirmText
          }
          onConfirm={
            handleDialogConfirm
          }
        />
      </MainLayout>
    );
  }

  // =====================================================
  // MAIN
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

        {/* =================================================
            RATING SUMMARY
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
              Based on{" "}
              {totalReviews}{" "}
              customer{" "}
              {totalReviews === 1
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

          {reviews.length === 0 ? (

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

            reviews.map(
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

        {/* =================================================
            LOAD MORE REVIEWS
        ================================================= */}

        {reviews.length > 0 &&
          hasMore && (

            <div className="load-more-reviews-container">

              <button
                type="button"
                className="load-more-reviews-btn"
                onClick={
                  handleLoadMore
                }
                disabled={
                  loadingMore
                }
              >

                {loadingMore ? (
                  <>
                    <span className="load-more-spinner" />
                    Loading Reviews...
                  </>
                ) : (
                  "Load More Reviews"
                )}

              </button>

            </div>

          )}

      </div>

      {/* =================================================
          DIALOG
      ================================================= */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={
          dialog.confirmText
        }
        onConfirm={
          handleDialogConfirm
        }
      />

    </MainLayout>
  );
}

export default OwnerReviews;