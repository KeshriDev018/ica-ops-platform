import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Ensure dotenv is loaded
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log to verify config is loaded (remove in production)
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "***SET***" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "***SET***" : "MISSING",
});

export default cloudinary;
