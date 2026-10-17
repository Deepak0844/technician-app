import { z } from "zod";

// Constants
import {
  ApplianceLimits,
  ErrorMessages,
  JobStatus,
  PriorityLevels,
  PaymentMethods,
} from "#constants/generalConstants.js";

// Utils
import { getBillToError } from "#utils/invoiceUtils.js";
import {
  normalizeAppliances,
  summarizeAppliances,
} from "#utils/applianceUtils.js";

// Shared max constraints
const MAX_TEXT_LENGTH = 2000;
const MAX_SHORT_TEXT = 255;
const MAX_REFRESH_TOKEN_LENGTH = 256;
const MAX_ITEMS = 50;
const MAX_PAGE_SIZE = 100;

/**
 * Auth: Send OTP
 */
export const sendOtpSchema = z.object({
  // E.164-friendly: optional leading +, 7–15 digits
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(16, "Phone number too long")
    .regex(
      /^\+?\d{7,15}$/,
      "Phone must contain only digits (and optional leading +)",
    ),
});

/**
 * Auth: Verify OTP
 */
export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(16, "Phone number too long")
    .regex(
      /^\+?\d{7,15}$/,
      "Phone must contain only digits (and optional leading +)",
    ),
  otp: z
    .string()
    .min(4, "OTP must be at least 4 characters")
    .max(8, "OTP too long"),
  sessionId: z
    .string()
    .min(1, "Session ID is required")
    .max(128, "Session ID too long"),
  name: z.string().max(MAX_SHORT_TEXT).optional(),
});

/**
 * Auth: Refresh / Logout (refresh token in body)
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required")
    .max(MAX_REFRESH_TOKEN_LENGTH),
});

/**
 * Auth: Logout (body optional — clients may send only an access token)
 */
export const logoutSchema = z
  .object({
    refreshToken: z.string().max(MAX_REFRESH_TOKEN_LENGTH).nullish(),
  })
  .default({});

/**
 * Auth: Update Profile
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(MAX_SHORT_TEXT)
    .optional(),
  companyName: z.string().max(MAX_SHORT_TEXT).optional(),
  phone: z
    .string()
    .min(7)
    .max(16)
    .regex(/^\+?\d{7,15}$/, "Phone must contain only digits")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .max(MAX_SHORT_TEXT)
    .optional()
    .or(z.literal("")),
  address: z.string().max(MAX_TEXT_LENGTH).optional(),
});

/**
 * Customer: Location entry
 */
const locationSchema = z.object({
  label: z.string().trim().max(MAX_SHORT_TEXT).default("Primary"),
  address: z
    .string()
    .trim()
    .min(1, "Location address is required")
    .max(MAX_TEXT_LENGTH),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Job: Line item entry
 */
const lineItemSchema = z.object({
  id: z.string().max(64).optional(),
  description: z.string().max(MAX_TEXT_LENGTH).default(""),
  qty: z.number().min(0).max(99999).default(1),
  rate: z.number().min(0).max(9999999).default(0),
  note: z.string().max(MAX_TEXT_LENGTH).optional().default(""),
});

/**
 * Job: Parts used entry
 */
const partUsedSchema = z.object({
  name: z.string().max(MAX_SHORT_TEXT).optional(),
  quantity: z.number().min(0).max(99999).default(1),
  price: z.number().min(0).max(9999999).default(0),
  warranty: z.string().max(MAX_SHORT_TEXT).optional().default(""),
});

/**
 * Shared job location sub-schema
 */
const jobLocationSchema = z
  .object({
    label: z.string().max(MAX_SHORT_TEXT).optional(),
    address: z.string().max(MAX_TEXT_LENGTH).optional(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
  })
  .optional()
  .nullable();

/**
 * Customer: Upsert
 */
export const upsertCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(MAX_SHORT_TEXT),
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(16)
    .regex(/^\+?\d{7,15}$/, "Phone must contain only digits"),
  email: z
    .string()
    .email("Invalid email address")
    .max(MAX_SHORT_TEXT)
    .optional()
    .or(z.literal("")),
  locations: z
    .array(locationSchema)
    .max(20, "Too many locations")
    .optional()
    .default([]),
});

/**
 * Customer: Update (all fields optional except locations items still validated)
 */
export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(MAX_SHORT_TEXT).optional(),
  phone: z
    .string()
    .min(7)
    .max(16)
    .regex(/^\+?\d{7,15}$/, "Phone must contain only digits")
    .optional(),
  email: z.string().email().max(MAX_SHORT_TEXT).optional().or(z.literal("")),
  locations: z.array(locationSchema).min(1).max(20).optional(),
});

/**
 * Customer: Search Query
 */
export const customerSearchSchema = z.object({
  q: z.string().max(MAX_SHORT_TEXT).optional().default(""),
  page: z.string().optional().default("1"),
  pageSize: z
    .string()
    .optional()
    .default("20")
    .transform((v) =>
      String(Math.max(1, Math.min(Number(v) || 20, MAX_PAGE_SIZE))),
    ),
});

/**
 * Create: apply the Bill To rules to the payload (absent fields take their
 * defaults). Updates are checked in JobService against the merged job, since
 * a partial payload can't be judged on its own.
 */
function requireBillTo(data, ctx) {
  const message = getBillToError({
    showCustomerName: data.invoiceDisplay?.showCustomerName,
    showOrganization: data.invoiceDisplay?.showOrganization,
    organizationName: data.organization?.name,
  });
  if (message) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["invoiceDisplay"],
      message,
    });
  }
}

/**
 * Job: One appliance serviced on the job
 */
const applianceSchema = z.object({
  type: z.string().trim().max(ApplianceLimits.MAX_NAME_LENGTH),
  brand: z.string().trim().max(ApplianceLimits.MAX_NAME_LENGTH).optional(),
});

/**
 * The appliance list a payload asks for: `appliances`, or (older clients) a
 * single `applianceType`. Undefined when the payload says nothing about it.
 */
function requestedAppliances(data) {
  if (data.appliances !== undefined) return data.appliances;
  if (data.applianceType) return [{ type: data.applianceType }];
  return undefined;
}

/**
 * At least one appliance is needed on create; on update only when the
 * payload touches the appliances.
 */
function requireAppliances(data, ctx, { required }) {
  const requested = requestedAppliances(data);
  if (requested === undefined && !required) return;
  if (normalizeAppliances(requested).length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["appliances"],
      message: ErrorMessages.APPLIANCE_REQUIRED,
    });
  }
}

/**
 * Store the cleaned list and keep `applianceType` as its summary.
 */
function applyAppliances(data) {
  const requested = requestedAppliances(data);
  if (requested === undefined) return data;
  const appliances = normalizeAppliances(requested);
  return {
    ...data,
    appliances,
    applianceType: summarizeAppliances(appliances),
  };
}

/**
 * Job: Invoice display options (which Bill To details the invoice shows)
 */
const invoiceDisplaySchema = z.object({
  showCustomerName: z.boolean().optional(),
  showCustomerPhone: z.boolean().optional(),
  showOrganization: z.boolean().optional(),
  showAddress: z.boolean().optional(),
});

/**
 * Job: Organization (company / school / hotel) the invoice can be addressed to
 */
const organizationSchema = z.object({
  name: z.string().trim().max(MAX_SHORT_TEXT).optional().default(""),
});

/**
 * Job: Shared fields (used by create and update)
 */
const jobSharedFields = {
  // Clients that predate multi-appliance support send only `applianceType`.
  applianceType: z
    .string()
    .trim()
    .min(1, "Appliance type is required")
    .max(MAX_SHORT_TEXT)
    .optional(),
  appliances: z
    .array(applianceSchema)
    .max(
      ApplianceLimits.MAX_PER_JOB,
      ErrorMessages.APPLIANCE_LIMIT(ApplianceLimits.MAX_PER_JOB),
    )
    .optional(),
  issue: z
    .string()
    .min(1, "Issue description is required")
    .max(MAX_TEXT_LENGTH),
  serviceDone: z.string().max(MAX_TEXT_LENGTH).optional().default(""),
  amount: z.number().min(0).max(9999999).optional().default(0),
  diagnosticFee: z.number().min(0).max(9999999).optional().default(0),
  lineItems: z
    .array(lineItemSchema)
    .max(MAX_ITEMS, "Too many line items")
    .optional()
    .default([]),
  partsUsed: z
    .array(partUsedSchema)
    .max(MAX_ITEMS, "Too many parts")
    .optional()
    .default([]),
  status: z.nativeEnum(JobStatus).optional().default(JobStatus.PENDING),
  serviceDate: z
    .string()
    .min(1, "Service date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: ErrorMessages.SERVICE_DATE_INVALID,
    }),
  nextReminderDate: z.string().optional().nullable(),
  warranty: z.string().max(MAX_SHORT_TEXT).optional().default(""),
  warrantyStartDate: z.string().optional().nullable(),
  internalNotes: z.string().max(MAX_TEXT_LENGTH).optional().default(""),
  priority: z
    .nativeEnum(PriorityLevels)
    .optional()
    .default(PriorityLevels.NORMAL),
  isPaid: z.boolean().optional().default(false),
  paymentMethod: z
    .nativeEnum(PaymentMethods)
    .optional()
    .default(PaymentMethods.CASH),
  location: jobLocationSchema,
  invoiceDisplay: invoiceDisplaySchema.optional(),
  invoiceAddress: z.string().trim().max(MAX_TEXT_LENGTH).optional(),
  organization: organizationSchema.optional(),
};

/**
 * Job: Create
 */
export const createJobSchema = z
  .object({
    customerId: z.string().min(1, "Customer ID is required").max(64),
    ...jobSharedFields,
  })
  .superRefine(requireBillTo)
  .superRefine((data, ctx) => requireAppliances(data, ctx, { required: true }))
  .transform(applyAppliances);

/**
 * Job: Update (all fields optional, customerId can be changed)
 * Strip .default() from all shared fields so absent fields don't
 * overwrite existing DB values with their defaults (e.g. amount → 0).
 */
export const updateJobSchema = z
  .object({
    customerId: z.string().min(1).max(64).optional(),
    ...Object.fromEntries(
      Object.entries(jobSharedFields).map(([k, v]) => {
        // Unwrap ZodDefault so missing fields are truly undefined, not defaulted
        const unwrapped = v instanceof z.ZodDefault ? v.removeDefault() : v;
        return [k, unwrapped.optional()];
      }),
    ),
  })
  .superRefine((data, ctx) => requireAppliances(data, ctx, { required: false }))
  .transform(applyAppliances);

/**
 * Job: Change only the service date (works on completed + paid jobs too)
 */
export const changeServiceDateSchema = z.object({
  serviceDate: z
    .string()
    .min(1, "Service date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: ErrorMessages.SERVICE_DATE_INVALID,
    }),
});

/**
 * Job: Recent organizations query
 */
export const recentOrganizationsQuerySchema = z.object({
  q: z.string().max(MAX_SHORT_TEXT).optional().default(""),
});

/**
 * Job: Recent appliances query
 */
export const recentAppliancesQuerySchema = z.object({
  q: z.string().max(MAX_SHORT_TEXT).optional().default(""),
});

/**
 * Job: List Query
 */
export const jobListQuerySchema = z.object({
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  search: z.string().max(MAX_SHORT_TEXT).optional().default(""),
  isPaid: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  applianceType: z.string().max(MAX_SHORT_TEXT).optional(),
  page: z.string().optional().default("1"),
  pageSize: z
    .string()
    .optional()
    .default("20")
    .transform((v) =>
      String(Math.max(1, Math.min(Number(v) || 20, MAX_PAGE_SIZE))),
    ),
});
