import { z } from "zod";

/**
 * Auth: Send OTP
 */
export const sendOtpSchema = z.object({
  phone: z.string().min(7, "Valid phone number is required"),
});

/**
 * Auth: Verify OTP
 */
export const verifyOtpSchema = z.object({
  phone: z.string().min(7, "Valid phone number is required"),
  otp: z.string().min(4, "OTP must be at least 4 characters"),
  sessionId: z.string().min(1, "Session ID is required"),
  name: z.string().optional(),
});

/**
 * Customer: Location entry
 */
const locationSchema = z.object({
  label: z.string().trim().default("Primary"),
  address: z.string().trim().min(1, "Location address is required"),
  latitude: z.number().nullable().optional().default(null),
  longitude: z.number().nullable().optional().default(null),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Customer: Upsert
 */
export const upsertCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  locations: z.array(locationSchema).min(1, "At least one location is required"),
});

/**
 * Customer: Update (all fields optional except locations items still validated)
 */
export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(7).optional(),
  email: z.string().email().optional().or(z.literal("")),
  locations: z.array(locationSchema).min(1).optional(),
});

/**
 * Customer: Search Query
 */
export const customerSearchSchema = z.object({
  q: z.string().optional().default(""),
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
});

/**
 * Job: Create
 */
export const createJobSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  applianceType: z.string().min(1, "Appliance type is required"),
  issue: z.string().min(1, "Issue description is required"),
  serviceDone: z.string().optional().default(""),
  amount: z.number().min(0, "Amount must be a positive number"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional().default("pending"),
  serviceDate: z.string().min(1, "Service date is required"),
  nextReminderDate: z.string().optional().nullable(),
  warranty: z.string().optional().default(""),
  location: z.object({
    label: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  }).optional().nullable(),
});

/**
 * Job: List Query
 */
export const jobListQuerySchema = z.object({
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
});
