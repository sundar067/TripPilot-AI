import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get all missing destinations

export const getMissingDestinations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/api/admin/missing-destinations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// Delete one missing destination

export const deleteMissingDestination = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `${API_URL}/api/admin/missing-destinations/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// Delete all missing destinations

export const clearMissingDestinations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `${API_URL}/api/admin/missing-destinations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
