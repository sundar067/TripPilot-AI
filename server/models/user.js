import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password is optional for Google users
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },

    // Google Account ID
    googleId: {
      type: String,
      default: null,
    },

    // Profile image from Google
    avatar: {
      type: String,
      default: "",
    },

    // Account Information
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Appearance Settings
    appearanceSettings: {
      theme: {
        type: String,
        enum: ["dark", "light"],
        default: "dark",
      },

      compactMode: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
