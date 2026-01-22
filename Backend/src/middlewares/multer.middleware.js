import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "class-materials", // Cloudinary folder
    resource_type: "auto", // auto-detect (pdf, image, video, etc.)
    allowed_formats: [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "mp4",
    ],
    public_id: (req, file) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      return uniqueName;
    },
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export default upload;
