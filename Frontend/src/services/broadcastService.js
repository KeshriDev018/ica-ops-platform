import api from "../lib/api";

export const broadcastService = {
  // Create a new broadcast (Admin only)
  createBroadcast: async (data) => {
    const response = await api.post("/broadcast", data);
    return response.data;
  },

  // Get all broadcasts (Admin only - for management)
  getAllBroadcasts: async (page = 1, limit = 20) => {
    const response = await api.get(`/broadcast/all?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get broadcasts for current user (role-based)
  getMyBroadcasts: async (page = 1, limit = 20) => {
    const response = await api.get(`/broadcast/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get unread broadcast count
  getUnreadCount: async () => {
    const response = await api.get("/broadcast/unread/count");
    return response.data;
  },

  // Mark broadcast as read
  markAsRead: async (broadcastId) => {
    const response = await api.patch(`/broadcast/${broadcastId}/read`);
    return response.data;
  },

  // Edit broadcast (within 10 minutes, Admin only)
  editBroadcast: async (broadcastId, data) => {
    const response = await api.patch(`/broadcast/${broadcastId}`, data);
    return response.data;
  },

  // Delete broadcast (within 10 minutes, Admin only)
  deleteBroadcast: async (broadcastId) => {
    const response = await api.delete(`/broadcast/${broadcastId}`);
    return response.data;
  },
};
