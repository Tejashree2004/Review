import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

function PlaceCard({ place, onClick }) {
  // Safety Check
  if (!place) {
    return null;
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";

  // =====================================
  // Check whether result is a Business
  // =====================================

  const isBusiness =
    place.resultType === "business" ||
    Boolean(place.businessId);

  // =====================================
  // Name
  // =====================================

  const displayName = isBusiness
    ? place.businessName || "Business"
    : place.name || "Place";

  // =====================================
  // Image
  // =====================================

  let displayImage = place.imageUrl;

  // Business photos
  if (
    isBusiness &&
    Array.isArray(place.photos) &&
    place.photos.length > 0
  ) {
    const primaryPhoto = place.photos.find(
      (photo) => photo.isPrimary === true
    );

    displayImage =
      primaryPhoto?.photoUrl ||
      place.photos[0]?.photoUrl ||
      displayImage;
  }

  displayImage =
    displayImage || fallbackImage;

  // =====================================
  // Click Handler
  // =====================================

  const handleClick = () => {
    if (onClick) {
      onClick(place);
    }
  };

  return (
    <div
      className="place-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {/* =================================
          Image
      ================================= */}

      <img
        src={displayImage}
        alt={displayName}
        onError={(e) => {
          e.target.src = fallbackImage;
        }}
      />

      {/* =================================
          Content
      ================================= */}

      <div className="place-content">

        {/* Name */}

        <h3>
          {displayName}
        </h3>

        {/* Location */}

        <p>
          <FaMapMarkerAlt
            style={{ marginRight: "6px" }}
          />

          {place.city || "Location not available"}
        </p>

        {/* Rating */}

        <span>
          <FaStar
            color="#FFD700"
            style={{ marginRight: "5px" }}
          />

          {place.rating ?? 0}
        </span>

      </div>
    </div>
  );
}

export default PlaceCard;