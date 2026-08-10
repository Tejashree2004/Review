import { useEffect, useState } from "react";
import {
  FaSearch,
  FaSlidersH,
} from "react-icons/fa";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "../styles/SearchBar.css";

function SearchBar() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const currentKeyword =
    searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(
    currentKeyword
  );

  // Update input when URL keyword changes
  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);


  // =====================================
  // Search
  // =====================================

  const handleSearch = () => {
    const value = keyword.trim();

    if (value !== "") {
      navigate(
        `/search?keyword=${encodeURIComponent(value)}`
      );
    }
  };


  // =====================================
  // Enter Key
  // =====================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
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
          onChange={(e) =>
            setKeyword(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

      </div>



    

    </div>
  );
}

export default SearchBar;