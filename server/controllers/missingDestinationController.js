import MissingDestination from "../models/MissingDestination.js";

// Get all missing destinations

export const getMissingDestinations = async (req, res) => {
  try {
    const destinations = await MissingDestination.find().sort({
      count: -1,
      lastSearched: -1,
    });

    res.status(200).json({
      success: true,
      destinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch missing destinations",
      error: error.message,
    });
  }
};

// Delete one missing destination

export const deleteMissingDestination = async (req, res) => {
  try {
    const destination = await MissingDestination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    await destination.deleteOne();

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete destination",
      error: error.message,
    });
  }
};

// Delete all missing destinations

export const clearMissingDestinations = async (req, res) => {
  try {
    await MissingDestination.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All missing destinations cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear missing destinations",
      error: error.message,
    });
  }
};
