import { Account } from "../models/account.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateSetPasswordToken } from "../utils/passToken.util.js";
import { sendSetPasswordEmail } from "../utils/email.util.js";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 1️⃣ Fetch user + password explicitly
    const user = await Account.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Block login if password not set yet
    if (!user.password) {
      return res.status(401).json({
        message: "Please set your password first",
      });
    }

    // 3️⃣ Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5️⃣ Store refresh token securely
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // 6️⃣ Send response
    res.json({
      accessToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};





export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await Account.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};


export const logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ message: "Logged out successfully" });
};




export const setPassword = async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const account = await Account.findOne({
    setPasswordToken: hashedToken,
    setPasswordExpiresAt: { $gt: Date.now() },
  }).select("+setPasswordToken");

  if (!account) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  account.password = hashedPassword;
  account.setPasswordToken = undefined;
  account.setPasswordExpiresAt = undefined;
  await account.save();

  res.json({ message: "Password set successfully. Please login." });
};

export const resendSetPasswordLink = async (req, res) => {
  const { email } = req.body;

  const account = await Account.findOne({ email });
  if (!account || account.password) {
    return res.status(400).json({
      message: "Account not eligible",
    });
  }

  const { rawToken, hashedToken } = generateSetPasswordToken();

  account.setPasswordToken = hashedToken;
  account.setPasswordExpiresAt = Date.now() + 15 * 60 * 1000;
  await account.save();

  const link = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;
  sendSetPasswordEmail(account.email, link,"ROLE");

  res.json({ message: "Password setup link resent" });
};
