import {
  FaUtensils,
  FaCoffee,
  FaHotel,
  FaDumbbell,
} from "react-icons/fa";

const icons = {
  Restaurant: <FaUtensils />,
  Cafe: <FaCoffee />,
  Hotel: <FaHotel />,
  Gym: <FaDumbbell />,
};

function CategoryCard({ category, onClick }) {
  return (
    <div
      className="category-card"
      onClick={() => onClick(category)}
      style={{ cursor: "pointer" }}
    >
      <div className="category-icon">
        {icons[category.categoryName] || "📍"}
      </div>

      <h4>{category.categoryName}</h4>
    </div>
  );
}

export default CategoryCard;