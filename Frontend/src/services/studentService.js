import api from "../lib/api";

const studentService = {
  getAll: async () => {
    const response = await api.get("/students");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  getByAccountId: async (accountId) => {
    const response = await api.get(`/students/account/${accountId}`);
    return response.data;
  },

  getMyStudent: async () => {
    const response = await api.get("/students/me");
    return response.data;
  },

  getCoachStudents: async () => {
    const response = await api.get("/students/coach");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/students", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/students/${id}/status`, { status });
    return response.data;
  },

  reassign: async (id, coachId, batchId) => {
    const response = await api.patch(`/students/${id}/reassign`, {
      coachId,
      batchId,
    });
    return response.data;
  },
};

export default studentService;
