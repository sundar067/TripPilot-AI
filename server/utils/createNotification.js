import Notification from "../models/Notification.js";
import { io } from "../index.js";

const createNotification = async ({
  title,
  message,
  type = "system",
  audience,
  userId = null,
}) => {
  try {
    if (!title?.trim() || !message?.trim()) {
      throw new Error("Title and message are required.");
    }

    if (!["admin", "user", "all"].includes(audience)) {
      throw new Error("Invalid audience. Use 'admin', 'user', or 'all'.");
    }

    if (audience === "user" && !userId) {
      throw new Error("userId is required for user notifications.");
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type,
      audience,
      userId: audience === "user" ? userId : null,
    });

    const data = notification.toObject();

    if (audience === "user") {
      io.to(userId.toString()).emit("new-notification", data);
    } else if (audience === "admin") {
      io.to("admins").emit("new-notification", data);
    } else if (audience === "all") {
      io.emit("new-notification", data);
    }

    return notification;
  } catch (error) {
    console.error("Notification Error:", error.message);
    throw error;
  }
};

export default createNotification;
