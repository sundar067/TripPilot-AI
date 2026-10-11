import api from "./api";

// Login
export const loginUser = (userData) => {
  return api.post("/auth/login", userData);
};

// Register
export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

// Forgot password
export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", {
    email,
  });
};

// Reset password
export const resetPassword = (token, password) => {
  return api.post(`/auth/reset-password/${token}`, {
    password,
  });
};

// Update user profile
export const updateProfile = (profileData) => {
  return api.put("/auth/profile", profileData);
};

// Change password
export const changePassword = (passwordData) => {
  return api.put("/auth/change-password", passwordData);
};
