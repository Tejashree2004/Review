import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getUserPublicProfile,
} from "../services/reviewService";

import {
  FaArrowLeft,
  FaStar,
  FaUserCircle,
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

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USER PUBLIC PROFILE + CLICKED REVIEW
  // =====================================================

  useEffect(() => {
    loadUserPublicProfile();
  }, [userId, reviewId]);

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
  // GET REVIEW
  // =====================================================

  const getReview = () => {
    return (
      profile?.review ??
      profile?.Review ??
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
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const user = getUser();

    return (
      user?.id ??
      user?.Id ??
      userId
    );
  };

  // =====================================================
  // GET CREATED AT
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
  // GET REVIEW ID
  // =====================================================

  const getReviewId = () => {
    const review = getReview();

    return (
      review?.reviewId ??
      review?.ReviewId ??
      reviewId
    );
  };

  // =====================================================
  // GET RATING
  // =====================================================

  const getRating = () => {
    const review = getReview();

    return Number(
      review?.rating ??
      review?.Rating ??
      0
    );
  };

  // =====================================================
  // GET COMMENT
  // =====================================================

  const getComment = () => {
    const review = getReview();

    return (
      review?.comment ??
      review?.Comment ??
      ""
    );
  };

  // =====================================================
  // GET REVIEW DATE
  // =====================================================

  const getReviewCreatedAt = () => {
    const review = getReview();

    return (
      review?.createdAt ??
      review?.CreatedAt ??
      null
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
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

  const renderStars = (rating) => {
    const numericRating =
      Number(rating) || 0;

    return (
      <div className="public-profile-stars">

        {[1, 2, 3, 4, 5].map(
          (star) => (
            <FaStar
              key={star}
              className={
                star <= numericRating
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>

        <div className="user-public-profile-page">

          <button
            className="user-public-profile-back-btn"
            onClick={() => navigate(-1)}
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

  if (error || !profile) {
    return (
      <MainLayout>

        <div className="user-public-profile-page">

          <button
            className="user-public-profile-back-btn"
            onClick={() => navigate(-1)}
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
              onClick={() => navigate(-1)}
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

  const rating =
    getRating();

  const comment =
    getComment();

  const userCreatedAt =
    getUserCreatedAt();

  const reviewCreatedAt =
    getReviewCreatedAt();

  const currentReviewId =
    getReviewId();

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
          onClick={() => navigate(-1)}
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
            REVIEW SECTION
        ================================================= */}

        <div className="user-public-review-section">

          <div className="user-public-review-heading">

            <div>

              <span className="user-public-review-label">
                Customer Review
              </span>

              <h2>
                Review #{currentReviewId}
              </h2>

            </div>

            <div className="user-public-review-rating">

              {renderStars(rating)}

              <strong>
                {rating.toFixed(1)}
              </strong>

            </div>

          </div>

          {/* =================================================
              REVIEW CARD
          ================================================= */}

          <div className="user-public-review-card">

            <div className="user-public-review-top">

              <div className="user-public-review-user">

                <div className="user-public-review-small-avatar">
                  {getInitial()}
                </div>

                <div>

                  <h3>
                    {userName}
                  </h3>

                  {reviewCreatedAt && (
                    <span>
                      {formatDate(
                        reviewCreatedAt
                      )}
                    </span>
                  )}

                </div>

              </div>

              {renderStars(rating)}

            </div>

            <p className="user-public-review-comment">

              {comment
                ? `"${comment}"`
                : "No comment was added with this review."}

            </p>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default UserPublicProfile;