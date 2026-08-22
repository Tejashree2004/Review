import axios from "axios";

const API_BASE = "http://localhost:5213/api";

// =====================================================
// GET BUSINESS REVIEWS
// =====================================================

export const getBusinessReviews = (businessId) => {
  return axios.get(
    `${API_BASE}/Review/business/${businessId}`
  );
};

// =====================================================
// GET PLACE REVIEWS
// =====================================================

export const getPlaceReviews = (placeId) => {
  return axios.get(
    `${API_BASE}/Review/place/${placeId}`
  );
};

// =====================================================
// ADD REVIEW
// =====================================================

export const addReview = (reviewData) => {
  return axios.post(
    `${API_BASE}/Review`,
    reviewData
  );
};

// =====================================================
// DELETE REVIEW
// =====================================================

export const deleteReview = (reviewId) => {
  return axios.delete(
    `${API_BASE}/Review/${reviewId}`
  );
};