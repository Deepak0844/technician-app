// Models
import Job from "#models/Job.js";
import Customer from "#models/Customer.js";

// Constants
import { ErrorMessages, DefaultPagination } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import { AppError } from "#utils/errorUtils.js";

/**
 * Create a new job
 */
async function createJob(userId, jobData) {
  // Verify customer belongs to this user
  if (!jobData.customerId) throw new AppError(ErrorMessages.BAD_REQUEST, HttpStatus.BAD_REQUEST);
  
  const customer = await Customer.findOne({ _id: jobData.customerId, userId });
  if (!customer) throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);

  const job = await Job.create({
    userId,
    ...jobData,
    serviceDate: new Date(jobData.serviceDate),
    nextReminderDate: jobData.nextReminderDate ? new Date(jobData.nextReminderDate) : null,
  });

  return await Job.findById(job._id).populate("customerId", "name phone address").lean();
}

/**
 * Get paginated jobs for a user, with optional filters
 */
async function getJobs(userId, { customerId, startDate, endDate, status, page = 1, pageSize = DefaultPagination.PAGE_SIZE } = {}) {
  const skip = (Number(page) - 1) * Number(pageSize);
  const query = { userId };

  if (customerId) query.customerId = customerId;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.serviceDate = {};
    if (startDate) query.serviceDate.$gte = new Date(startDate);
    if (endDate) query.serviceDate.$lte = new Date(endDate);
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
 * Get all jobs for a specific customer (belonging to user)
 */
async function getJobsByCustomer(userId, customerId) {
  // Verify customer belongs to user
  const customer = await Customer.findOne({ _id: customerId, userId });
  if (!customer) throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);

  return Job.find({ userId, customerId }).sort({ serviceDate: -1 }).populate("customerId", "name phone address").lean();
}

/**
 * Repeat an existing job (clone with today's date and pending status)
 */
async function repeatJob(userId, jobId) {
  const original = await Job.findOne({ _id: jobId, userId });
  if (!original) throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);

  const repeated = await Job.create({
    userId: original.userId,
    customerId: original.customerId,
    applianceType: original.applianceType,
    issue: original.issue,
    serviceDone: "",
    amount: original.amount,
    status: "pending",
    serviceDate: new Date(),
    nextReminderDate: null,
  });

  return await Job.findById(repeated._id).populate("customerId", "name phone address").lean();
}

/**
 * Update an existing job
 */
async function updateJob(userId, jobId, updateData) {
  const job = await Job.findOne({ _id: jobId, userId });
  if (!job) throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);

  // If customer is being updated, verify it belongs to user
  if (updateData.customerId && updateData.customerId !== job.customerId.toString()) {
    const customer = await Customer.findOne({ _id: updateData.customerId, userId });
    if (!customer) throw new AppError(ErrorMessages.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  const updated = await Job.findByIdAndUpdate(
    jobId,
    { 
      ...updateData,
      serviceDate: updateData.serviceDate ? new Date(updateData.serviceDate) : job.serviceDate,
      nextReminderDate: updateData.nextReminderDate ? new Date(updateData.nextReminderDate) : job.nextReminderDate
    },
    { new: true, runValidators: true }
  ).populate("customerId", "name phone address").lean();

  return updated;
}

async function getJobById(userId, jobId) {
  const job = await Job.findOne({ _id: jobId, userId }).populate("customerId", "name phone address").lean();
  if (!job) throw new AppError(ErrorMessages.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);
  return job;
}

const JobService = {
  createJob,
  getJobs,
  getJobsByCustomer,
  getJobById,
  repeatJob,
  updateJob,
};

export default JobService;
