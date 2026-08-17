import API from "./api";

export const signupUser = (data) => {
  return API.post("/Auth/register", data);
};

export const loginUser = (data) => {
  return API.post("/Auth/login", data);
};