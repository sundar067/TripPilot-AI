// Import mongoose package
import mongoose from "mongoose";

// Connect MongoDB Database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected ");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
