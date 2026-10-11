import mongoose from "mongoose";

const missingDestinationSchema = new mongoose.Schema(
  {
    // Destination searched by user but not available

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    // Number of times searched

    count: {
      type: Number,
      default: 1,
    },

    // Last time searched

    lastSearched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const MissingDestination = mongoose.model(
  "MissingDestination",
  missingDestinationSchema,
);

export default MissingDestination;
