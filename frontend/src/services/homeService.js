import axios from "axios";

const API_URL = "http://localhost:5213/api/Home";
const FAVORITE_API = "http://localhost:5213/api/Favorite";
const PROFILE_API = "http://localhost:5213/api/Profile";

// =============================
// Categories
// =============================

export const getCategories = () => {
  return axios.get(`${API_URL}/categories`);
};


// =============================
// Top Rated Places
// =============================

export const getTopRatedPlaces = () => {
  return axios.get(`${API_URL}/toprated`);
};


// =============================
// AI Summary
// =============================

export const getAIReviewSummary = () => {
  return axios.get(`${API_URL}/summary`);
};


// =============================
// Place Details
// =============================

export const getPlaceDetails = (id) => {
  return axios.get(`${API_URL}/place/${id}`);
};


// =============================
// Add Favorite
// =============================

export const addFavorite = (data) => {
  return axios.post(FAVORITE_API, data);
};


// =============================
// Remove Favorite
// =============================

export const removeFavorite = (userId, placeId) => {
  return axios.delete(
    `${FAVORITE_API}/${userId}/${placeId}`
  );
};


// =============================
// Get User Favorites
// =============================

export const getFavorites = (userId) => {
  return axios.get(
    `${FAVORITE_API}/user/${userId}`
  );
};


// =============================
// Get My Reviews
// =============================
// Reviews written by the currently
// logged-in user

export const getMyReviews = (userId) => {
  return axios.get(
    `${PROFILE_API}/${userId}/reviews`
  );
};