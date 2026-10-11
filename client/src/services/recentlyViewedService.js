import api from "./api";

export const addRecentlyViewed = (destinationId, userId) => {
  return api.post(`/recent/${destinationId}`, {
    userId,
  });
};

export const getRecentlyViewed = (userId) => {
  return api.get(`/recent/user/${userId}`);
};
