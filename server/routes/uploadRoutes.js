import express from "express";

import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import { uploadImage, uploadVideo } from "../controllers/uploadController.js";

const router = express.Router();

// Upload image
router.post("/image", protect, adminOnly, upload.single("image"), uploadImage);

// Upload video
router.post("/video", protect, adminOnly, upload.single("video"), uploadVideo);

export default router;
