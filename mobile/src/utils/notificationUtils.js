import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Reminder windows in minutes before the service date
const REMINDER_MINUTES = [60, 30, 15];

/**
 * Build a stable, unique notification identifier for a job reminder.
 * Pattern: reminder-{jobId}-{mins}
 */
function reminderId(jobId, mins) {
  return `reminder-${jobId}-${mins}`;
}

/**
 * Request OS notification permission and set up the Android channel.
 * Must be called once when the user authenticates.
 * Returns true if permission is granted, false otherwise.
 */
async function requestPermissions() {
  if (!Device.isDevice) {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("job-reminders", {
      name: "Job Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#c899ff",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Schedule 60-min, 30-min, and 15-min local reminders for a job.
 * Silently skips any window whose trigger time is already in the past.
 *
 * @param {{
 *   _id: string,
 *   applianceType: string,
 *   serviceDate: string,
 *   customerName?: string,
 *   location?: { address?: string },
 *   issue?: string
 * }} job
 */
async function scheduleJobReminders(job) {
  const serviceTime = new Date(job.serviceDate).getTime();
  const now = Date.now();

  const customerName =
    job.customerName || job.customerId?.name || job.customer?.name || null;

  const address =
    job.location?.address ||
    job.customerId?.address ||
    job.customer?.address ||
    null;

  for (const mins of REMINDER_MINUTES) {
    const triggerTime = serviceTime - mins * 60 * 1000;

    // Skip if trigger time is already in the past (allow 5-second buffer)
    if (triggerTime <= now + 5000) continue;

    const label = mins === 60 ? "1 hour" : `${mins} minutes`;

    const titleParts = ["Job Reminder"];
    if (customerName) titleParts.push(`– ${customerName}`);
    const title = titleParts.join(" ");

    const bodyParts = [`${job.applianceType} service in ${label}.`];
    if (job.issue) bodyParts.push(`Issue: ${job.issue}`);
    if (address) bodyParts.push(`📍 ${address}`);
    const body = bodyParts.join(" ");

    await Notifications.scheduleNotificationAsync({
      identifier: reminderId(job._id, mins),
      content: {
        title,
        body,
        sound: true,
        data: { jobId: job._id, minsBefore: mins },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTime),
        channelId: "job-reminders",
      },
    });
  }
}

/**
 * Cancel all pending local reminders for a given job.
 * Safe to call even if notifications were never scheduled.
 *
 * @param {string} jobId
 */
async function cancelJobReminders(jobId) {
  for (const mins of REMINDER_MINUTES) {
    await Notifications.cancelScheduledNotificationAsync(
      reminderId(jobId, mins),
    );
  }
}

/**
 * Reschedule reminders for ALL active jobs.
 * Call this once on app start to recover from an Android reboot,
 * which wipes all scheduled OS alarms.
 *
 * - Skips jobs with no valid _id or serviceDate.
 * - Skips terminal jobs (completed / cancelled).
 * - Silently ignores individual scheduling errors so one bad
 *   job doesn't block the rest.
 *
 * @param {Array<{ _id: string, applianceType: string, serviceDate: string, status: string }>} jobs
 */
async function rescheduleAllReminders(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return;

  const TERMINAL = ["completed", "cancelled"];

  for (const job of jobs) {
    if (!job._id || !job.serviceDate) continue;
    if (TERMINAL.includes(job.status)) continue;

    try {
      // Cancel first to avoid duplicates, then reschedule
      await cancelJobReminders(job._id);
      await scheduleJobReminders(job);
    } catch (err) {
      console.warn(
        `[NotificationUtils] Failed to reschedule job ${job._id}:`,
        err,
      );
    }
  }
}

const NotificationUtils = {
  requestPermissions,
  scheduleJobReminders,
  cancelJobReminders,
  rescheduleAllReminders,
};

export default NotificationUtils;
