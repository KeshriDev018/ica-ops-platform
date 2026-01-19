import axios from "axios";
import store from "@/redux/store";
import { setAccessToken, logout } from "@/redux/authSlice";

// =============================
// Axios instance
// =============================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // "/api"
  withCredentials: true, // required for refresh cookie
});

// =============================
// Attach access token to headers
// =============================
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// =============================
// Auto Refresh Token System
// =============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });

  failedQueue = [];
};

// =============================
// Response interceptor
// =============================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token (sent via HTTP-only cookie)
        const res = await axios.get("/api/auth/refresh", {
          withCredentials: true,
        });

        const newAccessToken = res.data.accessToken;

        // Save new token
        store.dispatch(setAccessToken(newAccessToken));
        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Refresh failed → logout user
        store.dispatch(logout());
        localStorage.removeItem("accessToken");

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
