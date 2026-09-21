
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaStar,
  FaGlobe,
  FaHeart,
  FaLock,
  FaChevronRight,
  FaEdit,
  FaStore,
  FaTimes,
  FaChevronLeft,
} from "react-icons/fa";

import "../styles/OwnerPublicProfile.css";

const API_BASE =
  "http://localhost:5213/api";

const SAMPLE_PHOTOS = [
  {
    id: "sample-1",
    url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    alt: "Coffee",
  },
  {
    id: "sample-2",
    url:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85",
    alt: "Cafe interior",
  },
  {
    id: "sample-3",
    url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    alt: "Cafe dessert",
  },
  {
    id: "sample-4",
    url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
    alt: "Restaurant interior",
  },
];

const BUSINESS_PHOTO_PREVIEW_COUNT = 4;

function OwnerPublicProfile() {
  const navigate = useNavigate();

  const {
    businessId: routeBusinessId,
  } = useParams();

  const [business, setBusiness] =
    useState(null);

  const [photos, setPhotos] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // REVIEW SUMMARY
  // =====================================================

  const [reviewSummary, setReviewSummary] =
    useState({
      averageRating: 0,
      totalReviews: 0,
    });

  // =====================================================
  // REVIEW EXPANSION
  // =====================================================

  const [expandedReviews, setExpandedReviews] =
    useState({});

  const [reviewMoreStates, setReviewMoreStates] =
    useState({});

  const reviewCommentRefs =
    useRef({});

  // =====================================================
  // REVIEW MEDIA VIEWER
  // =====================================================

  const [selectedReviewMedia, setSelectedReviewMedia] =
    useState(null);

  const [selectedMediaIndex, setSelectedMediaIndex] =
    useState(0);

  // =====================================================
  // BUSINESS PHOTO VIEWER
  // =====================================================

  const [selectedBusinessPhoto, setSelectedBusinessPhoto] =
    useState(null);

  const [selectedBusinessPhotoIndex, setSelectedBusinessPhotoIndex] =
    useState(0);

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

      return Number.isFinite(parsed)
        ? parsed
        : null;
    }

    return null;
  };

  // =====================================================
  // REVIEW RATING
  // =====================================================

  const getReviewRating = (review) => {
    if (
      !review ||
      typeof review !== "object"
    ) {
      return 0;
    }

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
  // REVIEW MEDIA
  // =====================================================

  const getReviewMedia = (review) => {
    const media =
      review?.media ??
      review?.Media ??
      [];

    return Array.isArray(media)
      ? media
      : [];
  };

  // =====================================================
  // REVIEW MEDIA URL
  // =====================================================

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) {
      return "";
    }

    const cleanUrl =
      String(mediaUrl).trim();

    if (!cleanUrl) {
      return "";
    }

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

    return `http://localhost:5213${
      cleanUrl.startsWith("/")
        ? cleanUrl
        : `/${cleanUrl}`
    }`;
  };

  // =====================================================
  // CHECK REVIEW VIDEO
  // =====================================================

  const isVideoMedia = (media) => {
    const mediaType =
      (
        media?.mediaType ??
        media?.MediaType ??
        ""
      )
        .toString()
        .toLowerCase()
        .trim();

    const mediaUrl =
      (
        media?.mediaUrl ??
        media?.MediaUrl ??
        ""
      )
        .toString()
        .toLowerCase()
        .split("?")[0];

    return (
      mediaType.includes("video") ||
      mediaType === ".mp4" ||
      mediaType === ".webm" ||
      mediaType === ".mov" ||
      mediaType === ".avi" ||
      mediaType === ".m4v" ||
      mediaUrl.endsWith(".mp4") ||
      mediaUrl.endsWith(".webm") ||
      mediaUrl.endsWith(".mov") ||
      mediaUrl.endsWith(".avi") ||
      mediaUrl.endsWith(".m4v")
    );
  };

  // =====================================================
  // OPEN REVIEW MEDIA VIEWER
  // =====================================================

  const openReviewMediaViewer = (
    mediaList,
    startIndex = 0
  ) => {
    if (
      !Array.isArray(mediaList) ||
      mediaList.length === 0
    ) {
      return;
    }

    setSelectedReviewMedia(
      mediaList
    );

    setSelectedMediaIndex(
      startIndex
    );
  };

  // =====================================================
  // CLOSE REVIEW MEDIA VIEWER
  // =====================================================

  const closeReviewMediaViewer = () => {
    setSelectedReviewMedia(null);
    setSelectedMediaIndex(0);
  };

  // =====================================================
  // NEXT REVIEW MEDIA
  // =====================================================

  const showNextMedia = () => {
    if (
      !selectedReviewMedia?.length
    ) {
      return;
    }

    setSelectedMediaIndex(
      (previous) =>
        (previous + 1) %
        selectedReviewMedia.length
    );
  };

  // =====================================================
  // PREVIOUS REVIEW MEDIA
  // =====================================================

  const showPreviousMedia = () => {
    if (
      !selectedReviewMedia?.length
    ) {
      return;
    }

    setSelectedMediaIndex(
      (previous) =>
        previous === 0
          ? selectedReviewMedia.length - 1
          : previous - 1
    );
  };

  // =====================================================
  // OPEN BUSINESS PHOTO VIEWER
  // =====================================================

  const openBusinessPhotoViewer = (
    photoList,
    startIndex = 0
  ) => {
    if (
      !Array.isArray(photoList) ||
      photoList.length === 0
    ) {
      return;
    }

    setSelectedBusinessPhoto(
      photoList
    );

    setSelectedBusinessPhotoIndex(
      startIndex
    );
  };

  // =====================================================
  // CLOSE BUSINESS PHOTO VIEWER
  // =====================================================

  const closeBusinessPhotoViewer = () => {
    setSelectedBusinessPhoto(null);
    setSelectedBusinessPhotoIndex(0);
  };

  // =====================================================
  // NEXT BUSINESS PHOTO
  // =====================================================

  const showNextBusinessPhoto = () => {
    if (
      !selectedBusinessPhoto?.length
    ) {
      return;
    }

    setSelectedBusinessPhotoIndex(
      (previous) =>
        (previous + 1) %
        selectedBusinessPhoto.length
    );
  };

  // =====================================================
  // PREVIOUS BUSINESS PHOTO
  // =====================================================

  const showPreviousBusinessPhoto = () => {
    if (
      !selectedBusinessPhoto?.length
    ) {
      return;
    }

    setSelectedBusinessPhotoIndex(
      (previous) =>
        previous === 0
          ? selectedBusinessPhoto.length - 1
          : previous - 1
    );
  };

  // =====================================================
  // KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {
    const activeViewer =
      selectedReviewMedia ||
      selectedBusinessPhoto;

    if (!activeViewer) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (selectedBusinessPhoto) {
          closeBusinessPhotoViewer();
        }

        if (selectedReviewMedia) {
          closeReviewMediaViewer();
        }

        return;
      }

      if (event.key === "ArrowRight") {
        if (selectedBusinessPhoto) {
          showNextBusinessPhoto();
        }

        if (selectedReviewMedia) {
          showNextMedia();
        }
      }

      if (event.key === "ArrowLeft") {
        if (selectedBusinessPhoto) {
          showPreviousBusinessPhoto();
        }

        if (selectedReviewMedia) {
          showPreviousMedia();
        }
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
    selectedBusinessPhoto,
  ]);

  // =====================================================
  // LOAD SELECTED BUSINESS
  // =====================================================

  useEffect(() => {
    const loadPublicProfile =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            getToken();

          if (!token) {
            setError(
              "Please login again."
            );

            return;
          }

          const config = {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          };

          let ownerBusiness =
            null;

          // =================================================
          // SELECTED BUSINESS
          // =================================================

          if (routeBusinessId) {
            const businessResponse =
              await axios.get(
                `${API_BASE}/owner/business/${routeBusinessId}`,
                config
              );

            ownerBusiness =
              getResponseData(
                businessResponse
              );
          }

          // =================================================
          // OLD ROUTE
          // =================================================

          else {
            const businessResponse =
              await axios.get(
                `${API_BASE}/owner/business`,
                config
              );

            const businessData =
              getResponseData(
                businessResponse
              );

            ownerBusiness =
              Array.isArray(
                businessData
              )
                ? businessData[0]
                : businessData;
          }

          // =================================================
          // NO BUSINESS
          // =================================================

          if (!ownerBusiness) {
            setBusiness(null);
            setPhotos([]);
            setReviews([]);

            setReviewSummary({
              averageRating: 0,
              totalReviews: 0,
            });

            return;
          }

          console.log(
            "SELECTED OWNER BUSINESS:",
            ownerBusiness
          );

          setBusiness(
            ownerBusiness
          );

          const businessId =
            ownerBusiness?.businessId ??
            ownerBusiness?.BusinessId ??
            ownerBusiness?.id ??
            ownerBusiness?.Id;

          if (!businessId) {
            setError(
              "Business ID not found."
            );

            return;
          }

          // =================================================
          // PHOTOS
          // =================================================

          try {
            const photoResponse =
              await axios.get(
                `${API_BASE}/owner/photos/business/${businessId}`,
                config
              );

            const data =
              getResponseData(
                photoResponse
              );

            const photoList =
              Array.isArray(data)
                ? data
                : [];

            console.log(
              "BUSINESS PHOTOS:",
              photoList
            );

            setPhotos(
              photoList
            );
          } catch (photoError) {
            console.error(
              "Business photos loading error:",
              photoError
            );

            setPhotos([]);
          }

          // =================================================
          // REVIEWS
          // =================================================

          try {
            setReviewsLoading(true);

            const reviewResponse =
              await axios.get(
                `${API_BASE}/Review/business/${businessId}`,
                {
                  ...config,
                  params: {
                    page: 1,
                    pageSize: 3,
                  },
                }
              );

            console.log(
              "BUSINESS REVIEWS API RESPONSE:",
              reviewResponse.data
            );

            const reviewData =
              getResponseData(
                reviewResponse
              );

            // =================================================
            // REVIEW LIST
            // =================================================

            let reviewList = [];

            if (
              Array.isArray(
                reviewData
              )
            ) {
              reviewList =
                reviewData;
            } else if (
              Array.isArray(
                reviewData?.reviews
              )
            ) {
              reviewList =
                reviewData.reviews;
            } else if (
              Array.isArray(
                reviewData?.Reviews
              )
            ) {
              reviewList =
                reviewData.Reviews;
            } else if (
              Array.isArray(
                reviewData?.items
              )
            ) {
              reviewList =
                reviewData.items;
            } else if (
              Array.isArray(
                reviewData?.Items
              )
            ) {
              reviewList =
                reviewData.Items;
            }

            console.log(
              "BUSINESS REVIEWS:",
              reviewList
            );

            // =================================================
            // CHECK MEDIA
            // =================================================

            reviewList.forEach(
              (
                review,
                index
              ) => {
                console.log(
                  `REVIEW ${index + 1} MEDIA:`,
                  getReviewMedia(
                    review
                  )
                );
              }
            );

            // =================================================
            // REVIEW API AVERAGE
            // =================================================

            const apiAverageRating =
              normalizeNumber(
                reviewData?.averageRating ??
                reviewData?.AverageRating
              ) ?? 0;

            // =================================================
            // TOTAL REVIEWS
            // =================================================

            const totalReviewsValue =
              normalizeNumber(
                reviewData?.totalReviews ??
                reviewData?.TotalReviews ??
                reviewData?.reviewCount ??
                reviewData?.ReviewCount ??
                reviewData?.total ??
                reviewData?.Total ??
                reviewData?.totalCount ??
                reviewData?.TotalCount ??
                ownerBusiness?.reviewCount ??
                ownerBusiness?.ReviewCount
              );

            const totalReviews =
              totalReviewsValue !==
              null
                ? totalReviewsValue
                : reviewList.length;

            // =================================================
            // SAVE REVIEW SUMMARY
            // =================================================

            setReviewSummary({
              averageRating:
                apiAverageRating,

              totalReviews:
                totalReviews,
            });

            // =================================================
            // UPDATE BUSINESS REVIEW COUNT
            // =================================================

            setBusiness(
              (previous) => {
                if (!previous) {
                  return previous;
                }

                return {
                  ...previous,

                  reviewCount:
                    totalReviews,

                  ReviewCount:
                    totalReviews,
                };
              }
            );

            // =================================================
            // ONLY FIRST 3 REVIEWS
            // =================================================

            setReviews(
              reviewList.slice(
                0,
                3
              )
            );
          } catch (reviewError) {
            console.error(
              "Business reviews loading error:",
              reviewError
            );

            setReviews([]);

            setReviewSummary({
              averageRating: 0,
              totalReviews: 0,
            });
          } finally {
            setReviewsLoading(
              false
            );
          }
        } catch (err) {
          console.error(
            "Public profile loading error:",
            err
          );

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
            setBusiness(null);
            setPhotos([]);
            setReviews([]);

            setReviewSummary({
              averageRating: 0,
              totalReviews: 0,
            });
          } else {
            setError(
              "Unable to load business profile."
            );
          }
        } finally {
          setLoading(false);
        }
      };

    loadPublicProfile();
  }, [routeBusinessId]);

  // =====================================================
  // CHECK REVIEW VIEW MORE
  // =====================================================

  useEffect(() => {
    if (!reviews.length) {
      return;
    }

    const checkReviewHeights = () => {
      const states = {};

      reviews
        .slice(0, 3)
        .forEach(
          (
            review,
            index
          ) => {
            const reviewId =
              getReviewId(
                review,
                index
              );

            const element =
              reviewCommentRefs.current[
                reviewId
              ];

            if (!element) {
              return;
            }

            const computedStyle =
              window.getComputedStyle(
                element
              );

            const lineHeight =
              parseFloat(
                computedStyle.lineHeight
              );

            if (
              !Number.isFinite(
                lineHeight
              ) ||
              lineHeight <= 0
            ) {
              states[
                reviewId
              ] = false;

              return;
            }

            const twoLineHeight =
              lineHeight * 2;

            states[
              reviewId
            ] =
              element.scrollHeight >
              twoLineHeight + 1;
          }
        );

      setReviewMoreStates(
        states
      );
    };

    const timeout =
      setTimeout(
        checkReviewHeights,
        50
      );

    window.addEventListener(
      "resize",
      checkReviewHeights
    );

    return () => {
      clearTimeout(timeout);

      window.removeEventListener(
        "resize",
        checkReviewHeights
      );
    };
  }, [reviews]);

  // =====================================================
  // BUSINESS VALUES
  // =====================================================

  const businessName =
    business?.businessName ??
    business?.BusinessName ??
    "Your Business Name";

  const description =
    business?.description ??
    business?.Description ??
    "Business information will appear here.";

  const address =
    business?.address ??
    business?.Address ??
    "";

  const city =
    business?.city ??
    business?.City ??
    "";

  const phone =
    business?.phoneNumber ??
    business?.PhoneNumber ??
    "";

  const website =
    business?.website ??
    business?.Website ??
    "";

  const openingTime =
    business?.openingTime ??
    business?.OpeningTime ??
    "";

  const closingTime =
    business?.closingTime ??
    business?.ClosingTime ??
    "";

  const businessId =
    business?.businessId ??
    business?.BusinessId ??
    business?.id ??
    business?.Id;

  const categoryName =
    business?.category?.categoryName ??
    business?.category?.CategoryName ??
    business?.categoryName ??
    business?.CategoryName ??
    "Business";

  // =====================================================
  // RATING
  // =====================================================

  const ratedReviews =
    reviews.filter(
      (review) =>
        getReviewRating(
          review
        ) > 0
    );

  const calculatedRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            getReviewRating(
              review
            ),
          0
        ) /
        ratedReviews.length
      : 0;

  const backendRating =
    normalizeNumber(
      business?.rating ??
      business?.Rating ??
      business?.averageRating ??
      business?.AverageRating
    ) ?? 0;

  const reviewApiRating =
    normalizeNumber(
      reviewSummary?.averageRating
    ) ?? 0;

  const rating =
    reviewApiRating > 0
      ? reviewApiRating
      : backendRating > 0
        ? backendRating
        : calculatedRating;

  // =====================================================
  // REVIEW COUNT
  // =====================================================

  const backendReviewCount =
    normalizeNumber(
      business?.reviewCount ??
      business?.ReviewCount ??
      business?.totalReviews ??
      business?.TotalReviews
    ) ?? 0;

  const reviewCount =
    reviewSummary?.totalReviews > 0
      ? reviewSummary.totalReviews
      : backendReviewCount > 0
        ? backendReviewCount
        : reviews.length;

  // =====================================================
  // BUSINESS PHOTO URL
  // =====================================================

  const getPhotoUrl = (photo) => {
    return (
      photo?.photoUrl ??
      photo?.PhotoUrl ??
      photo?.image ??
      photo?.Image ??
      ""
    );
  };

  // =====================================================
  // NORMALIZE BUSINESS PHOTOS
  // =====================================================

  const uploadedPhotos =
    photos
      .map(
        (
          photo,
          index
        ) => {
          const url =
            getPhotoUrl(
              photo
            );

          if (!url) {
            return null;
          }

          return {
            id:
              photo?.businessPhotoId ??
              photo?.BusinessPhotoId ??
              photo?.id ??
              photo?.Id ??
              `uploaded-${index}`,

            url,

            alt:
              photo?.caption ??
              photo?.Caption ??
              `${businessName} photo`,
          };
        }
      )
      .filter(Boolean);

  /*
    IMPORTANT:

    Uploaded business photos are the SOURCE OF TRUTH.

    Sample photos are used ONLY when the business
    has no uploaded photos.
  */

  const displayPhotos =
    uploadedPhotos.length > 0
      ? uploadedPhotos
      : SAMPLE_PHOTOS;

  // =====================================================
  // BUSINESS PHOTO PREVIEW
  // =====================================================

  const visibleBusinessPhotos =
    displayPhotos.slice(
      0,
      BUSINESS_PHOTO_PREVIEW_COUNT
    );

  // =====================================================
  // REMAINING BUSINESS PHOTOS
  // =====================================================

  const remainingBusinessPhotoCount =
    Math.max(
      displayPhotos.length -
        BUSINESS_PHOTO_PREVIEW_COUNT,
      0
    );

  // =====================================================
  // COVER IMAGE
  // =====================================================

  const coverImage =
    displayPhotos[0]?.url ??
    SAMPLE_PHOTOS[0].url;

  // =====================================================
  // REVIEW USER NAME
  // =====================================================

  const getReviewUserName = (
    review
  ) => {
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
      review?.User?.fullName ??
      review?.User?.FullName ??
      review?.user?.fullName ??
      review?.user?.FullName ??
      review?.fullName ??
      review?.FullName ??
      review?.userName ??
      review?.UserName ??
      "REVIO User"
    );
  };

  // =====================================================
  // REVIEW USER ID
  // =====================================================

  const getReviewUserId = (
    review
  ) => {
    return (
      review?.userId ??
      review?.UserId ??
      review?.userID ??
      review?.UserID ??
      review?.user?.id ??
      review?.user?.Id ??
      review?.User?.id ??
      review?.User?.Id ??
      review?.user?.userId ??
      review?.user?.UserId ??
      review?.User?.userId ??
      review?.User?.UserId ??
      null
    );
  };

  // =====================================================
  // REVIEW ID
  // =====================================================

  const getReviewId = (
    review,
    fallbackIndex = null
  ) => {
    return (
      review?.reviewId ??
      review?.ReviewId ??
      review?.id ??
      review?.Id ??
      fallbackIndex
    );
  };

  // =====================================================
  // OPEN REVIEWER PROFILE
  // =====================================================

  const handleReviewUserClick = (
    review,
    index
  ) => {
    const userId =
      getReviewUserId(
        review
      );

    const reviewId =
      getReviewId(
        review,
        index
      );

    if (!userId) {
      return;
    }

    if (
      reviewId === null ||
      reviewId === undefined
    ) {
      return;
    }

    navigate(
      `/user-profile/${userId}/review/${reviewId}`
    );
  };

  // =====================================================
  // REVIEW COMMENT
  // =====================================================

  const getReviewComment = (
    review
  ) =>
    review?.comment ??
    review?.Comment ??
    "";

  // =====================================================
  // REVIEW DATE
  // =====================================================

  const getReviewDate = (
    review
  ) =>
    review?.createdAt ??
    review?.CreatedAt ??
    null;

  const formatReviewDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const parsed =
      new Date(
        date
      );

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
  // REVIEW STARS
  // =====================================================

  const renderStars = (
    reviewRating
  ) => {
    const numeric =
      normalizeNumber(
        reviewRating
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
      <div className="public-review-stars">
        {[1, 2, 3, 4, 5].map(
          (
            star
          ) => (
            <FaStar
              key={star}
              className={
                star <=
                Math.round(
                  safe
                )
                  ? "public-star-filled"
                  : "public-star-empty"
              }
            />
          )
        )}
      </div>
    );
  };

  // =====================================================
  // REVIEW COMMENT TOGGLE
  // =====================================================

  const toggleReviewComment = (
    reviewId
  ) => {
    setExpandedReviews(
      (previous) => ({
        ...previous,

        [reviewId]:
          !previous[
            reviewId
          ],
      })
    );
  };

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleViewReviews = () => {
    if (businessId) {
      navigate(
        `/owner/reviews/business/${businessId}`
      );
    } else {
      navigate(
        "/owner/reviews"
      );
    }
  };

  const handleEditBusiness = () => {
    if (businessId) {
      navigate(
        `/owner/business/${businessId}`
      );
    } else {
      navigate(
        "/owner/business"
      );
    }
  };

  // =====================================================
  // CURRENT REVIEW MODAL MEDIA
  // =====================================================

  const currentMedia =
    selectedReviewMedia?.[
      selectedMediaIndex
    ];

  const currentMediaUrl =
    currentMedia
      ? getMediaUrl(
          currentMedia?.resolvedUrl ??
          currentMedia?.mediaUrl ??
          currentMedia?.MediaUrl ??
          ""
        )
      : "";

  const currentMediaIsVideo =
    currentMedia
      ? isVideoMedia(
          currentMedia
        )
      : false;

  // =====================================================
  // CURRENT BUSINESS PHOTO
  // =====================================================

  const currentBusinessPhoto =
    selectedBusinessPhoto?.[
      selectedBusinessPhotoIndex
    ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-container">
          <div className="public-loading-card">
            <div className="public-loader"></div>

            <p>
              Loading your business profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="public-profile-page">

        <header className="public-profile-header">

          <button
            className="public-back-btn"
            onClick={() =>
              navigate(
                "/owner-dashboard"
              )
            }
          >
            <FaArrowLeft />
          </button>

          <div className="public-header-title">
            <span>
              REVIO
            </span>

            <h1>
              Public Profile
            </h1>
          </div>

        </header>

        <main className="public-profile-container">

          <section className="public-error-card">

            <h3>
              Unable to load profile
            </h3>

            <p>
              {error}
            </p>

            <button
              className="public-edit-btn"
              onClick={() =>
                navigate(
                  "/owner-dashboard"
                )
              }
            >
              Back to Businesses
            </button>

          </section>

        </main>

      </div>
    );
  }

  // =====================================================
  // NO BUSINESS
  // =====================================================

  if (!business) {
    return (
      <div className="public-profile-page">

        <header className="public-profile-header">

          <button
            className="public-back-btn"
            onClick={() =>
              navigate(
                "/owner-dashboard"
              )
            }
          >
            <FaArrowLeft />
          </button>

          <div className="public-header-title">

            <span>
              REVIO
            </span>

            <h1>
              Public Profile
            </h1>

          </div>

        </header>

        <main className="public-profile-container">

          <section className="public-error-card">

            <FaStore />

            <h3>
              No Business Found
            </h3>

            <p>
              Add a business first to view its public profile.
            </p>

            <button
              className="public-edit-btn"
              onClick={() =>
                navigate(
                  "/owner/business/new"
                )
              }
            >
              Add Business
            </button>

          </section>

        </main>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="public-profile-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="public-profile-header">

        <button
          className="public-back-btn"
          onClick={() =>
            navigate(
              "/owner-dashboard"
            )
          }
        >
          <FaArrowLeft />
        </button>

        <div className="public-header-title">

          <span>
            REVIO
          </span>

          <h1>
            Public Profile
          </h1>

        </div>

      </header>


      <main className="public-profile-container">

        {/* =====================================================
            COVER
        ===================================================== */}

        <section className="public-cover">

          <img
            src={coverImage}
            alt={`${businessName} cover`}
            className="public-cover-image"
          />

          <div className="public-cover-overlay"></div>

          <button
            className="public-favorite-btn"
            type="button"
            aria-label="Favorite"
          >
            <FaHeart />
          </button>

        </section>


        {/* =====================================================
            BUSINESS INFORMATION
        ===================================================== */}

        <section className="public-business-info">

          <div className="public-title-row">

            <div className="public-business-title">

              <h2>
                {businessName}
              </h2>

              <p className="public-category">
                {categoryName}
              </p>

            </div>

            <div className="public-rating">

              <FaStar />

              <strong>
                {rating > 0
                  ? rating.toFixed(1)
                  : "New"}
              </strong>

              <span>
                ({reviewCount}{" "}
                {reviewCount === 1
                  ? "Review"
                  : "Reviews"}
                )
              </span>

            </div>

          </div>


          {(address || city) && (
            <div className="public-info-item">

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


          {phone && (
            <div className="public-info-item">

              <FaPhone />

              <span>
                {phone}
              </span>

            </div>
          )}


          {(openingTime ||
            closingTime) && (
            <div className="public-info-item">

              <FaClock />

              <span>

                {openingTime}

                {openingTime &&
                closingTime
                  ? " - "
                  : ""}

                {closingTime}

              </span>

            </div>
          )}


          {website && (
            <a
              className="public-info-item public-website"
              href={
                website.startsWith(
                  "http"
                )
                  ? website
                  : `https://${website}`
              }
              target="_blank"
              rel="noreferrer"
            >

              <FaGlobe />

              <span>
                {website}
              </span>

              <FaChevronRight className="website-arrow" />

            </a>
          )}

        </section>


        {/* =====================================================
            ABOUT
        ===================================================== */}

        <section className="public-section">

          <h3>
            About this business
          </h3>

          <p>
            {description}
          </p>

        </section>


        {/* =====================================================
            BUSINESS PHOTOS
        ===================================================== */}

        <section className="public-section public-photos-section">

          <div className="public-section-title">

            <h3>
              Photos
            </h3>

            <span>
              {displayPhotos.length}{" "}
              {displayPhotos.length === 1
                ? "Photo"
                : "Photos"}
            </span>

          </div>


          <div className="public-photo-grid">

            {visibleBusinessPhotos.map(
              (
                photo,
                index
              ) => {

                const isLastVisible =
                  index ===
                    BUSINESS_PHOTO_PREVIEW_COUNT -
                      1 &&
                  remainingBusinessPhotoCount >
                    0;

                return (
                  <button
                    type="button"
                    className={`public-photo ${
                      index === 0
                        ? "public-photo-main"
                        : ""
                    }`}
                    key={photo.id}
                    onClick={() =>
                      openBusinessPhotoViewer(
                        displayPhotos,
                        index
                      )
                    }
                    aria-label={
                      isLastVisible
                        ? `View ${remainingBusinessPhotoCount} more business photos`
                        : `View business photo ${index + 1}`
                    }
                  >

                    <img
                      src={photo.url}
                      alt={photo.alt}
                      loading={
                        index === 0
                          ? "eager"
                          : "lazy"
                      }
                    />

                    {index === 0 && (
                      <div className="public-photo-label">
                        Featured
                      </div>
                    )}

                    {isLastVisible && (
                      <span className="public-business-photo-more-overlay">

                        <span className="public-business-photo-more-text">
                          +{remainingBusinessPhotoCount} More
                        </span>

                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

        </section>


        {/* =====================================================
            CUSTOMER REVIEWS
        ===================================================== */}

        <section className="public-section public-reviews-section">

          <div className="public-section-title">

            <div>

              <h3>
                Customer Reviews
              </h3>

              {reviewCount > 0 && (
                <span>
                  {reviewCount}{" "}
                  {reviewCount === 1
                    ? "Review"
                    : "Reviews"}
                </span>
              )}

            </div>

            <button
              className="public-view-reviews-btn"
              onClick={
                handleViewReviews
              }
              type="button"
            >
              View All
            </button>

          </div>


          {/* =================================================
              REVIEWS LOADING
          ================================================= */}

          {reviewsLoading ? (

            <div className="public-review-empty">

              <FaStar />

              <p>
                Loading customer reviews...
              </p>

            </div>

          ) : reviews.length > 0 ? (

            <div className="public-review-list">

              {reviews
                .slice(0, 3)
                .map(
                  (
                    review,
                    index
                  ) => {

                    const reviewRating =
                      getReviewRating(
                        review
                      );

                    const userName =
                      getReviewUserName(
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

                    const reviewId =
                      getReviewId(
                        review,
                        index
                      );

                    const userId =
                      getReviewUserId(
                        review
                      );

                    const reviewMedia =
                      getReviewMedia(
                        review
                      );

                    const validReviewMedia =
                      reviewMedia
                        .map(
                          (
                            media,
                            mediaIndex
                          ) => ({
                            ...media,

                            mediaIndex,

                            resolvedUrl:
                              getMediaUrl(
                                media?.mediaUrl ??
                                media?.MediaUrl ??
                                ""
                              ),
                          })
                        )
                        .filter(
                          (
                            media
                          ) =>
                            media.resolvedUrl
                        );

                    const visibleMedia =
                      validReviewMedia.slice(
                        0,
                        2
                      );

                    const remainingMediaCount =
                      Math.max(
                        validReviewMedia.length -
                          2,
                        0
                      );

                    const isExpanded =
                      Boolean(
                        expandedReviews[
                          reviewId
                        ]
                      );

                    const showViewMore =
                      Boolean(
                        reviewMoreStates[
                          reviewId
                        ]
                      );

                    return (
                      <article
                        className="public-review-card"
                        key={reviewId}
                      >

                        {/* =================================================
                            REVIEWER HEADER
                        ================================================= */}

                        <div className="public-review-top">

                          <button
                            type="button"
                            className="public-review-avatar"
                            onClick={() =>
                              handleReviewUserClick(
                                review,
                                index
                              )
                            }
                            disabled={!userId}
                          >

                            <span>
                              {userName
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                          </button>


                          <button
                            type="button"
                            className="public-review-user"
                            onClick={() =>
                              handleReviewUserClick(
                                review,
                                index
                              )
                            }
                            disabled={!userId}
                          >

                            <strong>
                              {userName}
                            </strong>

                            {date && (
                              <span>
                                {formatReviewDate(
                                  date
                                )}
                              </span>
                            )}

                          </button>


                          <div className="public-review-rating">

                            {renderStars(
                              reviewRating
                            )}

                          </div>

                        </div>


                        {/* =================================================
                            RATING VALUE
                        ================================================= */}

                        {reviewRating > 0 && (
                          <div className="public-review-rating-value">
                            {reviewRating}/5
                          </div>
                        )}


                        {/* =================================================
                            COMMENT
                        ================================================= */}

                        {comment && (
                          <div className="public-review-comment-wrapper">

                            <p
                              ref={(element) => {
                                reviewCommentRefs.current[
                                  reviewId
                                ] = element;
                              }}
                              className={`public-review-comment ${
                                isExpanded
                                  ? "public-review-comment-expanded"
                                  : ""
                              }`}
                            >
                              "{comment}"
                            </p>

                            {showViewMore && (
                              <button
                                type="button"
                                className="public-review-more-btn"
                                onClick={() =>
                                  toggleReviewComment(
                                    reviewId
                                  )
                                }
                              >
                                {isExpanded
                                  ? "View less"
                                  : "View more"}
                              </button>
                            )}

                          </div>
                        )}


                        {/* =================================================
                            REVIEW MEDIA
                        ================================================= */}

                        {validReviewMedia.length >
                          0 && (

                          <div className="public-review-media-gallery">

                            {visibleMedia.map(
                              (
                                media,
                                mediaIndex
                              ) => {

                                const mediaId =
                                  media?.reviewMediaId ??
                                  media?.ReviewMediaId ??
                                  `${reviewId}-media-${mediaIndex}`;

                                const isLastVisible =
                                  mediaIndex ===
                                    1 &&
                                  remainingMediaCount >
                                    0;

                                return (
                                  <button
                                    type="button"
                                    className="public-review-media-item"
                                    key={mediaId}
                                    onClick={() =>
                                      openReviewMediaViewer(
                                        validReviewMedia,
                                        media.mediaIndex
                                      )
                                    }
                                    aria-label={
                                      isLastVisible
                                        ? `View ${remainingMediaCount} more review media`
                                        : `View review media ${mediaIndex + 1}`
                                    }
                                  >

                                    {isVideoMedia(
                                      media
                                    ) ? (

                                      <video
                                        className="public-review-media-video"
                                        src={
                                          media.resolvedUrl
                                        }
                                        muted
                                        playsInline
                                        preload="metadata"
                                      />

                                    ) : (

                                      <img
                                        className="public-review-media-image"
                                        src={
                                          media.resolvedUrl
                                        }
                                        alt={`Review media ${
                                          mediaIndex + 1
                                        }`}
                                        loading="lazy"
                                      />

                                    )}


                                    {isLastVisible && (
                                      <span className="public-review-media-more">

                                        +{remainingMediaCount} More

                                      </span>
                                    )}

                                  </button>
                                );
                              }
                            )}

                          </div>
                        )}


                        {/* =================================================
                            OWNER REPLY
                        ================================================= */}

                        {(review?.ownerReply ||
                          review?.OwnerReply) && (

                          <div className="public-review-owner-reply">

                            <strong>
                              Business Owner Reply
                            </strong>

                            <p>
                              {review?.ownerReply ||
                                review?.OwnerReply}
                            </p>

                          </div>
                        )}

                      </article>
                    );
                  }
                )}

            </div>

          ) : (

            <div className="public-review-empty">

              <FaStar />

              <p>
                Customer reviews will appear here.
              </p>

              <span>
                Once customers review your business,
                their ratings and comments will appear here.
              </span>

            </div>

          )}

        </section>


        {/* =====================================================
            PUBLIC PREVIEW NOTE
        ===================================================== */}

        <div className="public-preview-note">

          <FaLock />

          <span>
            You are seeing this as a public user
          </span>

        </div>


        {/* =====================================================
            EDIT BUSINESS
        ===================================================== */}

        <button
          className="public-edit-btn"
          onClick={
            handleEditBusiness
          }
        >

          <FaEdit />

          {" "}

          Edit Business Information

        </button>


        {/* =====================================================
            BACK TO BUSINESSES
        ===================================================== */}

        <button
          type="button"
          className="public-edit-btn"
          style={{
            marginTop: "10px",
          }}
          onClick={() =>
            navigate(
              "/owner-dashboard"
            )
          }
        >
          Back to My Businesses
        </button>

      </main>


      {/* =====================================================
          REVIEW MEDIA VIEWER MODAL
      ===================================================== */}

      {selectedReviewMedia &&
        currentMediaUrl && (

          <div
            className="public-review-media-modal"
            onClick={
              closeReviewMediaViewer
            }
          >

            <button
              type="button"
              className="public-review-media-modal-close"
              onClick={
                closeReviewMediaViewer
              }
              aria-label="Close media viewer"
            >
              <FaTimes />
            </button>


            <div
              className="public-review-media-modal-content"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {selectedReviewMedia.length >
                1 && (

                <button
                  type="button"
                  className="public-review-media-nav public-review-media-prev"
                  onClick={
                    showPreviousMedia
                  }
                  aria-label="Previous media"
                >
                  <FaChevronLeft />
                </button>

              )}


              <div className="public-review-media-modal-image-wrapper">

                {currentMediaIsVideo ? (

                  <video
                    className="public-review-media-modal-video"
                    src={
                      currentMediaUrl
                    }
                    controls
                    autoPlay
                    playsInline
                  />

                ) : (

                  <img
                    className="public-review-media-modal-image"
                    src={
                      currentMediaUrl
                    }
                    alt={`Review media ${
                      selectedMediaIndex + 1
                    }`}
                  />

                )}

              </div>


              {selectedReviewMedia.length >
                1 && (

                <button
                  type="button"
                  className="public-review-media-nav public-review-media-next"
                  onClick={
                    showNextMedia
                  }
                  aria-label="Next media"
                >
                  <FaChevronRight />
                </button>

              )}


              <div className="public-review-media-counter">

                {selectedMediaIndex + 1}

                {" / "}

                {selectedReviewMedia.length}

              </div>

            </div>

          </div>

        )}


      {/* =====================================================
          BUSINESS PHOTO VIEWER MODAL
      ===================================================== */}

      {selectedBusinessPhoto &&
        currentBusinessPhoto && (

          <div
            className="public-business-photo-modal"
            onClick={
              closeBusinessPhotoViewer
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="public-business-photo-modal-close"
              onClick={
                closeBusinessPhotoViewer
              }
              aria-label="Close business photo viewer"
            >
              <FaTimes />
            </button>


            <div
              className="public-business-photo-modal-content"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* PREVIOUS */}

              {selectedBusinessPhoto.length >
                1 && (

                <button
                  type="button"
                  className="public-business-photo-nav public-business-photo-prev"
                  onClick={
                    showPreviousBusinessPhoto
                  }
                  aria-label="Previous business photo"
                >
                  <FaChevronLeft />
                </button>

              )}


              {/* CURRENT PHOTO */}

              <div className="public-business-photo-modal-wrapper">

                <img
                  className="public-business-photo-modal-image"
                  src={
                    currentBusinessPhoto.url
                  }
                  alt={
                    currentBusinessPhoto.alt ||
                    `${businessName} photo ${
                      selectedBusinessPhotoIndex + 1
                    }`
                  }
                />

              </div>


              {/* NEXT */}

              {selectedBusinessPhoto.length >
                1 && (

                <button
                  type="button"
                  className="public-business-photo-nav public-business-photo-next"
                  onClick={
                    showNextBusinessPhoto
                  }
                  aria-label="Next business photo"
                >
                  <FaChevronRight />
                </button>

              )}


              {/* COUNTER */}

              <div className="public-business-photo-counter">

                {selectedBusinessPhotoIndex + 1}

                {" / "}

                {selectedBusinessPhoto.length}

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default OwnerPublicProfile;
