import express from "express";

// Controllers
import * as dashboardController from "#controllers/dashboardController.js";

// Middlewares
import { protect } from "#middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", dashboardController.getDashboardSummary);

export default router;
