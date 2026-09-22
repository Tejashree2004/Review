import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

function PlaceCard({ place, onClick }) {
  // =====================================
  // Safety Check
  // =====================================

  if (!place) {
    return null;
  }

  // =====================================
  // Backend Base URL
  // =====================================

  const BACKEND_URL =
    "http://localhost:5213";

  // =====================================
  // Fallback Image
  // =====================================

  const fallbackImage =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";

  // =====================================
  // Check Result Type
  // =====================================

  const isBusiness =
    place.type === "Business" ||
    place.resultType === "business" ||
    Boolean(place.businessId);

  // =====================================
  // Display Name
  // =====================================

  const displayName =
    place.name ||
    place.businessName ||
    (isBusiness ? "Business" : "Place");

  // =====================================
  // RAW IMAGE
  // =====================================

  let rawImage =
    place.imageUrl ||
    place.ImageUrl ||
    "";

  // =====================================
  // BUSINESS PHOTOS
  // =====================================

  if (
    !rawImage &&
    isBusiness &&
    Array.isArray(place.photos) &&
    place.photos.length > 0
  ) {
    const primaryPhoto =
      place.photos.find(
        (photo) =>
          photo?.isPrimary === true ||
          photo?.IsPrimary === true
      );

    rawImage =
      primaryPhoto?.photoUrl ||
      primaryPhoto?.PhotoUrl ||
      place.photos[0]?.photoUrl ||
      place.photos[0]?.PhotoUrl ||
      "";
  }

  // =====================================
  // NORMALIZE IMAGE URL
  // =====================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    const cleanUrl =
      String(imageUrl).trim();

    if (!cleanUrl) {
      return "";
    }

    // Already absolute URL
    if (
      cleanUrl.startsWith("http://") ||
      cleanUrl.startsWith("https://") ||
      cleanUrl.startsWith("data:image/")
    ) {
      return cleanUrl;
    }

    // Relative backend URL
    return `${BACKEND_URL}${
      cleanUrl.startsWith("/")
        ? cleanUrl
        : `/${cleanUrl}`
    }`;
  };

  // =====================================
  // FINAL DISPLAY IMAGE
  // =====================================

  const displayImage =
    getImageUrl(rawImage) ||
    fallbackImage;

  // =====================================
  // DISPLAY RATING
  // =====================================

  const rating =
    place.averageRating ??
    place.AverageRating ??
    place.rating ??
    place.Rating ??
    0;

  // =====================================
  // CLICK HANDLER
  // =====================================

  const handleClick = () => {
    if (onClick) {
      onClick(place);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div
      className="place-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {/* =================================
          IMAGE
      ================================= */}

      <img
        src={displayImage}
        alt={displayName}
        onError={(event) => {
          if (
            event.currentTarget.src !==
            fallbackImage
          ) {
            event.currentTarget.src =
              fallbackImage;
          }
        }}
      />

      {/* =================================
          CONTENT
      ================================= */}

      <div className="place-content">

        {/* NAME */}

        <h3>
          {displayName}
        </h3>

        {/* LOCATION */}

        <p>
          <FaMapMarkerAlt
            style={{
              marginRight: "6px",
            }}
          />

          {place.city ||
            place.City ||
            "Location not available"}
        </p>

        {/* RATING */}

        <span>
          <FaStar
            color="#FFD700"
            style={{
              marginRight: "5px",
            }}
          />

          {Number(rating).toFixed(1)}
        </span>

      </div>
    </div>
  );
}

export default PlaceCard;