import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
} from "react-icons/fa";

import "../styles/BusinessReviews.css";

const API_BASE_URL =
  "http://localhost:5213";

const REVIEW_MEDIA_PREVIEW_COUNT = 2;

function BusinessReviews() {
  const { businessId } = useParams();

  const navigate = useNavigate();

  const [business, setBusiness] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize] =
    useState(10);

  const [totalReviews, setTotalReviews] =
    useState(0);

  const [hasMore, setHasMore] =
    useState(false);

  // =====================================================
  // VIEW MORE / VIEW LESS
  // =====================================================

  const [expandedReviews, setExpandedReviews] =
    useState(new Set());

  const [longReviews, setLongReviews] =
    useState(new Set());

  const commentRefs =
    useRef({});

  // =====================================================
  // MEDIA MODAL
  // =====================================================

  const [selectedReviewMedia, setSelectedReviewMedia] =
    useState(null);

  const [selectedReviewMediaIndex, setSelectedReviewMediaIndex] =
    useState(0);

  // =====================================================
  // LOAD BUSINESS + REVIEWS
  // =====================================================

  useEffect(() => {
    loadBusinessAndReviews();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // =====================================================
  // LOAD BUSINESS AND FIRST REVIEW PAGE
  // =====================================================

  const loadBusinessAndReviews =
    async () => {
      try {
        setLoading(true);
        setReviewsLoading(true);

        if (!businessId) {
          return;
        }

        // =================================================
        // BUSINESS DETAILS
        // =================================================

        const businessResponse =
          await getBusinessDetails(
            businessId
          );

        console.log(
          "VIEW ALL BUSINESS DETAILS:",
          businessResponse.data
        );

        const businessData =
          businessResponse.data?.data ||
          businessResponse.data ||
          null;

        setBusiness(
          businessData
        );

        // =================================================
        // FIRST REVIEW PAGE
        // =================================================

        await loadReviews(
          1,
          false
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
  // LOAD REVIEWS
  // =====================================================

  const loadReviews =
    async (
      page = 1,
      append = false
    ) => {
      try {
        setReviewsLoading(true);

        const reviewResponse =
          await getBusinessReviews(
            businessId,
            page,
            pageSize
          );

        console.log(
          "VIEW ALL BUSINESS REVIEWS API:",
          reviewResponse.data
        );

        const responseData =
          reviewResponse.data?.data ??
          reviewResponse.data?.Data ??
          reviewResponse.data;

        let reviewData = [];

        let total = 0;

        let more = false;

        // =================================================
        // PAGINATED RESPONSE
        // =================================================

        if (
          responseData &&
          !Array.isArray(
            responseData
          )
        ) {
          reviewData =
            responseData.reviews ??
            responseData.Reviews ??
            responseData.items ??
            responseData.Items ??
            [];

          total =
            Number(
              responseData.totalReviews ??
              responseData.TotalReviews ??
              responseData.totalCount ??
              responseData.TotalCount ??
              0
            );

          more =
            Boolean(
              responseData.hasMore ??
              responseData.HasMore ??
              false
            );
        }

        // =================================================
        // DIRECT ARRAY RESPONSE
        // =================================================

        else if (
          Array.isArray(
            responseData
          )
        ) {
          reviewData =
            responseData;

          total =
            responseData.length;

          more = false;
        }

        const finalReviews =
          Array.isArray(
            reviewData
          )
            ? reviewData
            : [];

        console.log(
          "FINAL ALL BUSINESS REVIEWS:",
          finalReviews
        );

        // =================================================
        // DEBUG MEDIA
        // =================================================

        finalReviews.forEach(
          (
            review,
            index
          ) => {
            console.log(
              `REVIEW ${index + 1} MEDIA:`,
              {
                ReviewId:
                  review?.ReviewId ??
                  review?.reviewId,

                reviewMedia:
                  review?.reviewMedia,

                ReviewMedia:
                  review?.ReviewMedia,

                media:
                  review?.media,

                Media:
                  review?.Media,

                reviewMedias:
                  review?.reviewMedias,

                ReviewMedias:
                  review?.ReviewMedias,
              }
            );
          }
        );

        // =================================================
        // APPEND REVIEWS
        // =================================================

        if (append) {
          setReviews(
            (previous) => [
              ...previous,
              ...finalReviews,
            ]
          );
        } else {
          setReviews(
            finalReviews
          );

          setExpandedReviews(
            new Set()
          );

          setLongReviews(
            new Set()
          );
        }

        setTotalReviews(
          total
        );

        setCurrentPage(
          page
        );

        setHasMore(
          more
        );

      } catch (error) {
        console.error(
          "Failed to load business reviews:",
          error
        );

        if (!append) {
          setReviews([]);
          setTotalReviews(0);
        }

        setHasMore(false);

      } finally {
        setReviewsLoading(false);
      }
    };

  // =====================================================
  // LOAD MORE
  // =====================================================

  const handleLoadMore =
    async () => {
      if (
        reviewsLoading ||
        !hasMore
      ) {
        return;
      }

      const nextPage =
        currentPage + 1;

      await loadReviews(
        nextPage,
        true
      );
    };

  // =====================================================
  // GET REVIEWER NAME
  // =====================================================

  const getReviewerName =
    (review) => {
      if (review.UserName) {
        return review.UserName;
      }

      if (review.userName) {
        return review.userName;
      }

      if (
        typeof review.User ===
        "string"
      ) {
        return review.User;
      }

      if (
        typeof review.user ===
        "string"
      ) {
        return review.user;
      }

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
  // GET REVIEWER ID
  // =====================================================

  const getReviewerId =
    (review) => {
      return (
        review.UserId ??
        review.userId ??
        review.User?.Id ??
        review.user?.id ??
        null
      );
    };

  // =====================================================
  // GET REVIEW ID
  // =====================================================

  const getReviewId =
    (
      review,
      index
    ) => {
      const reviewId =
        review.ReviewId ??
        review.reviewId ??
        review.id ??
        review.Id ??
        null;

      if (
        reviewId !== null &&
        reviewId !== undefined
      ) {
        return Number(
          reviewId
        );
      }

      return `review-${index}`;
    };

  // =====================================================
  // OPEN USER PROFILE
  // =====================================================

  const handleReviewerProfile =
    (review) => {
      const reviewerId =
        getReviewerId(
          review
        );

      const reviewId =
        getReviewId(
          review
        );

      if (
        !reviewerId ||
        !reviewId ||
        typeof reviewId !==
          "number"
      ) {
        console.warn(
          "Cannot open reviewer profile.",
          {
            reviewerId,
            reviewId,
            review,
          }
        );

        return;
      }

      navigate(
        `/user-profile/${reviewerId}/review/${reviewId}`
      );
    };

  // =====================================================
  // GET RATING
  // =====================================================

  const getRating =
    (review) => {
      return Number(
        review.Rating ??
        review.rating ??
        0
      );
    };

  // =====================================================
  // GET COMMENT
  // =====================================================

  const getComment =
    (review) => {
      return (
        review.Comment ??
        review.comment ??
        ""
      );
    };

  // =====================================================
  // GET DATE
  // =====================================================

  const getDate =
    (review) => {
      return (
        review.CreatedAt ??
        review.createdAt ??
        null
      );
    };

  // =====================================================
  // GET REVIEW MEDIA
  // =====================================================

  const getReviewMedia =
    (review) => {
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

      return Array.isArray(
        possibleMedia
      )
        ? possibleMedia
        : [];
    };

  // =====================================================
  // GET MEDIA URL
  // =====================================================

  const getMediaUrl =
    (media) => {
      if (!media) {
        return "";
      }

      const rawUrl =
        typeof media ===
        "string"
          ? media
          : (
              media.MediaUrl ??
              media.mediaUrl ??
              media.Url ??
              media.url ??
              media.FileUrl ??
              media.fileUrl ??
              ""
            );

      if (!rawUrl) {
        return "";
      }

      const cleanUrl =
        String(
          rawUrl
        ).trim();

      if (!cleanUrl) {
        return "";
      }

      // Data URL
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

      // Already absolute URL
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

      // Relative backend URL
      return `${API_BASE_URL}${
        cleanUrl.startsWith("/")
          ? cleanUrl
          : `/${cleanUrl}`
      }`;
    };

  // =====================================================
  // CHECK VIDEO
  // =====================================================

  const isVideoMedia =
    (media) => {
      if (!media) {
        return false;
      }

      const mediaType =
        String(
          media.MediaType ??
          media.mediaType ??
          media.Type ??
          media.type ??
          ""
        ).toLowerCase();

      const mediaUrl =
        String(
          media.MediaUrl ??
          media.mediaUrl ??
          media.Url ??
          media.url ??
          ""
        ).toLowerCase();

      return (
        mediaType.includes(
          "video"
        ) ||
        mediaType.includes(
          "mp4"
        ) ||
        mediaType.includes(
          "webm"
        ) ||
        mediaType.includes(
          "mov"
        ) ||
        mediaUrl.includes(
          ".mp4"
        ) ||
        mediaUrl.includes(
          ".webm"
        ) ||
        mediaUrl.includes(
          ".mov"
        ) ||
        mediaUrl.includes(
          ".avi"
        ) ||
        mediaUrl.includes(
          ".m4v"
        )
      );
    };

  // =====================================================
  // NORMALIZE REVIEW MEDIA
  // =====================================================

  const getValidReviewMedia =
    (
      review,
      reviewId
    ) => {
      const mediaList =
        getReviewMedia(
          review
        );

      if (
        !Array.isArray(
          mediaList
        )
      ) {
        return [];
      }

      return mediaList
        .map(
          (
            media,
            mediaIndex
          ) => {
            const mediaUrl =
              getMediaUrl(
                media
              );

            if (!mediaUrl) {
              return null;
            }

            const mediaId =
              media?.ReviewMediaId ??
              media?.reviewMediaId ??
              media?.MediaId ??
              media?.mediaId ??
              media?.id ??
              media?.Id ??
              `${reviewId}-media-${mediaIndex}`;

            return {
              ...(
                typeof media ===
                "object"
                  ? media
                  : {}
              ),

              mediaId:
                String(
                  mediaId
                ),

              mediaUrl,

              mediaIndex,
            };
          }
        )
        .filter(Boolean);
    };

  // =====================================================
  // TOGGLE VIEW MORE / VIEW LESS
  // =====================================================

  const toggleReviewComment =
    (reviewId) => {
      const key =
        String(
          reviewId
        );

      setExpandedReviews(
        (previous) => {
          const updated =
            new Set(
              previous
            );

          if (
            updated.has(key)
          ) {
            updated.delete(
              key
            );
          } else {
            updated.add(
              key
            );
          }

          return updated;
        }
      );
    };

  // =====================================================
  // CHECK COMMENT OVERFLOW
  // =====================================================

  const checkCommentOverflow =
    (reviewId) => {
      const element =
        commentRefs.current[
          String(
            reviewId
          )
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
            new Set(
              previous
            );

          if (isOverflowing) {
            updated.add(
              String(
                reviewId
              )
            );
          } else {
            updated.delete(
              String(
                reviewId
              )
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
    const checkAllComments =
      () => {
        reviews.forEach(
          (
            review,
            index
          ) => {
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

    // Wait until DOM is painted
    const timeout =
      setTimeout(
        () => {
          checkAllComments();

          requestAnimationFrame(
            () => {
              checkAllComments();
            }
          );
        },
        100
      );

    window.addEventListener(
      "resize",
      checkAllComments
    );

    return () => {
      clearTimeout(
        timeout
      );

      window.removeEventListener(
        "resize",
        checkAllComments
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  // =====================================================
  // OPEN MEDIA GALLERY
  // =====================================================

  const openReviewMediaGallery =
    (
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

      const safeIndex =
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
        safeIndex
      );
    };

  // =====================================================
  // CLOSE MEDIA GALLERY
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
  // NEXT MEDIA
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
  // PREVIOUS MEDIA
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
            ? selectedReviewMedia.length - 1
            : previous - 1
      );
    };

  // =====================================================
  // MEDIA KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {
    if (
      !selectedReviewMedia
    ) {
      return;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeReviewMediaGallery();
        }

        if (
          event.key ===
          "ArrowRight"
        ) {
          showNextReviewMedia();
        }

        if (
          event.key ===
          "ArrowLeft"
        ) {
          showPreviousReviewMedia();
        }
      };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        oldOverflow;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReviewMedia]);

  // =====================================================
  // RELATIVE DATE
  // =====================================================

  const getRelativeDate =
    (dateValue) => {
      if (!dateValue) {
        return "";
      }

      const reviewDate =
        new Date(
          dateValue
        );

      if (
        Number.isNaN(
          reviewDate.getTime()
        )
      ) {
        return "";
      }

      const now =
        new Date();

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
        return `${Math.floor(
          days / 7
        )} weeks ago`;
      }

      if (days < 365) {
        return `${Math.floor(
          days / 30
        )} months ago`;
      }

      return `${Math.floor(
        days / 365
      )} years ago`;
    };

  // =====================================================
  // RENDER STARS
  // =====================================================

  const renderStars =
    (rating) => {
      const numericRating =
        Number(
          rating
        ) || 0;

      return (
        <div className="all-review-stars">

          {[1, 2, 3, 4, 5].map(
            (star) => (
              <FaStar
                key={star}
                className={
                  star <=
                  numericRating
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

  const averageRating =
    () => {
      const businessRating =
        Number(
          business?.averageRating ??
          business?.AverageRating ??
          business?.rating ??
          business?.Rating ??
          0
        );

      if (
        businessRating > 0 &&
        Number.isFinite(
          businessRating
        )
      ) {
        return businessRating.toFixed(
          1
        );
      }

      if (
        reviews.length > 0
      ) {
        const total =
          reviews.reduce(
            (
              sum,
              review
            ) =>
              sum +
              getRating(
                review
              ),
            0
          );

        return (
          total /
          reviews.length
        ).toFixed(1);
      }

      return "0.0";
    };

  // =====================================================
  // CURRENT MODAL MEDIA
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

        <div className="all-business-reviews-page">

          <button
            className="all-reviews-back-btn"
            onClick={() =>
              navigate(-1)
            }
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
            onClick={() =>
              navigate(-1)
            }
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
          onClick={() =>
            navigate(-1)
          }
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

            {(address ||
              city) && (
              <div className="all-reviews-location">

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

            <div className="all-reviews-summary">

              <FaStar />

              <strong>
                {averageRating()}
              </strong>

              <span>
                (
                {
                  totalReviews ||
                  reviews.length
                }{" "}
                Reviews)
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
            {
              totalReviews ||
              reviews.length
            }{" "}
            Reviews
          </strong>

        </div>

        {/* =================================================
            LOADING REVIEWS
        ================================================= */}

        {reviewsLoading &&
          reviews.length === 0 && (
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

        {reviews.length > 0 && (

          <div className="all-reviews-list">

            {reviews.map(
              (
                review,
                index
              ) => {

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

                const reviewerId =
                  getReviewerId(
                    review
                  );

                const canOpenProfile =
                  Boolean(
                    reviewerId &&
                    typeof reviewId ===
                      "number"
                  );

                // =================================================
                // MEDIA
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

                const remainingMediaCount =
                  Math.max(
                    validReviewMedia.length -
                      REVIEW_MEDIA_PREVIEW_COUNT,
                    0
                  );

                // =================================================
                // COMMENT STATE
                // =================================================

                const reviewKey =
                  String(
                    reviewId
                  );

                const isExpanded =
                  expandedReviews.has(
                    reviewKey
                  );

                const isLongReview =
                  longReviews.has(
                    reviewKey
                  );

                return (
                  <div
                    className="all-review-card"
                    key={reviewKey}
                  >

                    {/* =================================================
                        REVIEW TOP
                    ================================================= */}

                    <div className="all-review-top">

                      <div className="all-review-user">

                        <button
                          type="button"
                          className="all-review-avatar"
                          onClick={() =>
                            handleReviewerProfile(
                              review
                            )
                          }
                          disabled={
                            !canOpenProfile
                          }
                          title={
                            canOpenProfile
                              ? "View reviewer profile"
                              : "Reviewer profile unavailable"
                          }
                          aria-label={
                            canOpenProfile
                              ? `View ${reviewerName}'s profile`
                              : "Reviewer profile unavailable"
                          }
                        >

                          {reviewerName
                            .charAt(0)
                            .toUpperCase()}

                        </button>

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

                    {/* =================================================
                        COMMENT
                    ================================================= */}

                    {comment && (

                      <div className="all-review-comment-wrapper">

                        <p
                          ref={(element) => {
                            commentRefs.current[
                              reviewKey
                            ] =
                              element;
                          }}
                          className={
                            isExpanded
                              ? "all-review-comment expanded"
                              : "all-review-comment"
                          }
                          style={
                            isExpanded
                              ? {
                                  display:
                                    "block",
                                  overflow:
                                    "visible",
                                  maxHeight:
                                    "none",
                                }
                              : {
                                  display:
                                    "-webkit-box",
                                  WebkitLineClamp:
                                    2,
                                  WebkitBoxOrient:
                                    "vertical",
                                  overflow:
                                    "hidden",
                                  maxHeight:
                                    "none",
                                }
                          }
                        >
                          "{comment}"
                        </p>

                        {isLongReview && (
                          <button
                            type="button"
                            className="all-review-view-more-btn"
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

                    {/* =================================================
                        REVIEW MEDIA
                    ================================================= */}

                    {visibleReviewMedia.length >
                      0 && (

                      <div
                        className="all-review-media-gallery"
                        style={{
                          display:
                            "flex",
                          gap:
                            "10px",
                          marginTop:
                            "14px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {visibleReviewMedia.map(
                          (
                            media,
                            mediaIndex
                          ) => {

                            const isLastVisible =
                              mediaIndex ===
                              visibleReviewMedia.length -
                                1;

                            const showMore =
                              isLastVisible &&
                              remainingMediaCount >
                                0;

                            const handleMediaClick =
                              () => {
                                openReviewMediaGallery(
                                  validReviewMedia,
                                  mediaIndex
                                );
                              };

                            return (
                              <div
                                key={
                                  media.mediaId
                                }
                                className="all-review-media-item"
                                onClick={
                                  handleMediaClick
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(
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
                                }}
                                style={{
                                  position:
                                    "relative",
                                  width:
                                    "120px",
                                  height:
                                    "100px",
                                  borderRadius:
                                    "10px",
                                  overflow:
                                    "hidden",
                                  cursor:
                                    "pointer",
                                  flexShrink:
                                    0,
                                }}
                              >

                                {isVideoMedia(
                                  media
                                ) ? (

                                  <video
                                    src={
                                      media.mediaUrl
                                    }
                                    className="all-review-media-video"
                                    muted
                                    preload="metadata"
                                    style={{
                                      width:
                                        "100%",
                                      height:
                                        "100%",
                                      objectFit:
                                        "cover",
                                      display:
                                        "block",
                                    }}
                                  />

                                ) : (

                                  <img
                                    src={
                                      media.mediaUrl
                                    }
                                    className="all-review-media-image"
                                    alt={`Review media ${
                                      mediaIndex +
                                      1
                                    }`}
                                    loading="lazy"
                                    style={{
                                      width:
                                        "100%",
                                      height:
                                        "100%",
                                      objectFit:
                                        "cover",
                                      display:
                                        "block",
                                    }}
                                  />

                                )}

                                {/* VIDEO ICON */}

                                {isVideoMedia(
                                  media
                                ) && (
                                  <div
                                    style={{
                                      position:
                                        "absolute",
                                      top:
                                        "50%",
                                      left:
                                        "50%",
                                      transform:
                                        "translate(-50%, -50%)",
                                      width:
                                        "34px",
                                      height:
                                        "34px",
                                      borderRadius:
                                        "50%",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      background:
                                        "rgba(0,0,0,0.65)",
                                      color:
                                        "#fff",
                                      pointerEvents:
                                        "none",
                                    }}
                                  >
                                    <FaPlay
                                      size={
                                        13
                                      }
                                    />
                                  </div>
                                )}

                                {/* + MORE OVERLAY */}

                                {showMore && (
                                  <div
                                    style={{
                                      position:
                                        "absolute",
                                      inset:
                                        0,
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      background:
                                        "rgba(0,0,0,0.55)",
                                      color:
                                        "#fff",
                                      fontWeight:
                                        "700",
                                      fontSize:
                                        "16px",
                                    }}
                                  >
                                    +
                                    {
                                      remainingMediaCount
                                    }{" "}
                                    More
                                  </div>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                    {/* =================================================
                        OWNER REPLY
                    ================================================= */}

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

        {/* =================================================
            LOAD MORE
        ================================================= */}

        {!reviewsLoading &&
          hasMore && (

            <div className="view-all-reviews-wrapper">

              <button
                className="view-all-reviews-btn"
                onClick={
                  handleLoadMore
                }
                disabled={
                  reviewsLoading
                }
              >
                Load More Reviews
              </button>

            </div>
          )}

        {/* =================================================
            LOADING MORE
        ================================================= */}

        {reviewsLoading &&
          reviews.length > 0 && (

            <div className="all-reviews-loading">
              Loading more reviews...
            </div>
          )}

      </div>

      {/* =====================================================
          MEDIA MODAL
      ===================================================== */}

      {selectedReviewMedia &&
        currentReviewMedia && (

          <div
            className="all-review-media-modal"
            onClick={
              closeReviewMediaGallery
            }
            style={{
              position:
                "fixed",
              inset:
                0,
              zIndex:
                9999,
              background:
                "rgba(0,0,0,0.88)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "20px",
            }}
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={
                closeReviewMediaGallery
              }
              aria-label="Close"
              style={{
                position:
                  "absolute",
                top:
                  "20px",
                right:
                  "20px",
                width:
                  "42px",
                height:
                  "42px",
                border:
                  "none",
                borderRadius:
                  "50%",
                background:
                  "rgba(255,255,255,0.15)",
                color:
                  "#fff",
                cursor:
                  "pointer",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "18px",
                zIndex:
                  2,
              }}
            >
              <FaTimes />
            </button>

            {/* PREVIOUS */}

            {selectedReviewMedia.length >
              1 && (

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  showPreviousReviewMedia();
                }}
                aria-label="Previous media"
                style={{
                  position:
                    "absolute",
                  left:
                    "20px",
                  top:
                    "50%",
                  transform:
                    "translateY(-50%)",
                  width:
                    "45px",
                  height:
                    "45px",
                  border:
                    "none",
                  borderRadius:
                    "50%",
                  background:
                    "rgba(255,255,255,0.15)",
                  color:
                    "#fff",
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  zIndex:
                    2,
                }}
              >
                <FaChevronLeft />
              </button>
            )}

            {/* MEDIA */}

            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                maxWidth:
                  "90vw",
                maxHeight:
                  "85vh",
                display:
                  "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
              }}
            >

              {isVideoMedia(
                currentReviewMedia
              ) ? (

                <video
                  src={
                    currentReviewMedia.mediaUrl
                  }
                  controls
                  autoPlay
                  style={{
                    maxWidth:
                      "90vw",
                    maxHeight:
                      "80vh",
                    borderRadius:
                      "10px",
                  }}
                />

              ) : (

                <img
                  src={
                    currentReviewMedia.mediaUrl
                  }
                  alt={`Review media ${
                    selectedReviewMediaIndex +
                    1
                  }`}
                  style={{
                    maxWidth:
                      "90vw",
                    maxHeight:
                      "80vh",
                    objectFit:
                      "contain",
                    borderRadius:
                      "10px",
                  }}
                />

              )}

            </div>

            {/* NEXT */}

            {selectedReviewMedia.length >
              1 && (

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  showNextReviewMedia();
                }}
                aria-label="Next media"
                style={{
                  position:
                    "absolute",
                  right:
                    "20px",
                  top:
                    "50%",
                  transform:
                    "translateY(-50%)",
                  width:
                    "45px",
                  height:
                    "45px",
                  border:
                    "none",
                  borderRadius:
                    "50%",
                  background:
                    "rgba(255,255,255,0.15)",
                  color:
                    "#fff",
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  zIndex:
                    2,
                }}
              >
                <FaChevronRight />
              </button>
            )}

            {/* COUNTER */}

            <div
              style={{
                position:
                  "absolute",
                bottom:
                  "25px",
                left:
                  "50%",
                transform:
                  "translateX(-50%)",
                color:
                  "#fff",
                background:
                  "rgba(0,0,0,0.5)",
                padding:
                  "7px 14px",
                borderRadius:
                  "20px",
                fontSize:
                  "14px",
                fontWeight:
                  "600",
              }}
            >
              {selectedReviewMediaIndex +
                1}{" "}
              /{" "}
              {
                selectedReviewMedia.length
              }
            </div>

          </div>
        )}

    </MainLayout>
  );
}

export default BusinessReviews;