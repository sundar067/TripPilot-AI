import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";

dotenv.config();

const finalVideoFix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const destinations = await Destination.find({
      videoUrl: {
        $exists: true,
        $ne: null,
      },
    });

    console.log(`${destinations.length} destinations found`);

    for (const destination of destinations) {
      destination.shortVideos = [destination.videoUrl];

      await destination.save();

      console.log(`${destination.name} fixed`);
    }

    console.log("Final video migration completed");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

finalVideoFix();
