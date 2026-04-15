// Constants
import { SuccessMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

// Services
import DashboardService from "#services/dashboardService.js";

// Middleware
import asyncHandler from "#middlewares/asyncHandler.js";

/**
 * @desc    Get dashboard summary
 * @route   GET /api/v1/dashboard/summary
 * @access  Private
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await DashboardService.getDashboardSummary(req.user._id);
  return ResponseUtils.success(res, summary, HttpStatus.OK, SuccessMessages.DASHBOARD_LOADED);
});
