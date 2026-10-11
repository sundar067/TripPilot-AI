import dotenv from "dotenv";
import mongoose from "mongoose";

import State from "../models/State.js";
import Destination from "../models/Destination.js";

import destinations from "../data/states/Jharkhand/destinations.js";

dotenv.config();

/* =========================================================
   FORMAT SHORT VIDEOS
   ========================================================= */

const formatShortVideos = (videos = []) => {
  if (!Array.isArray(videos)) {
    return [];
  }

  return videos
    .filter(Boolean)
    .map((video) => {
      /* String URL */
      if (typeof video === "string") {
        return {
          type: "url",
          url: video,
          publicId: "",
        };
      }

      /* Object */
      if (typeof video === "object") {
        return {
          type: "url",
          url: video.url || "",
          publicId: video.publicId || "",
        };
      }

      return null;
    })
    .filter((video) => video && video.url);
};

/* =========================================================
   FORMAT GALLERY IMAGES
   ========================================================= */

const formatGalleryImages = (images = []) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter(Boolean)
    .map((image) => {
      /* String URL */
      if (typeof image === "string") {
        return {
          url: image,
          publicId: "",
        };
      }

      /* Object */
      if (typeof image === "object") {
        return {
          url: image.url || "",
          publicId: image.publicId || "",
        };
      }

      return null;
    })
    .filter((image) => image && image.url);
};

/* =========================================================
   SEED JHARKHAND
   ========================================================= */

const seedJharkhand = async () => {
  try {
    /* =====================================================
       CONNECT MONGODB
       ===================================================== */

    await mongoose.connect(process.env.MONGO_URI);

    console.log("\n========================================");
    console.log("MongoDB connected");
    console.log("========================================\n");

    /* =====================================================
       FIND JHARKHAND STATE
       ===================================================== */

    const jharkhandState = await State.findOne({
      name: {
        $in: ["Jharkhand", "jharkhand"],
      },
    });

    if (!jharkhandState) {
      throw new Error(
        "Jharkhand state not found. Please create the Jharkhand State first.",
      );
    }

    console.log(`Found Jharkhand: ${jharkhandState._id}`);

    /* =====================================================
       REMOVE OLD JHARKHAND DESTINATIONS
       ===================================================== */

    await Destination.deleteMany({
      stateId: jharkhandState._id,
    });

    console.log("Old Jharkhand destinations removed");

    /* =====================================================
       PREPARE DESTINATIONS
       ===================================================== */

    const finalDestinations = [];

    for (const destination of destinations) {
      console.log(`\nProcessing: ${destination.name}`);

      /* ===================================================
         DESTINATION GALLERY
         =================================================== */

      const galleryImages = formatGalleryImages(
        destination.galleryImageSources,
      );

      console.log(`Gallery images: ${galleryImages.length}`);

      /* ===================================================
         DESTINATION VIDEOS
         =================================================== */

      const destinationVideos = formatShortVideos(destination.shortVideos);

      console.log(`Short videos: ${destinationVideos.length}`);

      /* ===================================================
         THINGS TO DO
         =================================================== */

      const thingsToDo = Array.isArray(destination.thingsToDo)
        ? destination.thingsToDo.map((thing) => {
            const thingGalleryImages = formatGalleryImages(
              thing.galleryImageSources,
            );

            const thingVideos = formatShortVideos(thing.shortVideos);

            return {
              name: thing.name || "",

              description: thing.description || "",

              /* Main image */
              image: thing.imageSource || "",

              imagePublicId: "",

              /* Gallery */
              galleryImages: thingGalleryImages,

              /* Videos */
              shortVideos: thingVideos,

              /* Other information */
              price: thing.price || "",

              bestTime: thing.bestTime || "",

              safetyTips: thing.safetyTips || "",

              rating: typeof thing.rating === "number" ? thing.rating : 0,
            };
          })
        : [];

      console.log(`Things to do: ${thingsToDo.length}`);

      /* ===================================================
         NEARBY PLACES
         =================================================== */

      const nearbyPlaces = Array.isArray(destination.nearbyPlaces)
        ? destination.nearbyPlaces.map((place) => {
            const placeGalleryImages = formatGalleryImages(
              place.galleryImageSources || place.galleryImages || [],
            );

            const placeVideos = formatShortVideos(place.shortVideos);

            return {
              name: place.name || "",

              description: place.description || "",

              distance: place.distance || "",

              location: place.location || "",

              famousFor: place.famousFor || "",

              /* Main image */
              image: place.imageSource || "",

              /*
               * Nearby schema requires string URLs
               */
              galleryImages: placeGalleryImages.map((image) => image.url),

              /* Videos */
              shortVideos: placeVideos,

              bestTime: place.bestTime || "",

              travelTips: place.travelTips || "",

              rating: typeof place.rating === "number" ? place.rating : 0,
            };
          })
        : [];

      console.log(`Nearby places: ${nearbyPlaces.length}`);

      /* ===================================================
         FINAL DESTINATION OBJECT
         =================================================== */

      finalDestinations.push({
        /* State reference */
        stateId: jharkhandState._id,

        /* Basic information */
        name: destination.name || "",

        description: destination.description || "",

        location: destination.location || "",

        category: destination.category || "",

        famousFor: destination.famousFor || "",

        /* Main image */
        image: destination.imageSource || "",

        imagePublicId: "",

        /* Gallery */
        galleryImages,

        /* Destination videos */
        shortVideos: destinationVideos,

        /* Things to do */
        thingsToDo,

        /* Nearby places */
        nearbyPlaces,

        /* Travel information */
        bestTime: destination.bestTime || "",

        travelTips: destination.travelTips || "",

        /* Rating */
        rating: typeof destination.rating === "number" ? destination.rating : 0,

        /* Wishlist */
        wishlistCount: 0,
      });

      console.log(`Prepared: ${destination.name}`);
    }

    /* =====================================================
       CHECK PREPARED DESTINATIONS
       ===================================================== */

    console.log(`\nTotal destinations prepared: ${finalDestinations.length}`);

    /* =====================================================
       NO DESTINATIONS
       ===================================================== */

    if (finalDestinations.length === 0) {
      console.log("\nNo destinations found in destinations.js");

      await mongoose.disconnect();

      process.exit(0);
    }

    /* =====================================================
       INSERT INTO MONGODB
       ===================================================== */

    console.log(`\nInserting ${finalDestinations.length} destinations...`);

    await Destination.insertMany(finalDestinations);

    /* =====================================================
       SUCCESS
       ===================================================== */

    console.log("\n========================================");

    console.log("Jharkhand seed completed successfully");

    console.log("========================================");

    console.log(`Total destinations inserted: ${finalDestinations.length}`);

    console.log("Images stored as external URLs");

    console.log("Videos stored as external URLs");

    console.log("Travel tips stored in MongoDB");

    console.log("========================================\n");

    /* =====================================================
       DISCONNECT MONGODB
       ===================================================== */

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    /* =====================================================
       ERROR
       ===================================================== */

    console.error("\n========================================");

    console.error("Jharkhand seed failed");

    console.error("========================================");

    console.error("\nError message:");

    console.error(error.message);

    /* =====================================================
       MONGOOSE VALIDATION ERROR
       ===================================================== */

    if (error.name === "ValidationError") {
      console.error("\nMongoose validation details:");

      Object.keys(error.errors).forEach((field) => {
        console.error(`\nField: ${field}`);

        console.error(`Message: ${error.errors[field].message}`);

        console.error(`Value: ${error.errors[field].value}`);

        console.error(`Kind: ${error.errors[field].kind}`);
      });
    }

    /* =====================================================
       CAST ERROR
       ===================================================== */

    if (error.name === "CastError") {
      console.error("\nMongoose Cast Error:");

      console.error("Path:", error.path);

      console.error("Value:", error.value);

      console.error("Kind:", error.kind);
    }

    /* =====================================================
       DUPLICATE KEY ERROR
       ===================================================== */

    if (error.code === 11000) {
      console.error("\nDuplicate key error:");

      console.error(error.keyValue);
    }

    console.error("\n========================================\n");

    /* =====================================================
       DISCONNECT AFTER ERROR
       ===================================================== */

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("MongoDB disconnect error:", disconnectError.message);
    }

    process.exit(1);
  }
};

/* =========================================================
   RUN SEED
   ========================================================= */

seedJharkhand();
