import { Account } from "../models/account.model.js";
import { generateSetPasswordToken } from "../utils/passToken.util.js";
import { sendSetPasswordEmail } from "../utils/email.util.js";

/**
 * ADMIN: Get All Coaches
 */
export const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Account.find({ role: "COACH" })
      .select("email name _id")
      .sort({ createdAt: -1 });

    res.json(coaches);
  } catch (error) {
    console.error("Get all coaches error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Create Coach Account
 */
export const createCoach = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Coach email is required" });
    }

    // Prevent duplicate account
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Account already exists" });
    }

    // Create coach account
    const coach = await Account.create({
      email,
      role: "COACH",
      password: null,
    });

    // Generate set-password token
    const { rawToken, hashedToken } = generateSetPasswordToken();
    coach.setPasswordToken = hashedToken;
    coach.setPasswordExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
    await coach.save();
    let role = "COACH";

    // Send onboarding email
    const link = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;
    await sendSetPasswordEmail(coach.email, link, role);

    res.status(201).json({
      message: "Coach account created and onboarding email sent",
      coachId: coach._id,
    });
  } catch (error) {
    console.error("Create coach error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Delete Coach Account
 */
export const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;

    // Find coach account
    const coach = await Account.findById(id);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    // Verify it's a coach account
    if (coach.role !== "COACH") {
      return res.status(400).json({ message: "Account is not a coach" });
    }

    // Delete the coach account
    await Account.findByIdAndDelete(id);

    res.json({ message: "Coach account deleted successfully" });
  } catch (error) {
    console.error("Delete coach error:", error);
    res.status(500).json({ message: error.message });
  }
};
