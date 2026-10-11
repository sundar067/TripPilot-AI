import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const cleanupDestination = async () => {
  try {
    // MongoDB connect
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // Direct collection access
    const destinationCollection =
      mongoose.connection.collection("destinations");

    // Remove unwanted fields
    const result = await destinationCollection.updateMany(
      {},
      {
        $unset: {
          videoUrl: "",
          nearbyPlaces: "",
        },
      },
    );

    console.log(`${result.modifiedCount} destinations cleaned`);

    console.log("videoUrl and nearbyPlaces removed successfully");

    process.exit(0);
  } catch (error) {
    console.log("Migration Error:", error);

    process.exit(1);
  }
};

cleanupDestination();
