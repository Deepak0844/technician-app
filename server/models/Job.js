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
    warrantyStartDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
      index: true,
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
    // Which Bill To details the invoice shows. Display-only: hiding a value
    // here never changes the underlying customer / job data.
    invoiceDisplay: {
      showCustomerName: { type: Boolean, default: true },
      showCustomerPhone: { type: Boolean, default: true },
      showOrganization: { type: Boolean, default: false },
      showAddress: { type: Boolean, default: true },
    },
    // Optional address printed on the invoice instead of the service location.
    invoiceAddress: {
      type: String,
      trim: true,
      default: "",
    },
    // Optional company / school / hotel the invoice can be addressed to.
    organization: {
      name: { type: String, trim: true, default: "" },
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
// Index for status-based filtering (dashboard, list)
jobSchema.index({ userId: 1, status: 1 });
// Index for payment status queries
jobSchema.index({ userId: 1, isPaid: 1 });
// Recent organizations lookup
jobSchema.index({ userId: 1, "organization.name": 1 });
// Text index for full-text search scoped to a user
jobSchema.index(
  { userId: 1, applianceType: "text", issue: "text", serviceDone: "text" },
  { name: "job_text_search" },
);

export default mongoose.model("Job", jobSchema);
