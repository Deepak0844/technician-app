import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import createError from "http-errors";

// Database connection
import connectToDatabase from "#config/db.js";

// Config
import Env from "#config/env.js";

// Constants
import { ErrorMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";
import logger from "#utils/logger.js";

// Routes
import authRoutes from "#routes/authRoutes.js";
import customerRoutes from "#routes/customerRoutes.js";
import jobRoutes from "#routes/jobRoutes.js";
import dashboardRoutes from "#routes/dashboardRoutes.js";

// Create Express app
const app = express();

// Base API URL
const BASE_URL = "/api/v1";

// Connect to MongoDB
if (Env.NODE_ENV !== "test") {
  connectToDatabase();
}

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS
const allowedOrigins = Env.ALLOWED_ORIGINS
  ? Env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "exp://localhost:8081"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Env.NODE_ENV === "production" ? 200 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(cookieParser());

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

// Routes
app.use(`${BASE_URL}/auth`, authRoutes);
app.use(`${BASE_URL}/customers`, customerRoutes);
app.use(`${BASE_URL}/jobs`, jobRoutes);
app.use(`${BASE_URL}/dashboard`, dashboardRoutes);

// Base route — health check
app.get("/", (_req, res) => {
  ResponseUtils.success(res, {
    message: "Technician App API is running",
    version: "1.0.0",
  });
});

app.get(`${BASE_URL}/health`, (_req, res) => {
  res
    .status(HttpStatus.OK)
    .json({ status: "ok", message: "Server is healthy" });
});

// 404 handler
app.use((_req, _res, next) => {
  next(createError(HttpStatus.NOT_FOUND, ErrorMessages.RESOURCE_NOT_FOUND));
});

// Global error handler
app.use((err, req, res, _next) => {
  // MongoDB CastError — invalid ObjectId
  if (err.name === "CastError") {
    return ResponseUtils.error(
      res,
      "Invalid ID format",
      HttpStatus.BAD_REQUEST,
    );
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return ResponseUtils.error(
      res,
      `A record with that ${field} already exists.`,
      HttpStatus.CONFLICT,
    );
  }

  const statusCode =
    err.status || err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || ErrorMessages.SERVER_ERROR;

  logger.error(
    { statusCode, method: req.method, url: req.originalUrl, stack: err.stack },
    message,
  );

  ResponseUtils.error(res, message, statusCode);
});

export default app;
