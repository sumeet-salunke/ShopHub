// import dependencies
import mongoose from "mongoose";

//create async DB connection function
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    process.exit(1);
  }
};