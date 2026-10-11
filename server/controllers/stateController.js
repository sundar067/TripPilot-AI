import State from "../models/State.js";

import MissingDestination from "../models/MissingDestination.js";

import cloudinary from "../config/cloudinary.js";

import createNotification from "../utils/createNotification.js";

// Get Cloudinary public ID from image URL

const getPublicIdFromCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    if (!url.includes("res.cloudinary.com")) {
      return "";
    }

    const uploadIndex = url.indexOf("/upload/");

    if (uploadIndex === -1) {
      return "";
    }

    let publicId = url.substring(uploadIndex + "/upload/".length);

    // Remove version number
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Failed to get Cloudinary public ID:", error);
    return "";
  }
};

// Delete image from Cloudinary

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log("Cloudinary delete result:", result);

    return result;
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
  }
};

// Create State

export const createState = async (req, res) => {
  try {
    const { name, description, image, imagePublicId } = req.body;

    // Check required fields

    if (!name || !description || !image) {
      return res.status(400).json({
        message: "Please provide name, description and image",
      });
    }

    // Check duplicate state

    const existingState = await State.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingState) {
      return res.status(400).json({
        message: "State already exists",
      });
    }

    // Create state

    const state = await State.create({
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      imagePublicId: imagePublicId?.trim() || "",
    });

    // Remove state from missing destinations

    await MissingDestination.deleteMany({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    // Create notification

    await createNotification({
      title: "New State Added",
      message: `${state.name} has been added successfully.`,
      type: "state",
      audience: "admin",
    });

    return res.status(201).json({
      message: "State created successfully",
      state,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create state",
      error: error.message,
    });
  }
};

// Get All States

export const getStates = async (req, res) => {
  try {
    const states = await State.find().sort({
      createdAt: 1,
    });

    return res.status(200).json(states);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch states",
      error: error.message,
    });
  }
};

// Get State By ID

export const getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    return res.status(200).json(state);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch state",
      error: error.message,
    });
  }
};

// Search States

export const searchStates = async (req, res) => {
  try {
    const { query = "", exact = "false" } = req.query;

    if (!query.trim()) {
      return res.status(200).json([]);
    }

    const searchRegex =
      exact === "true"
        ? new RegExp(`^${query.trim()}$`, "i")
        : new RegExp(query.trim(), "i");

    const states = await State.find({
      name: searchRegex,
    }).sort({
      name: 1,
    });

    return res.status(200).json(states);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to search states",
      error: error.message,
    });
  }
};

// Update State

export const updateState = async (req, res) => {
  try {
    const { name, description, image, imagePublicId } = req.body;

    // Check required fields

    if (!name || !description || !image) {
      return res.status(400).json({
        message: "Please provide name, description and image",
      });
    }

    // Find state

    const state = await State.findById(req.params.id);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    // Check duplicate state name

    const duplicateState = await State.findOne({
      _id: {
        $ne: req.params.id,
      },
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (duplicateState) {
      return res.status(400).json({
        message: "Another state with this name already exists",
      });
    }

    // Get old image details

    const oldImage = state.image;

    const oldImagePublicId =
      state.imagePublicId || getPublicIdFromCloudinaryUrl(oldImage);

    // Get new image details

    const newImage = image.trim();

    const newImagePublicId =
      imagePublicId?.trim() || getPublicIdFromCloudinaryUrl(newImage);

    // Check if image was changed

    const imageChanged =
      oldImage !== newImage &&
      oldImagePublicId &&
      newImagePublicId &&
      oldImagePublicId !== newImagePublicId;

    // Update state

    state.name = name.trim();
    state.description = description.trim();
    state.image = newImage;
    state.imagePublicId = newImagePublicId;

    const updatedState = await state.save();

    // Delete old image if a new image was uploaded

    if (imageChanged) {
      await deleteCloudinaryImage(oldImagePublicId);
    }

    // Create notification

    await createNotification({
      title: "State Updated",
      message: `${updatedState.name} has been updated successfully.`,
      type: "state",
      audience: "admin",
    });

    return res.status(200).json({
      message: "State updated successfully",
      state: updatedState,
    });
  } catch (error) {
    console.error("Update state error:", error);

    return res.status(500).json({
      message: "Failed to update state",
      error: error.message,
    });
  }
};

// Delete State

export const deleteState = async (req, res) => {
  try {
    // Find state

    const state = await State.findById(req.params.id);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    const stateName = state.name;

    // Get Cloudinary public ID

    const imagePublicId =
      state.imagePublicId || getPublicIdFromCloudinaryUrl(state.image);

    // Delete state from database

    await state.deleteOne();

    // Delete image from Cloudinary

    if (imagePublicId) {
      await deleteCloudinaryImage(imagePublicId);
    }

    // Create notification

    await createNotification({
      title: "State Deleted",
      message: `${stateName} has been deleted.`,
      type: "state",
      audience: "admin",
    });

    return res.status(200).json({
      message: "State and associated image deleted successfully",
    });
  } catch (error) {
    console.error("Delete state error:", error);

    return res.status(500).json({
      message: "Failed to delete state",
      error: error.message,
    });
  }
};
