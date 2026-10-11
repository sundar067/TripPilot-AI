import express from "express";
import {
  toggleWishlist,
  getUserWishlist,
  checkWishlistStatus,
} from "../controllers/wishlistController.js";

const router = express.Router();

// Current user ke saved destinations fetch karne ke liye
router.get("/user/:userId", getUserWishlist);

// Check karne ke liye ki destination already wishlist me hai ya nahi
router.get("/status/:destinationId/:userId", checkWishlistStatus);

// Destination ko wishlist me add/remove karne ke liye
router.put("/:id", toggleWishlist);

export default router;
