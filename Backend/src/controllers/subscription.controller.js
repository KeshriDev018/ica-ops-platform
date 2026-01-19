import { Subscription } from "../models/subscription.model.js";
import { Student } from "../models/student.model.js";

/**
 * ADMIN: View all subscriptions
 */
export const getAllSubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find().populate("accountId", "role");

  res.json(subscriptions);
};


/**
 * ADMIN: Pause subscription
 */
export const pauseSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  subscription.status = "SUSPENDED";
  await subscription.save();

  // Pause student as well
  await Student.findOneAndUpdate(
    { accountId: subscription.accountId },
    { status: "PAUSED" }
  );

  res.json({ message: "Subscription paused" });
};

/**
 * ADMIN: Resume subscription
 */
export const resumeSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  subscription.status = "ACTIVE";
  await subscription.save();

  // Resume student
  await Student.findOneAndUpdate(
    { accountId: subscription.accountId },
    { status: "ACTIVE" }
  );

  res.json({ message: "Subscription resumed" });
};

/**
 * ADMIN: Cancel subscription
 */
export const cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  subscription.status = "CANCELLED";
  await subscription.save();

  // Cancel student
  await Student.findOneAndUpdate(
    { accountId: subscription.accountId },
    { status: "CANCELLED" }
  );

  res.json({ message: "Subscription cancelled" });
};
