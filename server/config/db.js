import mongoose from "mongoose";

// Config
import Env from "#config/env.js";

async function connectToDatabase() {
  try {
    const conn = await mongoose.connect(Env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

export default connectToDatabase;
