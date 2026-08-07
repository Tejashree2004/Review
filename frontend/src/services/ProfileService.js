import axios from "axios";

const API_URL = "http://localhost:5213/api/Profile";

// ==========================================
// Get User Profile
// ==========================================

export const getProfile = (userId) => {
  return axios.get(`${API_URL}/${userId}`);
};