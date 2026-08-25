import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaStar,
  FaBuilding,
  FaSpinner,
  FaImage,
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

import "../styles/MyBusinesses.css";

const API_BASE =
  "http://localhost:5213/api";

function MyBusinesses() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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
  // LOAD OWNER BUSINESSES
  // =====================================================

  const loadBusinesses = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE}/owner/business`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "MY BUSINESSES:",
        response.data
      );

      const data =
        getResponseData(response);

      setBusinesses(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load businesses:",
        error
      );

      if (
        error.response?.status ===
        401
      ) {
        alert(
          "Your login session has expired. Please login again."
        );

        navigate("/login");
        return;
      }

      alert(
        "Unable to load your businesses."
      );

      setBusinesses([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadBusinesses();
  }, []);

  // =====================================================
  // BUSINESS HELPERS
  // =====================================================

  const getBusinessId = (business) => {
    return (
      business?.businessId ??
      business?.BusinessId ??
      business?.id ??
      business?.Id ??
      null
    );
  };

  const getBusinessName = (business) => {
    return (
      business?.businessName ??
      business?.BusinessName ??
      "Unnamed Business"
    );
  };

  const getBusinessDescription =
    (business) => {
      return (
        business?.description ??
        business?.Description ??
        ""
      );
    };

  const getBusinessAddress =
    (business) => {
      return (
        business?.address ??
        business?.Address ??
        ""
      );
    };

  const getBusinessCity =
    (business) => {
      return (
        business?.city ??
        business?.City ??
        ""
      );
    };

  const getBusinessState =
    (business) => {
      return (
        business?.state ??
        business?.State ??
        ""
      );
    };

  const getBusinessRating =
    (business) => {
      return (
        business?.averageRating ??
        business?.AverageRating ??
        business?.rating ??
        business?.Rating ??
        0
      );
    };

  const getBusinessReviewCount =
    (business) => {
      return (
        business?.reviewCount ??
        business?.ReviewCount ??
        business?.totalReviews ??
        business?.TotalReviews ??
        0
      );
    };

  const getBusinessPhone =
    (business) => {
      return (
        business?.phoneNumber ??
        business?.PhoneNumber ??
        ""
      );
    };

  const getCategoryName =
    (business) => {
      const category =
        business?.category ??
        business?.Category;

      return (
        category?.categoryName ??
        category?.CategoryName ??
        business?.categoryName ??
        business?.CategoryName ??
        "Business"
      );
    };

  const getBusinessImage =
    (business) => {
      const photos =
        business?.photos ??
        business?.Photos ??
        business?.businessPhotos ??
        business?.BusinessPhotos ??
        [];

      if (
        Array.isArray(photos) &&
        photos.length > 0
      ) {
        const primaryPhoto =
          photos.find(
            (photo) =>
              photo?.isPrimary === true ||
              photo?.IsPrimary === true
          );

        const photo =
          primaryPhoto ||
          photos[0];

        return (
          photo?.photoUrl ??
          photo?.PhotoUrl ??
          photo?.image ??
          photo?.Image ??
          ""
        );
      }

      return (
        business?.photoUrl ??
        business?.PhotoUrl ??
        business?.image ??
        business?.Image ??
        ""
      );
    };

  // =====================================================
  // VIEW BUSINESS
  // =====================================================

  const handleViewBusiness =
    (business) => {
      const businessId =
        getBusinessId(
          business
        );

      if (!businessId) {
        alert(
          "Business ID not found."
        );
        return;
      }

      navigate(
        `/business/${businessId}`
      );
    };

  // =====================================================
  // EDIT BUSINESS
  // =====================================================

  const handleEditBusiness =
    (business) => {
      const businessId =
        getBusinessId(
          business
        );

      if (!businessId) {
        alert(
          "Business ID not found."
        );
        return;
      }

      navigate(
        `/owner/business/${businessId}`
      );
    };

  // =====================================================
  // ADD BUSINESS
  // =====================================================

  const handleAddBusiness = () => {
    navigate(
      "/owner/business/new"
    );
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(
      "/owner-dashboard"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="my-businesses-page">

        <header className="my-businesses-header">

          <button
            type="button"
            className="my-businesses-back-btn"
            onClick={handleBack}
            aria-label="Back"
          >
            <FaArrowLeft />
          </button>

          <div className="my-businesses-brand">
            REVIO
          </div>

        </header>

        <main className="my-businesses-main">

          <div className="my-businesses-loading">

            <FaSpinner
              className="my-businesses-spinner"
            />

            <p>
              Loading your businesses...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="my-businesses-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="my-businesses-header">

        <div className="my-businesses-header-left">

          <button
            type="button"
            className="my-businesses-back-btn"
            onClick={handleBack}
            aria-label="Back"
            title="Back to Dashboard"
          >
            <FaArrowLeft />
          </button>

          <div
            className="my-businesses-brand"
            onClick={handleBack}
          >
            REVIO
          </div>

        </div>

        <div className="my-businesses-header-right">

          <span>
            My Businesses
          </span>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="my-businesses-main">

        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <section className="my-businesses-intro">

          <div className="my-businesses-intro-content">

            <span className="my-businesses-label">
              BUSINESS OWNER
            </span>

            <h1>
              My Businesses
            </h1>

            <p>
              Manage all your REVIO businesses
              from one place.
            </p>

          </div>


          <button
            type="button"
            className="my-businesses-add-btn"
            onClick={
              handleAddBusiness
            }
          >
            <FaPlus />

            <span>
              Add New Business
            </span>

          </button>

        </section>


        {/* =================================================
            BUSINESS COUNT
        ================================================= */}

        {businesses.length > 0 && (

          <div className="my-businesses-count">

            <span>
              YOUR BUSINESSES
            </span>

            <strong>
              {businesses.length}
            </strong>

          </div>

        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {businesses.length === 0 && (

          <section className="my-businesses-empty">

            <div className="my-businesses-empty-icon">
              <FaBuilding />
            </div>

            <h2>
              No businesses yet
            </h2>

            <p>
              You haven't added any businesses
              to your REVIO account yet.
            </p>

            <button
              type="button"
              className="my-businesses-empty-btn"
              onClick={
                handleAddBusiness
              }
            >
              <FaPlus />

              Add Your First Business

            </button>

          </section>

        )}


        {/* =================================================
            BUSINESS CARDS
        ================================================= */}

        {businesses.length > 0 && (

          <section className="my-businesses-grid">

            {businesses.map(
              (
                business,
                index
              ) => {

                const businessId =
                  getBusinessId(
                    business
                  );

                const businessName =
                  getBusinessName(
                    business
                  );

                const description =
                  getBusinessDescription(
                    business
                  );

                const address =
                  getBusinessAddress(
                    business
                  );

                const city =
                  getBusinessCity(
                    business
                  );

                const state =
                  getBusinessState(
                    business
                  );

                const rating =
                  Number(
                    getBusinessRating(
                      business
                    )
                  ) || 0;

                const reviewCount =
                  Number(
                    getBusinessReviewCount(
                      business
                    )
                  ) || 0;

                const category =
                  getCategoryName(
                    business
                  );

                const image =
                  getBusinessImage(
                    business
                  );

                const phone =
                  getBusinessPhone(
                    business
                  );

                return (

                  <article
                    className="my-business-card"
                    key={
                      businessId ??
                      `business-${index}`
                    }
                  >

                    {/* =========================
                        IMAGE
                    ========================= */}

                    <div className="my-business-card-image">

                      {image ? (

                        <img
                          src={image}
                          alt={businessName}
                        />

                      ) : (

                        <div className="my-business-card-placeholder">

                          <FaImage />

                        </div>

                      )}

                      <span className="my-business-card-category">
                        {category}
                      </span>

                    </div>


                    {/* =========================
                        CONTENT
                    ========================= */}

                    <div className="my-business-card-content">

                      <div className="my-business-card-number">
                        BUSINESS {index + 1}
                      </div>

                      <h2>
                        {businessName}
                      </h2>


                      {/* RATING */}

                      <div className="my-business-rating">

                        <FaStar />

                        <strong>
                          {rating > 0
                            ? rating.toFixed(1)
                            : "New"}
                        </strong>

                        <span>
                          {reviewCount > 0
                            ? `(${reviewCount} ${
                                reviewCount === 1
                                  ? "Review"
                                  : "Reviews"
                              })`
                            : "(No Reviews)"}
                        </span>

                      </div>


                      {/* LOCATION */}

                      {(city ||
                        state ||
                        address) && (

                        <div className="my-business-location">

                          <FaMapMarkerAlt />

                          <span>

                            {city}

                            {city &&
                              state &&
                              ", "}

                            {state}

                            {!city &&
                              !state &&
                              address}

                          </span>

                        </div>

                      )}


                      {/* DESCRIPTION */}

                      {description && (

                        <p className="my-business-description">
                          {description}
                        </p>

                      )}


                      {/* PHONE */}

                      {phone && (

                        <div className="my-business-phone">
                          {phone}
                        </div>

                      )}


                      {/* ACTIONS */}

                      <div className="my-business-card-actions">

                        <button
                          type="button"
                          className="my-business-view-btn"
                          onClick={() =>
                            handleViewBusiness(
                              business
                            )
                          }
                        >
                          <FaEye />

                          <span>
                            View Business
                          </span>

                        </button>


                        <button
                          type="button"
                          className="my-business-edit-btn"
                          onClick={() =>
                            handleEditBusiness(
                              business
                            )
                          }
                        >
                          <FaEdit />

                          <span>
                            Edit
                          </span>

                        </button>

                      </div>

                    </div>

                  </article>

                );
              }
            )}

          </section>

        )}

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="my-businesses-footer">

        <strong>
          REVIO
        </strong>

        <span>
          Discover. Review. Trust.
        </span>

      </footer>

    </div>
  );
}

export default MyBusinesses;