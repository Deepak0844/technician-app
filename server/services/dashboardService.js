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
  
  const [
    todayJobs, 
    weeklyStats, 
    monthlyStats, 
    prevMonthlyStatsActive, 
    pendingCount, 
    totalJobs, 
    recentJobs, 
    outstandingStats
  ] = await Promise.all([
    // Today's jobs
    Job.countDocuments({ userId: userObjectId, serviceDate: { $gte: todayStart, $lt: todayEnd } }),

    // Weekly jobs + Total Potential earnings (Amount + Diagnostic)
    Job.aggregate([
      { $match: { userId: userObjectId, serviceDate: { $gte: weekStart, $lt: weekEnd }, status: "completed" } },
      { $group: { _id: null, count: { $sum: 1 }, earnings: { $sum: { $add: ["$amount", "$diagnosticFee"] } } } },
    ]),

    // Monthly Paid vs Unpaid earnings
    Job.aggregate([
      { $match: { userId: userObjectId, serviceDate: { $gte: monthStart, $lt: monthEnd }, status: "completed" } },
      { 
        $group: { 
          _id: null, 
          count: { $sum: 1 }, 
          totalEarnings: { $sum: { $add: ["$amount", "$diagnosticFee"] } },
          paidEarnings: { 
            $sum: { 
              $cond: [{ $eq: ["$isPaid", true] }, { $add: ["$amount", "$diagnosticFee"] }, 0] 
            } 
          },
          pendingEarnings: { 
            $sum: { 
              $cond: [{ $eq: ["$isPaid", false] }, { $add: ["$amount", "$diagnosticFee"] }, 0] 
            } 
          }
        } 
      },
    ]),

    // Previous Monthly earnings (for growth calculation)
    Job.aggregate([
      { $match: { userId: userObjectId, serviceDate: { $gte: prevMonthStart, $lt: prevMonthEnd }, status: "completed" } },
      { $group: { _id: null, earnings: { $sum: { $add: ["$amount", "$diagnosticFee"] } } } },
    ]),

    // Pending jobs (Not started)
    Job.countDocuments({ userId: userObjectId, status: "pending" }),

    // Total jobs all-time
    Job.countDocuments({ userId: userObjectId }),

    // Recent 10 jobs
    Job.find({ userId: userObjectId })
      .sort({ serviceDate: -1 })
      .limit(10)
      .populate("customerId", "name phone")
      .lean(),

    // Outstanding payments total (completed but not paid) - All-time
    Job.aggregate([
      { $match: { userId: userObjectId, status: "completed", isPaid: false } },
      { $group: { _id: null, total: { $sum: { $add: ["$amount", "$diagnosticFee"] } } } },
    ]),
  ]);

  const totalAllTime = totalJobs || 0;
  
  const [allCompleted, allEarningsStats] = await Promise.all([
    Job.countDocuments({ userId: userObjectId, status: "completed" }),
    Job.aggregate([
      { $match: { userId: userObjectId, status: "completed", isPaid: true } },
      { $group: { _id: null, earnings: { $sum: { $add: ["$amount", "$diagnosticFee"] } } } },
    ]),
  ]);

  const totalPaidEarningsAllTime = allEarningsStats[0]?.earnings ?? 0;
  const efficiency = totalAllTime > 0 ? Math.round((allCompleted / totalAllTime) * 100) : 0;

  const currentMonthlyPaid = monthlyStats[0]?.paidEarnings ?? 0;
  const currentMonthlyPending = monthlyStats[0]?.pendingEarnings ?? 0;
  const prevMonthlyEarnings = prevMonthlyStatsActive[0]?.earnings ?? 0;

  // Calculate earnings change percentage (based on total potential)
  const currentMonthlyTotal = monthlyStats[0]?.totalEarnings ?? 0;
  let earningsChange = 0;
  if (prevMonthlyEarnings > 0) {
    earningsChange = Math.round(((currentMonthlyTotal - prevMonthlyEarnings) / prevMonthlyEarnings) * 100);
  } else if (currentMonthlyTotal > 0) {
    earningsChange = 100; 
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
