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
// Used only when business photos are not available
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

function OwnerPublicProfile() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // LOAD BUSINESS + PHOTOS
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
        // GET /api/owner/business
        // =================================================

        const businessResponse = await axios.get(
          `${API_BASE}/owner/business`,
          config
        );

        const businessData =
          businessResponse?.data?.data ??
          businessResponse?.data?.Data ??
          businessResponse?.data;

        const ownerBusiness = Array.isArray(businessData)
          ? businessData[0]
          : businessData;

        if (!ownerBusiness) {
          setBusiness(null);
          setPhotos([]);
          return;
        }

        setBusiness(ownerBusiness);

        // =================================================
        // GET BUSINESS PHOTOS
        // GET /api/owner/photos/business/{id}
        // =================================================

        const businessId =
          ownerBusiness.businessId ??
          ownerBusiness.BusinessId;

        if (businessId) {
          try {
            const photoResponse = await axios.get(
              `${API_BASE}/owner/photos/business/${businessId}`,
              config
            );

            const photoData =
              photoResponse?.data?.data ??
              photoResponse?.data?.Data ??
              photoResponse?.data;

            setPhotos(
              Array.isArray(photoData)
                ? photoData
                : []
            );
          } catch (photoError) {
            console.error(
              "Business photos loading error:",
              photoError
            );

            // Business profile can still be displayed
            // even when photos are unavailable.
            setPhotos([]);
          }
        }
      } catch (err) {
        console.error(
          "Public profile loading error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (err.response?.status === 404) {
          setBusiness(null);
          setPhotos([]);
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

  const rating =
    Number(
      business?.rating ??
      business?.Rating ??
      0
    );

  const reviewCount =
    Number(
      business?.reviewCount ??
      business?.ReviewCount ??
      0
    );

  const categoryName =
    business?.category?.categoryName ??
    business?.category?.CategoryName ??
    "Business";

  const businessId =
    business?.businessId ??
    business?.BusinessId;

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
  //
  // Uploaded photos are used first.
  // Missing photos are filled with sample photos.
  // =====================================================

  const uploadedPhotos = photos
    .map((photo, index) => {
      const url = getPhotoUrl(photo);

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
  // NAVIGATION
  // =====================================================

  const handleViewReviews = () => {
    if (businessId) {
      navigate(
        `/owner/reviews/business/${businessId}`
      );
    } else {
      navigate("/owner/reviews");
    }
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
            navigate("/owner-dashboard")
          }
          aria-label="Go back"
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


          {/* =================================================
              ADDRESS
          ================================================= */}

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


          {/* =================================================
              PHONE
          ================================================= */}

          {phone && (
            <div className="public-info-item">

              <FaPhone />

              <span>
                {phone}
              </span>

            </div>
          )}


          {/* =================================================
              OPENING HOURS
          ================================================= */}

          {(openingTime || closingTime) && (
            <div className="public-info-item">

              <FaClock />

              <span>

                {openingTime}

                {openingTime && closingTime
                  ? " - "
                  : ""}

                {closingTime}

              </span>

            </div>
          )}


          {/* =================================================
              WEBSITE
          ================================================= */}

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

            <h3>
              Customer Reviews
            </h3>

            <button
              className="public-view-reviews-btn"
              onClick={handleViewReviews}
            >
              View All
            </button>

          </div>


          {reviewCount > 0 ? (

            <div className="public-review-card">

              <div className="public-review-top">

                <div className="public-review-avatar">

                  <span>
                    R
                  </span>

                </div>


                <div className="public-review-user">

                  <strong>
                    Customer Review
                  </strong>

                  <span>
                    Recent review
                  </span>

                </div>


                <div className="public-review-rating">

                  <FaStar />

                  <strong>
                    {rating > 0
                      ? rating.toFixed(1)
                      : "5.0"}
                  </strong>

                </div>

              </div>


              <p>
                Customers have shared their
                experience with this business.
              </p>

            </div>

          ) : (

            <div className="public-review-empty">

              <FaStar />

              <p>
                Customer reviews will appear here.
              </p>

            </div>

          )}

        </section>


        {/* =================================================
            PUBLIC PREVIEW NOTE
        ================================================= */}

        <div className="public-preview-note">

          <FaLock />

          <span>
            You are seeing this as a public user
          </span>

        </div>


        {/* =================================================
            OWNER EDIT
        ================================================= */}

        <button
          className="public-edit-btn"
          onClick={() =>
            navigate("/owner/business")
          }
        >
          Edit Business Information
        </button>

      </main>

    </div>
  );
}

export default OwnerPublicProfile;