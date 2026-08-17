import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaStar,
  FaCamera,
  FaGlobe,
} from "react-icons/fa";

import "../styles/OwnerPublicProfile.css";

const API_BASE = "http://localhost:5213/api";

function OwnerPublicProfile() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================
  // LOAD BUSINESS + PHOTOS
  // ==========================================

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

        // ======================================
        // GET OWNER BUSINESS
        // GET /api/owner/business
        // ======================================

        const businessResponse = await axios.get(
          `${API_BASE}/owner/business`,
          config
        );

        const businessData =
          businessResponse?.data?.data ??
          businessResponse?.data?.Data ??
          businessResponse?.data;

        // Backend may return an array
        const ownerBusiness = Array.isArray(businessData)
          ? businessData[0]
          : businessData;

        if (!ownerBusiness) {
          setBusiness(null);
          setPhotos([]);
          return;
        }

        setBusiness(ownerBusiness);

        // ======================================
        // GET BUSINESS PHOTOS
        // GET /api/owner/photos/business/{id}
        // ======================================

        const businessId =
          ownerBusiness.businessId ??
          ownerBusiness.BusinessId;

        if (businessId) {
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-container">
          <div className="public-review-empty">
            <p>
              Loading your business profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="public-profile-page">

        <header className="public-profile-header">

          <button
            className="public-back-btn"
            onClick={() =>
              navigate("/owner-dashboard")
            }
          >
            <FaArrowLeft />
          </button>

          <div>
            <span>REVIO</span>
            <h1>Public Profile</h1>
          </div>

        </header>

        <main className="public-profile-container">

          <section className="public-section">

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

  // ==========================================
  // BUSINESS VALUES
  // ==========================================

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

  const email =
    business?.email ??
    business?.Email ??
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
    business?.rating ??
    business?.Rating ??
    0;

  const reviewCount =
    business?.reviewCount ??
    business?.ReviewCount ??
    0;

  const categoryName =
    business?.category?.categoryName ??
    business?.category?.CategoryName ??
    "Business";

  // ==========================================
  // PHOTO URL
  // ==========================================

  const getPhotoUrl = (photo) => {
    return (
      photo?.photoUrl ??
      photo?.PhotoUrl ??
      photo?.image ??
      ""
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="public-profile-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="public-profile-header">

        <button
          className="public-back-btn"
          onClick={() =>
            navigate("/owner-dashboard")
          }
        >
          <FaArrowLeft />
        </button>

        <div>
          <span>REVIO</span>
          <h1>Public Profile</h1>
        </div>

      </header>


      {/* =========================
          PROFILE
      ========================= */}

      <main className="public-profile-container">

        {/* =========================
            COVER
        ========================= */}

        <section className="public-cover">

          <div className="public-business-icon">
            <FaBuilding />
          </div>

        </section>


        {/* =========================
            BUSINESS INFORMATION
        ========================= */}

        <section className="public-business-info">

          <div className="public-title-row">

            <div>

              <h2>
                {businessName}
              </h2>

              <p className="public-category">
                {categoryName}
              </p>

            </div>


            <div className="public-rating">

              <FaStar />

              <span>
                {rating > 0
                  ? `${Number(rating).toFixed(1)} (${reviewCount})`
                  : "New"}
              </span>

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


          {/* WEBSITE */}

          {website && (

            <div className="public-info-item">

              <FaGlobe />

              <a
                href={
                  website.startsWith("http")
                    ? website
                    : `https://${website}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {website}
              </a>

            </div>

          )}

        </section>


        {/* =========================
            ABOUT
        ========================= */}

        <section className="public-section">

          <h3>
            About this business
          </h3>

          <p>
            {description}
          </p>

        </section>


        {/* =========================
            PHOTOS
        ========================= */}

        <section className="public-section">

          <div className="public-section-title">

            <h3>
              Photos
            </h3>

            <span>
              {photos.length} photos
            </span>

          </div>


          {photos.length > 0 ? (

            <div className="public-photo-grid">

              {photos.map((photo, index) => {

                const photoUrl =
                  getPhotoUrl(photo);

                return (

                  <div
                    className="public-photo"
                    key={
                      photo?.businessPhotoId ??
                      photo?.BusinessPhotoId ??
                      index
                    }
                  >

                    {photoUrl && (

                      <img
                        src={photoUrl}
                        alt={
                          photo?.caption ??
                          photo?.Caption ??
                          `Business ${index + 1}`
                        }
                      />

                    )}

                  </div>

                );

              })}

            </div>

          ) : (

            <div className="public-empty-photos">

              <FaCamera />

              <p>
                No business photos uploaded yet.
              </p>

            </div>

          )}

        </section>


        {/* =========================
            REVIEWS
        ========================= */}

        <section className="public-section">

          <div className="public-section-title">

            <h3>
              Customer Reviews
            </h3>

            <button
              onClick={() =>
                navigate(
                  business?.businessId
                    ? `/owner/reviews/business/${business.businessId}`
                    : "/owner/reviews"
                )
              }
            >
              View Reviews
            </button>

          </div>


          {reviewCount > 0 ? (

            <div className="public-review-empty">

              <FaStar />

              <p>
                This business has{" "}
                {reviewCount} customer{" "}
                {reviewCount === 1
                  ? "review"
                  : "reviews"}.
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


        {/* =========================
            OWNER EDIT
        ========================= */}

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