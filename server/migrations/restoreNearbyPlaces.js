import mongoose from "mongoose";
import dotenv from "dotenv";

import goaDestinations from "../data/states/goa/destinations.js";

dotenv.config();

const restoreNearbyPlaces = async () => {
  try {
    // MongoDB connect
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // Destination collection
    const destinationCollection =
      mongoose.connection.collection("destinations");

    // Loop through Goa destination data

    for (const destination of goaDestinations) {
      if (destination.nearbyPlaces) {
        const result = await destinationCollection.updateOne(
          {
            name: destination.name,
          },
          {
            $set: {
              nearbyPlaces: destination.nearbyPlaces,
            },
          },
        );

        console.log(`${destination.name} updated`, result.modifiedCount);
      }
    }

    console.log("Nearby Places restored successfully");

    process.exit(0);
  } catch (error) {
    console.log("Migration Error:", error);

    process.exit(1);
  }
};

restoreNearbyPlaces();
