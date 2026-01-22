import Razorpay from "razorpay";
import { Account } from "../models/account.model.js";
import { CoachProfile } from "../models/coach.model.js";
import { CoachPayout } from "../models/coachPayout.model.js";
import { generateSetPasswordToken } from "../utils/passToken.util.js";
import { sendSetPasswordEmail } from "../utils/email.util.js";

/**
 * ADMIN: Get All Coaches
 * 🔒 Controller name unchanged
 * 🔒 Response remains array
 * ➕ Now includes CoachProfile details
 */
export const getAllCoaches = async (req, res) => {
  try {
    // 1️⃣ Fetch coach accounts
    const accounts = await Account.find({ role: "COACH" })
      .select("email name _id createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Fetch related coach profiles
    const profiles = await CoachProfile.find({
      accountId: { $in: accounts.map((a) => a._id) },
    }).lean();

    // 3️⃣ Map profiles by accountId
    const profileMap = new Map(
      profiles.map((p) => [p.accountId.toString(), p]),
    );

    // 4️⃣ Merge (BACKWARD COMPATIBLE)
    const coaches = accounts.map((acc) => {
      const profile = profileMap.get(acc._id.toString());

      return {
        _id: acc._id, // existing
        accountId: acc._id, // for API consistency
        email: acc.email, // existing
        name: acc.name ?? null,

        // ➕ extra admin-useful info
        fullName: profile?.fullName ?? null,
        phoneNumber: profile?.phoneNumber ?? null,
        country: profile?.country ?? null,
        timezone: profile?.timezone ?? null,
        experienceYears: profile?.experienceYears ?? 0,
        isActive: profile?.isActive ?? false,

        // Full payout object for detailed view
        payout: profile?.payout ?? null,

        // Simplified payout fields (backward compatible)
        payoutVerified: profile?.payout?.isVerified ?? false,
        payoutMethod: profile?.payout?.method ?? null,
        payoutPerClass: profile?.payoutPerClass ?? 0,
        payoutPerBatch: profile?.payoutPerBatch ?? 0,
        currency: profile?.currency ?? "INR",

        createdAt: acc.createdAt,
      };
    });

    res.json(coaches);
  } catch (error) {
    console.error("Get all coaches error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Create Coach Account
 * ✅ Also creates CoachProfile (silent, required for payouts)
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

    // 1️⃣ Create coach account
    const coach = await Account.create({
      email,
      role: "COACH",
      password: null,
    });

    // 2️⃣ Create CoachProfile (required fields only)
    await CoachProfile.create({
      accountId: coach._id,
      fullName: "Pending",
      country: "Pending",
      timezone: "UTC",
      payoutPerClass: 0,
      payoutPerBatch: 0,
      payout: {
        method: "UPI",
      },
    });

    // 3️⃣ Generate set-password token
    const { rawToken, hashedToken } = generateSetPasswordToken();
    coach.setPasswordToken = hashedToken;
    coach.setPasswordExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await coach.save();

    // 4️⃣ Send onboarding email (non-blocking - don't await)
    const link = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;
    sendSetPasswordEmail(coach.email, link, "COACH")
      .then(() => {
        console.log(`✅ Coach invitation email sent to ${coach.email}`);
      })
      .catch((error) => {
        console.error(
          `⚠️ Failed to send invitation email to ${coach.email}:`,
          error.message,
        );
        // Email failure doesn't prevent coach creation
      });

    res.status(201).json({
      message: "Coach account created. Invitation email is being sent.",
      coachId: coach._id,
    });
  } catch (error) {
    console.error("Create coach error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Delete Coach Account
 * ✅ Also deletes CoachProfile (data integrity)
 */
export const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;

    // Find coach account
    const coach = await Account.findById(id);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    if (coach.role !== "COACH") {
      return res.status(400).json({ message: "Account is not a coach" });
    }

    // 1️⃣ Delete coach profile
    await CoachProfile.findOneAndDelete({ accountId: id });

    // 2️⃣ Delete coach account
    await Account.findByIdAndDelete(id);

    res.json({ message: "Coach account deleted successfully" });
  } catch (error) {
    console.error("Delete coach error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * COACH: Get own full profile
 */
export const getMyCoachProfile = async (req, res) => {
  try {
    const profile = await CoachProfile.findOne({
      accountId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "Coach profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Get my coach profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * COACH: Update basic profile (non-payout fields)
 */
export const updateCoachProfile = async (req, res) => {
  try {
    const updates = req.body;

    const profile = await CoachProfile.findOneAndUpdate(
      { accountId: req.user._id },
      updates,
      { new: true },
    );

    res.json(profile);
  } catch (error) {
    console.error("Update coach profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * COACH: Update payout details (BANK / UPI)
 * ⚠️ Resets admin verification
 */
export const updateCoachPayoutDetails = async (req, res) => {
  try {
    const { method, bankDetails, upiId } = req.body;

    if (!["BANK", "UPI"].includes(method)) {
      return res.status(400).json({ message: "Invalid payout method" });
    }

    const profile = await CoachProfile.findOne({
      accountId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "Coach profile not found" });
    }

    profile.payout.method = method;
    profile.payout.bankDetails = method === "BANK" ? bankDetails : {};
    profile.payout.upiId = method === "UPI" ? upiId : null;

    // reset verification
    profile.payout.razorpayContactId = null;
    profile.payout.razorpayFundAccountId = null;
    profile.payout.isVerified = false;

    await profile.save();

    res.json({
      message: "Payout details updated, pending admin verification",
    });
  } catch (error) {
    console.error("Update payout details error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Update coach payout rates (payoutPerClass, payoutPerBatch)
 */
export const updateCoachPayoutRates = async (req, res) => {
  try {
    const { coachAccountId } = req.params;
    const { payoutPerClass, payoutPerBatch } = req.body;

    const profile = await CoachProfile.findOne({
      accountId: coachAccountId,
    });

    if (!profile) {
      return res.status(404).json({ message: "Coach profile not found" });
    }

    if (payoutPerClass !== undefined) {
      profile.payoutPerClass = payoutPerClass;
    }
    if (payoutPerBatch !== undefined) {
      profile.payoutPerBatch = payoutPerBatch;
    }

    await profile.save();

    res.json({
      message: "Payout rates updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update payout rates error:", error);
    res.status(500).json({ message: error.message });
  }
};
