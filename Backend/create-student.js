import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import { Account } from "./src/models/account.model.js";
import { Student } from "./src/models/student.model.js";

async function createStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if student already exists
    const existingAccount = await Account.findOne({ email: "parent@chessacademy.com" });
    if (existingAccount) {
      console.log("⚠️ Student account already exists");
      const student = await Student.findOne({ accountId: existingAccount._id });
      if (student) {
        console.log("Student details:");
        console.log("- Email:", existingAccount.email);
        console.log("- Student Name:", student.studentName);
        console.log("- Parent Name:", student.parentName);
        console.log("- Account ID:", existingAccount._id);
        process.exit(0);
      } else {
        // Account exists but no student record - create it
        console.log("⚠️ Account exists but no student record. Creating student...");
        const newStudent = await Student.create({
          accountId: existingAccount._id,
          studentName: "Arjun Kumar",
          studentAge: 10,
          parentName: "Rajesh Kumar",
          parentEmail: "parent@chessacademy.com",
          parentPhone: "+91 98765 43210",
          timezone: "Asia/Kolkata",
          country: "India",
          studentType: "1-1",
          level: "Beginner",
          status: "ACTIVE",
        });
        console.log("✅ Created student:", newStudent.studentName);
        console.log("\n📋 Login Credentials:");
        console.log("Email: parent@chessacademy.com");
        console.log("Password: password123");
        console.log("Role: CUSTOMER (Parent/Student)");
        console.log("Account ID:", existingAccount._id);
        console.log("\n✅ Student account ready!");
        process.exit(0);
      }
    }

    // Create Account
    const hashedPassword = await bcrypt.hash("password123", 10);
    const account = await Account.create({
      email: "parent@chessacademy.com",
      password: hashedPassword,
      role: "CUSTOMER",
    });
    console.log("✅ Created parent account:", account.email);

    // Create Student
    const student = await Student.create({
      accountId: account._id,
      studentName: "Arjun Kumar",
      studentAge: 10,
      parentName: "Rajesh Kumar",
      parentEmail: "parent@chessacademy.com",
      parentPhone: "+91 98765 43210",
      timezone: "Asia/Kolkata",
      country: "India",
      studentType: "1-1",
      level: "Beginner",
      status: "ACTIVE",
    });
    console.log("✅ Created student:", student.studentName);

    console.log("\n📋 Login Credentials:");
    console.log("Email: parent@chessacademy.com");
    console.log("Password: password123");
    console.log("Role: CUSTOMER (Parent/Student)");
    console.log("Account ID:", account._id);
    console.log("\n✅ Student account created successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createStudent();
