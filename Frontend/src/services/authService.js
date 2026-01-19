import api from "../lib/api";
import { setAccessToken, setUser, logout as logoutAction } from "../redux/authslice";
import store from "../redux/store";

const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      
      const { accessToken, role } = response.data;
      
      // Store in Redux
      store.dispatch(setAccessToken(accessToken));
      store.dispatch(setUser({ email, role }));
      
      // Store in localStorage as backup
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify({ email, role }));
      
      // Return format expected by Login.jsx
      return { 
        token: accessToken,
        user: { email, role }
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
      
      // Clear Redux
      store.dispatch(logoutAction());
      
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      
      return { success: true };
    } catch (error) {
      // Still clear local state even if backend fails
      store.dispatch(logoutAction());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      
      console.error("Logout error:", error);
      return { success: true };
    }
  },

  // Set password (first time setup)
  setPassword: async ({ token, password }) => {
    try {
      const response = await api.post("/auth/set-password", {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to set password"
      );
    }
  },

  // Resend password setup link
  resendSetPasswordLink: async (email) => {
    try {
      const response = await api.post("/auth/resend-set-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to resend link"
      );
    }
  },

  // Refresh access token (handled automatically by api.js interceptor)
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken } = response.data;
      
      store.dispatch(setAccessToken(accessToken));
      localStorage.setItem("accessToken", accessToken);
      
      return accessToken;
    } catch (error) {
      // Auto logout on refresh failure
      store.dispatch(logoutAction());
      localStorage.clear();
      throw error;
    }
  },

  // Get current user from Redux/localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  },
};

export default authService;
