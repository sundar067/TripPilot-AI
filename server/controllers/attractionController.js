import Attraction from "../models/Attraction.js";

// Create New Attraction
export const createAttraction = async (req, res) => {
  try {
    const {
      destinationId,
      name,
      description,
      images,
      videos,
      price,
      timing,
      details,
      bestTime,
      location,
      rating,
    } = req.body;

    // Required fields validation
    if (!destinationId || !name || !description || !price) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Duplicate check
    const existingAttraction = await Attraction.findOne({
      destinationId,
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingAttraction) {
      return res.status(400).json({
        message: "Attraction already exists for this destination",
      });
    }

    const attraction = await Attraction.create({
      destinationId,

      name,

      description,

      images: images || [],

      videos: videos || [],

      price,

      timing,

      details,

      bestTime,

      location,

      rating,
    });

    res.status(201).json({
      message: "Attraction created successfully",

      attraction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create attraction",

      error: error.message,
    });
  }
};

// Get Attractions By Destination
export const getAttractionsByDestination = async (req, res) => {
  try {
    const attractions = await Attraction.find({
      destinationId: req.params.destinationId,
    })
      .populate("destinationId", "name")
      .sort({
        rating: -1,

        createdAt: -1,
      });

    res.status(200).json(attractions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attractions",

      error: error.message,
    });
  }
};

// Get Single Attraction
export const getAttractionById = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id).populate(
      "destinationId",
      "name",
    );

    if (!attraction) {
      return res.status(404).json({
        message: "Attraction not found",
      });
    }

    res.status(200).json(attraction);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attraction",

      error: error.message,
    });
  }
};

// Update Attraction
export const updateAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        message: "Attraction not found",
      });
    }

    const {
      destinationId,
      name,
      description,
      images,
      videos,
      price,
      timing,
      details,
      bestTime,
      location,
      rating,
    } = req.body;

    attraction.destinationId = destinationId || attraction.destinationId;

    attraction.name = name || attraction.name;

    attraction.description = description || attraction.description;

    attraction.images = images || attraction.images;

    attraction.videos = videos || attraction.videos;

    attraction.price = price || attraction.price;

    attraction.timing = timing || attraction.timing;

    attraction.details = details || attraction.details;

    attraction.bestTime = bestTime || attraction.bestTime;

    attraction.location = location || attraction.location;

    attraction.rating = rating || attraction.rating;

    const updatedAttraction = await attraction.save();

    res.status(200).json({
      message: "Attraction updated successfully",

      attraction: updatedAttraction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update attraction",

      error: error.message,
    });
  }
};

// Delete Attraction
export const deleteAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        message: "Attraction not found",
      });
    }

    await attraction.deleteOne();

    res.status(200).json({
      message: "Attraction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete attraction",

      error: error.message,
    });
  }
};
