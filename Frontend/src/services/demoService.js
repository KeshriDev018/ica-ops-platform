import api from "../lib/api";

const demoService = {
  // Get all demos (ADMIN only)
  getAll: async () => {
    const response = await api.get("/demos");
    return response.data;
  },

  // Get demo by ID
  getById: async (id) => {
    const response = await api.get(`/demos/${id}`);
    return response.data;
  },

  // Create new demo (PUBLIC - no auth required)
  create: async (data) => {
    const response = await api.post("/demos", data);
    return response.data;
  },

  // Verify demo by email (PUBLIC)
  verifyByEmail: async (email) => {
    const response = await api.post("/demos/verify", { email });
    return response.data;
  },

  // Schedule demo (ADMIN only)
  schedule: async (id, data) => {
    const response = await api.patch(`/demos/${id}/schedule`, data);
    return response.data;
  },

  // Mark attendance (ADMIN only)
  markAttendance: async (id, status) => {
    const response = await api.patch(`/demos/${id}/attendance`, { status });
    return response.data;
  },

  // Submit outcome (ADMIN only)
  submitOutcome: async (id, outcomeData) => {
    const response = await api.patch(`/demos/${id}/outcome`, outcomeData);
    return response.data;
  },
};

export default demoService;
