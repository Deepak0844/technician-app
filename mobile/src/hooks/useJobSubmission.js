import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@services/api/jobApi";
import NotificationUtils from "@utils/notificationUtils";
import { JobStatuses } from "@constants/appConstants";
import useNetworkStatus from "@hooks/useNetworkStatus";
import { setSyncQueueCount } from "@store/slices/syncSlice";
import { db } from "@db";
import { syncQueue } from "@db/schema";

export default function useJobSubmission({ userId, editingJob, onSuccess }) {
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const { isConnected } = useNetworkStatus();
  const dispatch = useDispatch();
  const isSyncing = isCreating || isUpdating;

  const submitJob = async (formData) => {
    const {
      selectedCustomer,
      appliance,
      issue,
      serviceDone,
      diagnosticFee,
      amount,
      status,
      serviceDate,
      selectedTime,
      nextReminderDate,
      warranty,
      showCustomWarranty,
      customWarranty,
      selectedLocation,
      partsUsed,
      priority,
      internalNotes,
      isPaid,
      paymentMethod,
    } = formData;

    if (!selectedCustomer) {
      Alert.alert("Error", "Please select a customer");
      return;
    }
    if (!issue.trim()) {
      Alert.alert("Error", "Please describe the issue");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Session expired. Please log in again.");
      return;
    }

    const parsedFee = parseFloat(diagnosticFee) || 0;
    const parsedAmount = parseFloat(amount) || 0;

    // Parse time into date
    let finalDate = new Date(serviceDate);
    const timeMatch = selectedTime.match(/(\d+):(\d+)(?::\d+)?\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3].toUpperCase();
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      finalDate = new Date(
        serviceDate.getFullYear(),
        serviceDate.getMonth(),
        serviceDate.getDate(),
        hours,
        minutes,
        0,
        0,
      );
    }

    if (isNaN(finalDate.getTime())) finalDate = new Date();

    // Past date check for NEW jobs
    if (!editingJob) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(finalDate);
      targetDate.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        Alert.alert(
          "Invalid Date",
          "New jobs cannot be scheduled for past dates.",
        );
        return;
      }
    }

    const partsTotal = (partsUsed || []).reduce(
      (acc, p) => acc + p.price * p.quantity,
      0,
    );

    const payload = {
      customerId: selectedCustomer._id || selectedCustomer.serverId,
      applianceType: appliance,
      issue: issue.trim(),
      serviceDone: serviceDone.trim(),
      diagnosticFee: parsedFee,
      amount: parsedAmount + partsTotal + parsedFee, // Total = Service + Parts + Diagnostic Fee
      status: status,
      serviceDate: finalDate.toISOString(),
      nextReminderDate: nextReminderDate
        ? nextReminderDate.toISOString()
        : null,
      warranty: showCustomWarranty ? customWarranty : warranty,
      location: selectedLocation,
      partsUsed: partsUsed,
      priority: priority,
      internalNotes: internalNotes,
      isPaid: isPaid,
      paymentMethod: paymentMethod,
    };

    // ── Offline path ──────────────────────────────────────────────────────────
    if (!isConnected) {
      try {
        await db.insert(syncQueue).values({
          id: uuidv4(),
          operation: editingJob ? "UPDATE_JOB" : "CREATE_JOB",
          resourceId: editingJob?._id ?? null,
          payload: JSON.stringify(payload),
          retries: 0,
          createdAt: new Date().toISOString(),
        });
        const rows = await db.select({ id: syncQueue.id }).from(syncQueue);
        dispatch(setSyncQueueCount(rows.length));
        Alert.alert(
          "Saved Offline",
          "Job saved locally. It will sync automatically when you're back online.",
        );
        if (onSuccess) onSuccess();
      } catch {
        Alert.alert("Error", "Failed to save job offline. Please try again.");
      }
      return;
    }

    // ── Online path ───────────────────────────────────────────────────────────
    try {
      if (editingJob) {
        await updateJob({ id: editingJob._id, ...payload }).unwrap();
        await NotificationUtils.cancelJobReminders(editingJob._id);
        if (
          status !== JobStatuses.COMPLETED &&
          status !== JobStatuses.CANCELLED
        ) {
          await NotificationUtils.scheduleJobReminders({
            _id: editingJob._id,
            applianceType: appliance,
            serviceDate: finalDate.toISOString(),
          });
        }
        Alert.alert("Success", "Job updated successfully.");
      } else {
        const result = await createJob(payload).unwrap();
        if (result?.data?._id)
          await NotificationUtils.scheduleJobReminders(result.data);
        Alert.alert("Success", "Job created successfully.");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Operation failed.");
    }
  };

  return { submitJob, isSyncing };
}
