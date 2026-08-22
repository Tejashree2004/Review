import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";

import "../styles/OwnerPublicProfile.css";

const API_BASE = "http://localhost:5213/api";

// =====================================================
// SAMPLE PHOTOS
// =====================================================

const SAMPLE_PHOTOS = [
  {
    id: "sample-1",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    alt: "Coffee",
  },
  {
    id: "sample-2",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85",
    alt: "Cafe interior",
  },
  {
    id: "sample-3",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    alt: "Cafe dessert",
  },
  {
    id: "sample-4",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
    alt: "Restaurant interior",
  },
];

// =====================================================
// COMPONENT
// =====================================================

function OwnerPublicProfile() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [business, setBusiness] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const cleanedValue = value.trim();

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
    if (
      !review ||
      typeof review !== "object"
    ) {
      return 0;
    }

    const possibleRatings = [
      review.rating,
      review.Rating,
      review.ratingValue,
      review.RatingValue,
      review.reviewRating,
      review.ReviewRating,
      review.stars,
      review.Stars,
      review.starRating,
      review.StarRating,
      review.ratingScore,
      review.RatingScore,
      review.review?.rating,
      review.review?.Rating,
      review.Review?.rating,
      review.Review?.Rating,
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
  // LOAD BUSINESS + PHOTOS + REVIEWS
  // =====================================================

  useEffect(() => {
    const loadPublicProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          setError("Please login again.");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // =================================================
        // GET OWNER BUSINESS
        // =================================================

        const businessResponse =
          await axios.get(
            `${API_BASE}/owner/business`,
            config
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
          setBusiness(null);
          setPhotos([]);
          setReviews([]);
          return;
        }

        console.log(
          "OWNER BUSINESS:",
          ownerBusiness
        );

        setBusiness(ownerBusiness);

        // =================================================
        // BUSINESS ID
        // =================================================

        const businessId =
          ownerBusiness.businessId ??
          ownerBusiness.BusinessId ??
          ownerBusiness.id ??
          ownerBusiness.Id;

        if (!businessId) {
          console.error(
            "Business ID not found."
          );

          setPhotos([]);
          setReviews([]);

          return;
        }

        console.log(
          "BUSINESS ID:",
          businessId
        );

        // =================================================
        // GET BUSINESS PHOTOS
        // =================================================

        try {
          const photoResponse =
            await axios.get(
              `${API_BASE}/owner/photos/business/${businessId}`,
              config
            );

          const photoData =
            photoResponse?.data?.data ??
            photoResponse?.data?.Data ??
            photoResponse?.data;

          const finalPhotos =
            Array.isArray(photoData)
              ? photoData
              : [];

          console.log(
            "BUSINESS PHOTOS:",
            finalPhotos
          );

          setPhotos(finalPhotos);
        } catch (photoError) {
          console.error(
            "Business photos loading error:",
            photoError
          );

          setPhotos([]);
        }

        // =================================================
        // GET CUSTOMER REVIEWS
        // =================================================

        try {
          setReviewsLoading(true);

          const reviewResponse =
            await axios.get(
              `${API_BASE}/Review/business/${businessId}`,
              config
            );

          console.log(
            "BUSINESS CUSTOMER REVIEWS API:",
            reviewResponse.data
          );

          const reviewData =
            reviewResponse?.data?.data ??
            reviewResponse?.data?.Data ??
            reviewResponse?.data;

          const finalReviews =
            Array.isArray(reviewData)
              ? reviewData
              : [];

          console.log(
            "FINAL PUBLIC PROFILE REVIEWS:",
            finalReviews
          );

          finalReviews.forEach(
            (review, index) => {
              console.log(
                `PUBLIC REVIEW ${index + 1}:`,
                {
                  ReviewId:
                    review?.reviewId ??
                    review?.ReviewId,

                  Rating:
                    getReviewRating(review),

                  Comment:
                    review?.comment ??
                    review?.Comment,

                  User:
                    review?.User ??
                    review?.user ??
                    review?.userName ??
                    review?.UserName,

                  CreatedAt:
                    review?.createdAt ??
                    review?.CreatedAt,
                }
              );
            }
          );

          setReviews(finalReviews);
        } catch (reviewError) {
          console.error(
            "Business reviews loading error:",
            reviewError
          );

          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } catch (err) {
        console.error(
          "Public profile loading error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (
          err.response?.status === 404
        ) {
          setBusiness(null);
          setPhotos([]);
          setReviews([]);
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
  }, []);

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
              navigate("/owner-dashboard")
            }
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>

          <div className="public-header-title">
            <span>REVIO</span>

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
                navigate("/owner/business")
              }
            >
              Add Business Information
            </button>

          </section>

        </main>

      </div>
    );
  }

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

  // =====================================================
  // ACTUAL REVIEW RATING
  // =====================================================

  const ratedReviews =
    reviews.filter((review) => {
      return getReviewRating(review) > 0;
    });

  const calculatedRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce(
          (sum, review) => {
            return (
              sum +
              getReviewRating(review)
            );
          },
          0
        ) / ratedReviews.length
      : 0;

  // =====================================================
  // BACKEND BUSINESS RATING
  // =====================================================

  const backendRating =
    normalizeNumber(
      business?.rating ??
      business?.Rating
    ) ?? 0;

  const backendReviewCount =
    Number(
      business?.reviewCount ??
      business?.ReviewCount ??
      0
    );

  // =====================================================
  // FINAL RATING
  // =====================================================

  const rating =
    ratedReviews.length > 0
      ? calculatedRating
      : backendRating;

  // =====================================================
  // FINAL REVIEW COUNT
  // =====================================================

  const reviewCount =
    reviews.length > 0
      ? reviews.length
      : backendReviewCount;

  // =====================================================
  // CATEGORY
  // =====================================================

  const categoryName =
    business?.category?.categoryName ??
    business?.category?.CategoryName ??
    business?.categoryName ??
    business?.CategoryName ??
    "Business";

  // =====================================================
  // BUSINESS ID
  // =====================================================

  const businessId =
    business?.businessId ??
    business?.BusinessId ??
    business?.id ??
    business?.Id;

  // =====================================================
  // PHOTO URL
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
  // PREPARE PHOTOS
  // =====================================================

  const uploadedPhotos =
    photos
      .map((photo, index) => {
        const url =
          getPhotoUrl(photo);

        if (!url) {
          return null;
        }

        return {
          id:
            photo?.businessPhotoId ??
            photo?.BusinessPhotoId ??
            `uploaded-${index}`,

          url,

          alt:
            photo?.caption ??
            photo?.Caption ??
            `${businessName} photo`,
        };
      })
      .filter(Boolean);

  const displayPhotos = [
    ...uploadedPhotos,
    ...SAMPLE_PHOTOS,
  ].slice(0, 4);

  // =====================================================
  // COVER IMAGE
  // =====================================================

  const coverImage =
    displayPhotos[0]?.url ??
    SAMPLE_PHOTOS[0].url;

  // =====================================================
  // VIEW ALL REVIEWS
  // =====================================================
  //
  // IMPORTANT:
  // App.jsx already has:
  //
  // /owner/reviews
  //
  // It does NOT have:
  //
  // /owner/reviews/business/:businessId
  //
  // Therefore View All uses the existing OwnerReviews
  // page. OwnerReviews should load the logged-in owner's
  // business reviews.
  // =====================================================

  const handleViewReviews = () => {
    navigate("/owner/reviews");
  };

  // =====================================================
  // REVIEW USER NAME
  // =====================================================

  const getReviewUserName = (review) => {

    // Current API response:
    // { User: "tanu" }

    if (
      typeof review?.User === "string" &&
      review.User.trim()
    ) {
      return review.User;
    }

    if (
      typeof review?.user === "string" &&
      review.user.trim()
    ) {
      return review.user;
    }

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
      "REVIO User"
    );
  };

  // =====================================================
  // REVIEW COMMENT
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
  // REVIEW DATE
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
  // FORMAT REVIEW DATE
  // =====================================================

  const formatReviewDate = (date) => {
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
  // RENDER REVIEW STARS
  // =====================================================

  const renderStars = (reviewRating) => {
    const numericRating =
      normalizeNumber(
        reviewRating
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
        className="public-review-stars"
        aria-label={`${safeRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <FaStar
              key={star}
              className={
                star <=
                Math.round(
                  safeRating
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
  // RENDER
  // =====================================================

  return (
    <div className="public-profile-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="public-profile-header">

        <button
          className="public-back-btn"
          onClick={() =>
            navigate(
              "/owner-dashboard"
            )
          }
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>

        <div className="public-header-title">

          <span>REVIO</span>

          <h1>
            Public Profile
          </h1>

        </div>

      </header>

      {/* =================================================
          MAIN PROFILE
      ================================================= */}

      <main className="public-profile-container">

        {/* =================================================
            COVER IMAGE
        ================================================= */}

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

        {/* =================================================
            BUSINESS HEADER
        ================================================= */}

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

              {rating > 0 ? (
                <>
                  <strong>
                    {rating.toFixed(1)}
                  </strong>

                  <span>
                    ({reviewCount}{" "}
                    {reviewCount === 1
                      ? "Review"
                      : "Reviews"})
                  </span>
                </>
              ) : (
                <strong>
                  New
                </strong>
              )}

            </div>

          </div>

          {/* ADDRESS */}

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

          {/* PHONE */}

          {phone && (
            <div className="public-info-item">

              <FaPhone />

              <span>
                {phone}
              </span>

            </div>
          )}

          {/* OPENING HOURS */}

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

          {/* WEBSITE */}

          {website && (
            <a
              className="public-info-item public-website"
              href={
                website.startsWith("http")
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

              <FaChevronRight
                className="website-arrow"
              />

            </a>
          )}

        </section>

        {/* =================================================
            ABOUT
        ================================================= */}

        <section className="public-section">

          <h3>
            About this business
          </h3>

          <p>
            {description}
          </p>

        </section>

        {/* =================================================
            PHOTOS
        ================================================= */}

        <section className="public-section public-photos-section">

          <div className="public-section-title">

            <h3>
              Photos
            </h3>

            <span>
              {displayPhotos.length} Photos
            </span>

          </div>

          <div className="public-photo-grid">

            {displayPhotos.map(
              (photo, index) => (
                <div
                  className={`public-photo ${
                    index === 0
                      ? "public-photo-main"
                      : ""
                  }`}
                  key={photo.id}
                >

                  <img
                    src={photo.url}
                    alt={photo.alt}
                  />

                  {index === 0 && (
                    <div className="public-photo-label">
                      Featured
                    </div>
                  )}

                </div>
              )
            )}

          </div>

        </section>

        {/* =================================================
            CUSTOMER REVIEWS
        ================================================= */}

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

            {/* VIEW ALL */}

            <button
              className="public-view-reviews-btn"
              onClick={handleViewReviews}
              type="button"
            >
              View All
            </button>

          </div>

          {/* =================================================
              LOADING REVIEWS
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
                  (review, index) => {

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

                    const reviewDate =
                      getReviewDate(
                        review
                      );

                    const reviewId =
                      review?.reviewId ??
                      review?.ReviewId ??
                      index;

                    return (
                      <article
                        className="public-review-card"
                        key={reviewId}
                      >

                        {/* CUSTOMER HEADER */}

                        <div className="public-review-top">

                          <div className="public-review-avatar">

                            <span>
                              {userName
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                          </div>

                          <div className="public-review-user">

                            <strong>
                              {userName}
                            </strong>

                            {reviewDate && (
                              <span>
                                {formatReviewDate(
                                  reviewDate
                                )}
                              </span>
                            )}

                          </div>

                          <div className="public-review-rating">

                            {renderStars(
                              reviewRating
                            )}

                          </div>

                        </div>

                        {/* RATING NUMBER */}

                        {reviewRating > 0 && (
                          <div
                            style={{
                              marginTop:
                                "5px",
                              fontSize:
                                "11px",
                              color:
                                "#777",
                              textAlign:
                                "right",
                            }}
                          >
                            {reviewRating}/5
                          </div>
                        )}

                        {/* COMMENT */}

                        {comment && (
                          <p className="public-review-comment">
                            "{comment}"
                          </p>
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
                Customer reviews will
                appear here.
              </p>

              <span>
                Once customers review
                your business, their
                ratings and comments
                will appear here.
              </span>

            </div>

          )}

        </section>

        {/* =================================================
            PUBLIC PREVIEW NOTE
        ================================================= */}

        <div className="public-preview-note">

          <FaLock />

          <span>
            You are seeing this as a
            public user
          </span>

        </div>

        {/* =================================================
            OWNER EDIT
        ================================================= */}

        <button
          className="public-edit-btn"
          onClick={() =>
            navigate(
              "/owner/business"
            )
          }
        >
          Edit Business Information
        </button>

      </main>

    </div>
  );
}

export default OwnerPublicProfile;