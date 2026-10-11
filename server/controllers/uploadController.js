import uploadToCloudinary from "../utils/cloudinaryUpload.js";

// Upload image
export const uploadImage = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    // Get folder from frontend
    const folderName = req.body.folder || "states";

    // Allowed image folders
    const allowedFolders = [
      "states",
      "destinations",
      "attractions",
      "destinationGallery",
      "attractionGallery",
      "thingsToDo",
      "thingsToDoGallery",
      "nearbyPlaces",
      "nearbyPlacesGallery",
    ];

    // Check folder
    if (!allowedFolders.includes(folderName)) {
      return res.status(400).json({
        message: "Invalid upload folder",
      });
    }

    // Cloudinary folders
    const folderMap = {
      states: "trippilot/states",

      destinations: "trippilot/destinations",

      attractions: "trippilot/attractions",

      destinationGallery: "trippilot/destinations/gallery",

      attractionGallery: "trippilot/attractions/gallery",

      // Things To Do main image
      thingsToDo: "trippilot/things-to-do",

      // Things To Do gallery
      thingsToDoGallery: "trippilot/things-to-do/gallery",

      // Nearby Places main image
      nearbyPlaces: "trippilot/nearby-places",

      // Nearby Places gallery
      nearbyPlacesGallery: "trippilot/nearby-places/gallery",
    };

    const cloudinaryFolder = folderMap[folderName];

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      cloudinaryFolder,
      "image",
    );

    // Send Cloudinary details
    return res.status(200).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary image upload error:", error);

    return res.status(500).json({
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

// Upload video
export const uploadVideo = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a video",
      });
    }

    // Get folder from frontend
    const folderName = req.body.folder || "destinationVideos";

    // Allowed video folders
    const allowedFolders = [
      "destinationVideos",
      "attractionVideos",
      "thingsToDoVideos",
    ];

    // Check folder
    if (!allowedFolders.includes(folderName)) {
      return res.status(400).json({
        message: "Invalid video upload folder",
      });
    }

    // Cloudinary folders
    const folderMap = {
      destinationVideos: "trippilot/destinations/videos",

      attractionVideos: "trippilot/attractions/videos",

      // Things To Do videos
      thingsToDoVideos: "trippilot/things-to-do/videos",
    };

    const cloudinaryFolder = folderMap[folderName];

    // Upload video to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      cloudinaryFolder,
      "video",
    );

    // Send Cloudinary details
    return res.status(200).json({
      message: "Video uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary video upload error:", error);

    return res.status(500).json({
      message: "Failed to upload video",
      error: error.message,
    });
  }
};
