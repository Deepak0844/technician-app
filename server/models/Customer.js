import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    locations: [
      {
        label: {
          type: String,
          trim: true,
          default: "Primary",
        },
        address: {
          type: String,
          trim: true,
          default: "",
        },
        latitude: {
          type: Number,
          default: null,
        },
        longitude: {
          type: Number,
          default: null,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Unique customer per technician (userId + phone)
customerSchema.index({ userId: 1, phone: 1 }, { unique: true });

export default mongoose.model("Customer", customerSchema);
