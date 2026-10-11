import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Save Final Search

export const logSearch = async (query) => {
  try {
    await axios.post(`${API_URL}/api/search/log`, {
      query,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
};
