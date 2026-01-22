import api from "../lib/api";

const paymentService = {
  // Create payment order (ADMIN)
  createOrder: async (amount, demoId) => {
    const response = await api.post("/payments/create-order", {
      amount,
      demoId,
    });
    return response.data;
  },

  // Verify payment (ADMIN)
  verifyPayment: async (paymentData) => {
    const response = await api.post("/payments/verify", paymentData);
    return response.data;
  },

  // Get subscription plans
  getPlans: async () => {
    return [
      {
        plan_id: "1-1",
        name: "Personalized 1-on-1 Coaching",
        price: 2999,
        billing_cycle: "monthly",
        features: [
          "8 personalized sessions per month",
          "Customized learning plan",
          "Dedicated coach assignment",
          "Flexible scheduling",
          "Progress tracking & reports",
          "Tournament preparation",
        ],
      },
      {
        plan_id: "group",
        name: "Engaging Group Coaching",
        price: 1499,
        billing_cycle: "monthly",
        features: [
          "12 group sessions per month",
          "Small batches (max 6 students)",
          "Age & skill-based grouping",
          "Interactive learning environment",
          "Peer learning & practice games",
          "Monthly tournaments",
        ],
      },
    ];
  },

  // Create subscription (after payment)
  createSubscription: async (accountId, planId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const plans = await paymentService.getPlans();
    const plan = plans.find((p) => p.plan_id === planId);

    if (!plan) {
      throw new Error("Invalid plan selected");
    }

    const newSubscription = {
      subscription_id: `sub-${Date.now()}`,
      account_id: accountId,
      plan_id: planId,
      amount: plan.price,
      billing_cycle: plan.billing_cycle,
      status: "ACTIVE",
      started_at: new Date().toISOString(),
      next_due_at: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 30 days from now
    };

    
    return newSubscription;
  },

  // Process demo account payment
  processDemoPayment: async (email, planId, paymentDetails) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    
    return {
      success: true,
      payment_id: `PAY_${Date.now()}`,
      message: "Payment successful",
    };
  },

  
  sendPasswordSetupEmail: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    
    return {
      success: true,
      message: "Password setup email sent",
      token: `TOKEN_${Date.now()}`,
    };
  },

  
  processPayment: async (accountId, planId, paymentDetails) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    
    const subscription = await paymentService.createSubscription(
      accountId,
      planId,
    );

    return {
      success: true,
      payment_id: `pay-${Date.now()}`,
      subscription: subscription,
      message: "Payment processed successfully",
    };
  },
};

export default paymentService;
