import api from "../lib/api";

const subscriptionService = {
  getAll: async () => {
    const response = await api.get("/subscriptions");
    return response.data;
  },

  getByAccountId: async (accountId) => {
    const response = await api.get(`/subscriptions/account/${accountId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/subscriptions", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/subscriptions/${id}`, data);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.patch(`/subscriptions/${id}/cancel`);
    return response.data;
  },
};

export default subscriptionService;
