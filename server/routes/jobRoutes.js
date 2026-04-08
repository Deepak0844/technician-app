import express from "express";

// Controllers
import * as jobController from "#controllers/jobController.js";

// Middlewares
import { protect } from "#middlewares/authMiddleware.js";
import { validateBody, validateQuery } from "#middlewares/validateMiddleware.js";

// Schemas
import { createJobSchema, jobListQuerySchema } from "#schemas/validationSchemas.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", validateBody(createJobSchema), jobController.createJob);
router.get("/", validateQuery(jobListQuerySchema), jobController.getJobs);
router.get("/customer/:customerId", jobController.getJobsByCustomer);
router.post("/repeat/:jobId", jobController.repeatJob);
router.get("/:jobId", jobController.getJobById);
router.put("/:jobId", jobController.updateJob);

export default router;
