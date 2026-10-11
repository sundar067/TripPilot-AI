import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    // Search Name
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    // Search Type
    type: {
      type: String,
      enum: ["state", "destination"],
      required: true,
    },
    // Number Of Searches
    count: {
      type: Number,
      default: 1,
    },
    // Last Search Time
    lastSearched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Prevents "Cannot overwrite model once compiled" error
export default mongoose.models.SearchHistory ||
  mongoose.model("SearchHistory", searchHistorySchema);
