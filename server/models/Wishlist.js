import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    // Jis user ne destination save kiya hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Jo destination wishlist me save hua hai
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Same user same destination ko duplicate save na kar sake
wishlistSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
