import Destination from "../models/Destination.js";
import State from "../models/State.js";
import SearchHistory from "../models/SearchHistory.js";
import MissingDestination from "../models/MissingDestination.js";

// Escape special regex characters to avoid "Invalid regular expression" errors
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Save Final Search
export const logSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchText = query.trim();
    const safeSearchText = escapeRegex(searchText);

    // Check State
    const state = await State.findOne({
      name: {
        $regex: `^${safeSearchText}$`,
        $options: "i",
      },
    });

    // Check Destination
    const destination = await Destination.findOne({
      name: {
        $regex: `^${safeSearchText}$`,
        $options: "i",
      },
    });

    // Valid Search
    if (state || destination) {
      const type = state ? "state" : "destination";
      const normalizedName = searchText.toLowerCase();

      const existing = await SearchHistory.findOne({
        name: normalizedName,
        type,
      });

      if (existing) {
        existing.count += 1;
        existing.lastSearched = new Date();
        await existing.save();
      } else {
        await SearchHistory.create({
          name: normalizedName,
          type,
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
      });
    }

    // Missing Destination
    const normalizedName = searchText.toLowerCase();

    const missing = await MissingDestination.findOne({
      name: normalizedName,
    });

    if (missing) {
      missing.count += 1;
      missing.lastSearched = new Date();
      await missing.save();
    } else {
      await MissingDestination.create({
        name: normalizedName,
      });
    }

    return res.status(200).json({
      success: true,
      valid: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save search",
      error: error.message,
    });
  }
};
