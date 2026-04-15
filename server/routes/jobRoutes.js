import express from "express";

// Controllers
import * as jobController from "#controllers/jobController.js";

// Middlewares
import { protect } from "#middlewares/authMiddleware.js";
import {
  validateBody,
  validateQuery,
  validateObjectId,
} from "#middlewares/validateMiddleware.js";

// Schemas
import {
  createJobSchema,
  updateJobSchema,
  jobListQuerySchema,
} from "#schemas/validationSchemas.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", validateBody(createJobSchema), jobController.createJob);
router.get("/", validateQuery(jobListQuerySchema), jobController.getJobs);
router.get(
  "/customer/:customerId",
  validateObjectId("customerId"),
  jobController.getJobsByCustomer,
);
router.post(
  "/repeat/:jobId",
  validateObjectId("jobId"),
  jobController.repeatJob,
);
router.get("/:jobId", validateObjectId("jobId"), jobController.getJobById);
router.put(
  "/:jobId",
  validateObjectId("jobId"),
  validateBody(updateJobSchema),
  jobController.updateJob,
);
router.delete("/:jobId", validateObjectId("jobId"), jobController.deleteJob);

export default router;
