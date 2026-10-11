import api from "./api";

// Destination ko wishlist me add ya remove karne ke liye
export const toggleWishlist = (destinationId, userId) => {
  return api.put(`/wishlist/${destinationId}`, {
    userId,
  });
};

// Logged-in user ke saved destinations fetch karne ke liye
export const getUserWishlist = (userId) => {
  return api.get(`/wishlist/user/${userId}`);
};

// Check karne ke liye ki destination already wishlist me hai ya nahi
export const checkWishlistStatus = (destinationId, userId) => {
  return api.get(`/wishlist/status/${destinationId}/${userId}`);
};
