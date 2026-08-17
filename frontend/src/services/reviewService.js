import API from "./api";

// ==========================================
// Get Reviews for a Place
// GET: /api/Review/place/{placeId}
// ==========================================

export const getReviews = (placeId) => {
  return API.get(`/Review/place/${placeId}`);
};

// ==========================================
// Add Review
// POST: /api/Review
// ==========================================

export const addReview = (data) => {
  return API.post("/Review", data);
};

// ==========================================
// Delete Review
// DELETE: /api/Review/{reviewId}
// ==========================================

export const deleteReview = (reviewId) => {
  return API.delete(`/Review/${reviewId}`);
};