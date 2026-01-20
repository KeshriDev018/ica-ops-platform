import api from "../lib/api";

const intelligenceService = {
  // Get conversion prediction scores for demos
  getConversionPrediction: async () => {
    const response = await api.get("/intelligence/conversion-prediction");
    return response.data;
  },

  // Get admin follow-up SLA tracking
  getAdminSLA: async () => {
    const response = await api.get("/intelligence/admin-sla");
    return response.data;
  },

  // Get coach effectiveness index
  getCoachEffectiveness: async () => {
    const response = await api.get("/intelligence/coach-effectiveness");
    return response.data;
  },

  // Get early drop-off risks
  getDropoffRisk: async () => {
    const response = await api.get("/intelligence/dropoff-risk");
    return response.data;
  },

  // Get demo audit timeline
  getDemoTimeline: async (demoId) => {
    const response = await api.get(`/intelligence/demo/${demoId}/timeline`);
    return response.data;
  },

  // Get coach recommendations
  getCoachRecommendation: async (params = {}) => {
    const response = await api.get("/intelligence/coach-recommendation", {
      params,
    });
    return response.data;
  },

  // Simulate funnel improvements
  simulateFunnel: async (data) => {
    const response = await api.get("/intelligence/simulate-funnel", {
      params: data,
    });
    return response.data;
  },

  // Get intelligence overview
  getOverview: async () => {
    const response = await api.get("/intelligence/overview");
    return response.data;
  },
};

export default intelligenceService;
