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
  getBusinessDetails,
  addBusinessFavorite,
  removeBusinessFavorite,
  getFavorites,
} from "../services/HomeService";

import {
  getBusinessReviews,
} from "../services/reviewService";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaStar,
  FaHeart,
  FaThLarge,
  FaCommentAlt,
  FaMapMarkedAlt,
  FaPen,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import DialogBox from "../components/DialogBox";

import "../styles/PlaceDetails.css";

/*
=====================================================
BUSINESS PHOTO PREVIEW COUNT

Only ONE photo will be visible on the
Business Details page.

If business has:
1 photo  -> 1 photo
5 photos -> 1 photo + "+4 More"
10 photos -> 1 photo + "+9 More"

Clicking the visible photo opens the
full gallery containing ALL uploaded photos.
=====================================================
*/
const BUSINESS_PHOTO_PREVIEW_COUNT = 1;

/*
=====================================================
CUSTOMER REVIEW MEDIA PREVIEW COUNT

Only TWO review media items will be visible
for each customer review.

If review has:
1 media  -> 1 media
2 media  -> 2 media
3 media  -> 2 media + "+1 More"
5 media  -> 2 media + "+3 More"
10 media -> 2 media + "+8 More"

Clicking ANY visible media opens the
full review media gallery containing ALL media.
=====================================================
*/
const REVIEW_MEDIA_PREVIEW_COUNT = 2;

function BusinessDetails() {
  const { id } = useParams();
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
  // BUSINESS PHOTO GALLERY
  // =====================================================

  const [selectedBusinessPhotos, setSelectedBusinessPhotos] =
    useState(null);

  const [selectedBusinessPhotoIndex, setSelectedBusinessPhotoIndex] =
    useState(0);

  // =====================================================
  // CUSTOMER REVIEW MEDIA GALLERY
  // =====================================================

  const [selectedReviewMedia, setSelectedReviewMedia] =
    useState(null);

  const [selectedReviewMediaIndex, setSelectedReviewMediaIndex] =
    useState(0);

  // =====================================================
  // REVIEW COMMENT EXPANSION
  // =====================================================

  const [expandedReviews, setExpandedReviews] =
    useState({});

  const [reviewOverflow, setReviewOverflow] =
    useState({});

  const reviewCommentRefs =
    useRef({});

  const toggleReview = (
    reviewId
  ) => {
    setExpandedReviews(
      (previous) => ({
        ...previous,
        [reviewId]:
          !previous[reviewId],
      })
    );
  };

  // =====================================================
  // CHECK REVIEW TEXT OVERFLOW
  // =====================================================

  const checkReviewOverflow = () => {
    const overflowState = {};

    Object.keys(
      reviewCommentRefs.current
    ).forEach(
      (reviewId) => {
        const element =
          reviewCommentRefs.current[
            reviewId
          ];

        if (!element) {
          return;
        }

        const lineHeight =
          parseFloat(
            window.getComputedStyle(
              element
            ).lineHeight
          ) || 24;

        const maxHeight =
          lineHeight * 2;

        overflowState[
          reviewId
        ] =
          element.scrollHeight >
          maxHeight + 1;
      }
    );

    setReviewOverflow(
      overflowState
    );
  };

  useEffect(() => {
    if (!reviews.length) {
      return;
    }

    const timer =
      setTimeout(() => {
        checkReviewOverflow();
      }, 0);

    window.addEventListener(
      "resize",
      checkReviewOverflow
    );

    return () => {
      clearTimeout(timer);

      window.removeEventListener(
        "resize",
        checkReviewOverflow
      );
    };
  }, [reviews]);

  // =====================================================
  // BUSINESS PHOTO GALLERY HANDLERS
  // =====================================================

  const openBusinessPhotoGallery = (
    photoList,
    startIndex = 0
  ) => {
    if (
      !Array.isArray(photoList) ||
      photoList.length === 0
    ) {
      return;
    }

    const safeStartIndex =
      Math.min(
        Math.max(
          Number(startIndex) || 0,
          0
        ),
        photoList.length - 1
      );

    setSelectedBusinessPhotos(
      photoList
    );

    setSelectedBusinessPhotoIndex(
      safeStartIndex
    );
  };

  const closeBusinessPhotoGallery = () => {
    setSelectedBusinessPhotos(
      null
    );

    setSelectedBusinessPhotoIndex(
      0
    );
  };

  const showNextBusinessPhoto = () => {
    if (
      !selectedBusinessPhotos?.length
    ) {
      return;
    }

    setSelectedBusinessPhotoIndex(
      (previous) =>
        (previous + 1) %
        selectedBusinessPhotos.length
    );
  };

  const showPreviousBusinessPhoto = () => {
    if (
      !selectedBusinessPhotos?.length
    ) {
      return;
    }

    setSelectedBusinessPhotoIndex(
      (previous) =>
        previous === 0
          ? selectedBusinessPhotos.length - 1
          : previous - 1
    );
  };

  // =====================================================
  // BUSINESS PHOTO KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {
    if (!selectedBusinessPhotos) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeBusinessPhotoGallery();
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNextBusinessPhoto();
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPreviousBusinessPhoto();
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
  }, [
    selectedBusinessPhotos,
  ]);

  // =====================================================
  // REVIEW MEDIA GALLERY HANDLERS
  // =====================================================

  const openReviewMediaGallery = (
    mediaList,
    startIndex = 0
  ) => {
    if (
      !Array.isArray(mediaList) ||
      mediaList.length === 0
    ) {
      return;
    }

    const safeStartIndex =
      Math.min(
        Math.max(
          Number(startIndex) || 0,
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

  const closeReviewMediaGallery = () => {
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

  const showNextReviewMedia = () => {
    if (
      !selectedReviewMedia?.length
    ) {
      return;
    }

    setSelectedReviewMediaIndex(
      (previous) =>
        (previous + 1) %
        selectedReviewMedia.length
    );
  };

  // =====================================================
  // PREVIOUS REVIEW MEDIA
  // =====================================================

  const showPreviousReviewMedia = () => {
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
  // REVIEW MEDIA KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {
    if (!selectedReviewMedia) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeReviewMediaGallery();
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNextReviewMedia();
        return;
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
  }, [
    selectedReviewMedia,
  ]);

  // =====================================================
  // DIALOG
  // =====================================================

  const [dialog, setDialog] =
    useState({
      isOpen: false,
      title: "REVIO",
      message: "",
      type: "info",
      confirmText: "OK",
      onConfirm: null,
    });

  const showDialog = ({
    title = "REVIO",
    message,
    type = "info",
    confirmText = "OK",
    onConfirm = null,
  }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm,
    });
  };

  const closeDialog = () => {
    setDialog(
      (previous) => ({
        ...previous,
        isOpen: false,
      })
    );
  };

  const handleDialogConfirm = () => {
    const callback =
      dialog.onConfirm;

    closeDialog();

    if (callback) {
      callback();
    }
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  // =====================================================
  // REVIEW PAGINATION
  // =====================================================

  const [totalReviews, setTotalReviews] =
    useState(0);

  const [currentReviewPage, setCurrentReviewPage] =
    useState(1);

  const [reviewPageSize] =
    useState(10);

  const [hasMoreReviews, setHasMoreReviews] =
    useState(false);

  // =====================================================
  // ACTUAL AVERAGE RATING
  // =====================================================

  const [averageRating, setAverageRating] =
    useState(null);

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const userId =
      localStorage.getItem(
        "userId"
      ) ||
      localStorage.getItem(
        "UserId"
      );

    return userId
      ? Number(userId)
      : null;
  };

  // =====================================================
  // CHECK GUEST USER
  // =====================================================

  const isGuestUser = () => {
    return (
      localStorage.getItem(
        "isGuest"
      ) === "true"
    );
  };

  // =====================================================
  // LOAD BUSINESS
  // =====================================================

  useEffect(() => {
    loadBusiness();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =====================================================
  // LOAD BUSINESS DETAILS
  // =====================================================

  const loadBusiness = async () => {
    try {
      setLoading(true);

      const response =
        await getBusinessDetails(
          id
        );

      console.log(
        "Business Details:",
        response.data
      );

      const businessData =
        response.data?.data ||
        response.data;

      setBusiness(
        businessData
      );

      // =================================================
      // DEBUG BUSINESS PHOTOS
      // =================================================

      console.log(
        "CUSTOMER BUSINESS PHOTOS:",
        businessData?.photos ??
          businessData?.Photos ??
          []
      );

      const businessId =
        businessData?.businessId ||
        businessData?.id;

      if (businessId) {
        await Promise.all([
          loadBusinessReviews(
            businessId,
            1,
            false
          ),
          checkFavorite(
            businessId
          ),
        ]);
      }
    } catch (error) {
      console.error(
        "Failed to load business details:",
        error
      );

      setBusiness(null);

      setAverageRating(
        null
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD BUSINESS REVIEWS
  // =====================================================

  const loadBusinessReviews =
    async (
      businessId,
      page = 1,
      append = false
    ) => {
      try {
        setReviewsLoading(
          true
        );

        const response =
          await getBusinessReviews(
            businessId,
            page,
            reviewPageSize
          );

        console.log(
          "Business Reviews:",
          response.data
        );

        const responseData =
          response.data?.data ??
          response.data?.Data ??
          response.data;

        let reviewData = [];
        let total = 0;
        let hasMore = false;

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
            [];

          total =
            Number(
              responseData.totalReviews ??
                responseData.TotalReviews ??
                0
            );

          hasMore =
            Boolean(
              responseData.hasMore ??
                responseData.HasMore ??
                false
            );

          // =================================================
          // ACTUAL AVERAGE RATING
          // =================================================

          const apiAverageRating =
            Number(
              responseData.averageRating ??
                responseData.AverageRating
            );

          if (
            Number.isFinite(
              apiAverageRating
            ) &&
            apiAverageRating >=
              0
          ) {
            setAverageRating(
              apiAverageRating
            );
          }
        } else if (
          Array.isArray(
            responseData
          )
        ) {
          reviewData =
            responseData;

          total =
            responseData.length;

          hasMore =
            false;
        }

        const finalReviews =
          Array.isArray(
            reviewData
          )
            ? reviewData
            : [];

        console.log(
          "FINAL BUSINESS DETAILS REVIEWS:",
          finalReviews
        );

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
        }

        setTotalReviews(
          total
        );

        setCurrentReviewPage(
          page
        );

        setHasMoreReviews(
          hasMore
        );
      } catch (error) {
        console.error(
          "Failed to load business reviews:",
          error
        );

        if (!append) {
          setReviews([]);

          setTotalReviews(
            0
          );

          setAverageRating(
            null
          );
        }

        setHasMoreReviews(
          false
        );
      } finally {
        setReviewsLoading(
          false
        );
      }
    };

  // =====================================================
  // LOAD MORE REVIEWS
  // =====================================================

  const handleLoadMoreReviews =
    async () => {
      const businessId =
        business?.businessId ||
        business?.id;

      if (
        !businessId ||
        reviewsLoading ||
        !hasMoreReviews
      ) {
        return;
      }

      const nextPage =
        currentReviewPage +
        1;

      await loadBusinessReviews(
        businessId,
        nextPage,
        true
      );
    };

  // =====================================================
  // CHECK FAVORITE
  // =====================================================

  const checkFavorite =
    async (
      businessId
    ) => {
      try {
        const userId =
          getUserId();

        const isGuest =
          isGuestUser();

        /*
        =================================================
        GUEST USERS

        Guests can view the business and reviews,
        but favorite status must not be checked.

        This also prevents a stale userId from allowing
        a guest session to access favorite functionality.
        =================================================
        */

        if (
          isGuest ||
          !userId ||
          !businessId
        ) {
          setIsFavorite(
            false
          );

          return;
        }

        const response =
          await getFavorites(
            userId
          );

        const favorites =
          response.data?.data ||
          response.data ||
          [];

        const currentBusinessId =
          Number(
            businessId
          );

        const alreadyFavorite =
          Array.isArray(
            favorites
          ) &&
          favorites.some(
            (
              favorite
            ) =>
              Number(
                favorite.businessId ??
                  favorite.BusinessId ??
                  favorite.business?.businessId ??
                  favorite.Business?.BusinessId
              ) ===
              currentBusinessId
          );

        setIsFavorite(
          alreadyFavorite
        );
      } catch (error) {
        console.error(
          "Failed to check business favorite:",
          error
        );

        setIsFavorite(
          false
        );
      }
    };

  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const handleFavorite =
    async () => {
      try {
        const userId =
          getUserId();

        const isGuest =
          isGuestUser();

        /*
        =================================================
        GUEST USERS CANNOT FAVORITE

        Show login dialog and redirect to login.
        =================================================
        */

        if (
          isGuest ||
          !userId
        ) {
          showDialog({
            title:
              "Login Required",

            message:
              "Please login first to add favorites.",

            type:
              "warning",

            onConfirm: () => {
              navigate(
                "/login"
              );
            },
          });

          return;
        }

        if (!business) {
          return;
        }

        const businessId =
          business.businessId ||
          business.id;

        if (!businessId) {
          console.error(
            "Business ID not found:",
            business
          );

          return;
        }

        setFavoriteLoading(
          true
        );

        if (
          isFavorite
        ) {
          await removeBusinessFavorite(
            userId,
            Number(
              businessId
            )
          );

          setIsFavorite(
            false
          );
        } else {
          await addBusinessFavorite({
            userId:
              userId,

            businessId:
              Number(
                businessId
              ),
          });

          setIsFavorite(
            true
          );
        }
      } catch (error) {
        console.error(
          "Favorite operation failed:",
          error
        );

        if (
          error.response?.data
            ?.message
        ) {
          showDialog({
            title:
              "Favorite Error",

            message:
              error.response.data.message,

            type:
              "error",
          });
        } else {
          showDialog({
            title:
              "Something Went Wrong",

            message:
              "Something went wrong while updating favorites.",

            type:
              "error",
          });
        }
      } finally {
        setFavoriteLoading(
          false
        );
      }
    };

  // =====================================================
  // GOOGLE MAP
  // =====================================================

  const handleMapClick = () => {
    if (!business) {
      return;
    }

    const address =
      `${business.businessName || business.name || ""}, ` +
      `${business.address || ""}, ` +
      `${business.city || ""}`;

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;

    window.open(
      mapUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // WRITE REVIEW
  // =====================================================

  const handleWriteReview = () => {
    const userId =
      getUserId();

    const isGuest =
      isGuestUser();

    /*
    =================================================
    GUEST USERS CANNOT WRITE REVIEWS

    Show login dialog and redirect to login.
    =================================================
    */

    if (
      isGuest ||
      !userId
    ) {
      showDialog({
        title:
          "Login Required",

        message:
          "Please login first to write a review.",

        type:
          "warning",

        onConfirm: () => {
          navigate(
            "/login"
          );
        },
      });

      return;
    }

    if (!business) {
      return;
    }

    const businessId =
      business.businessId ||
      business.id;

    navigate(
      `/write-review/business/${businessId}`
    );
  };

  // =====================================================
  // VIEW ALL REVIEWS
  // =====================================================

  const handleViewAllReviews =
    () => {
      const businessId =
        business?.businessId ||
        business?.id;

      if (!businessId) {
        return;
      }

      navigate(
        `/business/${businessId}/reviews`
      );
    };

  // =====================================================
  // REVIEWER PROFILE
  // =====================================================

  const handleReviewerProfileClick =
    (
      review
    ) => {
      const userId =
        review.UserId ??
        review.userId ??
        review.User?.Id ??
        review.user?.id;

      const reviewId =
        review.ReviewId ??
        review.reviewId;

      if (
        !userId ||
        !reviewId
      ) {
        console.error(
          "Reviewer profile information not found:",
          review
        );

        return;
      }

      navigate(
        `/user-profile/${userId}/review/${reviewId}`
      );
    };

  // =====================================================
  // RELATIVE DATE
  // =====================================================

  const getRelativeDate =
    (
      dateValue
    ) => {
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
  // RATING STARS
  // =====================================================

  const renderStars = (
    rating
  ) => {
    const numericRating =
      Number(
        rating
      ) || 0;

    return (
      <div className="review-stars">

        {[1, 2, 3, 4, 5].map(
          (
            star
          ) => (
            <FaStar
              key={
                star
              }
              className={
                star <=
                numericRating
                  ? "review-star-filled"
                  : "review-star-empty"
              }
            />
          )
        )}

      </div>
    );
  };

  // =====================================================
  // REVIEWER NAME
  // =====================================================

  const getReviewerName =
    (
      review
    ) => {
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
  // REVIEW RATING
  // =====================================================

  const getReviewRating =
    (
      review
    ) => {
      return Number(
        review.Rating ??
          review.rating ??
          0
      );
    };

  // =====================================================
  // REVIEW COMMENT
  // =====================================================

  const getReviewComment =
    (
      review
    ) => {
      return (
        review.Comment ??
        review.comment ??
        ""
      );
    };

  // =====================================================
  // REVIEW DATE
  // =====================================================

  const getReviewDate =
    (
      review
    ) => {
      return (
        review.CreatedAt ??
        review.createdAt ??
        null
      );
    };

  // =====================================================
  // REVIEW ID
  // =====================================================

  const getReviewId =
    (
      review,
      index
    ) => {
      return (
        review.ReviewId ??
        review.reviewId ??
        `review-${index}`
      );
    };

  // =====================================================
  // REVIEW MEDIA
  // =====================================================

  const getReviewMedia =
    (
      review
    ) => {
      return (
        review.Media ??
        review.media ??
        []
      );
    };

  // =====================================================
  // MEDIA URL
  // =====================================================

  const getMediaUrl = (
    mediaUrl
  ) => {
    if (!mediaUrl) {
      return "";
    }

    const cleanUrl =
      String(
        mediaUrl
      ).trim();

    if (!cleanUrl) {
      return "";
    }

    /*
    =================================================
    BASE64 DATA URL
    =================================================
    */

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

    /*
    =================================================
    ABSOLUTE URL
    =================================================
    */

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

    /*
    =================================================
    RELATIVE BACKEND URL
    =================================================
    */

    return `http://localhost:5213${
      cleanUrl.startsWith("/")
        ? cleanUrl
        : `/${cleanUrl}`
    }`;
  };

  // =====================================================
  // CHECK MEDIA TYPE
  // =====================================================

  const isVideoMedia =
    (
      media
    ) => {
      const mediaType =
        (
          media.MediaType ??
          media.mediaType ??
          ""
        ).toLowerCase();

      const mediaUrl =
        (
          media.MediaUrl ??
          media.mediaUrl ??
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
  // CALCULATE AVERAGE
  // =====================================================

  const calculateAverageRating =
    () => {
      if (
        averageRating !==
          null &&
        Number.isFinite(
          Number(
            averageRating
          )
        )
      ) {
        return Number(
          averageRating
        ).toFixed(1);
      }

      if (
        reviews.length >
        0
      ) {
        const validRatings =
          reviews
            .map(
              (
                review
              ) =>
                getReviewRating(
                  review
                )
            )
            .filter(
              (
                rating
              ) =>
                rating >=
                  1 &&
                rating <=
                  5
            );

        if (
          validRatings.length >
          0
        ) {
          const total =
            validRatings.reduce(
              (
                sum,
                rating
              ) =>
                sum + rating,
              0
            );

          return (
            total /
            validRatings.length
          ).toFixed(1);
        }
      }

      const businessRating =
        Number(
          business?.rating ??
            business?.Rating
        );

      if (
        Number.isFinite(
          businessRating
        ) &&
        businessRating >=
          0
      ) {
        return businessRating.toFixed(
          1
        );
      }

      return "0.0";
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>

        <h2
          style={{
            color: "#fff",
          }}
        >
          Loading...
        </h2>

        <DialogBox
          isOpen={
            dialog.isOpen
          }
          title={
            dialog.title
          }
          message={
            dialog.message
          }
          type={
            dialog.type
          }
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
  // BUSINESS NOT FOUND
  // =====================================================

  if (!business) {
    return (
      <MainLayout>

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
          title="Go Back"
        >
          <FaArrowLeft />
        </button>

        <h2
          style={{
            color: "#fff",
          }}
        >
          Business Not Found
        </h2>

        <DialogBox
          isOpen={
            dialog.isOpen
          }
          title={
            dialog.title
          }
          message={
            dialog.message
          }
          type={
            dialog.type
          }
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
  // BUSINESS VALUES
  // =====================================================

  const businessName =
    business.businessName ||
    business.name ||
    "Business";

  // =====================================================
  // NORMALIZE BUSINESS PHOTOS
  // =====================================================

  const businessPhotoSource =
    business.photos ??
    business.Photos ??
    [];

  const businessPhotos =
    Array.isArray(
      businessPhotoSource
    )
      ? businessPhotoSource
          .map(
            (
              photo,
              index
            ) => {
              const rawPhotoUrl =
                photo?.photoUrl ??
                photo?.PhotoUrl ??
                photo?.imageUrl ??
                photo?.ImageUrl ??
                photo?.image ??
                photo?.Image ??
                photo?.url ??
                photo?.Url ??
                "";

              const photoUrl =
                getMediaUrl(
                  rawPhotoUrl
                );

              if (!photoUrl) {
                return null;
              }

              return {
                id:
                  photo?.businessPhotoId ??
                  photo?.BusinessPhotoId ??
                  photo?.id ??
                  photo?.Id ??
                  `business-photo-${index}`,

                url:
                  photoUrl,

                isPrimary:
                  Boolean(
                    photo?.isPrimary ??
                      photo?.IsPrimary ??
                      false
                  ),

                caption:
                  photo?.caption ??
                  photo?.Caption ??
                  `${businessName} photo ${
                    index + 1
                  }`,
              };
            }
          )
          .filter(Boolean)
      : [];

  // =====================================================
  // PRIMARY PHOTO FIRST
  // =====================================================

  const sortedBusinessPhotos = [
    ...businessPhotos.filter(
      (
        photo
      ) =>
        photo.isPrimary
    ),

    ...businessPhotos.filter(
      (
        photo
      ) =>
        !photo.isPrimary
    ),
  ];

  // =====================================================
  // FALLBACK PHOTO
  // =====================================================

  const fallbackPhoto =
    getMediaUrl(
      business.imageUrl ||
        business.ImageUrl ||
        ""
    ) ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";

  // =====================================================
  // DISPLAY BUSINESS PHOTOS
  // =====================================================

  const displayBusinessPhotos =
    sortedBusinessPhotos.length >
    0
      ? sortedBusinessPhotos
      : [
          {
            id:
              "business-fallback",

            url:
              fallbackPhoto,

            isPrimary:
              true,

            caption:
              `${businessName} photo`,
          },
        ];

  // =====================================================
  // ONLY ONE PHOTO IN PAGE PREVIEW
  // =====================================================

  const visibleBusinessPhotos =
    displayBusinessPhotos.slice(
      0,
      BUSINESS_PHOTO_PREVIEW_COUNT
    );

  // =====================================================
  // NUMBER OF ADDITIONAL PHOTOS
  // =====================================================

  const remainingBusinessPhotoCount =
    Math.max(
      displayBusinessPhotos.length -
        BUSINESS_PHOTO_PREVIEW_COUNT,
      0
    );

  const coverImage =
    displayBusinessPhotos[0]
      ?.url ??
    fallbackPhoto;

  // =====================================================
  // ACTUAL RATING
  // =====================================================

  const rating =
    calculateAverageRating();

  const reviewCount =
    totalReviews ||
    business.reviewCount ||
    business.ReviewCount ||
    reviews.length ||
    0;

  const isOpen =
    business.isOpen ??
    business.openStatus ??
    false;

  const description =
    business.description ||
    business.businessDescription ||
    `${businessName} provides quality services and aims to provide a great customer experience.`;

  // =====================================================
  // CURRENT BUSINESS PHOTO
  // =====================================================

  const currentBusinessPhoto =
    selectedBusinessPhotos?.[
      selectedBusinessPhotoIndex
    ];

  // =====================================================
  // CURRENT REVIEW MEDIA
  // =====================================================

  const currentReviewMedia =
    selectedReviewMedia?.[
      selectedReviewMediaIndex
    ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        className="back-btn"
        onClick={() =>
          navigate(-1)
        }
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* =================================================
          BUSINESS DETAILS
      ================================================= */}

      <div className="place-details">

        {/* =================================================
            BUSINESS PHOTO GALLERY PREVIEW
        ================================================= */}

        <div className="image-section">

          <div className="business-photo-preview-grid">

            {visibleBusinessPhotos.map(
              (
                photo,
                photoIndex
              ) => {

                const isLastVisible =
                  photoIndex ===
                    BUSINESS_PHOTO_PREVIEW_COUNT -
                      1 &&
                  remainingBusinessPhotoCount >
                    0;

                return (
                  <button
                    type="button"
                    key={
                      photo.id
                    }
                    className="business-photo-preview-item"
                    onClick={() =>
                      openBusinessPhotoGallery(
                        displayBusinessPhotos,
                        photoIndex
                      )
                    }
                    aria-label={
                      isLastVisible
                        ? `View ${remainingBusinessPhotoCount} more business photos`
                        : `View business photo ${
                            photoIndex + 1
                          }`
                    }
                  >

                    <img
                      src={
                        photo.url
                      }
                      alt={
                        photo.caption
                      }
                      onError={(
                        event
                      ) => {

                        if (
                          event.currentTarget.src !==
                          fallbackPhoto
                        ) {
                          event.currentTarget.src =
                            fallbackPhoto;
                        }
                      }}
                    />

                    {photoIndex ===
                      0 && (
                      <span className="business-photo-featured-label">
                        Featured
                      </span>
                    )}

                    {isLastVisible && (
                      <span className="business-photo-more-overlay">
                        +{
                          remainingBusinessPhotoCount
                        } More
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* FAVORITE */}

          <button
            className={`heart-btn ${
              isFavorite
                ? "favorite-active"
                : ""
            }`}
            onClick={
              handleFavorite
            }
            disabled={
              favoriteLoading
            }
            title={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <FaHeart />
          </button>

        </div>

        {/* =================================================
            DETAILS CARD
        ================================================= */}

        <div className="details-card">

          <h1>
            {businessName}
          </h1>

          {/* RATING */}

          <div className="rating-row">

            <FaStar className="gold-star" />

            <span>
              {rating}
            </span>

            <span className="review-text">
              ({reviewCount} Reviews)
            </span>

          </div>

          {/* LOCATION */}

          <div className="info-row">

            <FaMapMarkerAlt />

            <span>
              {business.address ||
                "Address not available"}

              {business.city
                ? `, ${business.city}`
                : ""}
            </span>

          </div>

          {/* CATEGORY */}

          <div className="info-row">

            <FaThLarge />

            <span>
              Category
            </span>

            <strong>
              {business.category
                ?.categoryName ||
                business.categoryName ||
                "Not available"}
            </strong>

          </div>

          {/* REVIEWS */}

          <div className="info-row">

            <FaCommentAlt />

            <span>
              Reviews
            </span>

            <strong>
              {reviewCount}
            </strong>

          </div>

          {/* STATUS */}

          <div className="info-row">

            <span>
              Status
            </span>

            <strong
              className={
                isOpen
                  ? "status-badge open"
                  : "status-badge closed"
              }
            >
              {isOpen
                ? "Open Now"
                : "Closed"}
            </strong>

          </div>

          {/* ACTIONS */}

          <div className="place-actions">

            <button
              className="place-action-btn map-btn"
              onClick={
                handleMapClick
              }
            >
              <FaMapMarkedAlt />

              <span>
                View on Map
              </span>
            </button>

            <button
              className="place-action-btn review-btn"
              onClick={
                handleWriteReview
              }
            >
              <FaPen />

              <span>
                Write a Review
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          ABOUT
      ================================================= */}

      <div className="info-card">

        <h2>
          About
        </h2>

        <p>
          {description}
        </p>

      </div>

      {/* =================================================
          CUSTOMER REVIEWS
      ================================================= */}

      <div className="customer-reviews-card">

        <div className="customer-reviews-header">

          <div>

            <h2>
              Customer Reviews
            </h2>

            <span>
              {reviewCount} Reviews
            </span>

          </div>

        </div>

        {/* REVIEWS LOADING */}

        {reviewsLoading &&
          reviews.length ===
            0 && (
            <div className="reviews-loading">
              Loading reviews...
            </div>
          )}

        {/* NO REVIEWS */}

        {!reviewsLoading &&
          reviews.length ===
            0 && (
            <div className="no-reviews">

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first customer to review this business.
              </p>

            </div>
          )}

        {/* REVIEW LIST */}

        {!reviewsLoading &&
          reviews.length >
            0 && (
            <div className="reviews-list">

              {reviews
                .slice(0, 3)
                .map(
                  (
                    review,
                    index
                  ) => {

                    const reviewerName =
                      getReviewerName(
                        review
                      );

                    const reviewRating =
                      getReviewRating(
                        review
                      );

                    const reviewComment =
                      getReviewComment(
                        review
                      );

                    const reviewDate =
                      getReviewDate(
                        review
                      );

                    const reviewId =
                      getReviewId(
                        review,
                        index
                      );

                    const reviewMedia =
                      getReviewMedia(
                        review
                      );

                    const validReviewMedia =
                      Array.isArray(
                        reviewMedia
                      )
                        ? reviewMedia
                            .map(
                              (
                                media,
                                mediaIndex
                              ) => {

                                const mediaId =
                                  media?.ReviewMediaId ??
                                  media?.reviewMediaId ??
                                  `${reviewId}-media-${mediaIndex}`;

                                const mediaUrl =
                                  getMediaUrl(
                                    media?.MediaUrl ??
                                      media?.mediaUrl
                                  );

                                if (
                                  !mediaUrl
                                ) {
                                  return null;
                                }

                                return {
                                  ...media,

                                  mediaId,

                                  mediaUrl,

                                  mediaIndex,
                                };
                              }
                            )
                            .filter(
                              Boolean
                            )
                        : [];

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

                    const isExpanded =
                      Boolean(
                        expandedReviews[
                          reviewId
                        ]
                      );

                    const hasOverflow =
                      Boolean(
                        reviewOverflow[
                          reviewId
                        ]
                      );

                    return (
                      <div
                        className="customer-review-item"
                        key={
                          reviewId
                        }
                      >

                        {/* REVIEW TOP */}

                        <div className="customer-review-top">

                          <div className="reviewer-info">

                            <div
                              className="reviewer-avatar"
                              onClick={() =>
                                handleReviewerProfileClick(
                                  review
                                )
                              }
                              title="View Profile"
                              style={{
                                cursor:
                                  "pointer",
                              }}
                            >
                              {reviewerName
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>

                              <h3>
                                {reviewerName}
                              </h3>

                              <span>
                                {getRelativeDate(
                                  reviewDate
                                )}
                              </span>

                            </div>

                          </div>

                          {renderStars(
                            reviewRating
                          )}

                        </div>

                        {/* REVIEW COMMENT */}

                        <div
                          ref={(
                            element
                          ) => {
                            reviewCommentRefs.current[
                              reviewId
                            ] =
                              element;
                          }}
                          className={`customer-review-comment ${
                            isExpanded
                              ? "review-comment-expanded"
                              : "review-comment-collapsed"
                          }`}
                        >

                          <p>
                            "{reviewComment}"
                          </p>

                        </div>

                        {/* VIEW MORE */}

                        {hasOverflow && (
                          <button
                            type="button"
                            className="review-view-more-btn"
                            onClick={() =>
                              toggleReview(
                                reviewId
                              )
                            }
                          >
                            {isExpanded
                              ? "View Less"
                              : "View More"}
                          </button>
                        )}

                        {/* CUSTOMER REVIEW MEDIA */}

                        {validReviewMedia.length >
                          0 && (

                          <div className="review-media-gallery">

                            {visibleReviewMedia.map(
                              (
                                media,
                                visibleIndex
                              ) => {

                                const isLastVisible =
                                  visibleIndex ===
                                    REVIEW_MEDIA_PREVIEW_COUNT -
                                      1 &&
                                  remainingReviewMediaCount >
                                    0;

                                const isVideo =
                                  isVideoMedia(
                                    media
                                  );

                                const handleMediaClick =
                                  () => {
                                    openReviewMediaGallery(
                                      validReviewMedia,
                                      visibleIndex
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
                                    className="review-media-item"
                                    key={
                                      media.mediaId
                                    }
                                    style={{
                                      position:
                                        "relative",
                                      cursor:
                                        "pointer",
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onClick={
                                      handleMediaClick
                                    }
                                    onKeyDown={
                                      handleMediaKeyDown
                                    }
                                    aria-label={
                                      isLastVisible
                                        ? `Open review media gallery. ${remainingReviewMediaCount} more media`
                                        : `Open review media ${
                                            visibleIndex + 1
                                          }`
                                    }
                                  >

                                    {isVideo ? (

                                      <video
                                        className="review-media-video"
                                        src={
                                          media.mediaUrl
                                        }
                                        controls
                                        preload="metadata"
                                      />

                                    ) : (

                                      <img
                                        className="review-media-image"
                                        src={
                                          media.mediaUrl
                                        }
                                        alt={`Review media ${
                                          media.mediaIndex +
                                          1
                                        }`}
                                        loading="lazy"
                                      />

                                    )}

                                    {isLastVisible && (
                                      <div
                                        className="review-media-more-overlay"
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
                                        <span className="review-media-more-count">
                                          +{
                                            remainingReviewMediaCount
                                          } More
                                        </span>
                                      </div>
                                    )}

                                  </div>
                                );
                              }
                            )}

                          </div>

                        )}

                        {/* OWNER REPLY */}

                        {(review.OwnerReply ||
                          review.ownerReply) && (

                          <div className="owner-reply">

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

        {/* VIEW ALL REVIEWS */}

        {!reviewsLoading &&
          totalReviews >
            3 && (

            <div className="view-all-reviews-wrapper">

              <button
                className="view-all-reviews-btn"
                onClick={
                  handleViewAllReviews
                }
              >
                View All Reviews
              </button>

            </div>

          )}

      </div>

      {/* =================================================
          BUSINESS PHOTO FULL SCREEN GALLERY
      ================================================= */}

      {selectedBusinessPhotos &&
        currentBusinessPhoto && (

          <div
            className="business-photo-gallery-modal"
            onClick={
              closeBusinessPhotoGallery
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="business-photo-gallery-close"
              onClick={
                closeBusinessPhotoGallery
              }
              aria-label="Close business photo gallery"
            >
              <FaTimes />
            </button>

            <div
              className="business-photo-gallery-content"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              {/* PREVIOUS */}

              {selectedBusinessPhotos.length >
                1 && (

                <button
                  type="button"
                  className="business-photo-gallery-nav business-photo-gallery-prev"
                  onClick={
                    showPreviousBusinessPhoto
                  }
                  aria-label="Previous business photo"
                >
                  <FaChevronLeft />
                </button>

              )}

              {/* CURRENT PHOTO */}

              <div className="business-photo-gallery-image-wrapper">

                <img
                  className="business-photo-gallery-image"
                  src={
                    currentBusinessPhoto.url
                  }
                  alt={
                    currentBusinessPhoto.caption ||
                    `${businessName} photo ${
                      selectedBusinessPhotoIndex +
                      1
                    }`
                  }
                  onError={(
                    event
                  ) => {
                    if (
                      event.currentTarget.src !==
                      fallbackPhoto
                    ) {
                      event.currentTarget.src =
                        fallbackPhoto;
                    }
                  }}
                />

              </div>

              {/* NEXT */}

              {selectedBusinessPhotos.length >
                1 && (

                <button
                  type="button"
                  className="business-photo-gallery-nav business-photo-gallery-next"
                  onClick={
                    showNextBusinessPhoto
                  }
                  aria-label="Next business photo"
                >
                  <FaChevronRight />
                </button>

              )}

              {/* COUNTER */}

              <div className="business-photo-gallery-counter">

                {selectedBusinessPhotoIndex +
                  1}

                {" / "}

                {
                  selectedBusinessPhotos.length
                }

              </div>

            </div>

          </div>

        )}

      {/* =================================================
          CUSTOMER REVIEW MEDIA FULL SCREEN GALLERY
      ================================================= */}

      {selectedReviewMedia &&
        currentReviewMedia && (

          <div
            className="review-media-modal"
            onClick={
              closeReviewMediaGallery
            }
          >

            {/* CLOSE BUTTON */}

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

            {/* MODAL CONTENT */}

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

              {/* CURRENT MEDIA */}

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

      {/* =================================================
          DIALOG
      ================================================= */}

      <DialogBox
        isOpen={
          dialog.isOpen
        }
        title={
          dialog.title
        }
        message={
          dialog.message
        }
        type={
          dialog.type
        }
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

export default BusinessDetails;