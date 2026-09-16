
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5213/api",
});

const HOME_API = "/Home";
const FAVORITE_API = "/Favorite";
const BUSINESS_API = "/Business";
const REVIEW_API = "/Review";

// =====================================================
// CATEGORIES
// =====================================================

export const getCategories = () => {
  return API.get(`${HOME_API}/categories`);
};

// =====================================================
// TOP RATED PLACES + BUSINESSES
// =====================================================

export const getTopRatedPlaces = () => {
  return API.get(`${HOME_API}/toprated`);
};

// =====================================================
// AI REVIEW SUMMARY
// =====================================================

export const getAIReviewSummary = () => {
  return API.get(`${HOME_API}/summary`);
};

// =====================================================
// PLACE DETAILS
// =====================================================

export const getPlaceDetails = (id) => {
  return API.get(`${HOME_API}/place/${id}`);
};

// =====================================================
// BUSINESS DETAILS
// GET: /api/Business/{id}
// =====================================================

export const getBusinessDetails = (businessId) => {
  return API.get(`${BUSINESS_API}/${businessId}`);
};

// =====================================================
// ADD PLACE FAVORITE
// =====================================================

export const addFavorite = (data) => {
  return API.post(FAVORITE_API, data);
};

// =====================================================
// REMOVE PLACE FAVORITE
// =====================================================

export const removeFavorite = (userId, placeId) => {
  return API.delete(
    `${FAVORITE_API}/${userId}/${placeId}`
  );
};

// =====================================================
// ADD BUSINESS FAVORITE
// =====================================================

export const addBusinessFavorite = (data) => {
  return API.post(
    `${FAVORITE_API}/business`,
    data
  );
};

// =====================================================
// REMOVE BUSINESS FAVORITE
// =====================================================

export const removeBusinessFavorite = (
  userId,
  businessId
) => {
  return API.delete(
    `${FAVORITE_API}/business/${userId}/${businessId}`
  );
};

// =====================================================
// GET USER FAVORITES
// =====================================================

export const getFavorites = (userId) => {
  return API.get(
    `${FAVORITE_API}/user/${userId}`
  );
};

// =====================================================
// MY REVIEWS
// PAGINATED
//
// GET:
// /api/Review/my/{userId}?page=1&pageSize=10
// =====================================================

export const getMyReviews = (
  userId,
  page = 1,
  pageSize = 10
) => {
  return API.get(
    `${REVIEW_API}/my/${userId}`,
    {
      params: {
        page,
        pageSize,
      },
    }
  );
};

