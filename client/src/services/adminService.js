import api from "./api";

// profile

// Get Admin Profile
export const getProfile = async () => {
  const { data } = await api.get("/admin/profile");

  return data;
};

// Update Admin Profile
export const updateProfile = async (profileData) => {
  const { data } = await api.put("/admin/profile", profileData);

  return data;
};

// security

// Change Admin Password
export const changePassword = async (passwordData) => {
  const { data } = await api.put("/admin/change-password", passwordData);

  return data;
};
