import axios from "axios";

const BASE_URL = "http://localhost:5213/api/Auth"; // 👈 IMPORTANT (Auth capital A)

export const signupUser = (data) => {
  return axios.post(`${BASE_URL}/register`, data); // 👈 register (NOT signup)
};

export const loginUser = (data) => {
  return axios.post(`${BASE_URL}/login`, data);
};