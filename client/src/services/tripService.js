import api from "./api";

// AI trip plan generate
export const generateTripPlan = (tripData) => {
  return api.post("/trips/generate", tripData);
};

// Follow-up AI chat
export const askTripQuestion = (chatData) => {
  return api.post("/trips/ask", chatData);
};

// Logged-in user ke saved trips fetch karne ke liye
export const getMyTrips = () => {
  return api.get("/trips/my-trips");
};

// Single saved trip ki full details fetch karne ke liye
export const getTripById = (id) => {
  return api.get(`/trips/${id}`);
};

// Saved trip delete karne ke liye
export const deleteTrip = (id) => {
  return api.delete(`/trips/${id}`);
};
