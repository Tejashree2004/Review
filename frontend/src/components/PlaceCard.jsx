import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

function PlaceCard({ place, onClick }) {
  // Safety Check
  if (!place) {
    return null;
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";

  return (
    <div
      className="place-card"
      onClick={() => onClick && onClick(place)}
      style={{ cursor: "pointer" }}
    >
      <img
        src={place.imageUrl || fallbackImage}
        alt={place.name}
        onError={(e) => {
          e.target.src = fallbackImage;
        }}
      />

      <div className="place-content">
        <h3>{place.name}</h3>

        <p>
          <FaMapMarkerAlt style={{ marginRight: "6px" }} />
          {place.city}
        </p>

        <span>
          <FaStar color="#FFD700" style={{ marginRight: "5px" }} />
          {place.rating}
        </span>
      </div>
    </div>
  );
}

export default PlaceCard;