import axios from "axios";

// ─── Global Base URL ─────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: attach JWT token from localStorage ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gymToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 (auto logout) ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gymToken");
      localStorage.removeItem("gymAdmin");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
