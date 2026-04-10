import express from "express";

// Controllers
import * as customerController from "#controllers/customerController.js";

// Middlewares
import { protect } from "#middlewares/authMiddleware.js";
import { validateBody, validateQuery } from "#middlewares/validateMiddleware.js";

// Schemas
import { upsertCustomerSchema, updateCustomerSchema, customerSearchSchema } from "#schemas/validationSchemas.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/search", validateQuery(customerSearchSchema), customerController.searchCustomers);
router.post("/upsert", validateBody(upsertCustomerSchema), customerController.upsertCustomer);
router.get("/:id", customerController.getCustomerById);
router.patch("/:id", validateBody(updateCustomerSchema), customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

export default router;
