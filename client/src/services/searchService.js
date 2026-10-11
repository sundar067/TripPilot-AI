import api from "./api";

// State search

export const searchStates = (query, options = {}) => {
  const params = new URLSearchParams({
    query,
  });

  if (options.track === false) {
    params.append("track", "false");
  }

  if (options.exact === true) {
    params.append("exact", "true");
  }

  return api.get(`/states/search?${params.toString()}`);
};

// Destination search

export const searchDestinations = (query, options = {}) => {
  const params = new URLSearchParams({
    query,
  });

  if (options.track === false) {
    params.append("track", "false");
  }

  if (options.exact === true) {
    params.append("exact", "true");
  }

  return api.get(`/destinations/search?${params.toString()}`);
};

// Filter destinations

export const filterDestinations = (filters) => {
  return api.get("/destinations/filter", {
    params: filters,
  });
};

// Dynamic categories

export const getDestinationCategories = () => {
  return api.get("/destinations/categories");
};
