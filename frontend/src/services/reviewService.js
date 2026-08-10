import axios from "axios";

const API = "http://localhost:5213/api/Review";

// ==========================================
// Get Reviews for a Place
// GET: api/review/place/{placeId}
// ==========================================

export const getReviews = (placeId) => {
  return axios.get(`${API}/place/${placeId}`);
};

// ==========================================
// Add Review
// POST: api/review
// ==========================================

export const addReview = (data) => {
  return axios.post(API, data);
};

// ==========================================
// Delete Review
// DELETE: api/review/{reviewId}
// ==========================================

export const deleteReview = (reviewId) => {
  return axios.delete(`${API}/${reviewId}`);
};