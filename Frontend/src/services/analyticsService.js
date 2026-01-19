import api from "../lib/api";

const analyticsService = {
  // Get funnel metrics (ADMIN)
  getFunnelMetrics: async () => {
    const response = await api.get("/analytics/funnel");
    return response.data;
  },

  // Get coach performance metrics (ADMIN)
  getCoachMetrics: async () => {
    const response = await api.get("/analytics/coach");
    return response.data;
  },

  // Get admin dashboard metrics (ADMIN)
  getAdminMetrics: async () => {
    const response = await api.get("/analytics/admin");
    return response.data;
  },

  // Get funnel by student type (ADMIN)
  getFunnelByStudentType: async () => {
    const response = await api.get("/analytics/funnel-by-type");
    return response.data;
  },
};

export default analyticsService;
