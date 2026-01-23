import Razorpay from "razorpay";
import axios from "axios";
import { Account } from "../models/account.model.js";
import { CoachProfile } from "../models/coach.model.js";
import { CoachPayout } from "../models/coachPayout.model.js";
import { generateSetPasswordToken } from "../utils/passToken.util.js";
import { sendSetPasswordEmail } from "../utils/email.util.js";

// Initialize Razorpay instance for Payouts/X API
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized for payouts");
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay:", error.message);
  }
} else {
  console.error(
    "❌ Razorpay credentials not found. Payout operations will fail. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
  );
}

// Helper function to make Razorpay API calls directly
const razorpayRequest = async (method, endpoint, data = null) => {
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const config = {
    method,
    url: `https://api.razorpay.com/v1${endpoint}`,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    // Log detailed Razorpay error
    console.error("Razorpay API Error:", {
      endpoint,
      status: error.response?.status,
      error: error.response?.data?.error,
    });
    throw error;
  }
};

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

    // Check if payout method is set
    if (!profile.payout.method) {
      return res.status(400).json({ 
        message: "Coach has not set up payout method yet. Please ask coach to set up their payout details first." 
      });
    }

    // Validate payout details based on method
    if (profile.payout.method === "UPI" && !profile.payout.upiId) {
      return res.status(400).json({ 
        message: "UPI ID is missing. Please ask coach to complete their payout setup." 
      });
    }

    if (profile.payout.method === "BANK") {
      const bankDetails = profile.payout.bankDetails;
      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
        return res.status(400).json({ 
          message: "Bank details are incomplete. Please ask coach to complete their payout setup." 
        });
      }
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ 
        message: "Razorpay is not configured. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables." 
      });
    }

    // Check if using test mode - Payouts API not available in test mode
    const isTestMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_');
    
    let contact, fundAccount;
    
    if (isTestMode) {
      // Mock verification for test mode
      console.log("⚠️  TEST MODE: Using mock verification (Payouts API not available in test mode)");
      contact = {
        id: `mock_contact_${Date.now()}`,
        entity: "contact",
        name: profile.fullName,
        email: profile.email,
        contact: profile.phoneNumber,
        type: "employee"
      };
      
      if (profile.payout.method === "UPI") {
        fundAccount = {
          id: `mock_fa_${Date.now()}`,
          entity: "fund_account",
          contact_id: contact.id,
          account_type: "vpa",
          vpa: { address: profile.payout.upiId }
        };
      } else {
        fundAccount = {
          id: `mock_fa_${Date.now()}`,
          entity: "fund_account",
          contact_id: contact.id,
          account_type: "bank_account",
          bank_account: {
            name: profile.payout.bankDetails.accountHolderName,
            ifsc: profile.payout.bankDetails.ifscCode,
            account_number: profile.payout.bankDetails.accountNumber
          }
        };
      }
    } else {
      // Real Razorpay API calls for live mode
      const contactData = {
        name: profile.fullName,
        type: "employee",
      };
      if (profile.email) contactData.email = profile.email;
      if (profile.phoneNumber) contactData.contact = profile.phoneNumber;

      contact = await razorpayRequest("POST", "/contacts", contactData);
      
      // Create fund account based on method
      if (profile.payout.method === "UPI") {
        fundAccount = await razorpayRequest("POST", "/fund_accounts", {
          contact_id: contact.id,
          account_type: "vpa",
          vpa: { 
            address: profile.payout.upiId 
          },
        });
      } else {
        fundAccount = await razorpayRequest("POST", "/fund_accounts", {
          contact_id: contact.id,
          account_type: "bank_account",
          bank_account: {
            name: profile.payout.bankDetails.accountHolderName,
            ifsc: profile.payout.bankDetails.ifscCode,
            account_number: profile.payout.bankDetails.accountNumber,
          },
        });
      }
    }

    profile.payout.razorpayContactId = contact.id;
    profile.payout.razorpayFundAccountId = fundAccount.id;
    profile.payout.isVerified = true;

    await profile.save();

    res.json({ 
      message: "Coach payout verified successfully",
      contactId: contact.id,
      fundAccountId: fundAccount.id
    });
  } catch (error) {
    console.error("Verify coach payout error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to verify payout",
      error: error.error?.description || error.message
    });
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

    if (!profile) {
      return res.status(404).json({ message: "Coach profile not found" });
    }

    if (!profile.payout.isVerified) {
      return res.status(400).json({
        message: "Coach payout not verified. Please verify payout setup first.",
      });
    }

    if (!profile.payout.razorpayFundAccountId) {
      return res.status(400).json({
        message: "Razorpay fund account not found. Please re-verify payout.",
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

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ 
        message: "Razorpay is not configured. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables." 
      });
    }

    // Check if using test mode - Payouts API not available in test mode
    const isTestMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_');
    
    let payout;
    
    if (isTestMode) {
      // Mock payout for test mode
      console.log("⚠️  TEST MODE: Using mock payout (Payouts API not available in test mode)");
      payout = {
        id: `mock_payout_${Date.now()}`,
        entity: "payout",
        fund_account_id: profile.payout.razorpayFundAccountId,
        amount: Math.round(amount * 100),
        currency: profile.currency || "INR",
        mode: profile.payout.method === "UPI" ? "UPI" : "IMPS",
        purpose: "salary",
        status: "processed",
        utr: `MOCK${Date.now()}`,
        reference_id: `COACH_${coachAccountId}_${Date.now()}`,
        narration: `Payout for ${payoutPeriod}`,
        created_at: Math.floor(Date.now() / 1000)
      };
    } else {
      // Real Razorpay payout for live mode
      payout = await razorpayRequest("POST", "/payouts", {
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
        fund_account_id: profile.payout.razorpayFundAccountId,
        amount: Math.round(amount * 100),
        currency: profile.currency || "INR",
        mode: profile.payout.method === "UPI" ? "UPI" : "IMPS",
        purpose: "salary",
        queue_if_low_balance: true,
        reference_id: `COACH_${coachAccountId}_${Date.now()}`,
        narration: `Payout for ${payoutPeriod}`,
      });
    }

    const coachPayout = await CoachPayout.create({
      coachAccountId,
      coachProfileId: profile._id,
      amount,
      currency: profile.currency || "INR",
      payoutPeriod,
      periodStart,
      periodEnd,
      breakdown,
      razorpayPayoutId: payout.id,
      status: payout.status === "processed" ? "PROCESSED" : "INITIATED",
      processedByAdminId: req.user._id,
      processedAt: new Date(),
    });

    res.json({
      message: "Coach payout initiated successfully",
      coachPayout,
      razorpayPayout: {
        id: payout.id,
        status: payout.status,
        utr: payout.utr,
      }
    });
  } catch (error) {
    console.error("Pay coach error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to process payout",
      error: error.error?.description || error.message
    });
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

/**
 * ADMIN
 * Get next unpaid period for a coach
 */
export const getNextUnpaidPeriod = async (req, res) => {
  try {
    const { coachAccountId } = req.params;

    // Get the most recent processed payout
    const lastPayout = await CoachPayout.findOne({
      coachAccountId,
      status: "PROCESSED",
    }).sort({ createdAt: -1 });

    let nextPeriodDate;
    
    if (lastPayout && lastPayout.periodEnd) {
      // Calculate next period from last payout's end date
      const lastEndDate = new Date(lastPayout.periodEnd);
      nextPeriodDate = new Date(lastEndDate.getFullYear(), lastEndDate.getMonth() + 1, 1);
    } else {
      // No previous payout, use current month
      nextPeriodDate = new Date();
    }

    const year = nextPeriodDate.getFullYear();
    const month = nextPeriodDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Format period string (e.g., "January 2026")
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const payoutPeriod = `${monthNames[month]} ${year}`;

    // Format dates as YYYY-MM-DD
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    res.status(200).json({
      payoutPeriod,
      periodStart: formatDate(firstDay),
      periodEnd: formatDate(lastDay),
      lastPayoutPeriod: lastPayout?.payoutPeriod || null,
    });
  } catch (error) {
    console.error("Get next unpaid period error:", error);
    res.status(500).json({
      message: "Failed to calculate next unpaid period",
    });
  }
};

