// Constants
import { SuccessMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

// Services
import JobService from "#services/jobService.js";

// Middleware
import asyncHandler from "#middlewares/asyncHandler.js";

/**
 * @desc    Create a new job
 * @route   POST /api/v1/jobs
 * @access  Private
 */
export const createJob = asyncHandler(async (req, res) => {
  const job = await JobService.createJob(req.user._id, req.body);
  return ResponseUtils.success(
    res,
    job,
    HttpStatus.CREATED,
    SuccessMessages.JOB_CREATED,
  );
});

/**
 * @desc    Get all jobs (with optional filters: customerId, startDate, endDate, status, isPaid, applianceType, search)
 * @route   GET /api/v1/jobs
 * @access  Private
 */
export const getJobs = asyncHandler(async (req, res) => {
  const {
    customerId,
    startDate,
    endDate,
    status,
    search,
    isPaid,
    applianceType,
    page,
    pageSize,
  } = req.query;
  const isPaidBool =
    isPaid === "true" ? true : isPaid === "false" ? false : undefined;

  const result = await JobService.getJobs(req.user._id, {
    customerId,
    startDate,
    endDate,
    status,
    search,
    isPaid: isPaidBool,
    applianceType,
    page,
    pageSize,
  });
  return ResponseUtils.success(
    res,
    result,
    HttpStatus.OK,
    SuccessMessages.JOBS_LOADED,
  );
});

/**
 * @desc    Get the user's recently used organizations (company / school / hotel)
 * @route   GET /api/v1/jobs/organizations/recent
 * @access  Private
 */
export const getRecentOrganizations = asyncHandler(async (req, res) => {
  const result = await JobService.getRecentOrganizations(req.user._id, {
    q: req.query.q,
  });
  return ResponseUtils.success(res, result, HttpStatus.OK);
});

/**
 * @desc    Get the user's recently used appliance names
 * @route   GET /api/v1/jobs/appliances/recent
 * @access  Private
 */
export const getRecentAppliances = asyncHandler(async (req, res) => {
  const result = await JobService.getRecentAppliances(req.user._id, {
    q: req.query.q,
  });
  return ResponseUtils.success(res, result, HttpStatus.OK);
});

/**
 * @desc    Get all jobs for a specific customer
 * @route   GET /api/v1/jobs/customer/:customerId
 * @access  Private
 */
export const getJobsByCustomer = asyncHandler(async (req, res) => {
  const { page, pageSize } = req.query;
  const result = await JobService.getJobsByCustomer(
    req.user._id,
    req.params.customerId,
    { page, pageSize },
  );
  return ResponseUtils.success(
    res,
    result,
    HttpStatus.OK,
    SuccessMessages.JOBS_LOADED,
  );
});

/**
 * @desc    Repeat an existing job
 * @route   POST /api/v1/jobs/repeat/:jobId
 * @access  Private
 */
export const repeatJob = asyncHandler(async (req, res) => {
  const job = await JobService.repeatJob(req.user._id, req.params.jobId);
  return ResponseUtils.success(
    res,
    job,
    HttpStatus.CREATED,
    SuccessMessages.JOB_REPEATED,
  );
});

/**
 * @desc    Get a specific job by ID
 * @route   GET /api/v1/jobs/:jobId
 * @access  Private
 */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await JobService.getJobById(req.user._id, req.params.jobId);
  return ResponseUtils.success(
    res,
    job,
    HttpStatus.OK,
    SuccessMessages.JOB_LOADED,
  );
});

/**
 * @desc    Update an existing job
 * @route   PUT /api/v1/jobs/:jobId
 * @access  Private
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await JobService.updateJob(
    req.user._id,
    req.params.jobId,
    req.body,
  );
  return ResponseUtils.success(
    res,
    job,
    HttpStatus.OK,
    SuccessMessages.JOB_UPDATED,
  );
});

/**
 * @desc    Delete a job permanently
 * @route   DELETE /api/v1/jobs/:jobId
 * @access  Private
 */
export const deleteJob = asyncHandler(async (req, res) => {
  await JobService.deleteJob(req.user._id, req.params.jobId);
  return ResponseUtils.success(
    res,
    null,
    HttpStatus.OK,
    SuccessMessages.JOB_DELETED,
  );
});

/**
 * @desc    Reopen a completed & paid job — resets to in_progress + unpaid
 * @route   POST /api/v1/jobs/:jobId/reopen
 * @access  Private
 */
export const reopenJob = asyncHandler(async (req, res) => {
  const job = await JobService.reopenJob(req.user._id, req.params.jobId);
  return ResponseUtils.success(
    res,
    job,
    HttpStatus.OK,
    SuccessMessages.JOB_REOPENED,
  );
});
