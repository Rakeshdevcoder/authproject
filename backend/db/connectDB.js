import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB COnnected ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log("Error connection to MongoDB ", error.message);
    process.exit(1);
  }
};
