import mongoose from "mongoose";

// Constants
import {
  ApplianceTypes,
  JobStatus,
  PriorityLevels,
  PaymentMethods,
} from "#constants/generalConstants.js";

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
    diagnosticFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    lineItems: [
      {
        id: String,
        description: String,
        qty: { type: Number, default: 1, min: 0 },
        rate: { type: Number, default: 0, min: 0 },
        note: String,
      },
    ],
    partsUsed: [
      {
        name: String,
        quantity: { type: Number, default: 1, min: 0 },
        price: { type: Number, default: 0, min: 0 },
        warranty: { type: String, default: "" },
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethods),
      default: PaymentMethods.CASH,
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
    internalNotes: {
      type: String,
      trim: true,
      default: "",
    },
    priority: {
      type: String,
      enum: Object.values(PriorityLevels),
      default: PriorityLevels.NORMAL,
    },
    location: {
      label: String,
      address: String,
      latitude: Number,
      longitude: Number,
    },
    events: [
      {
        action: {
          type: String,
          enum: [
            "created",
            "status_changed",
            "marked_paid",
            "marked_unpaid",
            "reopened",
            "edited",
          ],
          required: true,
        },
        from: { type: String, default: null },
        to: { type: String, default: null },
        isPaid: { type: Boolean, default: null },
        note: { type: String, default: "" },
        at: { type: Date, default: () => new Date() },
      },
    ],
  },
  { timestamps: true },
);

// Index for date-range queries (calendar view)
jobSchema.index({ userId: 1, serviceDate: 1 });

export default mongoose.model("Job", jobSchema);
