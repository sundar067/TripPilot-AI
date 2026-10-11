import dotenv from "dotenv";
import mongoose from "mongoose";

import State from "../models/State.js";
import Destination from "../models/Destination.js";

import destinations from "../data/states/Uttarakhand/destinations.js";

dotenv.config();

/*
 * Convert video URLs from the data file into
 * the format expected by the Destination schema.
 *
 * Input:
 * [
 *   "https://www.youtube.com/watch?v=example"
 * ]
 *
 * Output:
 * [
 *   {
 *     type: "url",
 *     url: "https://www.youtube.com/watch?v=example",
 *     publicId: ""
 *   }
 * ]
 */
const formatShortVideos = (videos = []) => {
  return videos
    .filter(Boolean)
    .map((video) => {
      // If video is already a string URL
      if (typeof video === "string") {
        return {
          type: "url",
          url: video,
          publicId: "",
        };
      }

      // If video is already an object
      return {
        type: video.type || "url",
        url: video.url || "",
        publicId: video.publicId || "",
      };
    })
    .filter((video) => video.url);
};

const seedUttarakhand = async () => {
  try {
    // ========================================
    // Connect MongoDB
    // ========================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // ========================================
    // Find Uttarakhand state
    // ========================================

    const uttarakhandState = await State.findOne({
      name: "Uttarakhand",
    });

    if (!uttarakhandState) {
      throw new Error(
        "Uttarakhand state not found. Please create the State first.",
      );
    }

    console.log(`Found Uttarakhand: ${uttarakhandState._id}`);

    // ========================================
    // Remove old Uttarakhand destinations
    // ========================================

    await Destination.deleteMany({
      stateId: uttarakhandState._id,
    });

    console.log("Old Uttarakhand destinations removed");

    // ========================================
    // Prepare destinations
    // ========================================

    const finalDestinations = [];

    for (const destination of destinations) {
      console.log(`\nProcessing: ${destination.name}`);

      // ========================================
      // Destination Gallery Images
      // ========================================

      const galleryImages = (destination.galleryImageSources || [])
        .filter(Boolean)
        .map((url) => ({
          url,
          publicId: "",
        }));

      // ========================================
      // Things To Do
      // ========================================

      const thingsToDo = (destination.thingsToDo || []).map((thing) => {
        // ----------------------------------------
        // Thing Gallery Images
        // ----------------------------------------

        const thingGalleryImages = (thing.galleryImageSources || [])
          .filter(Boolean)
          .map((item) => {
            // String URL
            if (typeof item === "string") {
              return {
                url: item,
                publicId: "",
              };
            }

            // Object
            return {
              url: item.url,
              publicId: item.publicId || "",
            };
          })
          .filter((item) => item.url);

        // ----------------------------------------
        // Thing Object
        // ----------------------------------------

        return {
          name: thing.name,

          description: thing.description || "",

          // Main image
          image: thing.imageSource || "",
          imagePublicId: "",

          // Gallery
          galleryImages: thingGalleryImages,

          // Videos
          shortVideos: formatShortVideos(thing.shortVideos),

          // Other information
          price: thing.price || "",

          bestTime: thing.bestTime || "",

          safetyTips: thing.safetyTips || "",

          rating: thing.rating || 0,
        };
      });

      // ========================================
      // Nearby Places
      // ========================================

      const nearbyPlaces = (destination.nearbyPlaces || []).map((place) => {
        // ----------------------------------------
        // Nearby Gallery Images
        // ----------------------------------------

        const placeGalleryImages = (
          place.galleryImageSources ||
          place.galleryImages ||
          []
        )
          .filter(Boolean)
          .map((item) => {
            // String URL
            if (typeof item === "string") {
              return item;
            }

            // Object
            return item.url;
          })
          .filter(Boolean);

        // ----------------------------------------
        // Nearby Place Object
        // ----------------------------------------

        return {
          name: place.name,

          description: place.description || "",

          distance: place.distance || "",

          location: place.location || "",

          famousFor: place.famousFor || "",

          // Main image
          image: place.imageSource || "",

          // Gallery
          galleryImages: placeGalleryImages,

          // Videos
          shortVideos: formatShortVideos(place.shortVideos),

          // Other information
          bestTime: place.bestTime || "",

          travelTips: place.travelTips || "",

          rating: place.rating || 0,
        };
      });

      // ========================================
      // Final Destination Object
      // ========================================

      finalDestinations.push({
        // State reference
        stateId: uttarakhandState._id,

        // Basic information
        name: destination.name,

        description: destination.description,

        location: destination.location || "",

        category: destination.category,

        famousFor: destination.famousFor,

        // Main image
        image: destination.imageSource || "",

        imagePublicId: "",

        // Gallery
        galleryImages,

        // Destination videos
        shortVideos: formatShortVideos(destination.shortVideos),

        // Things to do
        thingsToDo,

        // Nearby places
        nearbyPlaces,

        // Travel information
        bestTime: destination.bestTime || "",

        travelTips: destination.travelTips || "",

        // Rating
        rating: destination.rating || 0,

        // Wishlist
        wishlistCount: 0,
      });

      console.log(`Prepared: ${destination.name}`);
    }

    // ========================================
    // Insert destinations into MongoDB
    // ========================================

    if (finalDestinations.length > 0) {
      await Destination.insertMany(finalDestinations);
    }

    // ========================================
    // Success
    // ========================================

    console.log("\n========================================");
    console.log("Uttarakhand seed completed");
    console.log("========================================");

    console.log(`Total destinations inserted: ${finalDestinations.length}`);

    console.log("Images stored as external URLs");
    console.log("Videos stored as external URLs");

    console.log("========================================\n");

    // ========================================
    // Disconnect MongoDB
    // ========================================

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    // ========================================
    // Error
    // ========================================

    console.error("\n========================================");
    console.error("Uttarakhand seed failed:");
    console.error(error);
    console.error("========================================");

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedUttarakhand();
