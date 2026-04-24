import mongoose from "mongoose";

// Constants
import { DefaultPagination, JobStatus } from "#constants/generalConstants.js";

// Models
import Job from "#models/Job.js";

// Helper: MongoDB expression to sum amount + diagnosticFee + all partsUsed costs
const jobTotalExpr = {
  $add: [
    "$amount",
    "$diagnosticFee",
    {
      $reduce: {
        input: { $ifNull: ["$partsUsed", []] },
        initialValue: 0,
        in: {
          $add: ["$$value", { $multiply: ["$$this.price", "$$this.quantity"] }],
        },
      },
    },
  ],
};

/**
 * Aggregate dashboard summary for a technician
 */
async function getDashboardSummary(userId) {
  const now = new Date();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Today boundaries
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // This week boundaries (Monday to Sunday)
  const weekStart = new Date(todayStart);
  weekStart.setDate(
    weekStart.getDate() -
      weekStart.getDay() +
      (weekStart.getDay() === 0 ? -6 : 1),
  );
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // This month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Previous month boundaries
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayJobs,
    weeklyStats,
    monthlyStats,
    prevMonthlyStatsActive,
    pendingCount,
    totalJobs,
    recentJobs,
    outstandingStats,
    allCompleted,
    allEarningsStats,
  ] = await Promise.all([
    // Today's jobs
    Job.countDocuments({
      userId: userObjectId,
      serviceDate: { $gte: todayStart, $lt: todayEnd },
    }),

    // Weekly jobs + Total Potential earnings (Amount + Diagnostic)
    // Uses completedAt (falls back to updatedAt for legacy jobs without it)
    Job.aggregate([
      {
        $match: {
          userId: userObjectId,
          $or: [
            { completedAt: { $gte: weekStart, $lt: weekEnd } },
            { completedAt: null, updatedAt: { $gte: weekStart, $lt: weekEnd } },
          ],
          status: JobStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          earnings: { $sum: jobTotalExpr },
        },
      },
    ]),

    // Monthly Paid vs Unpaid earnings
    // Uses completedAt (falls back to updatedAt for legacy jobs without it)
    Job.aggregate([
      {
        $match: {
          userId: userObjectId,
          $or: [
            { completedAt: { $gte: monthStart, $lt: monthEnd } },
            {
              completedAt: null,
              updatedAt: { $gte: monthStart, $lt: monthEnd },
            },
          ],
          status: JobStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalEarnings: { $sum: jobTotalExpr },
          paidEarnings: {
            $sum: {
              $cond: [{ $eq: ["$isPaid", true] }, jobTotalExpr, 0],
            },
          },
          pendingEarnings: {
            $sum: {
              $cond: [{ $eq: ["$isPaid", false] }, jobTotalExpr, 0],
            },
          },
        },
      },
    ]),

    // Previous Monthly earnings (for growth calculation)
    // Uses completedAt (falls back to updatedAt for legacy jobs without it)
    Job.aggregate([
      {
        $match: {
          userId: userObjectId,
          $or: [
            { completedAt: { $gte: prevMonthStart, $lt: prevMonthEnd } },
            {
              completedAt: null,
              updatedAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
            },
          ],
          status: JobStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          earnings: { $sum: jobTotalExpr },
        },
      },
    ]),

    // Pending jobs (Not started)
    Job.countDocuments({ userId: userObjectId, status: JobStatus.PENDING }),

    // Total jobs all-time
    Job.countDocuments({ userId: userObjectId }),

    // Recent jobs — exclude internalNotes from the summary view
    Job.find({ userId: userObjectId })
      .sort({ serviceDate: -1 })
      .limit(DefaultPagination.RECENT_JOBS_LIMIT)
      .select("-internalNotes")
      .populate("customerId", "name phone")
      .lean(),

    // Outstanding payments total (completed but not paid) - All-time
    Job.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: JobStatus.COMPLETED,
          isPaid: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: jobTotalExpr },
        },
      },
    ]),

    // All-time completed job count
    Job.countDocuments({ userId: userObjectId, status: JobStatus.COMPLETED }),

    // All-time paid earnings
    Job.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: JobStatus.COMPLETED,
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          earnings: { $sum: jobTotalExpr },
        },
      },
    ]),
  ]);

  const totalAllTime = totalJobs || 0;

  const totalPaidEarningsAllTime = allEarningsStats[0]?.earnings ?? 0;
  const efficiency =
    totalAllTime > 0 ? Math.round((allCompleted / totalAllTime) * 100) : 0;

  const currentMonthlyPaid = monthlyStats[0]?.paidEarnings ?? 0;
  const currentMonthlyPending = monthlyStats[0]?.pendingEarnings ?? 0;
  const prevMonthlyEarnings = prevMonthlyStatsActive[0]?.earnings ?? 0;

  // Calculate earnings change percentage vs previous month.
  // Returns null when there is no previous-month baseline (can't compute a meaningful %).
  const currentMonthlyTotal = monthlyStats[0]?.totalEarnings ?? 0;
  let earningsChange = null;
  if (prevMonthlyEarnings > 0) {
    earningsChange = Math.round(
      ((currentMonthlyTotal - prevMonthlyEarnings) / prevMonthlyEarnings) * 100,
    );
  }

  return {
    todayJobs,
    weeklyJobs: weeklyStats[0]?.count ?? 0,
    weeklyEarnings: weeklyStats[0]?.earnings ?? 0,
    monthlyJobs: monthlyStats[0]?.count ?? 0,
    monthlyPaidEarnings: currentMonthlyPaid,
    monthlyPendingEarnings: currentMonthlyPending,
    totalEarnings: totalPaidEarningsAllTime,
    earningsChange,
    pendingJobs: pendingCount,
    totalJobs: totalAllTime,
    efficiency,
    outstandingPayments: outstandingStats[0]?.total ?? 0,
    recentJobs,
  };
}

const DashboardService = {
  getDashboardSummary,
};

export default DashboardService;
