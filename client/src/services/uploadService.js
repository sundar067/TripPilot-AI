import api from "./api";

// Upload image to Cloudinary
export const uploadImage = async (file, folder = "states") => {
  const formData = new FormData();

  // Add image
  formData.append("image", file);

  // Add folder
  formData.append("folder", folder);

  // Send image
  const response = await api.post("/uploads/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Return response
  return response.data;
};

// Upload video to Cloudinary
export const uploadVideo = async (file, folder = "destinationVideos") => {
  const formData = new FormData();

  // Add video
  formData.append("video", file);

  // Add folder
  formData.append("folder", folder);

  // Send video
  const response = await api.post("/uploads/video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Return response
  return response.data;
};
