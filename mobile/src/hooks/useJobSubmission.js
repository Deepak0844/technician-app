import { Alert } from "react-native";
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@services/api/jobApi";
import { JobStatuses } from "@constants/appConstants";
import { combineDateAndTime } from "@utils/formatUtils";

// Same allowance as the server for a device clock running slightly ahead
const FUTURE_TOLERANCE_MS = 15 * 60 * 1000;

export default function useJobSubmission({ userId, editingJob, onSuccess }) {
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const isLoading = isCreating || isUpdating;

  const submitJob = async (formData) => {
    const {
      selectedCustomer,
      appliances,
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
      invoiceDisplay,
      organization,
      invoiceAddress,
    } = formData;

    if (!selectedCustomer) {
      Alert.alert("Error", "Please select a customer");
      return;
    }
    if (!appliances?.length) {
      Alert.alert("Error", "Select at least one appliance");
      return;
    }
    if (!issue.trim()) {
      Alert.alert("Error", "Please describe the issue");
      return;
    }
    const hasOrgName = !!organization?.name?.trim();
    if (
      !invoiceDisplay?.showCustomerName &&
      !(invoiceDisplay?.showOrganization && hasOrgName)
    ) {
      Alert.alert(
        "Error",
        "Show either the customer name or the organisation name on the invoice.",
      );
      return;
    }
    if (invoiceDisplay?.showOrganization && !hasOrgName) {
      Alert.alert("Error", "Enter the organisation name or untick it.");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Session expired. Please log in again.");
      return;
    }

    const parsedFee = parseFloat(diagnosticFee) || 0;
    const parsedAmount = parseFloat(amount) || 0;

    const finalDate = combineDateAndTime(serviceDate, selectedTime);
    if (!finalDate) {
      Alert.alert("Error", "Select a valid service date.");
      return;
    }

    // Force COMPLETED status when user marks a job as paid
    const resolvedStatus =
      isPaid && status !== JobStatuses.COMPLETED
        ? JobStatuses.COMPLETED
        : status;

    // A job can't be completed before its service date. Not checked when an
    // existing job is saved without changing its date.
    const dateChanged =
      !editingJob ||
      Math.floor(finalDate.getTime() / 60000) !==
        Math.floor(new Date(editingJob.serviceDate).getTime() / 60000);
    if (
      resolvedStatus === JobStatuses.COMPLETED &&
      dateChanged &&
      finalDate.getTime() > Date.now() + FUTURE_TOLERANCE_MS
    ) {
      Alert.alert(
        "Error",
        "A completed job can't have a service date in the future.",
      );
      return;
    }

    const payload = {
      customerId: selectedCustomer._id || selectedCustomer.serverId,
      appliances: appliances.map(({ type }) => ({ type })),
      // Summary kept for servers that predate multi-appliance support
      applianceType: appliances.map((a) => a.type).join(", "),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      issue: issue.trim(),
      serviceDone: serviceDone.trim(),
      diagnosticFee: parsedFee,
      amount: parsedAmount, // Service / labour charge only; parts live in partsUsed[], diagnostic fee is separate
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
      isPaid: isPaid,
      paymentMethod: paymentMethod,
      invoiceDisplay,
      organization: { name: organization?.name?.trim() ?? "" },
      invoiceAddress: invoiceAddress?.trim() ?? "",
    };

    try {
      if (editingJob) {
        await updateJob({ id: editingJob._id, ...payload }).unwrap();
        Alert.alert(
          "Success",
          resolvedStatus !== status
            ? "Job marked as Completed and Paid."
            : "Job updated successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                if (onSuccess) onSuccess();
              },
            },
          ],
        );
      } else {
        await createJob(payload).unwrap();
        Alert.alert("Success", "Job created successfully.", [
          {
            text: "OK",
            onPress: () => {
              if (onSuccess) onSuccess();
            },
          },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Operation failed.");
    }
  };

  return { submitJob, isLoading };
}
