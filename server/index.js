import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";

import "./config/passport.js";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import attractionRoutes from "./routes/attractionRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import recentlyViewedRoutes from "./routes/recentlyViewedRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import missingDestinationRoutes from "./routes/missingDestinationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes

app.use("/api/auth", authRoutes);

app.use("/api/states", stateRoutes);

app.use("/api/destinations", destinationRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/attractions", attractionRoutes);

app.use("/api/trips", tripRoutes);

// Chat AI Route
app.use("/api/chat", chatRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/recent", recentlyViewedRoutes);

app.use("/api/uploads", uploadRoutes);

// Analytics Route

app.use("/api/admin/analytics", analyticsRoutes);

// Missing Destination Routes

app.use("/api/admin/missing-destinations", missingDestinationRoutes);

// Admin Routes

app.use("/api/admin", adminRoutes);

app.use("/api/notifications", notificationRoutes);

// Socket.IO

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("join-admin", () => {
    socket.join("admins");
  });

  socket.on("disconnect", () => {});
});

// Root Route

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TripPilot AI API is running 🚀",
  });
});

// Global Error Handler

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
