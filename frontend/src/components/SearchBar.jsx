import { useState } from "react";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/SearchBar.css";

function SearchBar() {
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const value = keyword.trim();

      if (value !== "") {
        navigate(`/search?keyword=${value}`);
      }
    }
  };

  return (
    <div className="search-wrapper">
      {/* Search Box */}
      <div className="search-container">
        <FaSearch className="search-icon" />

        <input
          type="text"
          className="search-input"
          placeholder="Search restaurants, cafes, hotels..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* Filter Button */}
      <button className="filter-btn">
        <FaSlidersH className="filter-icon" />
      </button>
    </div>
  );
}

export default SearchBar;