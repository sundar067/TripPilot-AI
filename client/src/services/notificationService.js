import api from "./api";

// Get Notifications

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
};

// Mark as Read

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);

    return response.data;
  } catch (error) {
    console.error("Failed to mark notification:", error);
    throw error;
  }
};

// Mark All Read

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch("/notifications/read-all");

    return response.data;
  } catch (error) {
    console.error("Failed to mark all notifications:", error);
    throw error;
  }
};

// Delete Notification

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);

    return response.data;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
};

// Clear All Notifications

export const clearNotifications = async () => {
  try {
    const response = await api.delete("/notifications/clear");

    return response.data;
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    throw error;
  }
};
