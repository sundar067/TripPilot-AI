
import api from "./api";

// Get all missing destinations
export const getMissingDestinations = async () => {
  const { data } = await api.get("/admin/missing-destinations");
  return data;
};

// Delete one missing destination
export const deleteMissingDestination = async (id) => {
  const { data } = await api.delete(
    `/admin/missing-destinations/${id}`
  );
  return data;
};

// Delete all missing destinations
export const clearMissingDestinations = async () => {
  const { data } = await api.delete("/admin/missing-destinations");
  return data;
};
