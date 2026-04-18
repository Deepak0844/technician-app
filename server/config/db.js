import mongoose from "mongoose";

// Config
import Env from "#config/env.js";

// Utils
import logger from "#utils/logger.js";

async function connectToDatabase() {
  try {
    const conn = await mongoose.connect(Env.MONGODB_URI, {
      dbName: "technician-app",
    });
    logger.info(
      { host: conn.connection.host, db: conn.connection.name },
      "✅ MongoDB connected",
    );
  } catch (err) {
    logger.error({ err: err.message }, "❌ MongoDB connection error");
    process.exit(1);
  }
}

export default connectToDatabase;
