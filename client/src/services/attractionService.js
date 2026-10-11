import api from "./api";

// Add New Attraction
export const createAttraction = (data) => {
  return api.post("/attractions", data);
};

// Get Attractions By Destination
export const getAttractionsByDestination = (destinationId) => {
  return api.get(`/attractions/destination/${destinationId}`);
};

// Get Single Attraction
export const getAttractionById = (id) => {
  return api.get(`/attractions/${id}`);
};

// Update Attraction
export const updateAttraction = (id, data) => {
  return api.put(`/attractions/${id}`, data);
};

// Delete Attraction
export const deleteAttraction = (id) => {
  return api.delete(`/attractions/${id}`);
};
