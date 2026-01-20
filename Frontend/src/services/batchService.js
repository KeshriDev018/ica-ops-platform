import api from "../lib/api";

const batchService = {
  getAll: async () => {
    const response = await api.get("/batch");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/batch/${id}`);
    return response.data;
  },

  // COACH: Get my batches (for logged-in coach)
  getMyBatches: async () => {
    const response = await api.get("/batch/my-batches");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/batch", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/batch/${id}`, data);
    return response.data;
  },

  addStudent: async (batchId, studentId) => {
    const response = await api.post(`/batch/${batchId}/students/${studentId}`);
    return response.data;
  },

  removeStudent: async (batchId, studentId) => {
    const response = await api.delete(
      `/batch/${batchId}/students/${studentId}`,
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/batch/${id}`);
    return response.data;
  },
};

export default batchService;
