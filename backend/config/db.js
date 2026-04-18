// import dependencies
import mongoose from "mongoose";

//create async DB connection function
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error while connecting to MongoDB");
    process.exit(1);
  }
};