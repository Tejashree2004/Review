import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getUserPublicProfile,
  getUserReviews,
} from "../services/reviewService";

import {
  FaArrowLeft,
  FaStar,
  FaUserCircle,
  FaMapMarkerAlt,
  FaStore,
  FaChevronDown,
} from "react-icons/fa";

import "../styles/UserPublicProfile.css";

function UserPublicProfile() {
  const {
    userId,
    reviewId: routeReviewId,
  } = useParams();

  const [searchParams] = useSearchParams();

  // Supports both:
  // /user-profile/:userId/review/:reviewId
  // /user-profile/:userId?reviewId=:reviewId
  const reviewId =
    routeReviewId ??
    searchParams.get("reviewId");

  const navigate = useNavigate();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // ALL USER REVIEWS STATE
  // =====================================================

  const [userReviews, setUserReviews] = useState([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [reviewsError, setReviewsError] =
    useState("");

  const [reviewsPage, setReviewsPage] =
    useState(1);

  const [reviewsPageSize] =
    useState(10);

  const [hasMoreReviews, setHasMoreReviews] =
    useState(false);

  const [loadingMoreReviews, setLoadingMoreReviews] =
    useState(false);

  // =====================================================
  // EXPANDED REVIEW COMMENTS
  // =====================================================

  const [expandedReviews, setExpandedReviews] =
    useState({});

  // =====================================================
  // LONG REVIEW COMMENTS
  // =====================================================

  const [longReviews, setLongReviews] =
    useState({});

  // =====================================================
  // WORD-BASED TRUNCATED COMMENTS
  //
  // Stores the exact text that can fit within
  // two rendered lines without cutting a word.
  // =====================================================

  const [truncatedReviews, setTruncatedReviews] =
    useState({});

  /*
   * Ref points to the actual comment paragraph.
   *
   * We use a hidden measurement element to determine
   * how many COMPLETE words can fit in two lines.
   */
  const commentRefs = useRef({});

  // =====================================================
  // LOAD USER PUBLIC PROFILE
  // =====================================================

  useEffect(() => {
    loadUserPublicProfile();
  }, [userId, reviewId]);

  // =====================================================
  // LOAD ALL USER REVIEWS
  // =====================================================

  useEffect(() => {
    if (userId) {
      loadUserReviews(1, true);
    }
  }, [userId]);

  // =====================================================
  // MEASURE COMMENTS
  //
  // IMPORTANT:
  //
  // We do NOT use CSS line-clamp to cut the actual text.
  //
  // Instead:
  //
  // 1. Check whether the complete comment exceeds 2 lines.
  // 2. If it does, find the maximum COMPLETE words that
  //    fit inside exactly 2 lines.
  // 3. Add "..." after that complete word.
  //
  // Therefore words are never cut in the middle.
  // =====================================================

  useEffect(() => {
    if (!userReviews.length) {
      setLongReviews({});
      setTruncatedReviews({});
      return;
    }

    let cancelled = false;
    let resizeFrame = null;

    const measureComments = () => {
      if (cancelled) {
        return;
      }

      const measuredLongReviews = {};
      const measuredTruncatedReviews = {};

      Object.entries(commentRefs.current).forEach(
        ([id, element]) => {
          if (!element) {
            return;
          }

          const reviewIndex =
            userReviews.findIndex(
              (review, index) => {
                const currentId =
                  review?.reviewId ??
                  review?.ReviewId ??
                  `review-${index}`;

                return String(currentId) === String(id);
              }
            );

          if (reviewIndex === -1) {
            return;
          }

          const review =
            userReviews[reviewIndex];

          const originalComment =
            review?.comment ??
            review?.Comment ??
            "";

          if (
            !originalComment ||
            !originalComment.trim()
          ) {
            return;
          }

          const computedStyle =
            window.getComputedStyle(element);

          let lineHeight =
            parseFloat(
              computedStyle.lineHeight
            );

          if (Number.isNaN(lineHeight)) {
            const fontSize =
              parseFloat(
                computedStyle.fontSize
              ) || 14;

            lineHeight =
              fontSize * 1.7;
          }

          // -------------------------------------------------
          // Create hidden measurement container.
          //
          // It copies the exact width/font/line-height
          // of the visible comment text.
          // -------------------------------------------------

          const measurement =
            document.createElement("div");

          measurement.style.position =
            "fixed";

          measurement.style.left =
            "-100000px";

          measurement.style.top =
            "0";

          measurement.style.visibility =
            "hidden";

          measurement.style.pointerEvents =
            "none";

          measurement.style.zIndex =
            "-1";

          measurement.style.boxSizing =
            "border-box";

          measurement.style.width =
            `${element.clientWidth}px`;

          measurement.style.maxWidth =
            `${element.clientWidth}px`;

          measurement.style.margin =
            "0";

          measurement.style.padding =
            "0";

          measurement.style.border =
            "0";

          measurement.style.fontFamily =
            computedStyle.fontFamily;

          measurement.style.fontSize =
            computedStyle.fontSize;

          measurement.style.fontWeight =
            computedStyle.fontWeight;

          measurement.style.fontStyle =
            computedStyle.fontStyle;

          measurement.style.letterSpacing =
            computedStyle.letterSpacing;

          measurement.style.lineHeight =
            computedStyle.lineHeight;

          measurement.style.wordBreak =
            computedStyle.wordBreak;

          measurement.style.overflowWrap =
            computedStyle.overflowWrap;

          measurement.style.whiteSpace =
            "normal";

          document.body.appendChild(
            measurement
          );

          const fullText =
            `"${originalComment.trim()}"`;

          // -------------------------------------------------
          // Check complete comment height.
          // -------------------------------------------------

          measurement.textContent =
            fullText;

          const fullHeight =
            measurement.scrollHeight;

          const twoLineHeight =
            lineHeight * 2;

          const isLong =
            fullHeight >
            twoLineHeight + 2;

          measuredLongReviews[id] =
            isLong;

          // -------------------------------------------------
          // Short comment:
          //
          // Keep it exactly as it is.
          // -------------------------------------------------

          if (!isLong) {
            measurement.remove();

            return;
          }

          // -------------------------------------------------
          // LONG COMMENT
          //
          // Find the maximum COMPLETE words that fit
          // inside two lines together with "...".
          //
          // Binary search makes this efficient even for
          // very long reviews.
          // -------------------------------------------------

          const words =
            originalComment
              .trim()
              .split(/\s+/);

          let low = 1;
          let high = words.length;
          let bestText = "";

          const fitsInTwoLines =
            (candidateText) => {
              measurement.textContent =
                `"${candidateText}..."`;

              return (
                measurement.scrollHeight <=
                twoLineHeight + 2
              );
            };

          // -------------------------------------------------
          // First make sure at least one word is tested.
          // -------------------------------------------------

          if (
            !fitsInTwoLines(
              words[0]
            )
          ) {
            /*
             * Extremely narrow screens can theoretically
             * make even one word + "..." too tall.
             *
             * In that case we still keep the first complete
             * word instead of cutting it.
             */
            bestText =
              words[0];
          } else {
            while (low <= high) {
              const middle =
                Math.floor(
                  (low + high) / 2
                );

              const candidate =
                words
                  .slice(0, middle)
                  .join(" ");

              if (
                fitsInTwoLines(
                  candidate
                )
              ) {
                bestText =
                  candidate;

                low =
                  middle + 1;
              } else {
                high =
                  middle - 1;
              }
            }
          }

          // -------------------------------------------------
          // Store word-safe truncated text.
          // -------------------------------------------------

          measuredTruncatedReviews[id] =
            bestText;

          measurement.remove();
        }
      );

      if (!cancelled) {
        setLongReviews(
          measuredLongReviews
        );

        setTruncatedReviews(
          measuredTruncatedReviews
        );
      }
    };

    // Wait for DOM layout.
    const frame =
      requestAnimationFrame(
        measureComments
      );

    // Recalculate when viewport changes.
    const handleResize = () => {
      if (resizeFrame) {
        cancelAnimationFrame(
          resizeFrame
        );
      }

      resizeFrame =
        requestAnimationFrame(
          measureComments
        );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // Recalculate after fonts are ready.
    if (
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          requestAnimationFrame(
            measureComments
          );
        }
      });
    }

    return () => {
      cancelled = true;

      cancelAnimationFrame(frame);

      if (resizeFrame) {
        cancelAnimationFrame(
          resizeFrame
        );
      }

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [userReviews]);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadUserPublicProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userId || !reviewId) {
        setError(
          "Invalid user or review information."
        );
        return;
      }

      const response =
        await getUserPublicProfile(
          userId,
          reviewId
        );

      console.log(
        "USER PUBLIC PROFILE API:",
        response.data
      );

      const responseData =
        response.data?.data ??
        response.data?.Data ??
        response.data;

      if (!responseData) {
        setError(
          "User profile or review not found."
        );
        return;
      }

      setProfile(responseData);
    } catch (error) {
      console.error(
        "Failed to load user public profile:",
        error
      );

      setProfile(null);

      setError(
        error.response?.data?.message ||
          "Failed to load user profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ALL REVIEWS BY USER
  // =====================================================

  const loadUserReviews = async (
    page = 1,
    replace = false
  ) => {
    try {
      if (replace) {
        setReviewsLoading(true);
        setReviewsError("");
      } else {
        setLoadingMoreReviews(true);
      }

      const response =
        await getUserReviews(
          userId,
          page,
          reviewsPageSize
        );

      console.log(
        "USER ALL REVIEWS API:",
        response.data
      );

      const responseData =
        response.data?.data ??
        response.data?.Data ??
        response.data;

      if (!responseData) {
        if (replace) {
          setUserReviews([]);
        }

        setHasMoreReviews(false);
        return;
      }

      const incomingReviews =
        responseData?.reviews ??
        responseData?.Reviews ??
        [];

      const totalPages =
        responseData?.totalPages ??
        responseData?.TotalPages ??
        0;

      const hasMore =
        responseData?.hasMore ??
        responseData?.HasMore ??
        page < totalPages;

      if (replace) {
        setUserReviews(
          incomingReviews
        );
      } else {
        setUserReviews(
          (previousReviews) => {
            const existingIds =
              new Set(
                previousReviews.map(
                  (review) =>
                    review?.reviewId ??
                    review?.ReviewId
                )
              );

            const newReviews =
              incomingReviews.filter(
                (review) => {
                  const id =
                    review?.reviewId ??
                    review?.ReviewId;

                  return !existingIds.has(
                    id
                  );
                }
              );

            return [
              ...previousReviews,
              ...newReviews,
            ];
          }
        );
      }

      setReviewsPage(page);
      setHasMoreReviews(hasMore);
    } catch (error) {
      console.error(
        "Failed to load user's reviews:",
        error
      );

      if (replace) {
        setReviewsError(
          error.response?.data?.message ||
            "Failed to load user's reviews."
        );
      }
    } finally {
      setReviewsLoading(false);
      setLoadingMoreReviews(false);
    }
  };

  // =====================================================
  // LOAD MORE REVIEWS
  // =====================================================

  const handleLoadMoreReviews = () => {
    if (
      loadingMoreReviews ||
      !hasMoreReviews
    ) {
      return;
    }

    loadUserReviews(
      reviewsPage + 1,
      false
    );
  };

  // =====================================================
  // TOGGLE REVIEW COMMENT
  // =====================================================

  const handleToggleReview = (
    reviewKey
  ) => {
    if (!reviewKey) {
      return;
    }

    setExpandedReviews(
      (previous) => ({
        ...previous,
        [reviewKey]:
          !previous[reviewKey],
      })
    );
  };

  // =====================================================
  // GET USER
  // =====================================================

  const getUser = () => {
    return (
      profile?.user ??
      profile?.User ??
      null
    );
  };

  // =====================================================
  // GET USER NAME
  // =====================================================

  const getUserName = () => {
    const user = getUser();

    return (
      user?.fullName ??
      user?.FullName ??
      "Anonymous User"
    );
  };

  // =====================================================
  // GET USER CREATED AT
  // =====================================================

  const getUserCreatedAt = () => {
    const user = getUser();

    return (
      user?.createdAt ??
      user?.CreatedAt ??
      null
    );
  };

  // =====================================================
  // GET REVIEW ITEM ID
  // =====================================================

  const getReviewItemId = (
    review
  ) => {
    return (
      review?.reviewId ??
      review?.ReviewId ??
      null
    );
  };

  // =====================================================
  // GET REVIEW RATING
  // =====================================================

  const getReviewItemRating = (
    review
  ) => {
    return Number(
      review?.rating ??
        review?.Rating ??
        0
    );
  };

  // =====================================================
  // GET REVIEW COMMENT
  // =====================================================

  const getReviewItemComment = (
    review
  ) => {
    return (
      review?.comment ??
      review?.Comment ??
      ""
    );
  };

  // =====================================================
  // GET REVIEW DATE
  // =====================================================

  const getReviewItemDate = (
    review
  ) => {
    return (
      review?.createdAt ??
      review?.CreatedAt ??
      null
    );
  };

  // =====================================================
  // GET BUSINESS ID
  // =====================================================

  const getBusinessId = (
    review
  ) => {
    const business =
      review?.business ??
      review?.Business ??
      null;

    return (
      review?.businessId ??
      review?.BusinessId ??
      business?.businessId ??
      business?.BusinessId ??
      null
    );
  };

  // =====================================================
  // GET BUSINESS NAME
  // =====================================================

  const getBusinessName = (
    review
  ) => {
    const business =
      review?.business ??
      review?.Business ??
      null;

    return (
      review?.businessName ??
      review?.BusinessName ??
      business?.businessName ??
      business?.BusinessName ??
      null
    );
  };

  // =====================================================
  // GET PLACE ID
  // =====================================================

  const getPlaceId = (
    review
  ) => {
    const place =
      review?.place ??
      review?.Place ??
      null;

    return (
      review?.placeId ??
      review?.PlaceId ??
      place?.placeId ??
      place?.PlaceId ??
      null
    );
  };

  // =====================================================
  // GET PLACE NAME
  // =====================================================

  const getPlaceName = (
    review
  ) => {
    const place =
      review?.place ??
      review?.Place ??
      null;

    return (
      review?.placeName ??
      review?.PlaceName ??
      place?.name ??
      place?.Name ??
      null
    );
  };

  // =====================================================
  // GET REVIEW LOCATION
  // =====================================================

  const getReviewLocation = (
    review
  ) => {
    const business =
      review?.business ??
      review?.Business ??
      null;

    const address =
      review?.businessAddress ??
      review?.BusinessAddress ??
      business?.address ??
      business?.Address ??
      "";

    const city =
      review?.businessCity ??
      review?.BusinessCity ??
      business?.city ??
      business?.City ??
      "";

    const pincode =
      review?.businessPincode ??
      review?.BusinessPincode ??
      business?.pincode ??
      business?.Pincode ??
      "";

    const cleanAddress =
      typeof address === "string"
        ? address.trim()
        : "";

    const cleanCity =
      typeof city === "string"
        ? city.trim()
        : "";

    const cleanPincode =
      typeof pincode === "string"
        ? pincode.trim()
        : "";

    const primaryLocation = [
      cleanAddress,
      cleanCity,
    ].filter(Boolean);

    if (
      primaryLocation.length > 0
    ) {
      return primaryLocation.join(
        ", "
      );
    }

    if (cleanPincode) {
      return cleanPincode;
    }

    const genericLocation =
      review?.location ??
      review?.Location ??
      review?.address ??
      review?.Address ??
      "";

    if (
      genericLocation &&
      String(
        genericLocation
      ).trim() !== ""
    ) {
      return String(
        genericLocation
      ).trim();
    }

    return "Location not available";
  };

  // =====================================================
  // GET REVIEWED ENTITY NAME
  // =====================================================

  const getReviewedEntityName = (
    review
  ) => {
    const businessName =
      getBusinessName(review);

    const placeName =
      getPlaceName(review);

    return (
      businessName ||
      placeName ||
      "Reviewed Business"
    );
  };

  // =====================================================
  // GET REVIEWED ENTITY TYPE
  // =====================================================

  const getReviewedEntityType = (
    review
  ) => {
    const businessId =
      getBusinessId(review);

    const placeId =
      getPlaceId(review);

    if (businessId) {
      return "business";
    }

    if (placeId) {
      return "place";
    }

    return null;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
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

    return (
      <div className="public-profile-stars">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <FaStar
              key={star}
              className={
                star <=
                numericRating
                  ? "public-profile-star-filled"
                  : "public-profile-star-empty"
              }
            />
          )
        )}
      </div>
    );
  };

  // =====================================================
  // GET INITIAL
  // =====================================================

  const getInitial = () => {
    const name =
      getUserName();

    return name
      .charAt(0)
      .toUpperCase();
  };

  // =====================================================
  // NAVIGATE TO REVIEWED BUSINESS / PLACE
  // =====================================================

  const handleViewBusiness = (
    review
  ) => {
    const businessId =
      getBusinessId(review);

    const placeId =
      getPlaceId(review);

    if (businessId) {
      navigate(
        `/business/${businessId}`
      );

      return;
    }

    if (placeId) {
      navigate(
        `/place/${placeId}`
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="user-public-profile-page">

          <button
            className="user-public-profile-back-btn"
            onClick={() =>
              navigate(-1)
            }
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div className="user-public-profile-loading">
            Loading profile...
          </div>

        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (
    error ||
    !profile
  ) {
    return (
      <MainLayout>
        <div className="user-public-profile-page">

          <button
            className="user-public-profile-back-btn"
            onClick={() =>
              navigate(-1)
            }
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div className="user-public-profile-error">

            <FaUserCircle />

            <h2>
              Profile Not Found
            </h2>

            <p>
              {error ||
                "User profile or review could not be found."}
            </p>

            <button
              className="user-public-profile-return-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              Go Back
            </button>

          </div>

        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // VALUES
  // =====================================================

  const userName =
    getUserName();

  const userCreatedAt =
    getUserCreatedAt();

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>
      <div className="user-public-profile-page">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          className="user-public-profile-back-btn"
          onClick={() =>
            navigate(-1)
          }
          title="Go Back"
        >
          <FaArrowLeft />
        </button>

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <div className="user-public-profile-header">

          <div className="user-public-profile-avatar">
            {getInitial()}
          </div>

          <div className="user-public-profile-info">

            <h1>
              {userName}
            </h1>

            {userCreatedAt && (
              <p>
                Member since{" "}
                {formatDate(
                  userCreatedAt
                )}
              </p>
            )}

          </div>

        </div>

        {/* =================================================
            PROFILE DIVIDER
        ================================================= */}

        <div className="user-public-profile-divider" />

        {/* =================================================
            ALL REVIEWS BY USER
        ================================================= */}

        <div className="user-public-all-reviews-section">

          <div className="user-public-all-reviews-heading">

            <div>

              <span className="user-public-review-label">
                REVIO Activity
              </span>

              <h2>
                Reviews by {userName}
              </h2>

              <p>
                Businesses and places reviewed by this customer
              </p>

            </div>

            {!reviewsLoading && (
              <div className="user-public-review-count">

                {userReviews.length}

                {hasMoreReviews
                  ? "+"
                  : ""}

                <span>
                  Reviews
                </span>

              </div>
            )}

          </div>

          {/* =================================================
              REVIEWS LOADING
          ================================================= */}

          {reviewsLoading && (
            <div className="user-public-all-reviews-loading">
              Loading reviews...
            </div>
          )}

          {/* =================================================
              REVIEWS ERROR
          ================================================= */}

          {!reviewsLoading &&
            reviewsError && (
              <div className="user-public-all-reviews-error">

                <p>
                  {reviewsError}
                </p>

                <button
                  onClick={() =>
                    loadUserReviews(
                      1,
                      true
                    )
                  }
                >
                  Try Again
                </button>

              </div>
            )}

          {/* =================================================
              NO REVIEWS
          ================================================= */}

          {!reviewsLoading &&
            !reviewsError &&
            userReviews.length === 0 && (
              <div className="user-public-no-reviews">

                <FaStore />

                <h3>
                  No reviews yet
                </h3>

                <p>
                  This customer has not reviewed any businesses yet.
                </p>

              </div>
            )}

          {/* =================================================
              REVIEW LIST
          ================================================= */}

          {!reviewsLoading &&
            !reviewsError &&
            userReviews.length > 0 && (

              <div className="user-public-all-reviews-list">

                {userReviews.map(
                  (review, index) => {

                    const itemId =
                      getReviewItemId(
                        review
                      );

                    const reviewKey =
                      itemId ??
                      `review-${index}`;

                    const itemRating =
                      getReviewItemRating(
                        review
                      );

                    const itemComment =
                      getReviewItemComment(
                        review
                      );

                    const itemDate =
                      getReviewItemDate(
                        review
                      );

                    const entityName =
                      getReviewedEntityName(
                        review
                      );

                    const entityType =
                      getReviewedEntityType(
                        review
                      );

                    const businessId =
                      getBusinessId(
                        review
                      );

                    const placeId =
                      getPlaceId(
                        review
                      );

                    const location =
                      getReviewLocation(
                        review
                      );

                    const canView =
                      Boolean(
                        businessId ||
                        placeId
                      );

                    const isExpanded =
                      Boolean(
                        expandedReviews[
                          reviewKey
                        ]
                      );

                    const isLong =
                      Boolean(
                        longReviews[
                          reviewKey
                        ]
                      );

                    const truncatedComment =
                      truncatedReviews[
                        reviewKey
                      ];

                    return (
                      <div
                        className="user-public-history-card"
                        key={reviewKey}
                      >

                        {/* =================================
                            BUSINESS / PLACE HEADER
                        ================================= */}

                        <div className="user-public-history-top">

                          <div className="user-public-history-business">

                            <div className="user-public-history-business-icon">
                              <FaStore />
                            </div>

                            <div>

                              <h3>
                                {entityName}
                              </h3>

                              <div className="user-public-history-location">

                                <FaMapMarkerAlt />

                                <span>
                                  {location}
                                </span>

                              </div>

                            </div>

                          </div>

                          <span className="user-public-history-review-number">
                            Review #{itemId}
                          </span>

                        </div>

                        {/* =================================
                            REVIEW META
                        ================================= */}

                        <div className="user-public-history-meta">

                          <div className="user-public-history-type">

                            {entityType ===
                            "business"
                              ? "Business Review"
                              : "Place Review"}

                          </div>

                          {itemDate && (
                            <span>
                              {formatDate(
                                itemDate
                              )}
                            </span>
                          )}

                        </div>

                        {/* =================================
                            RATING
                        ================================= */}

                        <div className="user-public-history-rating">

                          {renderStars(
                            itemRating
                          )}

                          <strong>
                            {itemRating}/5
                          </strong>

                        </div>

                        {/* =================================
                            COMMENT
                        ================================= */}

                        <div className="user-public-history-comment-wrapper">

                          <p
                            ref={(element) => {
                              if (element) {
                                commentRefs.current[
                                  reviewKey
                                ] = element;
                              } else {
                                delete commentRefs.current[
                                  reviewKey
                                ];
                              }
                            }}
                            className={
                              `user-public-history-comment ${
                                isLong &&
                                !isExpanded
                                  ? "is-collapsed"
                                  : "is-expanded"
                              }`
                            }
                          >

                            {/* =================================
                                SHORT / FULL COMMENT
                            ================================= */}

                            {!isLong ||
                            isExpanded ? (
                              <span className="user-public-history-comment-text">
                                {itemComment
                                  ? `"${itemComment}"`
                                  : "No comment was added with this review."}
                              </span>
                            ) : (
                              <span className="user-public-history-comment-text">
                                {`"${
                                  truncatedComment ||
                                  itemComment
                                }..."`}
                              </span>
                            )}

                            {/* =================================
                                VIEW MORE / VIEW LESS
                            ================================= */}

                            {itemComment &&
                              isLong && (
                                <button
                                  type="button"
                                  className="user-public-history-comment-toggle"
                                  onClick={() =>
                                    handleToggleReview(
                                      reviewKey
                                    )
                                  }
                                  aria-expanded={
                                    isExpanded
                                  }
                                >
                                  {isExpanded
                                    ? "View Less"
                                    : "View More"}
                                </button>
                              )}

                          </p>

                        </div>

                        {/* =================================
                            VIEW BUSINESS / PLACE
                        ================================= */}

                        {canView && (
                          <button
                            className="user-public-history-view-btn"
                            onClick={() =>
                              handleViewBusiness(
                                review
                              )
                            }
                          >

                            <span>
                              {entityType ===
                              "business"
                                ? "View Business"
                                : "View Place"}
                            </span>

                            <FaChevronDown
                              className="user-public-history-view-arrow"
                            />

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

          {!reviewsLoading &&
            !reviewsError &&
            userReviews.length > 0 &&
            hasMoreReviews && (

              <div className="user-public-load-more-wrapper">

                <button
                  className="user-public-load-more-btn"
                  onClick={
                    handleLoadMoreReviews
                  }
                  disabled={
                    loadingMoreReviews
                  }
                >

                  {loadingMoreReviews
                    ? "Loading..."
                    : "Load More Reviews"}

                </button>

              </div>
            )}

        </div>

      </div>
    </MainLayout>
  );
}

export default UserPublicProfile;