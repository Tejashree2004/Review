import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getPlaceDetails,
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../services/HomeService";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaStar,
  FaHeart,
  FaThLarge,
  FaCommentAlt,
  FaMapMarkedAlt,
  FaPen,
} from "react-icons/fa";

import DialogBox from "../components/DialogBox";

import "../styles/PlaceDetails.css";

function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FAVORITE STATE
  // ==========================================

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  // ==========================================
  // DIALOG STATE
  // ==========================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "REVIO",
    message: "",
    type: "info",
    confirmText: "OK",
    onConfirm: null,
  });

  // ==========================================
  // SHOW DIALOG
  // ==========================================

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

  // ==========================================
  // CLOSE DIALOG
  // ==========================================

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  // ==========================================
  // HANDLE DIALOG CONFIRM
  // ==========================================

  const handleDialogConfirm = () => {
    const callback = dialog.onConfirm;

    closeDialog();

    if (callback) {
      callback();
    }
  };

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId
      ? Number(userId)
      : null;
  };

  // ==========================================
  // CHECK GUEST USER
  // ==========================================

  const isGuestUser = () => {
    return (
      localStorage.getItem("isGuest") ===
      "true"
    );
  };

  // ==========================================
  // LOAD PLACE
  // ==========================================

  useEffect(() => {
    loadPlace();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==========================================
  // LOAD PLACE DETAILS
  // ==========================================

  const loadPlace = async () => {
    try {
      setLoading(true);

      const response =
        await getPlaceDetails(id);

      console.log(
        "Place Details:",
        response.data
      );

      setPlace(response.data);

      if (response.data?.placeId) {
        await checkFavorite(
          response.data.placeId
        );
      }
    } catch (error) {
      console.error(
        "Failed to load place details:",
        error
      );

      setPlace(null);

      showDialog({
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to load place details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHECK FAVORITE
  // ==========================================

  const checkFavorite = async (
    placeId
  ) => {
    try {
      const userId = getUserId();
      const isGuest = isGuestUser();

      /*
      Guest users can browse places,
      but favorite state should not be
      loaded for them.
      */

      if (
        isGuest ||
        !userId ||
        !placeId
      ) {
        setIsFavorite(false);
        return;
      }

      const response =
        await getFavorites(userId);

      const favorites =
        Array.isArray(response.data)
          ? response.data
          : [];

      const currentPlaceId =
        Number(placeId);

      const alreadyFavorite =
        favorites.some(
          (favorite) =>
            Number(
              favorite.placeId ??
              favorite.PlaceId ??
              favorite.place?.placeId ??
              favorite.place?.PlaceId
            ) ===
            currentPlaceId
        );

      setIsFavorite(
        alreadyFavorite
      );
    } catch (error) {
      console.error(
        "Failed to check favorite:",
        error
      );

      setIsFavorite(false);
    }
  };

  // ==========================================
  // TOGGLE FAVORITE
  // ==========================================

  const handleFavorite = async () => {
    try {
      const userId = getUserId();
      const isGuest = isGuestUser();

      /*
      Guest users are allowed to browse,
      but they must login before adding
      or removing favorites.
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
            navigate("/login");
          },
        });

        return;
      }

      if (!place?.placeId) {
        return;
      }

      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(
          userId,
          place.placeId
        );

        setIsFavorite(false);
      } else {
        await addFavorite({
          userId: userId,
          placeId: place.placeId,
        });

        setIsFavorite(true);
      }
    } catch (error) {
      console.error(
        "Favorite operation failed:",
        error
      );

      showDialog({
        title: "Error",
        message:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ==========================================
  // GOOGLE MAPS
  // ==========================================

  const handleMapClick = () => {
    if (!place) {
      return;
    }

    const address = [
      place.name,
      place.address,
      place.city,
    ]
      .filter(Boolean)
      .join(", ");

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=` +
      encodeURIComponent(address);

    window.open(
      mapUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // WRITE REVIEW
  // ==========================================

  const handleWriteReview = () => {
    const userId = getUserId();
    const isGuest = isGuestUser();

    /*
    Guest users can view the place,
    but login is required before writing
    a review.
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
          navigate("/login");
        },
      });

      return;
    }

    if (!place?.placeId) {
      return;
    }

    navigate(
      `/write-review/${place.placeId}`
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

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

      </MainLayout>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!place) {
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
          Place Not Found
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

  // ==========================================
  // UI
  // ==========================================

  return (
    <MainLayout>

      {/* ==========================================
          BACK BUTTON
      ========================================== */}

      <button
        className="back-btn"
        onClick={() =>
          navigate(-1)
        }
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* ==========================================
          MAIN PLACE SECTION
      ========================================== */}

      <div className="place-details">

        {/* ==========================================
            IMAGE SECTION
        ========================================== */}

        <div className="image-section">

          <img
            src={
              place.imageUrl ||
              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
            }
            alt={
              place.name ||
              "Place"
            }
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";
            }}
          />

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

        {/* ==========================================
            DETAILS CARD
        ========================================== */}

        <div className="details-card">

          {/* NAME */}

          <h1>
            {place.name}
          </h1>

          {/* RATING */}

          <div className="rating-row">

            <FaStar className="gold-star" />

            <span>
              {place.rating ?? 0}
            </span>

            <span className="review-text">
              (
              {place.reviewCount ?? 0}
              {" "}
              Reviews)
            </span>

          </div>

          {/* LOCATION */}

          <div className="info-row">

            <FaMapMarkerAlt />

            <span>
              {place.address ||
                "Address not available"}

              {place.city
                ? `, ${place.city}`
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
              {
                place.category
                  ?.categoryName ||
                "Not available"
              }
            </strong>

          </div>

          {/* REVIEWS */}

          <div className="info-row">

            <FaCommentAlt />

            <span>
              Reviews
            </span>

            <strong>
              {place.reviewCount ?? 0}
            </strong>

          </div>

          {/* STATUS */}

          <div className="info-row">

            <span>
              Status
            </span>

            <strong
              className={
                place.openStatus
                  ? "status-badge open"
                  : "status-badge closed"
              }
            >
              {place.openStatus
                ? "Open Now"
                : "Closed"}
            </strong>

          </div>

          {/* ==========================================
              ACTION BUTTONS
          ========================================== */}

          <div className="place-actions">

            {/* MAP */}

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

            {/* REVIEW */}

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

      {/* ==========================================
          ABOUT
      ========================================== */}

      <div className="info-card">

        <h2>
          About
        </h2>

        <p>
          {place.name} is one of the
          popular places in{" "}
          {place.city ||
            "this area"}.
          Explore its details, reviews
          and location to learn more.
        </p>

      </div>

      {/* ==========================================
          STANDARD DIALOG
      ========================================== */}

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

export default PlaceDetails;