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

import DialogBox from "../components/DialogBox";

import "../styles/Favorites.css";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // DIALOG
  // =====================================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "REVIO",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const showDialog = ({
    title = "REVIO",
    message,
    type = "info",
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = false,
    onConfirm = null,
    onCancel = null,
  }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm,
      onCancel,
    });
  };

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const handleDialogConfirm = () => {
    const callback = dialog.onConfirm;

    closeDialog();

    if (callback) {
      callback();
    }
  };

  const handleDialogCancel = () => {
    const callback = dialog.onCancel;

    closeDialog();

    if (callback) {
      callback();
    }
  };

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId ? Number(userId) : null;
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
        showDialog({
          title: "Login Required",
          message: "Please login first.",
          type: "warning",
          onConfirm: () => {
            navigate("/login");
          },
        });

        return;
      }

      const response = await getFavorites(userId);

      console.log("Favorites:", response.data);

      const favoriteData = Array.isArray(response.data)
        ? response.data
        : [];

      setFavorites(favoriteData);
    } catch (error) {
      console.error("Failed to load favorites:", error);

      setFavorites([]);

      showDialog({
        title: "Favorites Error",
        message:
          error.response?.data?.message ||
          "Failed to load favorites. Please try again.",
        type: "error",
      });
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
  // GET FAVORITE ID
  // =====================================================

  const getFavoriteId = (favorite) => {
    return (
      favorite.favoriteId ??
      favorite.FavoriteId
    );
  };

  // =====================================================
  // GET AVERAGE RATING
  // =====================================================
  // IMPORTANT:
  // Home / Business Details may return the calculated
  // average using averageRating instead of rating.
  //
  // We support all common property variations here so
  // Favorites always displays the actual calculated value.
  // =====================================================

  const getAverageRating = (item) => {
    if (!item) {
      return 0;
    }

    const rating =
      item.averageRating ??
      item.AverageRating ??
      item.avgRating ??
      item.AvgRating ??
      item.rating ??
      item.Rating ??
      item.average ??
      item.Average ??
      0;

    const numericRating = Number(rating);

    return Number.isFinite(numericRating)
      ? numericRating
      : 0;
  };

  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  const removeFavoriteFromBackend = async (
    favorite
  ) => {
    try {
      const userId = getUserId();

      if (!userId) {
        return;
      }

      const placeId = getPlaceId(favorite);

      const businessId = getBusinessId(favorite);

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

      // ==========================================
      // REMOVE FROM UI
      // ==========================================

      const favoriteId =
        getFavoriteId(favorite);

      setFavorites((previous) =>
        previous.filter((item) => {
          const itemId =
            getFavoriteId(item);

          if (
            favoriteId != null &&
            itemId != null
          ) {
            return itemId !== favoriteId;
          }

          return item !== favorite;
        })
      );
    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error
      );

      showDialog({
        title: "Remove Failed",
        message:
          error.response?.data?.message ||
          "Failed to remove favorite. Please try again.",
        type: "error",
      });
    }
  };

  // =====================================================
  // REMOVE CONFIRMATION
  // =====================================================

  const handleRemoveFavorite = (
    favorite
  ) => {
    const place = getPlace(favorite);

    const business = getBusiness(favorite);

    const name = isBusinessFavorite(
      favorite
    )
      ? business?.businessName ??
        business?.BusinessName ??
        "this business"
      : place?.name ??
        place?.Name ??
        "this place";

    showDialog({
      title: "Remove Favorite?",
      message:
        `Are you sure you want to remove "${name}" from your favorites?`,
      type: "warning",
      confirmText: "Remove",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm: () => {
        removeFavoriteFromBackend(
          favorite
        );
      },
    });
  };

  // =====================================================
  // OPEN FAVORITE
  // =====================================================

  const handleFavoriteClick = (
    favorite
  ) => {
    const placeId = getPlaceId(favorite);

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
      navigate(`/place/${placeId}`);
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

        <DialogBox
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          showCancel={dialog.showCancel}
          onConfirm={handleDialogConfirm}
          onCancel={handleDialogCancel}
        />
      </MainLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>
      <div className="favorites-page">

        {/* HEADER */}

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

        {/* EMPTY */}

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
                        business?.photos?.find(
                          (photo) =>
                            photo.isPrimary ||
                            photo.IsPrimary
                        )?.PhotoUrl ??
                        business?.photos?.[0]?.photoUrl ??
                        business?.photos?.[0]?.PhotoUrl ??
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
                      )
                    : (
                        place?.imageUrl ??
                        place?.ImageUrl ??
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
                      );

                // ==========================================
                // FIX:
                // Use actual calculated average rating.
                // ==========================================

                const rating =
                  businessFavorite
                    ? getAverageRating(
                        business
                      )
                    : getAverageRating(
                        place
                      );

                const categoryName =
                  businessFavorite
                    ? (
                        business?.category?.categoryName ??
                        business?.category?.CategoryName ??
                        business?.categoryName ??
                        business?.CategoryName ??
                        business?.Category?.categoryName ??
                        business?.Category?.CategoryName ??
                        "Business"
                      )
                    : (
                        place?.category?.categoryName ??
                        place?.category?.CategoryName ??
                        place?.categoryName ??
                        place?.CategoryName ??
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

                const favoriteId =
                  getFavoriteId(
                    favorite
                  );

                return (
                  <div
                    className="favorite-card"
                    key={
                      favoriteId ??
                      `${businessFavorite ? "business" : "place"}-${getBusinessId(favorite) ?? getPlaceId(favorite)}`
                    }
                    onClick={() =>
                      handleFavoriteClick(
                        favorite
                      )
                    }
                  >

                    {/* IMAGE */}

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

                    {/* CONTENT */}

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

      {/* STANDARD DIALOG */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

    </MainLayout>
  );
}

export default Favorites;