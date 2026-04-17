import { Alert } from "react-native";
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@services/api/jobApi";
import NotificationUtils from "@utils/notificationUtils";
import { JobStatuses } from "@constants/appConstants";

export default function useJobSubmission({ userId, editingJob, onSuccess }) {
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const isLoading = isCreating || isUpdating;

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

    const resolvedStatus =
      isPaid && status !== JobStatuses.COMPLETED
        ? JobStatuses.COMPLETED
        : status;

    // If editing a paid job and status is moved away from COMPLETED, reset isPaid to false
    const resolvedIsPaid =
      editingJob?.isPaid && status !== JobStatuses.COMPLETED ? false : isPaid;

    const payload = {
      customerId: selectedCustomer._id || selectedCustomer.serverId,
      applianceType: appliance,
      issue: issue.trim(),
      serviceDone: serviceDone.trim(),
      diagnosticFee: parsedFee,
      amount: parsedAmount + partsTotal + parsedFee, // Total = Service + Parts + Diagnostic Fee
      status: resolvedStatus,
      serviceDate: finalDate.toISOString(),
      nextReminderDate: nextReminderDate
        ? nextReminderDate.toISOString()
        : null,
      warranty: showCustomWarranty ? customWarranty : warranty,
      location: selectedLocation,
      partsUsed: partsUsed,
      priority: priority,
      internalNotes: internalNotes,
      isPaid: resolvedIsPaid,
      paymentMethod: paymentMethod,
    };

    try {
      if (editingJob) {
        await updateJob({ id: editingJob._id, ...payload }).unwrap();
        await NotificationUtils.cancelJobReminders(editingJob._id);
        if (
          resolvedStatus !== JobStatuses.COMPLETED &&
          resolvedStatus !== JobStatuses.CANCELLED
        ) {
          await NotificationUtils.scheduleJobReminders({
            _id: editingJob._id,
            applianceType: appliance,
            serviceDate: finalDate.toISOString(),
          });
        }
        Alert.alert(
          "Success",
          resolvedStatus !== status
            ? "Job marked as Completed and Paid."
            : resolvedIsPaid !== isPaid
              ? "Job updated and payment reset to Unpaid."
              : "Job updated successfully.",
        );
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

  return { submitJob, isLoading };
}
