
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

// Allowed frontend origins
const allowedOrigins = [
  "https://trip-pilot-ai-liart.vercel.app",
  "http://localhost:5173",
  process.env.CLIENT_URL?.replace(/\/$/, ""),
].filter(Boolean);

// Shared CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as server-to-server requests.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// Socket.IO
export const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/attractions", attractionRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/recent", recentlyViewedRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/missing-destinations", missingDestinationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.IO events
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(String(userId));
    }
  });

  socket.on("join-admin", () => {
    socket.join("admins");
  });

  socket.on("disconnect", () => {});
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TripPilot AI API is running 🚀",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
