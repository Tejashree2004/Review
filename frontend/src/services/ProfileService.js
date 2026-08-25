import axios from "axios";

const API_URL = "http://localhost:5213/api/Profile";

// ==========================================
// Get User Profile
// ==========================================

export const getProfile = (userId) => {
  return axios.get(`${API_URL}/${userId}`);
};

// ==========================================
// Update User Profile
// ==========================================

export const updateProfile = (userId, data) => {
  return axios.put(
    `${API_URL}/${userId}`,
    data
  );
};