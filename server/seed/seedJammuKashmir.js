import dotenv from "dotenv";
import mongoose from "mongoose";

import State from "../models/State.js";
import Destination from "../models/Destination.js";

import destinations from "../data/states/JammuKashmir/destinations.js";

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
      /* -----------------------------------------
         String URL
         ----------------------------------------- */

      if (typeof video === "string") {
        return {
          type: "url",
          url: video,
          publicId: "",
        };
      }

      /* -----------------------------------------
         Object
         ----------------------------------------- */

      if (typeof video === "object") {
        /*
         * Destination schema accepts "url"
         * as the video type.
         *
         * Even if destinations.js contains:
         *
         * type: "youtube"
         *
         * convert it to:
         *
         * type: "url"
         */

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
      /* -----------------------------------------
         String URL
         ----------------------------------------- */

      if (typeof image === "string") {
        return {
          url: image,
          publicId: "",
        };
      }

      /* -----------------------------------------
         Object
         ----------------------------------------- */

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
   SEED JAMMU AND KASHMIR
   ========================================================= */

const seedJammuKashmir = async () => {
  try {
    /* =====================================================
       CONNECT MONGODB
       ===================================================== */

    await mongoose.connect(process.env.MONGO_URI);

    console.log("\n========================================");
    console.log("MongoDB connected");
    console.log("========================================\n");

    /* =====================================================
       FIND JAMMU AND KASHMIR STATE
       ===================================================== */

    const jammuKashmirState = await State.findOne({
      name: {
        $in: ["Jammu and Kashmir", "Jammu & Kashmir", "Jammu Kashmir"],
      },
    });

    if (!jammuKashmirState) {
      throw new Error(
        "Jammu and Kashmir state not found. Please create the State first.",
      );
    }

    console.log(`Found Jammu and Kashmir: ${jammuKashmirState._id}`);

    /* =====================================================
       REMOVE OLD JAMMU AND KASHMIR DESTINATIONS
       ===================================================== */

    await Destination.deleteMany({
      stateId: jammuKashmirState._id,
    });

    console.log("Old Jammu and Kashmir destinations removed");

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
            /* ---------------------------------------------
               Thing Gallery
               --------------------------------------------- */

            const thingGalleryImages = formatGalleryImages(
              thing.galleryImageSources,
            );

            /* ---------------------------------------------
               Thing Videos
               --------------------------------------------- */

            const thingVideos = formatShortVideos(thing.shortVideos);

            /* ---------------------------------------------
               Thing Object
               --------------------------------------------- */

            return {
              name: thing.name || "",

              description: thing.description || "",

              /* -----------------------------------------
                 Main image
                 ----------------------------------------- */

              image: thing.imageSource || "",

              imagePublicId: "",

              /* -----------------------------------------
                 Gallery
                 ----------------------------------------- */

              galleryImages: thingGalleryImages,

              /* -----------------------------------------
                 Videos
                 ----------------------------------------- */

              shortVideos: thingVideos,

              /* -----------------------------------------
                 Other information
                 ----------------------------------------- */

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
            /* ---------------------------------------------
               Nearby Gallery
               --------------------------------------------- */

            const placeGalleryImages = formatGalleryImages(
              place.galleryImageSources || place.galleryImages || [],
            );

            /* ---------------------------------------------
               Nearby Videos
               --------------------------------------------- */

            const placeVideos = formatShortVideos(place.shortVideos);

            /* ---------------------------------------------
               Nearby Object
               --------------------------------------------- */

            return {
              name: place.name || "",

              description: place.description || "",

              distance: place.distance || "",

              location: place.location || "",

              famousFor: place.famousFor || "",

              /* -----------------------------------------
                 Main image
                 ----------------------------------------- */

              image: place.imageSource || "",

              /* -----------------------------------------
                 Gallery

                 IMPORTANT:
                 NearbyPlaces schema expects
                 galleryImages as URL strings.
                 ----------------------------------------- */

              galleryImages: placeGalleryImages.map((image) => image.url),

              /* -----------------------------------------
                 Videos
                 ----------------------------------------- */

              shortVideos: placeVideos,

              /* -----------------------------------------
                 Other information
                 ----------------------------------------- */

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
        /* -----------------------------------------
           State reference
           ----------------------------------------- */

        stateId: jammuKashmirState._id,

        /* -----------------------------------------
           Basic information
           ----------------------------------------- */

        name: destination.name || "",

        description: destination.description || "",

        location: destination.location || "",

        category: destination.category || "",

        famousFor: destination.famousFor || "",

        /* -----------------------------------------
           Main image
           ----------------------------------------- */

        image: destination.imageSource || "",

        imagePublicId: "",

        /* -----------------------------------------
           Gallery
           ----------------------------------------- */

        galleryImages,

        /* -----------------------------------------
           Destination videos
           ----------------------------------------- */

        shortVideos: destinationVideos,

        /* -----------------------------------------
           Things to do
           ----------------------------------------- */

        thingsToDo,

        /* -----------------------------------------
           Nearby places
           ----------------------------------------- */

        nearbyPlaces,

        /* -----------------------------------------
           Travel information
           ----------------------------------------- */

        bestTime: destination.bestTime || "",

        travelTips: destination.travelTips || "",

        /* -----------------------------------------
           Rating
           ----------------------------------------- */

        rating: typeof destination.rating === "number" ? destination.rating : 0,

        /* -----------------------------------------
           Wishlist
           ----------------------------------------- */

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

    console.log("Jammu and Kashmir seed completed successfully");

    console.log("========================================");

    console.log(`Total destinations inserted: ${finalDestinations.length}`);

    console.log("Images stored as external URLs");

    console.log("Videos stored as external URLs");

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

    console.error("Jammu and Kashmir seed failed");

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

      console.error(`Path: ${error.path}`);

      console.error(`Value: ${error.value}`);

      console.error(`Kind: ${error.kind}`);
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

seedJammuKashmir();
