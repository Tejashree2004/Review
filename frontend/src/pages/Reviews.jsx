import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaStar,
  FaMapMarkerAlt,
  FaCommentAlt,
  FaStore,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";

import {
  getMyReviews,
  getBusinessDetails,
} from "../services/HomeService";

import "../styles/Reviews.css";

const PAGE_SIZE = 10;

// =====================================================
// REVIEW MEDIA PREVIEW COUNT
// =====================================================

const REVIEW_MEDIA_PREVIEW_COUNT = 2;

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  // =====================================================
  // VIEW MORE / VIEW LESS STATE
  // =====================================================

  const [expandedReviews, setExpandedReviews] =
    useState(new Set());

  const [longReviews, setLongReviews] =
    useState(new Set());

  const commentRefs = useRef({});

  // =====================================================
  // REVIEW MEDIA MODAL STATE
  // =====================================================

  const [selectedReviewMedia, setSelectedReviewMedia] =
    useState(null);

  const [selectedReviewMediaIndex, setSelectedReviewMediaIndex] =
    useState(0);

  // =====================================================
  // CHECK WHETHER COMMENT IS LONGER THAN 2 LINES
  // =====================================================

  const checkCommentOverflow = (
    reviewId
  ) => {
    const element =
      commentRefs.current[
        String(reviewId)
      ];

    if (!element) {
      return;
    }

    const isOverflowing =
      element.scrollHeight >
      element.clientHeight + 1;

    setLongReviews(
      (previous) => {
        const updated =
          new Set(previous);

        if (isOverflowing) {
          updated.add(
            String(reviewId)
          );
        } else {
          updated.delete(
            String(reviewId)
          );
        }

        return updated;
      }
    );
  };

  // =====================================================
  // CHECK ALL COMMENT OVERFLOW
  // =====================================================

  useEffect(() => {
    const checkAllComments = () => {
      reviews.forEach(
        (review, index) => {
          const reviewId =
            getReviewId(
              review,
              index
            );

          checkCommentOverflow(
            reviewId
          );
        }
      );
    };

    const timeout =
      setTimeout(
        checkAllComments,
        50
      );

    window.addEventListener(
      "resize",
      checkAllComments
    );

    return () => {
      clearTimeout(timeout);

      window.removeEventListener(
        "resize",
        checkAllComments
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  // =====================================================
  // REVIEW MEDIA MODAL KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {
    if (!selectedReviewMedia) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeReviewMediaGallery();
        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        showNextReviewMedia();
        return;
      }

      if (
        event.key === "ArrowLeft"
      ) {
        showPreviousReviewMedia();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReviewMedia]);

  // =====================================================
  // TOGGLE REVIEW COMMENT
  // =====================================================

  const toggleReviewComment = (
    reviewId
  ) => {
    setExpandedReviews(
      (previous) => {
        const updated =
          new Set(previous);

        if (
          updated.has(
            String(reviewId)
          )
        ) {
          updated.delete(
            String(reviewId)
          );
        } else {
          updated.add(
            String(reviewId)
          );
        }

        return updated;
      }
    );
  };

  // =====================================================
  // GET LOGGED-IN USER ID
  // =====================================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId
      ? Number(userId)
      : null;
  };

  // =====================================================
  // GET BUSINESS DETAILS
  // =====================================================

  const getBusinessInfo =
    async (businessId) => {
      try {
        if (!businessId) {
          return null;
        }

        const response =
          await getBusinessDetails(
            businessId
          );

        console.log(
          `Business Details for ${businessId}:`,
          response.data
        );

        const businessData =
          response.data?.data ||
          response.data;

        return businessData || null;
      } catch (error) {
        console.error(
          `Failed to load business ${businessId}:`,
          error
        );

        return null;
      }
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
  // GET REVIEW MEDIA
  // =====================================================

  const getReviewMedia = (
    review
  ) => {
    if (!review) {
      return [];
    }

    const possibleMedia =
      review.reviewMedia ??
      review.ReviewMedia ??
      review.media ??
      review.Media ??
      review.reviewMedias ??
      review.ReviewMedias ??
      review.mediaFiles ??
      review.MediaFiles ??
      [];

    if (
      Array.isArray(
        possibleMedia
      )
    ) {
      return possibleMedia;
    }

    return [];
  };

  // =====================================================
  // GET MEDIA URL
  // =====================================================

  const getMediaUrl = (
    mediaUrl
  ) => {
    if (!mediaUrl) {
      return "";
    }

    const cleanUrl =
      String(mediaUrl).trim();

    if (!cleanUrl) {
      return "";
    }

    // -------------------------------------------------
    // Base64 media
    // -------------------------------------------------

    if (
      cleanUrl.startsWith(
        "data:image/"
      ) ||
      cleanUrl.startsWith(
        "data:video/"
      )
    ) {
      return cleanUrl;
    }

    // -------------------------------------------------
    // Already absolute URL
    // -------------------------------------------------

    if (
      cleanUrl.startsWith(
        "http://"
      ) ||
      cleanUrl.startsWith(
        "https://"
      )
    ) {
      return cleanUrl;
    }

    // -------------------------------------------------
    // Backend relative URL
    // -------------------------------------------------

    return `http://localhost:5213${
      cleanUrl.startsWith("/")
        ? cleanUrl
        : `/${cleanUrl}`
    }`;
  };

  // =====================================================
  // CHECK VIDEO MEDIA
  // =====================================================

  const isVideoMedia = (
    media
  ) => {
    const mediaType =
      (
        media?.MediaType ??
        media?.mediaType ??
        ""
      ).toLowerCase();

    const mediaUrl =
      (
        media?.MediaUrl ??
        media?.mediaUrl ??
        ""
      ).toLowerCase();

    return (
      mediaType.includes(
        "video"
      ) ||
      mediaType === ".mp4" ||
      mediaType === ".webm" ||
      mediaType === ".mov" ||
      mediaUrl.endsWith(
        ".mp4"
      ) ||
      mediaUrl.endsWith(
        ".webm"
      ) ||
      mediaUrl.endsWith(
        ".mov"
      ) ||
      mediaUrl.endsWith(
        ".avi"
      ) ||
      mediaUrl.endsWith(
        ".m4v"
      )
    );
  };

  // =====================================================
  // NORMALIZE REVIEW MEDIA
  // =====================================================

  const getValidReviewMedia = (
    review,
    reviewId
  ) => {
    const reviewMedia =
      getReviewMedia(
        review
      );

    if (
      !Array.isArray(
        reviewMedia
      )
    ) {
      return [];
    }

    return reviewMedia
      .map(
        (
          media,
          mediaIndex
        ) => {
          const rawUrl =
            media?.MediaUrl ??
            media?.mediaUrl ??
            media?.url ??
            media?.Url ??
            "";

          const mediaUrl =
            getMediaUrl(
              rawUrl
            );

          if (!mediaUrl) {
            return null;
          }

          const mediaId =
            media?.ReviewMediaId ??
            media?.reviewMediaId ??
            media?.id ??
            media?.Id ??
            `${reviewId}-media-${mediaIndex}`;

          return {
            ...media,
            mediaId,
            mediaUrl,
            mediaIndex,
          };
        }
      )
      .filter(Boolean);
  };

  // =====================================================
  // OPEN REVIEW MEDIA GALLERY
  // =====================================================

  const openReviewMediaGallery = (
    mediaList,
    startIndex = 0
  ) => {
    if (
      !Array.isArray(
        mediaList
      ) ||
      mediaList.length === 0
    ) {
      return;
    }

    const safeStartIndex =
      Math.min(
        Math.max(
          Number(
            startIndex
          ) || 0,
          0
        ),
        mediaList.length - 1
      );

    setSelectedReviewMedia(
      mediaList
    );

    setSelectedReviewMediaIndex(
      safeStartIndex
    );
  };

  // =====================================================
  // CLOSE REVIEW MEDIA GALLERY
  // =====================================================

  const closeReviewMediaGallery =
    () => {
      setSelectedReviewMedia(
        null
      );

      setSelectedReviewMediaIndex(
        0
      );
    };

  // =====================================================
  // NEXT REVIEW MEDIA
  // =====================================================

  const showNextReviewMedia =
    () => {
      if (
        !selectedReviewMedia?.length
      ) {
        return;
      }

      setSelectedReviewMediaIndex(
        (previous) =>
          (
            previous + 1
          ) %
          selectedReviewMedia.length
      );
    };

  // =====================================================
  // PREVIOUS REVIEW MEDIA
  // =====================================================

  const showPreviousReviewMedia =
    () => {
      if (
        !selectedReviewMedia?.length
      ) {
        return;
      }

      setSelectedReviewMediaIndex(
        (previous) =>
          previous === 0
            ? selectedReviewMedia.length -
              1
            : previous - 1
      );
    };

  // =====================================================
  // GET PAGINATION INFORMATION
  // =====================================================

  const getHasMore = (
    responseData,
    currentPage,
    receivedCount
  ) => {
    const directHasMore =
      responseData?.hasMore ??
      responseData?.HasMore;

    if (
      typeof directHasMore ===
      "boolean"
    ) {
      return directHasMore;
    }

    const pagination =
      responseData?.pagination ??
      responseData?.Pagination;

    if (pagination) {
      const paginationHasMore =
        pagination?.hasMore ??
        pagination?.HasMore;

      if (
        typeof paginationHasMore ===
        "boolean"
      ) {
        return paginationHasMore;
      }

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

      const total =
        Number(
          pagination?.totalReviews ??
          pagination?.TotalReviews ??
          pagination?.totalCount ??
          pagination?.TotalCount ??
          0
        );

      if (total > 0) {
        return (
          responsePage *
            responsePageSize <
          total
        );
      }
    }

    const total =
      Number(
        responseData?.totalReviews ??
        responseData?.TotalReviews ??
        responseData?.totalCount ??
        responseData?.TotalCount ??
        0
      );

    if (total > 0) {
      return (
        currentPage *
          PAGE_SIZE <
        total
      );
    }

    return (
      receivedCount >=
      PAGE_SIZE
    );
  };

  // =====================================================
  // LOAD MY REVIEWS
  // =====================================================

  const loadMyReviews =
    async ({
      targetPage = 1,
      append = false,
    } = {}) => {
      try {
        if (append) {
          setLoadingMore(
            true
          );
        } else {
          setLoading(true);
          setError("");
        }

        const userId =
          getUserId();

        if (!userId) {
          setError(
            "Please login to view your reviews."
          );

          return;
        }

        const response =
          await getMyReviews(
            userId,
            targetPage,
            PAGE_SIZE
          );

        console.log(
          "My Reviews API Response:",
          response.data
        );

        let responseData =
          response.data;

        if (
          responseData?.data !==
          undefined
        ) {
          responseData =
            responseData.data;
        } else if (
          responseData?.Data !==
          undefined
        ) {
          responseData =
            responseData.Data;
        }

        let data = [];

        if (
          Array.isArray(
            responseData
          )
        ) {
          data =
            responseData;
        } else if (
          Array.isArray(
            responseData?.reviews
          )
        ) {
          data =
            responseData.reviews;
        } else if (
          Array.isArray(
            responseData?.Reviews
          )
        ) {
          data =
            responseData.Reviews;
        } else if (
          Array.isArray(
            responseData?.items
          )
        ) {
          data =
            responseData.items;
        } else if (
          Array.isArray(
            responseData?.Items
          )
        ) {
          data =
            responseData.Items;
        } else if (
          Array.isArray(
            responseData?.results
          )
        ) {
          data =
            responseData.results;
        } else if (
          Array.isArray(
            responseData?.Results
          )
        ) {
          data =
            responseData.Results;
        }

        console.log(
          "My Reviews Page Data:",
          data
        );

        const businessCache = {};

        const reviewsWithBusiness =
          await Promise.all(
            data.map(
              async (
                review
              ) => {
                const businessId =
                  review.businessId ??
                  review.BusinessId ??
                  null;

                const placeId =
                  review.placeId ??
                  review.PlaceId ??
                  null;

                if (
                  businessId &&
                  !placeId
                ) {
                  const existingBusiness =
                    review.business ||
                    review.Business ||
                    null;

                  const existingBusinessName =
                    existingBusiness?.businessName ||
                    existingBusiness?.BusinessName ||
                    existingBusiness?.name ||
                    existingBusiness?.Name ||
                    null;

                  if (
                    existingBusiness &&
                    existingBusinessName
                  ) {
                    return review;
                  }

                  if (
                    businessCache[
                      businessId
                    ]
                  ) {
                    return {
                      ...review,
                      business:
                        businessCache[
                          businessId
                        ],
                      Business:
                        businessCache[
                          businessId
                        ],
                    };
                  }

                  const business =
                    await getBusinessInfo(
                      businessId
                    );

                  if (business) {
                    businessCache[
                      businessId
                    ] =
                      business;

                    return {
                      ...review,
                      business,
                      Business:
                        business,
                    };
                  }
                }

                return review;
              }
            )
          );

        console.log(
          "Final My Reviews Page:",
          reviewsWithBusiness
        );

        setReviews(
          (
            previousReviews
          ) => {
            if (!append) {
              return Array.isArray(
                reviewsWithBusiness
              )
                ? reviewsWithBusiness
                : [];
            }

            const existingIds =
              new Set(
                previousReviews.map(
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
              reviewsWithBusiness.filter(
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
              ...previousReviews,
              ...newReviews,
            ];
          }
        );

        setPage(
          targetPage
        );

        setHasMore(
          getHasMore(
            responseData,
            targetPage,
            reviewsWithBusiness.length
          )
        );
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error
        );

        if (!append) {
          setReviews([]);
        }

        if (
          error.response?.status ===
          401
        ) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (
          error.response?.status ===
          404
        ) {
          setError(
            "No reviews found."
          );
        } else {
          setError(
            append
              ? "Unable to load more reviews. Please try again."
              : "Unable to load your reviews. Please try again."
          );
        }
      } finally {
        if (append) {
          setLoadingMore(
            false
          );
        } else {
          setLoading(
            false
          );
        }
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadMyReviews({
      targetPage: 1,
      append: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // LOAD MORE REVIEWS
  // =====================================================

  const handleLoadMore =
    async () => {
      if (
        loading ||
        loadingMore ||
        !hasMore
      ) {
        return;
      }

      await loadMyReviews({
        targetPage:
          page + 1,
        append: true,
      });
    };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date
  ) => {
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

  const renderStars = (
    rating
  ) => {
    const numericRating =
      Number(rating) || 0;

    return Array.from(
      { length: 5 },
      (_, index) => (
        <FaStar
          key={index}
          className={
            index <
            numericRating
              ? "review-star active"
              : "review-star"
          }
        />
      )
    );
  };

  // =====================================================
  // CURRENT REVIEW MEDIA
  // =====================================================

  const currentReviewMedia =
    selectedReviewMedia?.[
      selectedReviewMediaIndex
    ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>

        <div className="reviews-page">

          <button
            className="reviews-back-btn"
            onClick={() =>
              navigate(-1)
            }
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
            onClick={() =>
              navigate(-1)
            }
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
                (
                  review,
                  index
                ) => {

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
                  // IDs
                  // =================================================

                  const placeId =
                    review.placeId ??
                    review.PlaceId ??
                    null;

                  const businessId =
                    review.businessId ??
                    review.BusinessId ??
                    null;

                  // =================================================
                  // REVIEW TYPE
                  // =================================================

                  const isBusinessReview =
                    !!businessId &&
                    !placeId;

                  // =================================================
                  // PLACE NAME
                  // =================================================

                  const placeName =
                    place?.name ||
                    place?.Name ||
                    null;

                  // =================================================
                  // BUSINESS NAME
                  // =================================================

                  const businessName =
                    business?.businessName ||
                    business?.BusinessName ||
                    business?.name ||
                    business?.Name ||
                    null;

                  // =================================================
                  // FINAL TARGET NAME
                  // =================================================

                  const reviewTargetName =
                    isBusinessReview
                      ? businessName ||
                        `Business #${businessId}`
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

                  const rating =
                    Number(
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
                    getReviewId(
                      review,
                      index
                    );

                  // =================================================
                  // REVIEW MEDIA
                  // =================================================

                  const validReviewMedia =
                    getValidReviewMedia(
                      review,
                      reviewId
                    );

                  const visibleReviewMedia =
                    validReviewMedia.slice(
                      0,
                      REVIEW_MEDIA_PREVIEW_COUNT
                    );

                  const remainingReviewMediaCount =
                    Math.max(
                      validReviewMedia.length -
                        REVIEW_MEDIA_PREVIEW_COUNT,
                      0
                    );

                  // =================================================
                  // COMMENT STATE
                  // =================================================

                  const isExpanded =
                    expandedReviews.has(
                      String(reviewId)
                    );

                  const isLongReview =
                    longReviews.has(
                      String(reviewId)
                    );

                  return (
                    <div
                      className="my-review-card"
                      key={
                        reviewId
                      }
                    >

                      {/* ==========================================
                          REVIEW HEADER
                      ========================================== */}

                      <div className="review-card-top">

                        <div className="review-place-info">

                          <div className="review-place-icon">

                            {isBusinessReview ? (
                              <FaStore />
                            ) : (
                              <FaCommentAlt />
                            )}

                          </div>

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

                      <div className="review-type">

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
                          REVIEW MEDIA
                      ========================================== */}

                      {visibleReviewMedia.length >
                        0 && (
                        <div className="my-review-media-gallery">

                          {visibleReviewMedia.map(
                            (
                              media,
                              mediaIndex
                            ) => {

                              const isLastVisible =
                                mediaIndex ===
                                visibleReviewMedia.length -
                                  1;

                              const showMoreOverlay =
                                isLastVisible &&
                                remainingReviewMediaCount >
                                  0;

                              const handleMediaClick =
                                () => {
                                  openReviewMediaGallery(
                                    validReviewMedia,
                                    mediaIndex
                                  );
                                };

                              const handleMediaKeyDown =
                                (
                                  event
                                ) => {
                                  if (
                                    event.key ===
                                      "Enter" ||
                                    event.key ===
                                      " "
                                  ) {
                                    event.preventDefault();

                                    handleMediaClick();
                                  }
                                };

                              return (
                                <div
                                  className="my-review-media-item"
                                  key={
                                    media.mediaId
                                  }
                                  role="button"
                                  tabIndex={0}
                                  onClick={
                                    handleMediaClick
                                  }
                                  onKeyDown={
                                    handleMediaKeyDown
                                  }
                                  aria-label={
                                    showMoreOverlay
                                      ? `Open review media gallery. ${remainingReviewMediaCount} more media`
                                      : `Open review media ${mediaIndex + 1}`
                                  }
                                >

                                  {isVideoMedia(
                                    media
                                  ) ? (
                                    <video
                                      className="my-review-media-video"
                                      src={
                                        media.mediaUrl
                                      }
                                      preload="metadata"
                                      muted
                                    />
                                  ) : (
                                    <img
                                      className="my-review-media-image"
                                      src={
                                        media.mediaUrl
                                      }
                                      alt="Review media"
                                      loading="lazy"
                                    />
                                  )}

                                  {isVideoMedia(
                                    media
                                  ) && (
                                    <div className="my-review-video-icon">
                                      <FaPlay />
                                    </div>
                                  )}

                                  {showMoreOverlay && (
                                    <div
                                      className="my-review-media-more-overlay"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();

                                        openReviewMediaGallery(
                                          validReviewMedia,
                                          1
                                        );
                                      }}
                                    >
                                      <span className="my-review-media-more-count">
                                        +
                                        {
                                          remainingReviewMediaCount
                                        }{" "}
                                        More
                                      </span>
                                    </div>
                                  )}

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}

                      {/* ==========================================
                          COMMENT
                          2 LINES + CONDITIONAL VIEW MORE
                      ========================================== */}

                      {comment && (
                        <div className="review-comment">

                          <p
                            ref={(
                              element
                            ) => {
                              commentRefs.current[
                                String(
                                  reviewId
                                )
                              ] =
                                element;
                            }}
                            className={
                              isExpanded
                                ? "expanded"
                                : ""
                            }
                          >
                            "{comment}"
                          </p>

                          {isLongReview && (
                            <button
                              type="button"
                              className="review-view-more-btn"
                              onClick={() =>
                                toggleReviewComment(
                                  reviewId
                                )
                              }
                            >
                              {isExpanded
                                ? "View Less"
                                : "View More"}
                            </button>
                          )}

                        </div>
                      )}

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

        {/* =================================================
            LOAD MORE REVIEWS
        ================================================= */}

        {!error &&
          reviews.length > 0 &&
          hasMore && (
            <div className="load-more-reviews-container">

              <button
                className="load-more-reviews-btn"
                onClick={
                  handleLoadMore
                }
                disabled={
                  loadingMore
                }
              >
                {loadingMore
                  ? "Loading Reviews..."
                  : "Load More Reviews"}
              </button>

            </div>
          )}

      </div>

      {/* =====================================================
          REVIEW MEDIA MODAL
      ===================================================== */}

      {selectedReviewMedia &&
        currentReviewMedia && (
          <div
            className="review-media-modal"
            onClick={
              closeReviewMediaGallery
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="review-media-modal-close"
              onClick={
                closeReviewMediaGallery
              }
              aria-label="Close review media gallery"
            >
              <FaTimes />
            </button>

            {/* CONTENT */}

            <div
              className="review-media-modal-content"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              {/* PREVIOUS */}

              {selectedReviewMedia.length >
                1 && (
                <button
                  type="button"
                  className="review-media-modal-nav review-media-modal-prev"
                  onClick={
                    showPreviousReviewMedia
                  }
                  aria-label="Previous review media"
                >
                  <FaChevronLeft />
                </button>
              )}

              {/* MEDIA */}

              <div className="review-media-modal-media-wrapper">

                {isVideoMedia(
                  currentReviewMedia
                ) ? (
                  <video
                    className="review-media-modal-video"
                    src={
                      currentReviewMedia.mediaUrl
                    }
                    controls
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="review-media-modal-image"
                    src={
                      currentReviewMedia.mediaUrl
                    }
                    alt={`Review media ${
                      selectedReviewMediaIndex +
                      1
                    }`}
                  />
                )}

              </div>

              {/* NEXT */}

              {selectedReviewMedia.length >
                1 && (
                <button
                  type="button"
                  className="review-media-modal-nav review-media-modal-next"
                  onClick={
                    showNextReviewMedia
                  }
                  aria-label="Next review media"
                >
                  <FaChevronRight />
                </button>
              )}

              {/* COUNTER */}

              <div className="review-media-modal-counter">

                {selectedReviewMediaIndex +
                  1}

                {" / "}

                {
                  selectedReviewMedia.length
                }

              </div>

            </div>

          </div>
        )}

    </MainLayout>
  );
}

export default Reviews;