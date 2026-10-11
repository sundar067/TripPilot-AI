import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";

dotenv.config();

const migrateVideos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const destinations = await Destination.find({
      videoUrl: { $exists: true },
    });

    console.log(`${destinations.length} destinations found`);

    for (const destination of destinations) {
      destination.shortVideos = [destination.videoUrl];

      destination.videoUrl = undefined;

      await destination.save();
    }

    console.log("Migration completed");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

migrateVideos();
