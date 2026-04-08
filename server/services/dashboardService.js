import mongoose from "mongoose";

// Models
import Job from "#models/Job.js";

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
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // This month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Previous month boundaries
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayJobs, weeklyStats, monthlyStats, prevMonthlyStats, pendingCount, totalJobs, recentJobs] = await Promise.all([
    // Today's jobs
    Job.countDocuments({ userId: userObjectId, serviceDate: { $gte: todayStart, $lt: todayEnd } }),

    // Weekly jobs + earnings
    Job.aggregate([
      { $match: { userId: userObjectId, serviceDate: { $gte: weekStart, $lt: weekEnd }, status: "completed" } },
      { $group: { _id: null, count: { $sum: 1 }, earnings: { $sum: "$amount" } } },
    ]),

    // Monthly jobs + earnings
    Job.aggregate([
      { $match: { userId: userObjectId, serviceDate: { $gte: monthStart, $lt: monthEnd }, status: "completed" } },
      { $group: { _id: null, count: { $sum: 1 }, earnings: { $sum: "$amount" } } },
    ]),

    // Previous Monthly earnings (for growth calculation)
    Job.aggregate([
      { $match: { userId: userObjectId, serviceDate: { $gte: prevMonthStart, $lt: prevMonthEnd }, status: "completed" } },
      { $group: { _id: null, earnings: { $sum: "$amount" } } },
    ]),

    // Pending jobs
    Job.countDocuments({ userId: userObjectId, status: "pending" }),

    // Total jobs all-time
    Job.countDocuments({ userId: userObjectId }),

    // Recent 10 jobs (sorting by serviceDate to match History)
    Job.find({ userId: userObjectId })
      .sort({ serviceDate: -1 })
      .limit(10)
      .populate("customerId", "name phone")
      .lean(),
  ]);

  const totalAllTime = totalJobs || 0;
  // Let's get cumulative completed for efficiency.
  const [allCompleted, allEarningsStats] = await Promise.all([
    Job.countDocuments({ userId: userObjectId, status: "completed" }),
    Job.aggregate([
      { $match: { userId: userObjectId, status: "completed" } },
      { $group: { _id: null, earnings: { $sum: "$amount" } } },
    ]),
  ]);

  const totalEarningsAllTime = allEarningsStats[0]?.earnings ?? 0;
  const efficiency = totalAllTime > 0 ? Math.round((allCompleted / totalAllTime) * 100) : 0;

  const currentMonthlyEarnings = monthlyStats[0]?.earnings ?? 0;
  const prevMonthlyEarnings = prevMonthlyStats[0]?.earnings ?? 0;

  // Calculate earnings change percentage
  let earningsChange = 0;
  if (prevMonthlyEarnings > 0) {
    earningsChange = Math.round(((currentMonthlyEarnings - prevMonthlyEarnings) / prevMonthlyEarnings) * 100);
  } else if (currentMonthlyEarnings > 0) {
    earningsChange = 100; // New growth
  }

  return {
    todayJobs,
    weeklyJobs: weeklyStats[0]?.count ?? 0,
    weeklyEarnings: weeklyStats[0]?.earnings ?? 0,
    monthlyJobs: monthlyStats[0]?.count ?? 0,
    monthlyEarnings: currentMonthlyEarnings,
    totalEarnings: totalEarningsAllTime,
    earningsChange,
    pendingJobs: pendingCount,
    totalJobs: totalAllTime,
    efficiency,
    recentJobs,
  };
}

const DashboardService = {
  getDashboardSummary,
};

export default DashboardService;
