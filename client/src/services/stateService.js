import api from "./api";

// Get All States
export const getAllStates = () => {
  return api.get("/states");
};

// Get Single State
export const getStateById = (id) => {
  return api.get(`/states/${id}`);
};

// Search States
export const searchStates = (query) => {
  return api.get(`/states/search?query=${query}`);
};

// Create State
export const createState = (stateData) => {
  return api.post("/states", stateData);
};

// Update State
export const updateState = (id, stateData) => {
  return api.put(`/states/${id}`, stateData);
};

// Delete State
export const deleteState = (id) => {
  return api.delete(`/states/${id}`);
};
