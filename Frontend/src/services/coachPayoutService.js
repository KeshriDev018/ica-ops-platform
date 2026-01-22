import api from "../lib/api";

const coachPayoutService = {
  // ADMIN: Verify coach payout details
  verifyCoachPayout: async (coachAccountId) => {
    const response = await api.post(
      `/coachPayout/admin/coach/${coachAccountId}/verify-payout`,
    );
    return response.data;
  },

  // ADMIN: Pay a coach
  payCoach: async (payoutData) => {
    const response = await api.post("/coachPayout/admin/coach/pay", payoutData);
    return response.data;
  },

  // ADMIN: Get payout history for a specific coach
  getCoachPayoutHistory: async (coachAccountId) => {
    const response = await api.get(
      `/coachPayout/admin/coach/${coachAccountId}/payouts`,
    );
    return response.data;
  },

  // COACH: Get own payout history
  getMyPayoutHistory: async () => {
    const response = await api.get("/coachPayout/my/payouts");
    return response.data;
  },
};

export default coachPayoutService;
