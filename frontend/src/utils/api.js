// Central Axios instance with base URL + auth token interceptor
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hirevision_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
