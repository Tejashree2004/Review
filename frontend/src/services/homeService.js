import axios from "axios";

const API_BASE = "http://localhost:5213/api";

const API_URL = `${API_BASE}/Home`;
const FAVORITE_API = `${API_BASE}/Favorite`;
const PROFILE_API = `${API_BASE}/Profile`;

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
// MY REVIEWS
// GET: /api/Profile/{id}/reviews
// =============================

export const getMyReviews = (userId) => {
  return axios.get(
    `${PROFILE_API}/${userId}/reviews`
  );
};