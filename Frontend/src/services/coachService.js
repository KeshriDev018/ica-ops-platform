import api from "../lib/api";

const coachService = {
  getAll: async () => {
    const response = await api.get("/coach");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/coach/${id}`);
    return response.data;
  },

  create: async (coachData) => {
    const response = await api.post("/coach/create", coachData);
    return response.data;
  },

  delete: async (coachId) => {
    const response = await api.delete(`/coach/${coachId}`);
    return response.data;
  },

  getBatches: async (coachId) => {
    const response = await api.get(`/coach/${coachId}/batches`);
    return response.data;
  },

  getStudents: async (coachId) => {
    const response = await api.get(`/coach/${coachId}/students`);
    return response.data;
  },

  // COACH: Get own profile
  getMyProfile: async () => {
    const response = await api.get("/coach/me/profile");
    return response.data;
  },

  // COACH: Update basic profile
  updateMyProfile: async (profileData) => {
    const response = await api.patch("/coach/me/profile", profileData);
    return response.data;
  },

  // COACH: Update payout details
  updateMyPayoutDetails: async (payoutData) => {
    const response = await api.patch("/coach/me/payout-details", payoutData);
    return response.data;
  },

  // ADMIN: Update coach payout rates
  updatePayoutRates: async (coachAccountId, ratesData) => {
    const response = await api.patch(
      `/coach/${coachAccountId}/payout-rates`,
      ratesData,
    );
    return response.data;
  },
};

export default coachService;
