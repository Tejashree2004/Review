import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import PlaceCard from "../components/PlaceCard";

function Search() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const keyword = searchParams.get("keyword");

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keyword) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5213/api/Search/place/${keyword}`)
      .then((res) => res.json())
      .then((data) => {
        setPlaces(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [keyword]);

  const handlePlaceClick = (place) => {
    console.log("Selected Place :", place);

    // Open Place Details Page
    navigate(`/place/${place.placeId}`);
  };

  return (
    <MainLayout>
      <h2 style={{ marginBottom: "20px" }}>
        Search Results for "{keyword}"
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : places.length === 0 ? (
        <p>No places found.</p>
      ) : (
        <div className="places">
          {places.map((place) => (
            <PlaceCard
              key={place.placeId}
              place={place}
              onClick={handlePlaceClick}
            />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Search;