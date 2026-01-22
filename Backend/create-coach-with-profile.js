/**
 * Script to create a test coach account WITH profile
 */
import mongoose from "mongoose";
import { Account } from "./src/models/account.model.js";
import { CoachProfile } from "./src/models/coach.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function createCoachWithProfile() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const coachEmail = "coach@chessacademy.com";

    // Step 1: Create or update Account
    let coachAccount = await Account.findOne({ email: coachEmail });

    if (coachAccount) {
      console.log("⚠️  Coach account already exists:", coachEmail);
      // Update password
      const hashedPassword = await bcrypt.hash("coach123", 10);
      coachAccount.password = hashedPassword;
      coachAccount.name = "Test Coach";
      await coachAccount.save();
      console.log("✅ Updated coach password and name");
    } else {
      // Create new coach account
      const hashedPassword = await bcrypt.hash("coach123", 10);
      coachAccount = await Account.create({
        email: coachEmail,
        password: hashedPassword,
        role: "COACH",
        name: "Test Coach",
      });
      console.log("✅ Coach account created:", coachAccount.email);
    }

    // Step 2: Create or update CoachProfile
    let coachProfile = await CoachProfile.findOne({
      accountId: coachAccount._id,
    });

    if (coachProfile) {
      console.log("⚠️  Coach profile already exists");
      // Update existing profile
      coachProfile.fullName = "Test Coach";
      coachProfile.phoneNumber = "+1234567890";
      coachProfile.country = "India";
      coachProfile.timezone = "Asia/Kolkata";
      coachProfile.languages = ["English", "Hindi"];
      coachProfile.bio =
        "Experienced chess coach with 5+ years of teaching experience.";
      coachProfile.experienceYears = 5;
      coachProfile.specialization = ["Openings", "Tactics", "Endgames"];
      coachProfile.isActive = true;
      await coachProfile.save();
      console.log("✅ Updated coach profile");
    } else {
      // Create new profile
      coachProfile = await CoachProfile.create({
        accountId: coachAccount._id,
        fullName: "Test Coach",
        phoneNumber: "+1234567890",
        country: "India",
        timezone: "Asia/Kolkata",
        languages: ["English", "Hindi"],
        bio: "Experienced chess coach with 5+ years of teaching experience.",
        experienceYears: 5,
        specialization: ["Openings", "Tactics", "Endgames"],
        payout: {
          method: "UPI",
          upiId: "testcoach@upi",
          isVerified: false,
        },
        payoutPerClass: 500,
        payoutPerBatch: 2000,
        currency: "INR",
        isActive: true,
      });
      console.log("✅ Coach profile created");
    }

    console.log("\n📋 Coach Credentials:");
    console.log("   Email:", coachEmail);
    console.log("   Password: coach123");
    console.log("   Role: COACH");
    console.log("   Account ID:", coachAccount._id);
    console.log("   Profile ID:", coachProfile._id);
    console.log("\n💰 Payout Details:");
    console.log("   Method:", coachProfile.payout.method);
    console.log("   UPI ID:", coachProfile.payout.upiId);
    console.log(
      "   Per Class:",
      coachProfile.payoutPerClass,
      coachProfile.currency,
    );
    console.log(
      "   Per Batch:",
      coachProfile.payoutPerBatch,
      coachProfile.currency,
    );

    await mongoose.disconnect();
    console.log(
      "\n✅ Script completed - You can now login as coach@chessacademy.com",
    );
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createCoachWithProfile();
