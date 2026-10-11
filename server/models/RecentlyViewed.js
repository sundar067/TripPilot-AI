import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema(
  {
    // Kis user ne destination dekha
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Kaunsa destination dekha
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    // Last time destination kab dekha gaya
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Same user ke liye same destination ka duplicate record nahi banega
recentlyViewedSchema.index(
  {
    userId: 1,
    destinationId: 1,
  },
  {
    unique: true,
  },
);

const RecentlyViewed = mongoose.model("RecentlyViewed", recentlyViewedSchema);

export default RecentlyViewed;
