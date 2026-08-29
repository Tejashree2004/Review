import axios from "axios";

const API_BASE = "http://localhost:5213/api";

// =====================================================
// GET BUSINESS REVIEWS
// =====================================================

export const getBusinessReviews = (
  businessId,
  page = 1,
  pageSize = 10,
  rating = null
) => {
  return axios.get(
    `${API_BASE}/Review/business/${businessId}`,
    {
      params: {
        page,
        pageSize,
        ...(rating
          ? { rating }
          : {}),
      },
    }
  );
};

// =====================================================
// GET PLACE REVIEWS
// =====================================================

export const getPlaceReviews = (
  placeId,
  page = 1,
  pageSize = 10,
  rating = null
) => {
  return axios.get(
    `${API_BASE}/Review/place/${placeId}`,
    {
      params: {
        page,
        pageSize,
        ...(rating
          ? { rating }
          : {}),
      },
    }
  );
};

// =====================================================
// GET USER PUBLIC PROFILE + CLICKED REVIEW
// =====================================================

export const getUserPublicProfile = (
  userId,
  reviewId
) => {
  return axios.get(
    `${API_BASE}/Review/user/${userId}/review/${reviewId}`
  );
};

// =====================================================
// ADD REVIEW
// =====================================================

export const addReview = (
  reviewData
) => {
  return axios.post(
    `${API_BASE}/Review`,
    reviewData
  );
};

// =====================================================
// DELETE REVIEW
// =====================================================

export const deleteReview = (
  reviewId
) => {
  return axios.delete(
    `${API_BASE}/Review/${reviewId}`
  );
};