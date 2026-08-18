import axios from "axios";

const API_BASE = "http://localhost:5213/api";

const API_URL = `${API_BASE}/Home`;
const FAVORITE_API = `${API_BASE}/Favorite`;
const PROFILE_API = `${API_BASE}/Profile`;
const BUSINESS_API = `${API_BASE}/Business`;

// =====================================================
// CATEGORIES
// =====================================================

export const getCategories = () => {
  return axios.get(
    `${API_URL}/categories`
  );
};

// =====================================================
// TOP RATED PLACES + BUSINESSES
// =====================================================

export const getTopRatedPlaces = () => {
  return axios.get(
    `${API_URL}/toprated`
  );
};

// =====================================================
// AI REVIEW SUMMARY
// =====================================================

export const getAIReviewSummary = () => {
  return axios.get(
    `${API_URL}/summary`
  );
};

// =====================================================
// PLACE DETAILS
// =====================================================

export const getPlaceDetails = (id) => {
  return axios.get(
    `${API_URL}/place/${id}`
  );
};

// =====================================================
// BUSINESS DETAILS
// GET: /api/Business/{id}
// =====================================================

export const getBusinessDetails = (businessId) => {
  return axios.get(
    `${BUSINESS_API}/${businessId}`
  );
};

// =====================================================
// ADD FAVORITE
// =====================================================

export const addFavorite = (data) => {
  return axios.post(
    FAVORITE_API,
    data
  );
};

// =====================================================
// REMOVE FAVORITE
// =====================================================

export const removeFavorite = (
  userId,
  placeId
) => {
  return axios.delete(
    `${FAVORITE_API}/${userId}/${placeId}`
  );
};

// =====================================================
// GET USER FAVORITES
// =====================================================

export const getFavorites = (userId) => {
  return axios.get(
    `${FAVORITE_API}/user/${userId}`
  );
};

// =====================================================
// MY REVIEWS
// GET: /api/Profile/{id}/reviews
// =====================================================

export const getMyReviews = (userId) => {
  return axios.get(
    `${PROFILE_API}/${userId}/reviews`
  );
};