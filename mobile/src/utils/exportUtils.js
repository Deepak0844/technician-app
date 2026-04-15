import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/* eslint-disable import/namespace */

/**
 * Converts an array of objects to a CSV string.
 * @param {Array} data - The array of job objects.
 * @returns {string} - The formatted CSV string.
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = [
    'Customer Name',
    'Phone',
    'Date',
    'Appliance',
    'Issue',
    'Status',
    'Amount',
    'Paid Status',
    'Payment Method',
    'Warranty',
    'Location'
  ];

  const rows = data.map(job => {
    // Flatten logic
    const customerName = job.customerId?.name || job.customerName || 'N/A';
    const customerPhone = job.customerId?.phone || job.customerPhone || 'N/A';
    const date = job.serviceDate ? new Date(job.serviceDate).toLocaleDateString() : 'N/A';
    const location = job.location?.address ? job.location.address.replace(/,/g, ' ') : 'N/A';
    const amount = job.amount || 0;
    const paidStatus = job.isPaid ? 'Paid' : 'Unpaid';

    return [
      `"${customerName}"`, // Wrap in quotes to handle names with commas
      customerPhone,
      date,
      job.applianceType || 'N/A',
      `"${(job.issue || '').replace(/"/g, '""')}"`, // Escape quotes in text
      job.status || 'N/A',
      amount,
      paidStatus,
      job.paymentMethod || 'cash',
      `"${job.warranty || 'No Warranty'}"`,
      `"${location}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates a CSV file from job data and opens the sharing dialog.
 * @param {Array} jobs - The job list to export.
 */
export async function exportJobsToCSV(jobs) {
  if (!jobs || jobs.length === 0) {
    Alert.alert('No Data', 'There are no jobs to export.');
    return;
  }

  try {
    const csvContent = convertToCSV(jobs);
    const fileName = `JobHistory_${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Write to local temporary storage
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device.');
      return;
    }

    // Trigger share sheet
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Job History',
      UTI: 'public.comma-separated-values-text', // for iOS
    });
  } catch (error) {
    console.error('Export Error:', error);
    Alert.alert('Export Failed', 'An error occurred while generating the CSV file.');
  }
}
