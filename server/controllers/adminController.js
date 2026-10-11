import bcrypt from "bcryptjs";
import User from "../models/User.js";
import State from "../models/State.js";
import Destination from "../models/Destination.js";
import Attraction from "../models/Attraction.js";
import Trip from "../models/Trip.js";
import Wishlist from "../models/Wishlist.js";
import createNotification from "../utils/createNotification.js";

// dashboard

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStates,
      totalDestinations,
      totalAttractions,
      totalTrips,
    ] = await Promise.all([
      User.countDocuments(),
      State.countDocuments(),
      Destination.countDocuments(),
      Attraction.countDocuments(),
      Trip.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStates,
        totalDestinations,
        totalAttractions,
        totalTrips,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// users

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").lean();

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalTrips, savedDestinations] = await Promise.all([
          Trip.countDocuments({
            userId: user._id,
          }),

          Wishlist.countDocuments({
            userId: user._id,
          }),
        ]);

        return {
          ...user,
          totalTrips,
          savedDestinations,
          totalReviews: 0,
        };
      }),
    );

    // Super Admin -> Admin -> User
    usersWithStats.sort((a, b) => {
      if (a.isSuperAdmin && !b.isSuperAdmin) {
        return -1;
      }

      if (!a.isSuperAdmin && b.isSuperAdmin) {
        return 1;
      }

      if (a.role === "admin" && b.role !== "admin") {
        return -1;
      }

      if (a.role !== "admin" && b.role === "admin") {
        return 1;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Change User Role
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Cannot change own role
    if (loggedInUser._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    // Super Admin is protected
    if (targetUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super Admin role cannot be changed.",
      });
    }

    // Only Super Admin can promote Admin
    if (role === "admin" && !loggedInUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can assign Admin role.",
      });
    }

    targetUser.role = role;

    await targetUser.save();

    // Dashboard Notification
    await createNotification({
      title: role === "admin" ? "User Promoted to Admin" : "User Role Updated",

      message:
        role === "admin"
          ? `${targetUser.name} has been promoted to Admin.`
          : `${targetUser.name} is now a User.`,

      type: "admin",
      audience: "admin",
    });

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: targetUser,
    });
  } catch (error) {
    console.error("Change Role Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // Cannot delete yourself
    if (loggedInUser._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    // Super Admin is protected
    if (targetUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot be deleted.",
      });
    }

    // Only Super Admin can delete Admin
    if (targetUser.role === "admin" && !loggedInUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can delete Admin accounts.",
      });
    }

    const userName = targetUser.name;

    await User.findByIdAndDelete(id);

    // Dashboard Notification
    await createNotification({
      title: "User Deleted",
      message: `${userName} has been deleted.`,
      type: "admin",
      audience: "admin",
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Block / Unblock User
export const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // Cannot block yourself
    if (loggedInUser._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own account.",
      });
    }

    // Super Admin is protected
    if (targetUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot be blocked.",
      });
    }

    // Only Super Admin can block Admin
    if (targetUser.role === "admin" && !loggedInUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can block Admin accounts.",
      });
    }

    targetUser.isBlocked = !targetUser.isBlocked;

    await targetUser.save();

    // Dashboard Notification
    await createNotification({
      title: targetUser.isBlocked ? "User Blocked" : "User Unblocked",

      message: targetUser.isBlocked
        ? `${targetUser.name} has been blocked.`
        : `${targetUser.name} has been unblocked.`,

      type: "admin",
      audience: "admin",
    });

    res.status(200).json({
      success: true,

      message: targetUser.isBlocked
        ? "User blocked successfully."
        : "User unblocked successfully.",

      data: targetUser,
    });
  } catch (error) {
    console.error("Toggle Block Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// recent activity

// Get Recent Activity
export const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt");

    const recentTrips = await Trip.find({})
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("destination createdAt userId");

    const activities = [];

    recentUsers.forEach((user) => {
      activities.push({
        type: "user",
        title: `${user.name} registered`,
        description: "New user account created",
        createdAt: user.createdAt,
      });
    });

    recentTrips.forEach((trip) => {
      activities.push({
        type: "trip",
        title: `${trip.userId?.name || "User"} planned a trip`,
        description: `Destination: ${trip.destination}`,
        createdAt: trip.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: activities.slice(0, 10),
    });
  } catch (error) {
    console.error("Recent Activity Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// user details

// Get Single User Details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // User Trips
    const trips = await Trip.find({
      userId: id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const [totalTrips, savedDestinations] = await Promise.all([
      Trip.countDocuments({
        userId: id,
      }),

      Wishlist.countDocuments({
        userId: id,
      }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        ...user.toObject(),

        totalTrips,

        savedDestinations,

        recentTrips: trips,

        totalReviews: 0,

        lastLogin: user.lastLogin || null,

        provider: user.provider,

        isEmailVerified: user.isEmailVerified,

        accountType: user.isSuperAdmin
          ? "Super Admin"
          : user.role === "admin"
            ? "Admin"
            : "User",
      },
    });
  } catch (error) {
    console.error("Get User Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// profile

// Get Admin Profile
export const getProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update Admin Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// security

// Change Password
export const changePassword = async (req, res) => {
  try {
    // Get passwords
    const { currentPassword, newPassword } = req.body;

    // Check required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    // Check password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    // Find logged-in admin
    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    // Generate password salt
    const salt = await bcrypt.genSalt(10);

    // Hash new password
    admin.password = await bcrypt.hash(newPassword, salt);

    // Save new password
    await admin.save();

    // Success response
    res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    res.status(500).json({
      message: "Failed to change password.",
    });
  }
};
