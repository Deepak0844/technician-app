import { Alert } from "react-native";
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@services/api/jobApi";
import { JobStatuses } from "@constants/appConstants";

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

    // Force COMPLETED status when user marks a job as paid
    const resolvedStatus =
      isPaid && status !== JobStatuses.COMPLETED
        ? JobStatuses.COMPLETED
        : status;

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
