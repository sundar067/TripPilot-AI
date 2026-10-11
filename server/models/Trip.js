import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    startDate: {
      type: String,
      required: true,
    },

    endDate: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    travelers: {
      type: Number,
      required: true,
    },

    tripType: {
      type: String,
      required: true,
    },

    generatedPlan: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
