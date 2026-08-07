import axios from "axios";

// ===================================
// Base API
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
  API.get("/Home/top-rated");

// ===================================
// SEARCH
// ===================================

export const searchPlace = (keyword) =>
  API.get(`/Search/place/${keyword}`);

export const searchCity = (city) =>
  API.get(`/Search/city/${city}`);

export const searchCategory = (category) =>
  API.get(`/Search/category/${category}`);

export const getSuggestions = (keyword) =>
  API.get(`/Search/suggestions/${keyword}`);

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

export default API;