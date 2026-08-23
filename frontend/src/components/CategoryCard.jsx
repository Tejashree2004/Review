import {
  FaUtensils,
  FaCoffee,
  FaHotel,
  FaDumbbell,
  FaHospital,
  FaCut,
  FaBirthdayCake,
  FaPills,
  FaShoppingBag,
  FaShoppingCart,
  FaSpa,
  FaFilm,
  FaMobileAlt,
  FaTshirt,
  FaGem,
  FaBook,
  FaPaw,
  FaPlane,
  FaCar,
  FaHome,
} from "react-icons/fa";

const icons = {
  Restaurant: <FaUtensils />,
  Cafe: <FaCoffee />,
  Hotel: <FaHotel />,
  Gym: <FaDumbbell />,
  Hospital: <FaHospital />,
  Salon: <FaCut />,
  Bakery: <FaBirthdayCake />,
  Pharmacy: <FaPills />,
  Shopping: <FaShoppingBag />,
  Supermarket: <FaShoppingCart />,
  Spa: <FaSpa />,
  Cinema: <FaFilm />,
  Electronics: <FaMobileAlt />,
  Clothing: <FaTshirt />,
  Jewellery: <FaGem />,
  Bookstore: <FaBook />,
  "Pet Store": <FaPaw />,
  "Travel Agency": <FaPlane />,
  "Car Service": <FaCar />,
  "Real Estate": <FaHome />,
};

function CategoryCard({ category, onClick }) {
  return (
    <div
      className="category-card"
      onClick={() => onClick(category)}
      style={{ cursor: "pointer" }}
    >
      <div className="category-icon">
        {icons[category.categoryName] || null}
      </div>

      <h4>
        {category.categoryName}
      </h4>
    </div>
  );
}

export default CategoryCard;