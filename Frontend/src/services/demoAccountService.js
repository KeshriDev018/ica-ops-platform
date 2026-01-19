import api from "../lib/api";

const demoAccountService = {
  // Verify if demo exists for given email (PUBLIC)
  verifyDemoByEmail: async (email) => {
    try {
      const response = await api.post("/demos/verify", { email });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(
          "No demo booking found for this email. Please book a demo first.",
        );
      }
      throw new Error(error.response?.data?.message || "Failed to verify demo");
    }
  },

  // Get demo details by email (PUBLIC)
  getDemoByEmail: async (email) => {
    try {
      const response = await api.post("/demos/verify", { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch demo details",
      );
    }
  },

  // Create Razorpay payment order
  createPaymentOrder: async (demoId, amount) => {
    try {
      const response = await api.post("/payments/create-order", {
        demoId,
        amount,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create payment order",
      );
    }
  },

  // Verify Razorpay payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post("/payments/verify", paymentData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Payment verification failed",
      );
    }
  },
};

export default demoAccountService;
