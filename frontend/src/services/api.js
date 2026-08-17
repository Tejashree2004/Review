import axios from "axios";

// ===================================
// BASE API
// ===================================

const API = axios.create({
  baseURL: "http://localhost:5213/api",
});

// ===================================
// AUTH
// ===================================

export const login = (data) =>
  API.post("/Auth/login", data);

export const signup = (data) =>
  API.post("/Auth/register", data);

// ===================================
// HOME
// ===================================

export const getCategories = () =>
  API.get("/Home/categories");

export const getTopPlaces = () =>
  API.get("/Home/toprated");

export const getAIReviewSummary = () =>
  API.get("/Home/summary");

export const getPlaceDetails = (id) =>
  API.get(`/Home/place/${id}`);

// ===================================
// SEARCH
// ===================================

export const searchPlace = (keyword) =>
  API.get(
    `/Search/place/${encodeURIComponent(keyword)}`
  );

export const searchCity = (city) =>
  API.get(
    `/Search/city/${encodeURIComponent(city)}`
  );

export const searchCategory = (category) =>
  API.get(
    `/Search/category/${encodeURIComponent(category)}`
  );

export const getSuggestions = (keyword) =>
  API.get(
    `/Search/suggestions/${encodeURIComponent(keyword)}`
  );

// ===================================
// REVIEW
// ===================================

export const getReviews = (placeId) =>
  API.get(`/Review/place/${placeId}`);

export const addReview = (data) =>
  API.post("/Review", data);

export const deleteReview = (reviewId) =>
  API.delete(`/Review/${reviewId}`);

// ===================================
// FAVORITES
// ===================================

export const getFavorites = (userId) =>
  API.get(`/Favorite/user/${userId}`);

export const addFavorite = (data) =>
  API.post("/Favorite", data);

export const removeFavorite = (userId, placeId) =>
  API.delete(`/Favorite/${userId}/${placeId}`);

// ===================================
// PROFILE
// ===================================

export const getMyReviews = (userId) =>
  API.get(`/Profile/${userId}/reviews`);

export const getProfile = (userId) =>
  API.get(`/Profile/${userId}`);

export const updateProfile = (userId, data) =>
  API.put(`/Profile/${userId}`, data);

// ===================================
// NOTIFICATIONS
// ===================================

export const getNotifications = () =>
  API.get("/Notification");

export const markNotificationRead = (id) =>
  API.put(`/Notification/read/${id}`);

export const deleteNotification = (id) =>
  API.delete(`/Notification/${id}`);

// ===================================
// DEFAULT EXPORT
// ===================================

export default API;