import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Sanitize filename: remove extension and special characters
    const sanitized = file.originalname
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // replace special chars with underscore
      .substring(0, 50); // limit length
    
    return {
      folder: "class-materials",
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
      public_id: `${Date.now()}-${sanitized}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types and extensions
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
    ];

    const allowedExtensions = /\.(pdf|jpe?g|png|docx?|pptx?|mp4)$/i;

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PDF, JPG, PNG, DOC, DOCX, PPT, PPTX, MP4`), false);
    }
  },
});

export default upload;
