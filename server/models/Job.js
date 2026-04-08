import mongoose from "mongoose";

// Constants
import { ApplianceTypes, JobStatus } from "#constants/generalConstants.js";

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
      index: true,
    },
    applianceType: {
      type: String,
      enum: Object.values(ApplianceTypes),
      required: [true, "Appliance type is required"],
    },
    issue: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
    },
    serviceDone: {
      type: String,
      trim: true,
      default: "",
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
    },
    serviceDate: {
      type: Date,
      required: [true, "Service date is required"],
    },
    nextReminderDate: {
      type: Date,
      default: null,
    },
    invoiceUrl: {
      type: String,
      default: "",
    },
    warranty: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for date-range queries (calendar view)
jobSchema.index({ userId: 1, serviceDate: 1 });

export default mongoose.model("Job", jobSchema);
