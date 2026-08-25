import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getFavorites,
  removeFavorite,
  removeBusinessFavorite,
} from "../services/HomeService";

import {
  FaArrowLeft,
  FaHeart,
  FaStar,
  FaMapMarkerAlt,
  FaTrash,
  FaThLarge,
} from "react-icons/fa";

import "../styles/Favorites.css";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId
      ? Number(userId)
      : null;
  };

  // =====================================================
  // LOAD FAVORITES
  // =====================================================

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const response =
        await getFavorites(userId);

      console.log(
        "Favorites:",
        response.data
      );

      const favoriteData =
        Array.isArray(response.data)
          ? response.data
          : [];

      setFavorites(favoriteData);

    } catch (error) {
      console.error(
        "Failed to load favorites:",
        error
      );

      setFavorites([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHECK PLACE FAVORITE
  // =====================================================

  const isPlaceFavorite = (favorite) => {
    return Boolean(
      favorite.placeId ??
      favorite.PlaceId ??
      favorite.place
    );
  };

  // =====================================================
  // CHECK BUSINESS FAVORITE
  // =====================================================

  const isBusinessFavorite = (favorite) => {
    return Boolean(
      favorite.businessId ??
      favorite.BusinessId ??
      favorite.business
    );
  };

  // =====================================================
  // GET PLACE ID
  // =====================================================

  const getPlaceId = (favorite) => {
    return (
      favorite.placeId ??
      favorite.PlaceId ??
      favorite.place?.placeId ??
      favorite.place?.PlaceId
    );
  };

  // =====================================================
  // GET BUSINESS ID
  // =====================================================

  const getBusinessId = (favorite) => {
    return (
      favorite.businessId ??
      favorite.BusinessId ??
      favorite.business?.businessId ??
      favorite.business?.BusinessId
    );
  };

  // =====================================================
  // GET PLACE
  // =====================================================

  const getPlace = (favorite) => {
    return (
      favorite.place ??
      favorite.Place ??
      null
    );
  };

  // =====================================================
  // GET BUSINESS
  // =====================================================

  const getBusiness = (favorite) => {
    return (
      favorite.business ??
      favorite.Business ??
      null
    );
  };

  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  const handleRemoveFavorite = async (
    favorite
  ) => {
    try {
      const userId = getUserId();

      if (!userId) {
        return;
      }

      const placeId =
        getPlaceId(favorite);

      const businessId =
        getBusinessId(favorite);

      // ==========================================
      // REMOVE PLACE
      // ==========================================

      if (
        isPlaceFavorite(favorite) &&
        placeId
      ) {
        await removeFavorite(
          userId,
          placeId
        );
      }

      // ==========================================
      // REMOVE BUSINESS
      // ==========================================

      else if (
        isBusinessFavorite(favorite) &&
        businessId
      ) {
        await removeBusinessFavorite(
          userId,
          businessId
        );
      }

      // Remove immediately from UI
      setFavorites(
        (previous) =>
          previous.filter(
            (item) =>
              item.favoriteId !==
              favorite.favoriteId
          )
      );

    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error
      );

      alert(
        "Failed to remove favorite."
      );
    }
  };

  // =====================================================
  // OPEN FAVORITE
  // =====================================================

  const handleFavoriteClick = (
    favorite
  ) => {
    const placeId =
      getPlaceId(favorite);

    const businessId =
      getBusinessId(favorite);

    if (
      isBusinessFavorite(favorite) &&
      businessId
    ) {
      navigate(
        `/business/${businessId}`
      );

      return;
    }

    if (
      isPlaceFavorite(favorite) &&
      placeId
    ) {
      navigate(
        `/place/${placeId}`
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>

        <div className="favorites-page">

          <div className="favorites-loading">
            Loading Favorites...
          </div>

        </div>

      </MainLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>

      <div className="favorites-page">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="favorites-header">

          <button
            className="favorites-back-btn"
            onClick={() =>
              navigate(-1)
            }
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1>
              My Favorites
            </h1>

            <p>
              Places and businesses you saved
            </p>

          </div>

          <FaHeart className="favorites-header-heart" />

        </div>

        {/* ==========================================
            EMPTY
        ========================================== */}

        {favorites.length === 0 ? (

          <div className="favorites-empty">

            <FaHeart className="empty-heart" />

            <h2>
              No Favorites Yet
            </h2>

            <p>
              Add places or businesses to your
              favorites and they will appear here.
            </p>

            <button
              className="browse-favorites-btn"
              onClick={() =>
                navigate("/home")
              }
            >
              Browse Places
            </button>

          </div>

        ) : (

          <div className="favorites-grid">

            {favorites.map(
              (favorite) => {

                const place =
                  getPlace(favorite);

                const business =
                  getBusiness(favorite);

                const placeFavorite =
                  isPlaceFavorite(
                    favorite
                  );

                const businessFavorite =
                  isBusinessFavorite(
                    favorite
                  );

                const name =
                  businessFavorite
                    ? (
                        business?.businessName ??
                        business?.BusinessName ??
                        "Business"
                      )
                    : (
                        place?.name ??
                        place?.Name ??
                        "Place"
                      );

                const imageUrl =
                  businessFavorite
                    ? (
                        business?.photos?.find(
                          (photo) =>
                            photo.isPrimary ||
                            photo.IsPrimary
                        )?.photoUrl ??
                        business?.photos?.[0]?.photoUrl ??
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
                      )
                    : (
                        place?.imageUrl ??
                        place?.ImageUrl ??
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
                      );

                const rating =
                  businessFavorite
                    ? (
                        business?.rating ??
                        business?.Rating ??
                        0
                      )
                    : (
                        place?.rating ??
                        place?.Rating ??
                        0
                      );

                const categoryName =
                  businessFavorite
                    ? (
                        business?.category?.categoryName ??
                        business?.categoryName ??
                        business?.Category?.categoryName ??
                        "Business"
                      )
                    : (
                        place?.category?.categoryName ??
                        place?.categoryName ??
                        "Place"
                      );

                const address =
                  businessFavorite
                    ? (
                        business?.address ??
                        business?.Address ??
                        "Address not available"
                      )
                    : (
                        place?.address ??
                        place?.Address ??
                        "Address not available"
                      );

                const city =
                  businessFavorite
                    ? (
                        business?.city ??
                        business?.City ??
                        ""
                      )
                    : (
                        place?.city ??
                        place?.City ??
                        ""
                      );

                return (

                  <div
                    className="favorite-card"
                    key={
                      favorite.favoriteId ??
                      favorite.FavoriteId
                    }
                    onClick={() =>
                      handleFavoriteClick(
                        favorite
                      )
                    }
                  >

                    {/* ==================================
                        IMAGE
                    ================================== */}

                    <div className="favorite-image-wrapper">

                      <img
                        src={imageUrl}
                        alt={name}
                        className="favorite-image"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";
                        }}
                      />

                      <div className="favorite-type-badge">

                        {businessFavorite
                          ? "Business"
                          : "Place"}

                      </div>

                      <button
                        className="favorite-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();

                          handleRemoveFavorite(
                            favorite
                          );
                        }}
                        title="Remove Favorite"
                      >
                        <FaTrash />
                      </button>

                    </div>

                    {/* ==================================
                        CONTENT
                    ================================== */}

                    <div className="favorite-content">

                      <h2>
                        {name}
                      </h2>

                      {/* RATING */}

                      <div className="favorite-rating">

                        <FaStar />

                        <span>
                          {Number(
                            rating
                          ).toFixed(1)}
                        </span>

                      </div>

                      {/* CATEGORY */}

                      <div className="favorite-info">

                        <FaThLarge />

                        <span>
                          {categoryName}
                        </span>

                      </div>

                      {/* LOCATION */}

                      <div className="favorite-info">

                        <FaMapMarkerAlt />

                        <span>
                          {address}

                          {city
                            ? `, ${city}`
                            : ""}
                        </span>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </MainLayout>
  );
}

export default Favorites;