import { ErrorMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";
import { AppError } from "#utils/errorUtils.js";

// A device clock can run slightly ahead of the server's, so a service date a
// few minutes "in the future" is still treated as now.
const FUTURE_TOLERANCE_MS = 15 * 60 * 1000;
// Auto-filled warranty starts are matched to the job dates they came from.
const SAME_INSTANT_MS = 1000;
// A job created this long after its service date is noted as back-dated.
const BACKDATED_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * A completed job can't have a service date in the future.
 * @param {Date} serviceDate
 */
export function assertCompletableDate(serviceDate) {
  if (serviceDate.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
    throw new AppError(
      ErrorMessages.COMPLETED_JOB_FUTURE_DATE,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Completed date for a job saved as completed together with its service date:
 * the service date, but never later than now (back-dated jobs keep their
 * past date).
 * @param {Date} serviceDate
 * @returns {Date}
 */
export function completedAtFromServiceDate(serviceDate) {
  const now = new Date();
  return serviceDate.getTime() < now.getTime() ? serviceDate : now;
}

/**
 * True when two dates fall in the same minute. The add/edit form always sends
 * seconds as zero, so a date that was not edited can differ from the stored
 * one by its seconds; that is not a change.
 */
export function isSameMinute(a, b) {
  return Math.floor(a.getTime() / 60000) === Math.floor(b.getTime() / 60000);
}

/** True when the service date is well before now (a back-dated entry). */
export function isBackdated(serviceDate) {
  return Date.now() - serviceDate.getTime() > BACKDATED_AFTER_MS;
}

/** "2026-09-12" */
export function formatDay(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * When a completed job's completed date moves, a stored warranty start that
 * was only the auto-filled default (it equals the job's old completed date,
 * service date or last-update date) moves with it. A date the technician
 * picked is left alone.
 *
 * @param {{ warrantyStartDate?: Date, completedAt?: Date, serviceDate?: Date,
 *           updatedAt?: Date }} job  the job before the change
 * @param {Date} newCompletedAt
 * @returns {Date | undefined} the new warranty start, or undefined for no change
 */
export function movedWarrantyStart(job, newCompletedAt) {
  if (!job.warrantyStartDate) return undefined;
  const stored = new Date(job.warrantyStartDate).getTime();
  const wasAutoFilled = [job.completedAt, job.serviceDate, job.updatedAt].some(
    (d) => d && Math.abs(new Date(d).getTime() - stored) <= SAME_INSTANT_MS,
  );
  return wasAutoFilled ? newCompletedAt : undefined;
}
