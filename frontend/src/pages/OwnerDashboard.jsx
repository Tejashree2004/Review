import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import {
  FaArrowLeft,
  FaBuilding,
  FaEye,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaStar,
  FaSignOutAlt,
  FaHome,
  FaUserCircle,
  FaPlus,
  FaEdit,
  FaChevronRight,
} from "react-icons/fa";

import "../styles/OwnerDashboard.css";

function OwnerDashboard() {
  const navigate = useNavigate();

  const API_BASE =
    "http://localhost:5213/api";

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [businesses, setBusinesses] =
    useState([]);

  const [businessesLoading, setBusinessesLoading] =
    useState(true);

  // =========================================
  // Get token
  // =========================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =========================================
  // Get logged-in user
  // =========================================

  const storedUser =
    localStorage.getItem("user");

  let user = {};

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : {};
  } catch (error) {
    console.error(
      "User data error:",
      error
    );
  }

  // =========================================
  // Owner name
  // =========================================

  const ownerName =
    user?.name ||
    user?.Name ||
    user?.fullName ||
    user?.FullName ||
    user?.username ||
    user?.Username ||
    "Owner";

  const ownerInitial = ownerName
    .trim()
    .charAt(0)
    .toUpperCase();

  // =========================================
  // Navigation
  // =========================================

  const goTo = (
    path
  ) => {
    setMenuOpen(false);
    navigate(path);
  };

  // =========================================
  // LOAD OWNER BUSINESSES
  // =========================================

  useEffect(() => {
    loadOwnerBusinesses();
  }, []);

  const loadOwnerBusinesses =
    async () => {
      try {
        setBusinessesLoading(
          true
        );

        const token =
          getToken();

        if (!token) {
          setBusinesses([]);
          return;
        }

        const config = {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        };

        const response =
          await axios.get(
            `${API_BASE}/owner/business`,
            config
          );

      
        const data =
          response?.data?.data ??
          response?.data?.Data ??
          response?.data;

        const ownerBusinesses =
          Array.isArray(data)
            ? data
            : [];

        // =====================================================
        // LOAD ACTUAL REVIEW STATISTICS
        // =====================================================
        //
        // The owner business API may return rating/reviewCount
        // as 0 or may not contain the latest values.
        //
        // ReviewController already calculates:
        // - TotalReviews
        // - AverageRating
        //
        // Therefore the Review API is used as the source of
        // truth for each business.
        // =====================================================

        const businessesWithReviewStats =
          await Promise.all(
            ownerBusinesses.map(
              async (business) => {
                const businessId =
                  business?.businessId ??
                  business?.BusinessId ??
                  business?.id ??
                  business?.Id ??
                  null;

                // -------------------------------------------------
                // No business ID -> keep existing business object
                // -------------------------------------------------

                if (!businessId) {
                  return business;
                }

                try {
                  const reviewResponse =
                    await axios.get(
                      `${API_BASE}/Review/business/${businessId}`,
                      {
                        ...config,
                        params: {
                          page: 1,
                          pageSize: 1,
                        },
                      }
                    );

               
                  const reviewData =
                    reviewResponse?.data?.data ??
                    reviewResponse?.data?.Data ??
                    reviewResponse?.data;

                  // -------------------------------------------------
                  // ACTUAL REVIEW COUNT
                  // -------------------------------------------------

                  const totalReviewsValue =
                    reviewData?.totalReviews ??
                    reviewData?.TotalReviews ??
                    reviewData?.reviewCount ??
                    reviewData?.ReviewCount ??
                    reviewData?.total ??
                    reviewData?.Total ??
                    reviewData?.totalCount ??
                    reviewData?.TotalCount;

                  const parsedReviewCount =
                    Number(
                      totalReviewsValue
                    );

                  // -------------------------------------------------
                  // ACTUAL AVERAGE RATING
                  // -------------------------------------------------

                  const averageRatingValue =
                    reviewData?.averageRating ??
                    reviewData?.AverageRating ??
                    null;

                  const parsedAverageRating =
                    Number(
                      averageRatingValue
                    );

                  return {
                    ...business,

                    // Keep both camelCase and PascalCase
                    // so the existing frontend remains compatible.
                    reviewCount:
                      Number.isFinite(
                        parsedReviewCount
                      ) &&
                      parsedReviewCount >= 0
                        ? parsedReviewCount
                        : Number(
                            business?.reviewCount ??
                            business?.ReviewCount ??
                            0
                          ),

                    ReviewCount:
                      Number.isFinite(
                        parsedReviewCount
                      ) &&
                      parsedReviewCount >= 0
                        ? parsedReviewCount
                        : Number(
                            business?.ReviewCount ??
                            business?.reviewCount ??
                            0
                          ),

                    rating:
                      Number.isFinite(
                        parsedAverageRating
                      ) &&
                      parsedAverageRating > 0
                        ? parsedAverageRating
                        : Number(
                            business?.rating ??
                            business?.Rating ??
                            0
                          ),

                    Rating:
                      Number.isFinite(
                        parsedAverageRating
                      ) &&
                      parsedAverageRating > 0
                        ? parsedAverageRating
                        : Number(
                            business?.Rating ??
                            business?.rating ??
                            0
                          ),
                  };
                } catch (reviewError) {
                  // -------------------------------------------------
                  // If review API fails, do not break the business
                  // list. Keep the original business information.
                  // -------------------------------------------------

                  console.error(
                    `Failed to load reviews for business ${businessId}:`,
                    reviewError
                  );

                  return business;
                }
              }
            )
          );

       

        setBusinesses(
          businessesWithReviewStats
        );
      } catch (error) {
        console.error(
          "Failed to load owner businesses:",
          error
        );

        setBusinesses([]);
      } finally {
        setBusinessesLoading(
          false
        );
      }
    };

  // =========================================
  // Business ID
  // =========================================

  const getBusinessId =
    (business) => {
      return (
        business?.businessId ??
        business?.BusinessId ??
        business?.id ??
        business?.Id ??
        null
      );
    };

  // =========================================
  // Business name
  // =========================================

  const getBusinessName =
    (business) => {
      return (
        business?.businessName ??
        business?.BusinessName ??
        "Business"
      );
    };

  // =========================================
  // Business category
  // =========================================

  const getBusinessCategory =
    (business) => {
      return (
        business?.category?.categoryName ??
        business?.category?.CategoryName ??
        business?.categoryName ??
        business?.CategoryName ??
        "Business"
      );
    };

  // =========================================
  // Business location
  // =========================================

  const getBusinessLocation =
    (business) => {
      const city =
        business?.city ??
        business?.City ??
        "";

      const address =
        business?.address ??
        business?.Address ??
        "";

      if (
        city &&
        address
      ) {
        return `${city}, ${address}`;
      }

      return (
        city ||
        address ||
        "Location not available"
      );
    };

  // =========================================
  // Manage Business
  // =========================================

  const handleManageBusiness =
    (
      businessId
    ) => {
      if (!businessId) {
        return;
      }

      navigate(
        `/owner/business/${businessId}`
      );
    };

  // =========================================
  // Add New Business
  // =========================================

  const handleAddNewBusiness =
    () => {
      navigate(
        "/owner/business/new"
      );
    };

  // =========================================
  // Logout
  // =========================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "userId"
      );

      localStorage.removeItem(
        "isLoggedIn"
      );

      localStorage.removeItem(
        "userRole"
      );

      setMenuOpen(false);

      navigate(
        "/login"
      );
    };

  return (
    <div className="owner-dashboard">

      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="owner-navbar">

        <div className="owner-navbar-left">

          <button
            className="owner-back-btn"
            onClick={() =>
              navigate(
                "/role-selection"
              )
            }
            aria-label="Back to role selection"
            title="Back"
          >
            <FaArrowLeft />
          </button>

          <div
            className="owner-brand"
            onClick={() =>
              navigate(
                "/owner-dashboard"
              )
            }
          >
            REVIO
          </div>

        </div>


        <div className="owner-navbar-right">

          <span className="owner-name">
            {ownerName}
          </span>

          <button
            className="owner-menu-btn"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open menu"
            title="Menu"
          >
            <FaBars />
          </button>

          <button
            className="owner-profile"
            onClick={() =>
              goTo(
                businesses.length >
                  0
                  ? `/owner/public-profile/${getBusinessId(
                      businesses[0]
                    )}`
                  : "/owner/business"
              )
            }
            title={ownerName}
            aria-label="Business profile"
          >
            {ownerInitial || (
              <FaUserCircle />
            )}
          </button>

        </div>

      </header>


      {/* =================================================
          OVERLAY
      ================================================= */}

      {menuOpen && (
        <div
          className="owner-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}


      {/* =================================================
          SIDE MENU
      ================================================= */}

      <aside
        className={`owner-side-menu ${
          menuOpen
            ? "open"
            : ""
        }`}
      >

        <div className="owner-menu-header">

          <div className="owner-menu-user">

            <div className="owner-menu-avatar">
              {ownerInitial}
            </div>

            <div>

              <strong>
                {ownerName}
              </strong>

              <span>
                Business Owner
              </span>

            </div>

          </div>

          <button
            className="owner-menu-close"
            onClick={() =>
              setMenuOpen(
                false
              )
            }
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

        </div>


        <nav className="owner-menu-nav">

          {/* Dashboard */}

          <button
            onClick={() =>
              goTo(
                "/owner-dashboard"
              )
            }
          >
            <FaHome />

            <span>
              Dashboard
            </span>
          </button>


          {/* Business Profile */}

          <button
            onClick={() =>
              goTo(
                businesses.length >
                  0
                  ? `/owner/business/${getBusinessId(
                      businesses[0]
                    )}`
                  : "/owner/business"
              )
            }
          >
            <FaBuilding />

            <span>
              Business Profile
            </span>
          </button>


          {/* =================================================
              MY BUSINESSES - NEW OPTION
          ================================================= */}

          <button
            onClick={() =>
              goTo(
                "/owner/my-businesses"
              )
            }
          >
            <FaBuilding />

            <span>
              My Businesses
            </span>
          </button>


          {/* =================================================
              BUSINESS PHOTOS REMOVED

              Photos are now inside the Business Profile form.
          ================================================= */}


          {/* Public Profile */}

          <button
            onClick={() =>
              goTo(
                businesses.length >
                  0
                  ? `/owner/public-profile/${getBusinessId(
                      businesses[0]
                    )}`
                  : "/owner/public-profile"
              )
            }
          >
            <FaEye />

            <span>
              Public Profile
            </span>
          </button>

        </nav>


        <div className="owner-menu-bottom">

          <button
            className="owner-logout-btn"
            onClick={
              handleLogout
            }
          >
            <FaSignOutAlt />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <main className="owner-main">

        {/* PAGE HEADER */}

        <section className="owner-page-header">

          <span className="owner-eyebrow">
            BUSINESS OWNER
          </span>

          <h1>
            Set up your business
          </h1>

          <p>
            Add your business details to start
            appearing on REVIO and reach more
            customers.
          </p>

        </section>


        {/* =================================================
            MY BUSINESSES
        ================================================= */}

        <section className="owner-businesses-section">

          <div className="owner-businesses-heading">

            <div>

              <span className="owner-eyebrow">
                YOUR BUSINESSES
              </span>

              <h2>
                My Businesses
              </h2>

              <p>
                Manage all your REVIO businesses
                from one place.
              </p>

            </div>


            <button
              type="button"
              className="add-business-btn"
              onClick={
                handleAddNewBusiness
              }
            >
              <FaPlus />

              <span>
                Add New Business
              </span>
            </button>

          </div>


          {businessesLoading ? (

            <div className="businesses-loading">
              Loading your businesses...
            </div>

          ) : businesses.length ===
            0 ? (

            <div className="no-owner-businesses">

              <div className="no-business-icon">
                <FaBuilding />
              </div>

              <h3>
                No business added yet
              </h3>

              <p>
                Create your first business
                to start building your REVIO
                profile.
              </p>

              <button
                type="button"
                className="add-business-btn"
                onClick={
                  handleAddNewBusiness
                }
              >
                <FaPlus />

                Add Your Business
              </button>

            </div>

          ) : (

            <div className="owner-business-list">

              {businesses.map(
                (
                  business,
                  index
                ) => {

                  const businessId =
                    getBusinessId(
                      business
                    );

                  const name =
                    getBusinessName(
                      business
                    );

                  const category =
                    getBusinessCategory(
                      business
                    );

                  const location =
                    getBusinessLocation(
                      business
                    );

                  // =================================================
                  // ACTUAL REVIEW RATING
                  // =================================================

                  const ratingValue =
                    business?.rating ??
                    business?.Rating ??
                    0;

                  const rating =
                    Number(
                      ratingValue
                    );

                  // =================================================
                  // ACTUAL REVIEW COUNT
                  // =================================================

                  const reviewCountValue =
                    business?.reviewCount ??
                    business?.ReviewCount ??
                    business?.totalReviews ??
                    business?.TotalReviews ??
                    0;

                  const reviewCount =
                    Number(
                      reviewCountValue
                    );

                  return (
                    <article
                      className="owner-business-item"
                      key={
                        businessId ??
                        `business-${index}`
                      }
                    >

                      <div className="owner-business-icon">
                        <FaBuilding />
                      </div>


                      <div className="owner-business-info">

                        <h3>
                          {name}
                        </h3>

                        <div className="owner-business-meta">

                          <span>
                            {category}
                          </span>

                          <span>
                            {location}
                          </span>

                        </div>


                        <div className="owner-business-rating">

                          <FaStar />

                          <span>
                            {Number.isFinite(
                              rating
                            ) &&
                            rating >
                              0
                              ? rating.toFixed(
                                  1
                                )
                              : "New"}
                          </span>

                          <span>
                            (
                            {Number.isFinite(
                              reviewCount
                            )
                              ? reviewCount
                              : 0}{" "}
                            {reviewCount ===
                            1
                              ? "Review"
                              : "Reviews"}
                            )
                          </span>

                        </div>

                      </div>


                      <div className="owner-business-actions">

                        <button
                          type="button"
                          className="business-manage-btn"
                          onClick={() =>
                            handleManageBusiness(
                              businessId
                            )
                          }
                        >
                          <FaEdit />

                          <span>
                            Manage
                          </span>
                        </button>


                        <button
                          type="button"
                          className="business-open-btn"
                          onClick={() =>
                            navigate(
                              `/owner/public-profile/${businessId}`
                            )
                          }
                          title="Open Public Profile"
                        >
                          <FaChevronRight />
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            PROGRESS
        ================================================= */}

        <section className="setup-progress">

          <div className="progress-top">

            <span>
              Profile setup
            </span>

            <strong>
              {businesses.length >
              0
                ? "2 / 2"
                : "0 / 2"}
            </strong>

          </div>

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width:
                  businesses.length >
                  0
                    ? "100%"
                    : "0%",
              }}
            ></div>

          </div>

        </section>


        {/* =================================================
            SETUP STEPS
        ================================================= */}

        <section className="setup-steps">

          {/* STEP 01 - BUSINESS */}

          <div
            className="setup-card active"
            onClick={() =>
              navigate(
                "/owner/business/new"
              )
            }
          >

            <div className="setup-number">
              01
            </div>

            <div className="setup-icon">
              <FaBuilding />
            </div>

            <div className="setup-content">

              <span className="setup-label">
                BUSINESS INFORMATION
              </span>

              <h2>
                Add or manage your business
              </h2>

              <p>
                Add business details, contact
                information, opening hours and
                business photos.
              </p>

            </div>

            <button
              className="setup-arrow"
              onClick={(e) => {
                e.stopPropagation();

                navigate(
                  "/owner/business/new"
                );
              }}
              aria-label="Add business"
            >
              <FaArrowRight />
            </button>

          </div>


          {/* STEP 02 - PUBLIC PROFILE */}

          <div
            className="setup-card"
            onClick={() => {

              if (
                businesses.length >
                0
              ) {
                navigate(
                  `/owner/public-profile/${getBusinessId(
                    businesses[0]
                  )}`
                );
              } else {
                navigate(
                  "/owner/public-profile"
                );
              }

            }}
          >

            <div className="setup-number">
              02
            </div>

            <div className="setup-icon">
              <FaEye />
            </div>

            <div className="setup-content">

              <span className="setup-label">
                PUBLIC PROFILE
              </span>

              <h2>
                Preview your profile
              </h2>

              <p>
                See how your business will appear
                to REVIO users.
              </p>

            </div>

            <button
              className="setup-arrow"
              onClick={(e) => {
                e.stopPropagation();

                if (
                  businesses.length >
                  0
                ) {
                  navigate(
                    `/owner/public-profile/${getBusinessId(
                      businesses[0]
                    )}`
                  );
                } else {
                  navigate(
                    "/owner/public-profile"
                  );
                }

              }}
              aria-label="Preview profile"
            >
              <FaArrowRight />
            </button>

          </div>

        </section>


        {/* =================================================
            DISCOVERY
        ================================================= */}

        <section className="discovery-box">

          <div className="discovery-line"></div>

          <div>

            <h3>
              Get discovered on REVIO
            </h3>

            <p>
              A complete profile helps customers
              find your business, read reviews
              and learn more about your services.
            </p>

          </div>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="owner-footer">

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

export default OwnerDashboard;