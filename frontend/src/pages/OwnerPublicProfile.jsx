import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaStar,
  FaCamera,
} from "react-icons/fa";

import "../styles/OwnerPublicProfile.css";

function OwnerPublicProfile() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // Business information
    const savedBusiness =
      localStorage.getItem("businessProfile");

    if (savedBusiness) {
      setBusiness(JSON.parse(savedBusiness));
    }

    // Business photos
    const savedPhotos =
      localStorage.getItem("businessPhotos");

    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  return (
    <div className="public-profile-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="public-profile-header">

        <button
          className="public-back-btn"
          onClick={() => navigate("/owner-dashboard")}
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

        {/* Cover */}

        <section className="public-cover">

          <div className="public-business-icon">
            <FaBuilding />
          </div>

        </section>


        {/* Business Information */}

        <section className="public-business-info">

          <div className="public-title-row">

            <div>
              <h2>
                {business?.businessName ||
                  business?.name ||
                  "Your Business Name"}
              </h2>

              <p className="public-category">
                {business?.category ||
                  "Business Category"}
              </p>
            </div>

            <div className="public-rating">
              <FaStar />
              <span>New</span>
            </div>

          </div>


          {/* Address */}

          {(business?.address ||
            business?.city) && (

            <div className="public-info-item">

              <FaMapMarkerAlt />

              <span>
                {business?.address || ""}

                {business?.address &&
                business?.city
                  ? ", "
                  : ""}

                {business?.city || ""}
              </span>

            </div>

          )}


          {/* Phone */}

          {business?.phone && (

            <div className="public-info-item">

              <FaPhone />

              <span>
                {business.phone}
              </span>

            </div>

          )}


          {/* Opening Hours */}

          {business?.openingHours && (

            <div className="public-info-item">

              <FaClock />

              <span>
                {business.openingHours}
              </span>

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
            {business?.description ||
              "Business information will appear here once the owner completes the profile."}
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

              {photos.map((photo, index) => (

                <div
                  className="public-photo"
                  key={index}
                >

                  <img
                    src={photo}
                    alt={`Business ${index + 1}`}
                  />

                </div>

              ))}

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
                navigate("/owner/reviews")
              }
            >
              View Reviews
            </button>

          </div>

          <div className="public-review-empty">

            <FaStar />

            <p>
              Customer reviews will appear here.
            </p>

          </div>

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