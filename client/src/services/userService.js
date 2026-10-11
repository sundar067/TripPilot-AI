import api from "./api";

// Dashboard

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/stats");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw error;
  }
};

// Users

export const getAllUsers = async () => {
  try {
    const response = await api.get("/admin/users");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

// Get single user details

export const getUserDetails = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    throw error;
  }
};

// Change role

export const changeUserRole = async (id, role) => {
  try {
    const response = await api.patch(`/admin/users/${id}/role`, {
      role,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to change user role:", error);
    throw error;
  }
};

// Block / Unblock user

export const toggleUserBlock = async (id) => {
  try {
    const response = await api.patch(`/admin/users/${id}/block`);

    return response.data;
  } catch (error) {
    console.error("Failed to block/unblock user:", error);
    throw error;
  }
};

// Delete user

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);

    return response.data;
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
};

// Recent activity

export const getRecentActivity = async () => {
  try {
    const response = await api.get("/admin/activity");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    throw error;
  }
};
