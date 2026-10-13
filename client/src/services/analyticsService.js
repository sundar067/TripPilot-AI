
import api from "./api";

// Get Admin Dashboard Statistics
export const getAnalytics = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};
