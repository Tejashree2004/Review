import axios from "axios";

const BASE_URL = "http://localhost:5213/api/Auth";

// =====================================================
// SIGNUP
// =====================================================

export const signupUser = (data) => {
  return axios.post(`${BASE_URL}/register`, data);
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = (data) => {
  return axios.post(`${BASE_URL}/login`, data);
};

// =====================================================
// SEND EMAIL OTP
// =====================================================

export const sendEmailOtp = (data) => {
  return axios.post(
    `${BASE_URL}/send-email-otp`,
    data
  );
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================

export const verifyEmailOtp = (data) => {
  return axios.post(
    `${BASE_URL}/verify-email-otp`,
    data
  );
};