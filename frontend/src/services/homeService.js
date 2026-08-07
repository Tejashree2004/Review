import axios from "axios";

const API_URL = "http://localhost:5213/api/Home";
const FAVORITE_API = "http://localhost:5213/api/Favorite";

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
  return axios.delete(`${FAVORITE_API}/${userId}/${placeId}`);
};

// =============================
// Get User Favorites
// =============================

export const getFavorites = (userId) => {
  return axios.get(`${FAVORITE_API}/user/${userId}`);
};