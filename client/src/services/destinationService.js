import api from "./api";

// Get All Destinations
export const getAllDestinations = () => {
  return api.get("/destinations");
};

// Get Single Destination
export const getDestinationById = (id) => {
  return api.get(`/destinations/${id}`);
};

// Get Destinations By State
export const getDestinationsByState = (stateId) => {
  return api.get(`/destinations/state/${stateId}`);
};

// Create Destination
export const createDestination = (destinationData) => {
  return api.post("/destinations", destinationData);
};

// Update Destination
export const updateDestination = (id, destinationData) => {
  return api.put(`/destinations/${id}`, destinationData);
};

// Delete Destination
export const deleteDestination = (id) => {
  return api.delete(`/destinations/${id}`);
};

// Search Destinations
export const searchDestinations = (query) => {
  return api.get("/destinations/search", {
    params: { query },
  });
};

// Filter Destinations
export const filterDestinations = (params) => {
  return api.get("/destinations/filter", {
    params,
  });
};

// Get Destination Categories
export const getDestinationCategories = () => {
  return api.get("/destinations/categories");
};
