import Razorpay from "razorpay";
import { Account } from "../models/account.model.js";
import { CoachProfile } from "../models/coach.model.js";
import { CoachPayout } from "../models/coachPayout.model.js";
import { generateSetPasswordToken } from "../utils/passToken.util.js";
import { sendSetPasswordEmail } from "../utils/email.util.js";

// Initialize Razorpay instance only if keys are present
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn(
    "  Razorpay credentials not found - using mock mode for payout operations",
  );
}

/**
 * ADMIN: Verify coach payout & link Razorpay
 */
export const verifyCoachPayout = async (req, res) => {
  try {
    const { coachAccountId } = req.params;

    const profile = await CoachProfile.findOne({
      accountId: coachAccountId,
    });

    if (!profile) {
      return res.status(404).json({ message: "Coach profile not found" });
    }

    if (profile.payout.isVerified) {
      return res.status(400).json({ message: "Payout already verified" });
    }

    // Development mode: Skip Razorpay verification if keys are not configured
    if (!razorpay) {
      console.warn("  Razorpay not configured - using mock verification");
      profile.payout.razorpayContactId = "mock_contact_" + Date.now();
      profile.payout.razorpayFundAccountId = "mock_fund_" + Date.now();
      profile.payout.isVerified = true;
      await profile.save();
      return res.json({ message: "Coach payout verified successfully (mock)" });
    }

    const contact = await razorpay.contacts.create({
      name: profile.fullName,
      type: "employee",
    });

    const fundAccount =
      profile.payout.method === "UPI"
        ? await razorpay.fundAccount.create({
            contact_id: contact.id,
            account_type: "vpa",
            vpa: { address: profile.payout.upiId },
          })
        : await razorpay.fundAccount.create({
            contact_id: contact.id,
            account_type: "bank_account",
            bank_account: profile.payout.bankDetails,
          });

    profile.payout.razorpayContactId = contact.id;
    profile.payout.razorpayFundAccountId = fundAccount.id;
    profile.payout.isVerified = true;

    await profile.save();

    res.json({ message: "Coach payout verified successfully" });
  } catch (error) {
    console.error("Verify coach payout error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Pay coach
 */
export const payCoach = async (req, res) => {
  try {
    const {
      coachAccountId,
      payoutPeriod,
      periodStart,
      periodEnd,
      breakdown,
      amount,
    } = req.body;

    const profile = await CoachProfile.findOne({
      accountId: coachAccountId,
    });

    if (!profile || !profile.payout.isVerified) {
      return res.status(400).json({
        message: "Coach payout not verified",
      });
    }

    const alreadyPaid = await CoachPayout.findOne({
      coachAccountId,
      payoutPeriod,
      status: "PROCESSED",
    });

    if (alreadyPaid) {
      return res.status(400).json({
        message: "Payout already processed for this period",
      });
    }

    let razorpayPayoutId = null;

    // Development mode: Skip Razorpay payout if not configured
    if (!razorpay) {
      console.warn("  Razorpay not configured - using mock payout");
      razorpayPayoutId = "mock_payout_" + Date.now();
    } else {
      const payout = await razorpay.payouts.create({
        fund_account_id: profile.payout.razorpayFundAccountId,
        amount: amount * 100,
        currency: profile.currency,
        purpose: "salary",
      });
      razorpayPayoutId = payout.id;
    }

    const coachPayout = await CoachPayout.create({
      coachAccountId,
      coachProfileId: profile._id,
      amount,
      currency: profile.currency,
      payoutPeriod,
      periodStart,
      periodEnd,
      breakdown,
      razorpayPayoutId,
      status: "PROCESSED",
      processedByAdminId: req.user._id,
      processedAt: new Date(),
    });

    res.json({
      message: "Coach paid successfully",
      coachPayout,
    });
  } catch (error) {
    console.error("Pay coach error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * COACH: Get own payout history
 */
export const getMyPayoutHistory = async (req, res) => {
  try {
    const payouts = await CoachPayout.find({
      coachAccountId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(payouts);
  } catch (error) {
    console.error("Get payout history error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN
 * Get payout history for a single coach (by coachAccountId)
 */
export const getCoachPayoutHistoryById = async (req, res) => {
  try {
    const { coachAccountId } = req.params;

    const payouts = await CoachPayout.find({
      coachAccountId,
    }).sort({ createdAt: -1 }); // latest first

    res.status(200).json(payouts);
  } catch (error) {
    console.error("Get coach payout history error:", error);
    res.status(500).json({
      message: "Failed to fetch coach payout history",
    });
  }
};
