import Notification from "../models/Notification.js";

// Get Notifications

export const getNotifications = async (req, res) => {
  try {
    let query = {};

    // Admin Notifications

    if (req.user.role === "admin") {
      query = {
        $or: [{ audience: "admin" }, { audience: "all" }],
      };
    }

    // User Notifications
    else {
      query = {
        $or: [
          {
            audience: "user",
            userId: req.user._id,
          },
          {
            audience: "all",
          },
        ],
      };
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Mark Notification as Read

export const markAsRead = async (req, res) => {
  try {
    let query = {
      _id: req.params.id,
    };

    if (req.user.role === "admin") {
      query.$or = [{ audience: "admin" }, { audience: "all" }];
    } else {
      query.$or = [
        {
          audience: "user",
          userId: req.user._id,
        },
        {
          audience: "all",
        },
      ];
    }

    const notification = await Notification.findOne(query);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Mark Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Mark All Notifications as Read

export const markAllAsRead = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter = {
        isRead: false,
        $or: [{ audience: "admin" }, { audience: "all" }],
      };
    } else {
      filter = {
        isRead: false,
        $or: [
          {
            audience: "user",
            userId: req.user._id,
          },
          {
            audience: "all",
          },
        ],
      };
    }

    await Notification.updateMany(filter, {
      isRead: true,
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Notification

export const deleteNotification = async (req, res) => {
  try {
    let query = {
      _id: req.params.id,
    };

    if (req.user.role === "admin") {
      query.$or = [{ audience: "admin" }, { audience: "all" }];
    } else {
      query.$or = [
        {
          audience: "user",
          userId: req.user._id,
        },
        {
          audience: "all",
        },
      ];
    }

    const notification = await Notification.findOne(query);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Clear Notifications

export const clearNotifications = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter = {
        $or: [{ audience: "admin" }, { audience: "all" }],
      };
    } else {
      filter = {
        $or: [
          {
            audience: "user",
            userId: req.user._id,
          },
          {
            audience: "all",
          },
        ],
      };
    }

    await Notification.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: "Notifications cleared successfully.",
    });
  } catch (error) {
    console.error("Clear Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
