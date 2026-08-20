import API from "./api";

// =====================================================
// GET REVIEWS FOR A PLACE
// GET: /api/Review/place/{placeId}
// =====================================================

export const getReviews = (placeId) => {
  return API.get(`/Review/place/${placeId}`);
};


// =====================================================
// GET REVIEWS FOR A BUSINESS
// GET: /api/Review/business/{businessId}
// =====================================================

export const getBusinessReviews = (businessId) => {
  return API.get(`/Review/business/${businessId}`);
};


// =====================================================
// ADD REVIEW
// POST: /api/Review
// =====================================================

export const addReview = (data) => {
  return API.post("/Review", data);
};


// =====================================================
// DELETE REVIEW
// DELETE: /api/Review/{reviewId}
// =====================================================

export const deleteReview = (reviewId) => {
  return API.delete(`/Review/${reviewId}`);
};