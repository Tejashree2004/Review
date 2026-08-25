import {
  useEffect,
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
  // LOAD SELECTED BUSINESS
  // =====================================================

  useEffect(() => {
    const loadPublicProfile =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token = getToken();

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

          let ownerBusiness = null;

          // ===============================================
          // SELECTED BUSINESS
          // ===============================================

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

          // ===============================================
          // OLD ROUTE
          // ===============================================

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

          // ===============================================
          // NO BUSINESS
          // ===============================================

          if (!ownerBusiness) {
            setBusiness(null);
            setPhotos([]);
            setReviews([]);
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
            ownerBusiness?.BusinessId;

          if (!businessId) {
            setError(
              "Business ID not found."
            );
            return;
          }

          // ===============================================
          // PHOTOS
          // ===============================================

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

            setPhotos(
              Array.isArray(data)
                ? data
                : []
            );
          } catch (photoError) {
            console.error(
              "Business photos loading error:",
              photoError
            );

            setPhotos([]);
          }

          // ===============================================
          // REVIEWS
          // ===============================================

          try {
            setReviewsLoading(true);

            const reviewResponse =
              await axios.get(
                `${API_BASE}/Review/business/${businessId}`,
                config
              );

            const reviewData =
              getResponseData(
                reviewResponse
              );

            const reviewList =
              Array.isArray(
                reviewData
              )
                ? reviewData
                : [];

            console.log(
              "BUSINESS REVIEWS:",
              reviewList
            );

            setReviews(
              reviewList
            );
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
    business?.BusinessId;

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
        getReviewRating(review) > 0
    );

  const calculatedRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce(
          (sum, review) =>
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
        business?.Rating
    ) ?? 0;

  const rating =
    ratedReviews.length > 0
      ? calculatedRating
      : backendRating;

  const backendReviewCount =
    Number(
      business?.reviewCount ??
        business?.ReviewCount ??
        0
    );

  const reviewCount =
    reviews.length > 0
      ? reviews.length
      : backendReviewCount;

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

  const uploadedPhotos =
    photos
      .map(
        (photo, index) => {
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
        }
      )
      .filter(Boolean);

  const displayPhotos = [
    ...uploadedPhotos,
    ...SAMPLE_PHOTOS,
  ].slice(0, 4);

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
  // REVIEW COMMENT
  // =====================================================

  const getReviewComment =
    (review) =>
      review?.comment ??
      review?.Comment ??
      "";

  // =====================================================
  // REVIEW DATE
  // =====================================================

  const getReviewDate =
    (review) =>
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
          (star) => (
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

              {rating > 0 ? (
                <>
                  <strong>
                    {rating.toFixed(1)}
                  </strong>

                  <span>
                    ({reviewCount}{" "}
                    {reviewCount === 1
                      ? "Review"
                      : "Reviews"}
                    )
                  </span>
                </>
              ) : (
                <strong>
                  New
                </strong>
              )}
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

              <FaChevronRight
                className="website-arrow"
              />
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
            PHOTOS
        ===================================================== */}

        <section className="public-section public-photos-section">

          <div className="public-section-title">

            <h3>
              Photos
            </h3>

            <span>
              {displayPhotos.length}{" "}
              Photos
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

        {/* =====================================================
            REVIEWS
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

          {/* =====================================================
              REVIEWS LOADING
          ===================================================== */}

          {reviewsLoading ? (
            <div className="public-review-empty">
              <FaStar />

              <p>
                Loading customer reviews...
              </p>
            </div>
          ) : reviews.length > 0 ? (

            <div className="public-review-list">

              {/* Only preview first 3 reviews here.
                  View All opens complete reviewer list. */}

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
                      review?.reviewId ??
                      review?.ReviewId ??
                      index;

                    return (
                      <article
                        className="public-review-card"
                        key={reviewId}
                      >

                        <div className="public-review-top">

                          <div className="public-review-avatar">
                            <span>
                              {userName
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </span>
                          </div>

                          <div className="public-review-user">

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

                          </div>

                          <div className="public-review-rating">
                            {renderStars(
                              reviewRating
                            )}
                          </div>

                        </div>

                        {/* Actual submitted rating */}
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

                        {/* Actual submitted comment */}
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

        {/* =====================================================
            PUBLIC PREVIEW NOTE
        ===================================================== */}

        <div className="public-preview-note">

          <FaLock />

          <span>
            You are seeing this as a
            public user
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
    </div>
  );
}

export default OwnerPublicProfile;