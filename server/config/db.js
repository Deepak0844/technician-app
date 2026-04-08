import mongoose from "mongoose";

// Config
import Env from "#config/env.js";

async function connectToDatabase() {
  try {
    const conn = await mongoose.connect(Env.MONGODB_URI, {
      dbName: "technician-app",
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host} → DB: ${conn.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

export default connectToDatabase;
