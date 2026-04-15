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

  // Server-side past-date guard for new jobs
  const serviceDate = new Date(jobData.serviceDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(serviceDate);
  targetDay.setHours(0, 0, 0, 0);
  if (targetDay < today) {
    throw new AppError(
      ErrorMessages.SERVICE_DATE_IN_PAST,
      HttpStatus.BAD_REQUEST,
    );
  }

  const job = await Job.create({
    userId,
    ...jobData,
    serviceDate,
    nextReminderDate: jobData.nextReminderDate
      ? new Date(jobData.nextReminderDate)
      : null,
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
  if (isPaid !== undefined) query.isPaid = isPaid === "true" || isPaid === true;

  if (startDate || endDate) {
    query.serviceDate = {};
    if (startDate) query.serviceDate.$gte = new Date(startDate);
    if (endDate) query.serviceDate.$lte = new Date(endDate);
  }

  // Keyword search: match against applianceType or issue fields
  if (search && search.trim()) {
    const keywords = search.trim().split(/\s+/).filter(Boolean);
    const regexps = keywords.map((kw) => new RegExp(kw, "i"));

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
      .sort({ serviceDate: -1 })
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
      .sort({ serviceDate: -1 })
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
    priority: original.priority,
    internalNotes: original.internalNotes,
    status: JobStatus.PENDING,
    serviceDate: new Date(),
    nextReminderDate: null,
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

  const updated = await Job.findByIdAndUpdate(
    jobId,
    {
      ...updateData,
      serviceDate: updateData.serviceDate
        ? new Date(updateData.serviceDate)
        : job.serviceDate,
      nextReminderDate: updateData.nextReminderDate
        ? new Date(updateData.nextReminderDate)
        : job.nextReminderDate,
    },
    { new: true, runValidators: true },
  )
    .populate("customerId", "name phone address")
    .lean();

  return updated;
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

const JobService = {
  createJob,
  getJobs,
  getJobsByCustomer,
  getJobById,
  repeatJob,
  updateJob,
  deleteJob,
};

export default JobService;
