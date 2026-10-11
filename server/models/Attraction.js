import mongoose from "mongoose";

const attractionSchema = new mongoose.Schema(
  {
    // Kis destination ke andar ye activity hai
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    // Activity Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Activity Description
    description: {
      type: String,
      required: true,
    },

    // Multiple Activity Images
    images: [
      {
        type: String,
      },
    ],

    // Multiple Activity Videos
    videos: [
      {
        type: String,
      },
    ],

    // Activity Price
    price: {
      type: String,
      required: true,
    },

    // Activity timing
    timing: {
      type: String,
    },

    // Complete Activity Details
    details: {
      type: String,
    },

    // Best Time for activity
    bestTime: {
      type: String,
    },

    // Location (optional)
    location: {
      type: String,
    },

    // Rating
    rating: {
      type: Number,
      default: 0,
    },

    // Wishlist count
    wishlistCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Attraction = mongoose.model("Attraction", attractionSchema);

export default Attraction;
