import dotenv from "dotenv";
import mongoose from "mongoose";

import State from "../models/State.js";
import Destination from "../models/Destination.js";
import destinations from "../data/states/UP/destinations.js";

dotenv.config();

const seedUttarPradesh = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Find Uttar Pradesh state
    const upState = await State.findOne({
      name: "Uttar Pradesh",
    });

    if (!upState) {
      throw new Error(
        "Uttar Pradesh state not found. Please create the State first.",
      );
    }

    console.log(`Found Uttar Pradesh: ${upState._id}`);

    // Remove old Uttar Pradesh destinations
    await Destination.deleteMany({
      stateId: upState._id,
    });

    console.log("Old Uttar Pradesh destinations removed");

    const finalDestinations = [];

    // Process every destination
    for (const destination of destinations) {
      console.log(`\nProcessing: ${destination.name}`);

      // Gallery images
      const galleryImages = (destination.galleryImageSources || [])
        .filter(Boolean)
        .map((url) => ({
          url,
          publicId: "",
        }));

      // Things to do
      const thingsToDo = (destination.thingsToDo || []).map((thing) => {
        // thing gallery images
        const thingGalleryImages = (thing.galleryImageSources || [])
          .filter(Boolean)
          .map((url) => ({
            url,
            publicId: "",
          }));

        return {
          name: thing.name,
          description: thing.description || "",

          // Direct external image URL
          image: thing.imageSource || "",
          imagePublicId: "",

          galleryImages: thingGalleryImages,

          // Direct video URLs
          shortVideos: thing.shortVideos || [],

          price: thing.price || "",
          duration: thing.duration || "",
          bestTime: thing.bestTime || "",
          safetyTips: thing.safetyTips || "",

          rating: thing.rating || 0,
        };
      });

      // Nearby places
      const nearbyPlaces = (destination.nearbyPlaces || []).map((place) => {
        // Nearby gallery images
        const placeGalleryImages = (place.galleryImageSources || [])
          .filter(Boolean)
          .map((url) => url);

        return {
          name: place.name,
          description: place.description || "",

          distance: place.distance || "",
          location: place.location || "",
          famousFor: place.famousFor || "",

          // Direct external image URL
          image: place.imageSource || "",

          galleryImages: placeGalleryImages,

          // Direct video URLs
          shortVideos: place.shortVideos || [],

          bestTime: place.bestTime || "",
          travelTips: place.travelTips || "",

          rating: place.rating || 0,
        };
      });

      // Final destination object
      finalDestinations.push({
        // State ID is added from database
        stateId: upState._id,

        name: destination.name,
        description: destination.description,

        location: destination.location || "",

        category: destination.category,
        famousFor: destination.famousFor,

        // Direct external image URL
        image: destination.imageSource,
        imagePublicId: "",

        // Direct external gallery image URLs
        galleryImages,

        // Direct external video URLs
        shortVideos: destination.shortVideos || [],

        // Things to do
        thingsToDo,

        // Nearby places
        nearbyPlaces,

        bestTime: destination.bestTime,

        travelTips: destination.travelTips || "",

        rating: destination.rating || 0,

        wishlistCount: 0,
      });

      console.log(`Prepared: ${destination.name}`);
    }

    // Insert all destinations into MongoDB
    if (finalDestinations.length > 0) {
      await Destination.insertMany(finalDestinations);
    }

    // Final result
    console.log("\n========================================");
    console.log("Uttar Pradesh seed completed");
    console.log("========================================");

    console.log(`Total destinations inserted: ${finalDestinations.length}`);

    console.log("Images stored as external URLs");
    console.log("Videos stored as external URLs");

    console.log("========================================\n");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("\n========================================");
    console.error("Seed failed:");
    console.error(error);
    console.error("========================================");

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedUttarPradesh();
