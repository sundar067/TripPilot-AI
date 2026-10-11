import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get Dashboard Analytics

export const getAnalytics = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/api/admin/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
