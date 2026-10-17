import mongoose from "mongoose";

// Models
import Job from "#models/Job.js";
import Customer from "#models/Customer.js";

// Constants
import {
  ErrorMessages,
  DefaultPagination,
  JobStatus,
} from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import { AppError } from "#utils/errorUtils.js";
import { getBillToError } from "#utils/invoiceUtils.js";

/**
 * Create a new job
 */
async function createJob(userId, jobData) {
  // Verify customer belongs to this user
  if (!jobData.customerId)
    throw new AppError(ErrorMessages.BAD_REQUEST, HttpStatus.BAD_REQUEST);

  const customer = await Customer.findOne({ _id: jobData.customerId, userId });
  if (!customer)
    throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);

  const serviceDate = new Date(jobData.serviceDate);

  const job = await Job.create({
    userId,
    ...jobData,
    serviceDate,
    nextReminderDate: jobData.nextReminderDate
      ? new Date(jobData.nextReminderDate)
      : null,
    events: [
      {
        action: "created",
        to: jobData.status || JobStatus.PENDING,
        isPaid: jobData.isPaid || false,
        note: "Job created.",
        at: new Date(),
      },
    ],
  });

  return await Job.findById(job._id)
    .populate("customerId", "name phone address")
    .lean();
}

/**
 * Get paginated jobs for a user, with optional filters
 */
async function getJobs(
  userId,
  {
    customerId,
    startDate,
    endDate,
    status,
    isPaid,
    applianceType,
    search = "",
    page = 1,
    pageSize = DefaultPagination.PAGE_SIZE,
  } = {},
) {
  const skip = (Number(page) - 1) * Number(pageSize);
  const query = { userId };

  if (customerId) query.customerId = customerId;
  if (status) query.status = status;
  if (applianceType) query.applianceType = applianceType;
  if (isPaid !== undefined) query.isPaid = isPaid;

  if (startDate || endDate) {
    query.serviceDate = {};
    if (startDate) query.serviceDate.$gte = new Date(startDate);
    if (endDate) query.serviceDate.$lte = new Date(endDate);
  }

  // Keyword search: match against applianceType or issue fields
  if (search && search.trim()) {
    const MAX_KEYWORDS = 10;
    const MAX_KEYWORD_LENGTH = 50;
    const keywords = search
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, MAX_KEYWORDS)
      .map((kw) => kw.slice(0, MAX_KEYWORD_LENGTH));

    // Escape regex special characters to prevent SyntaxError and ReDoS
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regexps = keywords.map((kw) => new RegExp(escapeRegex(kw), "i"));

    query.$and = regexps.map((regex) => ({
      $or: [
        { applianceType: { $regex: regex } },
        { issue: { $regex: regex } },
        { serviceDone: { $regex: regex } },
        { warranty: { $regex: regex } },
      ],
    }));
  }

  const [data, total] = await Promise.all([
    Job.find(query)
      .populate("customerId", "name phone address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean(),
    Job.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      hasNext: skip + data.length < total,
    },
  };
}

/**
 * Get paginated jobs for a specific customer (belonging to user)
 */
async function getJobsByCustomer(
  userId,
  customerId,
  { page = 1, pageSize = DefaultPagination.PAGE_SIZE } = {},
) {
  // Verify customer belongs to user
  const customer = await Customer.findOne({ _id: customerId, userId });
  if (!customer)
    throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);

  const skip = (Number(page) - 1) * Number(pageSize);
  const [data, total] = await Promise.all([
    Job.find({ userId, customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .populate("customerId", "name phone address")
      .lean(),
    Job.countDocuments({ userId, customerId }),
  ]);

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      hasNext: skip + data.length < total,
    },
  };
}

/**
 * Repeat an existing job (clone with today's date and pending status)
 */
async function repeatJob(userId, jobId) {
  const original = await Job.findOne({ _id: jobId, userId });
  if (!original)
    throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);

  const repeated = await Job.create({
    userId: original.userId,
    customerId: original.customerId,
    applianceType: original.applianceType,
    issue: original.issue,
    serviceDone: "",
    diagnosticFee: original.diagnosticFee,
    amount: original.amount,
    lineItems: original.lineItems,
    partsUsed: original.partsUsed,
    warranty: original.warranty,
    location: original.location,
    invoiceDisplay: original.invoiceDisplay,
    invoiceAddress: original.invoiceAddress,
    organization: original.organization,
    priority: original.priority,
    internalNotes: original.internalNotes,
    status: JobStatus.PENDING,
    serviceDate: new Date(),
    nextReminderDate: null,
    events: [
      {
        action: "created",
        to: JobStatus.PENDING,
        isPaid: false,
        note: `Job repeated from #${original._id.toString().slice(-6).toUpperCase()}.`,
        at: new Date(),
      },
    ],
  });

  return await Job.findById(repeated._id)
    .populate("customerId", "name phone address")
    .lean();
}

/**
 * Update an existing job
 */
async function updateJob(userId, jobId, updateData) {
  const job = await Job.findOne({ _id: jobId, userId });
  if (!job)
    throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);

  // If customer is being updated, verify it belongs to user
  if (
    updateData.customerId &&
    updateData.customerId !== job.customerId.toString()
  ) {
    const customer = await Customer.findOne({
      _id: updateData.customerId,
      userId,
    });
    if (!customer)
      throw new AppError(
        ErrorMessages.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
  }

  // Business rule: a paid job must be completed
  if (updateData.isPaid === true) {
    updateData.status = JobStatus.COMPLETED;
  }

  // Business rule: a cancelled job can only be reactivated to pending
  if (
    job.status === JobStatus.CANCELLED &&
    updateData.status &&
    updateData.status !== JobStatus.PENDING &&
    updateData.status !== JobStatus.CANCELLED
  ) {
    throw new AppError(
      ErrorMessages.CANCELLED_JOB_TRANSITION,
      HttpStatus.BAD_REQUEST,
    );
  }

  // Business rule: if status is being moved away from completed on a paid job, reset isPaid
  if (
    job.isPaid &&
    updateData.status &&
    updateData.status !== JobStatus.COMPLETED &&
    updateData.isPaid !== true
  ) {
    updateData.isPaid = false;
  }

  // Build audit events for this update
  const newEvents = [];
  if (updateData.status && updateData.status !== job.status) {
    newEvents.push({
      action: "status_changed",
      from: job.status,
      to: updateData.status,
      isPaid: updateData.isPaid !== undefined ? updateData.isPaid : job.isPaid,
      note: `Status changed from ${job.status} to ${updateData.status}.`,
      at: new Date(),
    });
  }
  if (updateData.isPaid === true && !job.isPaid) {
    newEvents.push({
      action: "marked_paid",
      from: null,
      to: null,
      isPaid: true,
      note: `Marked as paid via ${updateData.paymentMethod || job.paymentMethod}.`,
      at: new Date(),
    });
  }
  if (updateData.isPaid === false && job.isPaid) {
    newEvents.push({
      action: "marked_unpaid",
      from: null,
      to: null,
      isPaid: false,
      note: "Payment reset to unpaid.",
      at: new Date(),
    });
  }

  // Record the exact timestamp when a job transitions to COMPLETED so the
  // dashboard can group earnings by actual completion date (not updatedAt).
  const completingNow =
    updateData.status === JobStatus.COMPLETED &&
    job.status !== JobStatus.COMPLETED;
  if (completingNow && !updateData.completedAt) {
    updateData.completedAt = new Date();
  }

  const { invoiceDisplay, organization, ...rest } = updateData;

  // Bill To rules apply to the final settings (request merged onto the saved
  // job), so a partial update is judged fairly. Skipped when the request
  // doesn't touch them, so unrelated edits never trip over old data.
  if (invoiceDisplay || organization) {
    const billToError = getBillToError({
      showCustomerName:
        invoiceDisplay?.showCustomerName ??
        job.invoiceDisplay?.showCustomerName,
      showOrganization:
        invoiceDisplay?.showOrganization ??
        job.invoiceDisplay?.showOrganization,
      organizationName: organization?.name ?? job.organization?.name,
    });
    if (billToError)
      throw new AppError(billToError, HttpStatus.BAD_REQUEST);
  }

  // Flatten nested option objects to dotted paths so a partial update
  // doesn't wipe sibling keys.
  const nestedSet = {};
  for (const [key, value] of Object.entries(invoiceDisplay || {})) {
    nestedSet[`invoiceDisplay.${key}`] = value;
  }
  for (const [key, value] of Object.entries(organization || {})) {
    nestedSet[`organization.${key}`] = value;
  }

  const updated = await Job.findByIdAndUpdate(
    jobId,
    {
      $set: {
        ...rest,
        ...nestedSet,
        serviceDate: updateData.serviceDate
          ? new Date(updateData.serviceDate)
          : job.serviceDate,
        nextReminderDate: updateData.nextReminderDate
          ? new Date(updateData.nextReminderDate)
          : job.nextReminderDate,
      },
      ...(newEvents.length > 0
        ? { $push: { events: { $each: newEvents } } }
        : {}),
    },
    { new: true, runValidators: true },
  )
    .populate("customerId", "name phone address")
    .lean();

  return updated;
}

/**
 * Get the user's most recently used organizations (distinct by name)
 */
async function getRecentOrganizations(userId, { q = "", limit = 10 } = {}) {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    "organization.name": { $nin: [null, ""] },
  };
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    match["organization.name"] = { $regex: `^${escaped}`, $options: "i" };
  }
  const rows = await Job.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $toLower: "$organization.name" },
        name: { $first: "$organization.name" },
        lastUsed: { $first: "$createdAt" },
      },
    },
    { $sort: { lastUsed: -1 } },
    { $limit: limit },
    { $project: { _id: 0, name: 1 } },
  ]);
  return rows;
}

async function getJobById(userId, jobId) {
  const job = await Job.findOne({ _id: jobId, userId })
    .populate("customerId", "name phone address")
    .lean();
  if (!job)
    throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);
  return job;
}

/**
 * Permanently delete a job
 */
async function deleteJob(userId, jobId) {
  const job = await Job.findOne({ _id: jobId, userId });
  if (!job)
    throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);
  await job.deleteOne();
}

/**
 * Reopen a completed & paid job — resets status to in_progress and isPaid to false
 */
async function reopenJob(userId, jobId) {
  const job = await Job.findOne({ _id: jobId, userId });
  if (!job)
    throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);

  if (job.status !== JobStatus.COMPLETED || !job.isPaid) {
    throw new AppError(
      ErrorMessages.JOB_REOPEN_FORBIDDEN,
      HttpStatus.BAD_REQUEST,
    );
  }

  const updated = await Job.findByIdAndUpdate(
    jobId,
    {
      $set: { status: JobStatus.IN_PROGRESS, isPaid: false },
      $push: {
        events: {
          action: "reopened",
          from: JobStatus.COMPLETED,
          to: JobStatus.IN_PROGRESS,
          isPaid: false,
          note: "Job reopened. Payment reset to unpaid.",
          at: new Date(),
        },
      },
    },
    { new: true, runValidators: true },
  )
    .populate("customerId", "name phone address")
    .lean();

  return updated;
}

const JobService = {
  createJob,
  getJobs,
  getJobsByCustomer,
  getRecentOrganizations,
  getJobById,
  repeatJob,
  updateJob,
  deleteJob,
  reopenJob,
};

export default JobService;
