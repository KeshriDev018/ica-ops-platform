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

  // Customer: Get my payment history
  getMyPaymentHistory: async () => {
    const response = await api.get("/subscriptions/my-payments");
    return response.data;
  },

  // Customer: Verify subscription payment
  verifySubscriptionPayment: async (paymentData) => {
    const response = await api.post(
      "/subscriptions/verify-payment",
      paymentData,
    );
    return response.data;
  },

  // Admin: Create payment order for student
  createPaymentOrder: async (studentId, amount, notes) => {
    const response = await api.post("/subscriptions/payment-order", {
      studentId,
      amount,
      notes,
    });
    return response.data;
  },

  // Admin: Get all payments
  getAllPayments: async (filters = {}) => {
    const response = await api.get("/subscriptions/payments", {
      params: filters,
    });
    return response.data;
  },

  pause: async (id) => {
    const response = await api.patch(`/subscriptions/${id}/pause`);
    return response.data;
  },

  resume: async (id) => {
    const response = await api.patch(`/subscriptions/${id}/resume`);
    return response.data;
  },
};

export default subscriptionService;
