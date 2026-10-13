
import api from "./api";

// Get Dashboard Analytics
export const getAnalytics = async () => {
  const { data } = await api.get("/admin/analytics");
  return data;
};
