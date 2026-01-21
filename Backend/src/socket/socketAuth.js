import jwt from "jsonwebtoken";
import { Account } from "../models/account.model.js";

/**
 * Socket.io authentication middleware
 * Validates JWT token from socket handshake
 */
export const socketAuth = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "") ||
      socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }

    // Get user from database
    const user = await Account.findById(decoded._id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
};
