import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { ScrollView, Alert, View, TouchableOpacity, TextInput, ActivityIndicator, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { useCreateJobMutation, useUpdateJobMutation } from "@services/api/jobApi";
import NotificationUtils from "@utils/notificationUtils";
import { useGetCustomersQuery } from "@services/api/customerApi";
import OfflineBanner from "@components/OfflineBanner";
import { ApplianceTypes, JobStatuses } from "@constants/appConstants";
import { Calendar } from "react-native-calendars";
import useTheme from "@hooks/useTheme";

// Gluestack Primitives
import { Text } from "@components/ui/text";

// Icons
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckSquare, 
  Zap, 
  Settings2, 
  Calendar as CalendarIcon, 
  Clock,
  Users,
  Phone,
  Settings,
  Activity,
  ChevronDown,
  Search,
  ShieldCheck
} from "lucide-react-native";

const WarrantyPresets = [
  "No Warranty",
  "30 Days",
  "90 Days",
  "6 Months",
  "1 Year"
];


export default function AddJobScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { job: editingJob, customer: initialCustomer, initialDate, origin } = route.params ?? {};
  const { colors } = useTheme();
  const userId = useSelector((state) => state.auth.user?._id);
  
  const [selectedCustomer, setSelectedCustomer] = useState(
    editingJob 
      ? { 
          _id: editingJob.customerId?._id || editingJob.customerId, // Handle both populated and ID
          name: editingJob.customerId?.name || editingJob.customerName, 
          phone: editingJob.customerId?.phone || editingJob.customerPhone 
        } 
      : (initialCustomer || null)
  );
  const [appliance, setAppliance] = useState(editingJob?.applianceType ?? ApplianceTypes[0]);
  const [issue, setIssue] = useState(editingJob?.issue ?? "");
  const [serviceDone, setServiceDone] = useState(editingJob?.serviceDone ?? "");
  const [amount, setAmount] = useState(editingJob?.amount?.toString() ?? "");
  const [status, setStatus] = useState(editingJob?.status ?? JobStatuses.PENDING);
  const [serviceDate, setServiceDate] = useState(() => {
    if (editingJob?.serviceDate) return new Date(editingJob.serviceDate);
    if (initialDate) {
      // Manual parsing for YYYY-MM-DD to avoid UTC flip
      const [y, m, d] = initialDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  const [warranty, setWarranty] = useState(editingJob?.warranty ?? WarrantyPresets[0]);
  const [customWarranty, setCustomWarranty] = useState("");
  const [showCustomWarranty, setShowCustomWarranty] = useState(false);
  
  // Time state
  let initialTime = "10:00 AM";
  if (editingJob?.serviceDate) {
    const d = new Date(editingJob.serviceDate);
    if (!isNaN(d.getTime())) {
      initialTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }
  const [selectedTime, setSelectedTime] = useState(initialTime);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [clockPickerMode, setClockPickerMode] = useState("hour"); // "hour" or "minute"
  
  const [isFocusedIssue, setIsFocusedIssue] = useState(false);
  const [isFocusedAmount, setIsFocusedAmount] = useState(false);
  const [isFocusedResolution, setIsFocusedResolution] = useState(false);

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const isSyncing = isCreating || isUpdating;

  // Recent Customers extraction from API
  const { data: customersResponse } = useGetCustomersQuery({ limit: 10 });
  const recentCustomers = customersResponse?.data || [];
  const topRecent = recentCustomers.slice(0, 3);

  const handleFinish = () => {
    if (origin === 'Calendar') {
      navigation.navigate("Calendar");
    } else {
      navigation.goBack();
    }
  };

  async function handleSubmit() {
    if (!selectedCustomer) { Alert.alert("Error", "Please select a customer"); return; }
    if (!issue.trim()) { Alert.alert("Error", "Please describe the issue"); return; }
    if (!userId) { Alert.alert("Error", "Session expired. Please log in again."); return; }

    let parsedAmount = 0;
    if (amount && amount.toString().trim() !== '') {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) { Alert.alert("Error", "Please enter a valid amount"); return; }
    }
    
    // Combine Date and Time
    let finalDate = new Date(serviceDate);
    // Robust parsing for "HH:MM AM/PM" or "HH:MM:SS AM/PM" (handles special spaces)
    const timeMatch = selectedTime.match(/(\d+):(\d+)(?::\d+)?\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3].toUpperCase();
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const year = serviceDate.getFullYear();
      const month = serviceDate.getMonth();
      const day = serviceDate.getDate();
      
      finalDate = new Date(year, month, day, hours, minutes, 0, 0);
    } else {
      console.warn("Time parsing failed for:", selectedTime);
    }

    // Safety Check: If finalDate is invalid, fallback to original or show error
    if (isNaN(finalDate.getTime())) {
      console.error("Invalid finalDate generated. Fallback to now.");
      finalDate = new Date();
    }

    // Past Date Validation - ONLY FOR NEW JOBS
    if (!editingJob) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(finalDate);
      targetDate.setHours(0, 0, 0, 0);
      
      if (targetDate < today) {
        Alert.alert("Invalid Date", "New jobs cannot be scheduled for past dates.");
        return;
      }
    }
    
    if (editingJob) {
      // mode: EDIT
      try {
        await updateJob({ 
          id: editingJob._id, 
          customerId: selectedCustomer._id || selectedCustomer.serverId,
          applianceType: appliance, 
          issue: issue.trim(), 
          serviceDone: serviceDone.trim(), 
          amount: parsedAmount,
          status: status,
          serviceDate: finalDate.toISOString(),
          warranty: showCustomWarranty ? customWarranty : warranty
        }).unwrap();

        // Always cancel existing reminders first
        await NotificationUtils.cancelJobReminders(editingJob._id);

        // Reschedule only if the job is still active
        const isTerminal = status === JobStatuses.COMPLETED || status === JobStatuses.CANCELLED;
        if (!isTerminal) {
          try {
            await NotificationUtils.scheduleJobReminders({
              _id: editingJob._id,
              applianceType: appliance,
              serviceDate: finalDate.toISOString(),
            });
          } catch (notiErr) {
            console.warn("Failed to reschedule reminders:", notiErr);
          }
        }

        Alert.alert("Success", "Job updated successfully.");
        handleFinish();
      } catch (err) {
        Alert.alert("Error", err?.data?.message || "Failed to update job.");
      }
      return;
    }

    // mode: CREATE
    try {
      const result = await createJob({ 
        customerId: selectedCustomer._id || selectedCustomer.serverId, 
        applianceType: appliance, 
        issue: issue.trim(), 
        serviceDone: serviceDone.trim(), 
        amount: parsedAmount, 
        status: status, 
        serviceDate: finalDate.toISOString(),
        warranty: showCustomWarranty ? customWarranty : warranty
      }).unwrap();

      // Schedule local reminders for the newly created job
      if (result?.data?._id) {
        try {
          await NotificationUtils.scheduleJobReminders(result.data);
          Alert.alert("Success", "Job created! You'll be reminded before the appointment.");
        } catch (notiErr) {
          console.warn("Failed to schedule reminders:", notiErr);
          Alert.alert("Success", "Job created! (Note: Reminders could not be set on this device)");
        }
      }

      // Reset state for new job
      if (!editingJob) {
        setSelectedCustomer(null);
        setAppliance(ApplianceTypes[0]);
        setIssue("");
        setServiceDone("");
        setAmount("");
        setStatus(JobStatuses.PENDING);
        setServiceDate(new Date());
        setWarranty(WarrantyPresets[0]);
        setCustomWarranty("");
        setShowCustomWarranty(false);
      }

      handleFinish();
    } catch (err) {
      console.error("Create job error:", err);
      Alert.alert("Error", err?.data?.message || "Failed to create job. Please check your connection.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <OfflineBanner />
      
      {/* TopAppBar */}
      <View style={{ width: '100%', zIndex: 50, backgroundColor: colors.bgPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 56, borderBottomWidth: 1, borderBottomColor: colors.borderMuted }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }} activeOpacity={0.7}>
            <ArrowLeft color={colors.primary} size={20} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, color: colors.primary, fontWeight: '700' }} numberOfLines={1}>{editingJob ? "Edit Job" : "Add New Job"}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 16 }} />
        
        {/* Section: Customer Identity */}
        <View style={{ marginBottom: 32, overflow: 'hidden', borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ backgroundColor: colors.bgCard, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', color: colors.secondary, letterSpacing: 4, textTransform: 'uppercase' }}>Customer Details</Text>
            <Users size={12} color={colors.secondary} />
          </View>
          
          <View style={{ padding: 20 }}>
            {!selectedCustomer ? (
              <View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("CustomerSearch", { onSelectCustomer: setSelectedCustomer })}
                  style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.secondaryBorder, borderRadius: 12, backgroundColor: colors.secondaryBg, marginBottom: 16 }}
                >
                  <Search size={20} color={colors.secondary} />
                  <Text style={{ fontFamily: 'Space Grotesk', color: colors.secondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginTop: 8 }}>Search Customers</Text>
                </TouchableOpacity>

                {topRecent.length > 0 && (
                  <View>
                    <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 7, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Recent Customers</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {topRecent.map((c) => (
                        <TouchableOpacity 
                          key={c._id} 
                          onPress={() => setSelectedCustomer(c)}
                          style={{ marginRight: 8, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 80 }}
                        >
                          <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 10, fontWeight: '700' }}>{c.name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{selectedCustomer.name}</Text>
                    <View style={{ backgroundColor: colors.secondaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderColor: colors.secondaryBorder }}>
                       <Text style={{ color: colors.secondary, fontSize: 7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>Verified</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Phone size={10} color={colors.secondary} />
                    <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 10, textTransform: 'uppercase', fontWeight: '700' }}>PHONE: {selectedCustomer.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedCustomer(null)}
                  style={{ backgroundColor: colors.bgCard, padding: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}
                >
                  <Search size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Section: Job Parameters */}
        <View style={{ marginBottom: 32, overflow: 'hidden', borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ backgroundColor: colors.bgCard, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 4, textTransform: 'uppercase' }}>Job Details</Text>
            <Settings size={12} color={colors.primary} />
          </View>

          <View style={{ padding: 20 }}>
            {/* Appliance Selector */}
            <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Device Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {ApplianceTypes.map((type) => {
                const isSelected = appliance === type;
                return (
                  <TouchableOpacity 
                    key={type} 
                    onPress={() => setAppliance(type)}
                    style={{ marginRight: 12, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? colors.primaryBg : colors.bgCard, borderColor: isSelected ? colors.primary : colors.border }}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: isSelected ? colors.textPrimary : colors.textDisabled }}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Issue Reported</Text>
            <View style={{ marginBottom: 24, padding: 16, borderRadius: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: isFocusedIssue ? colors.secondary : colors.border }}>
              <TextInput
                placeholder="Briefly describe the problem..."
                placeholderTextColor={colors.placeholderText}
                value={issue}
                onFocus={() => setIsFocusedIssue(true)}
                onBlur={() => setIsFocusedIssue(false)}
                onChangeText={setIssue}
                style={{ fontFamily: 'Inter', color: colors.textPrimary, fontSize: 12, lineHeight: 20, textAlignVertical: 'top' }}
                multiline
                numberOfLines={3}
              />
            </View>

            <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Resolution / Work Done</Text>
            <View style={{ marginBottom: 24, padding: 16, borderRadius: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: isFocusedResolution ? colors.success : colors.border }}>
              <TextInput
                placeholder="Describe what was done to fix the issue..."
                placeholderTextColor={colors.placeholderText}
                value={serviceDone}
                onFocus={() => setIsFocusedResolution(true)}
                onBlur={() => setIsFocusedResolution(false)}
                onChangeText={setServiceDone}
                style={{ fontFamily: 'Inter', color: colors.textPrimary, fontSize: 12, lineHeight: 20, textAlignVertical: 'top' }}
                multiline
                numberOfLines={3}
              />
            </View>

            <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Service Fee</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: isFocusedAmount ? colors.primary : colors.border }}>
               <Text style={{ fontFamily: 'Space Grotesk', color: colors.textMuted, fontSize: 12, marginRight: 8, fontWeight: '700', textTransform: 'uppercase' }}>Amt</Text>
               <TextInput
                 keyboardType="numeric"
                 placeholder="0.00"
                 placeholderTextColor={colors.placeholderText}
                 value={amount}
                 onFocus={() => setIsFocusedAmount(true)}
                 onBlur={() => setIsFocusedAmount(false)}
                 onChangeText={setAmount}
                 style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1 }}
               />
               <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4 }}>INR</Text>
            </View>
          </View>
        </View>

        {/* Section: Warranty Protocol */}
        <View style={{ marginBottom: 32, overflow: 'hidden', borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ backgroundColor: colors.bgCard, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', color: colors.secondary, letterSpacing: 4, textTransform: 'uppercase' }}>Service Warranty</Text>
            <ShieldCheck size={12} color={colors.secondary} />
          </View>
          
          <View style={{ padding: 20 }}>
            <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Selection Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {WarrantyPresets.map((p) => {
                const isSelected = !showCustomWarranty && warranty === p;
                return (
                  <TouchableOpacity 
                    key={p} 
                    onPress={() => { setWarranty(p); setShowCustomWarranty(false); }}
                    style={{ marginRight: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? colors.secondaryBg : colors.bgCard, borderColor: isSelected ? colors.secondary : colors.border }}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: isSelected ? colors.textPrimary : colors.textDisabled }}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity 
                onPress={() => setShowCustomWarranty(true)}
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: showCustomWarranty ? colors.primaryBg : colors.bgCard, borderColor: showCustomWarranty ? colors.primary : colors.border }}
              >
                <Text style={{ fontFamily: 'Space Grotesk', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: showCustomWarranty ? colors.textPrimary : colors.textDisabled }}>Custom</Text>
              </TouchableOpacity>
            </ScrollView>

            {showCustomWarranty && (
              <View style={{ marginTop: 8, padding: 16, borderRadius: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.primaryBorder }}>
                 <TextInput
                   placeholder="Enter custom warranty terms..."
                   placeholderTextColor={colors.placeholderText}
                   value={customWarranty}
                   onChangeText={setCustomWarranty}
                   style={{ fontFamily: 'Inter', color: colors.textPrimary, fontSize: 12 }}
                 />
              </View>
            )}
          </View>
        </View>

        {/* Section: Operational Timeline */}
        <View style={{ marginBottom: 32, overflow: 'hidden', borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ backgroundColor: colors.bgCard, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', color: colors.secondary, letterSpacing: 4, textTransform: 'uppercase' }}>Schedule & Status</Text>
            <Activity size={12} color={colors.secondary} />
          </View>
          
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <TouchableOpacity 
                onPress={() => setShowCalendar(true)}
                style={{ flex: 1, backgroundColor: colors.bgCard, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
              >
                <CalendarIcon size={16} color={colors.secondary} />
                <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 7, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 4, marginTop: 8, marginBottom: 4 }}>Service Date</Text>
                <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{serviceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowTimePicker(true)}
                style={{ flex: 1, backgroundColor: colors.bgCard, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
              >
                <Clock size={16} color={colors.primary} />
                <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 7, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 4, marginTop: 8, marginBottom: 4 }}>Time</Text>
                <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{selectedTime}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => setShowStatusSheet(true)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgCard, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
            >
              <View>
                <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 7, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 4, marginBottom: 4 }}>Current Status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status === 'pending' ? colors.warning : status === 'in_progress' ? colors.secondary : status === 'completed' ? colors.success : colors.danger }} />
                  <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>{status.replace('_', ' ')}</Text>
                </View>
              </View>
              <ChevronDown size={12} color={colors.textDisabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Action */}
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isSyncing}
          activeOpacity={0.8}
          style={{ marginBottom: 48, overflow: 'hidden', borderRadius: 16, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 30, elevation: 12 }}
        >
          <LinearGradient 
            colors={colors.gradientPrimary} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12 }}
          >
            {isSyncing ? (
              <ActivityIndicator color={colors.bgPrimary} size="small" />
            ) : (
              <>
                <Text style={{ fontFamily: 'Space Grotesk', color: colors.bgPrimary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 4, fontSize: 12 }}>
                  {editingJob ? "Save Changes" : "Create Job"}
                </Text>
                <Zap color={colors.bgPrimary} size={14} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.bgCard, padding: 24, paddingBottom: 48, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={{ color: colors.secondary, fontWeight: '700' }}>DONE</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              minDate={!editingJob ? new Date().toISOString().split('T')[0] : undefined}
              theme={{
                calendarBackground: colors.bgCard,
                textSectionTitleColor: colors.secondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.bgPrimary,
                todayTextColor: colors.secondary,
                dayTextColor: colors.textSecondary,
                textDisabledColor: colors.textDisabled,
                monthTextColor: colors.textPrimary,
                indicatorColor: colors.primary,
                arrowColor: colors.primary,
              }}
              onDayPress={(day) => { setServiceDate(new Date(day.timestamp)); }}
              markedDates={{ [serviceDate.toISOString().split('T')[0]]: { selected: true } }}
            />
          </View>
        </View>
      </Modal>

      {/* Radial Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.bgCard, padding: 24, paddingBottom: 48, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>Set Appointment Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>SET</Text>
              </TouchableOpacity>
            </View>

            <View className="items-center justify-center py-6">
               {/* Clock Face Toggle */}
               <View className="flex-row rounded-full p-1 mb-10 border border-white/5" style={{ backgroundColor: colors.bgInput }}>
                  <TouchableOpacity 
                    onPress={() => setClockPickerMode("hour")}
                    className="px-6 py-1.5 rounded-full"
                    style={{ backgroundColor: clockPickerMode === "hour" ? colors.primaryBgStrong : 'transparent' }}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk', color: clockPickerMode === "hour" ? colors.textPrimary : colors.textDisabled }} className="text-[10px] uppercase font-bold">Hour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setClockPickerMode("minute")}
                    className="px-6 py-1.5 rounded-full"
                    style={{ backgroundColor: clockPickerMode === "minute" ? colors.secondaryBg : 'transparent' }}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk', color: clockPickerMode === "minute" ? colors.textPrimary : colors.textDisabled }} className="text-[10px] uppercase font-bold">Minute</Text>
                  </TouchableOpacity>
               </View>

               {/* Radial Clock Face */}
               <View className="w-64 h-64 items-center justify-center relative">
                  {/* AM/PM Toggle in Center */}
                  <View className="z-20 w-16 h-16 rounded-full items-center justify-center border border-white/10" style={{ backgroundColor: colors.bgCard, shadowColor: colors.primary, shadowOpacity: 0.1, shadowRadius: 20 }}>
                     <TouchableOpacity onPress={() => setSelectedTime(prev => {
                       const t = prev || "10:00 AM";
                       const [timePart] = t.split(' ');
                       return `${timePart || "10:00"} ${t.endsWith('AM') ? 'PM' : 'AM'}`;
                     })}>
                        <Text style={{ fontFamily: 'Space Grotesk', color: colors.primary }} className="text-xs font-bold">{(selectedTime || "10:00 AM").split(' ')[1]}</Text>
                     </TouchableOpacity>
                  </View>

                  {/* Selection Hand (Visual indicator) */}
                  {(() => {
                    const time = selectedTime || "10:00 AM";
                    const val = clockPickerMode === "hour" ? parseInt(time.split(':')[0]) : parseInt(time.split(':')[1].split(' ')[0]);
                    const angle = clockPickerMode === "hour" ? (val % 12) * 30 : val * 6;
                    return (
                      <View 
                        className="absolute w-1 rounded-full" 
                        style={{ 
                          backgroundColor: colors.primaryBgStrong,
                          height: 90, 
                          bottom: '50%', 
                          left: '50%',
                          transform: [
                            { translateX: -0.5 },
                            { translateY: 45 },
                            { rotate: `${angle}deg` },
                            { translateY: -45 }
                          ]
                        }} 
                      />
                    );
                  })()}

                  {/* Numbers */}
                  {(clockPickerMode === "hour" ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]).map((val, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const radius = 100;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    const displayVal = clockPickerMode === "hour" ? val : val.toString().padStart(2, '0');
                    const time = selectedTime || "10:00 AM";
                    const isSelected = clockPickerMode === "hour" 
                      ? time.startsWith(val.toString().padStart(2, '0')) || (val === 12 && time.startsWith("12"))
                      : time.split(' ')[0].endsWith(displayVal);

                    return (
                      <TouchableOpacity 
                        key={val}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (clockPickerMode === "hour") {
                            setSelectedTime(prev => {
                              const t = prev || "10:00 AM";
                              const [time, ampm] = t.split(' ');
                              const [, m] = (time || "10:00").split(':');
                              return `${val.toString().padStart(2, '0')}:${m || "00"} ${ampm || "AM"}`;
                            });
                            setTimeout(() => setClockPickerMode("minute"), 200);
                          } else {
                            setSelectedTime(prev => {
                              const t = prev || "10:00 AM";
                              const [time, ampm] = t.split(' ');
                              const [h] = (time || "10:00").split(':');
                              return `${h || "10"}:${displayVal} ${ampm || "AM"}`;
                            });
                          }
                        }}
                        className={`absolute w-10 h-10 items-center justify-center rounded-full ${isSelected ? 'border-2' : ''}`}
                        style={{ 
                          backgroundColor: isSelected ? colors.primary : colors.bgInput,
                          borderColor: isSelected ? colors.borderLight : 'transparent',
                          transform: [{ translateX: x }, { translateY: y }],
                          shadowColor: isSelected ? colors.primary : 'transparent',
                          shadowOpacity: 0.5,
                          shadowRadius: 10
                        }}
                      >
                        <Text style={{ fontFamily: 'Space Grotesk', color: isSelected ? colors.bgPrimary : colors.textMuted }} className="text-xs font-bold">
                          {displayVal}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
               </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Bottom Sheet Modal */}
      <Modal visible={showStatusSheet} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.bgCard, padding: 24, paddingBottom: 48, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>Update Job Status</Text>
              <TouchableOpacity onPress={() => setShowStatusSheet(false)}>
                <ArrowLeft color={colors.textDisabled} size={24} style={{ transform: [{ rotate: '-90deg'}] }} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {Object.entries(JobStatuses).map(([key, val]) => {
                const isSelected = status === val;
                const config = {
                  pending: { color: colors.textMuted, icon: <Clock color={colors.textMuted} size={18} /> },
                  in_progress: { color: colors.danger, icon: <Zap color={colors.danger} size={18} /> },
                  completed: { color: colors.secondary, icon: <CheckSquare color={colors.secondary} size={18} /> },
                  cancelled: { color: colors.textDisabled, icon: <AlertCircle color={colors.textDisabled} size={18} /> },
                }[val] || { color: colors.textMuted, icon: <Settings2 color={colors.textMuted} size={18} /> };

                return (
                  <TouchableOpacity 
                    key={val}
                    onPress={() => { setStatus(val); setShowStatusSheet(false); }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, borderWidth: 1, backgroundColor: isSelected ? colors.bgSurface : colors.bgInput, borderColor: isSelected ? colors.primaryBorder : colors.border }}
                  >
                    {config.icon}
                    <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '700', textTransform: 'capitalize', color: isSelected ? colors.textPrimary : colors.textDisabled }}>{val.replace('_', ' ')}</Text>
                    {isSelected && <Zap color={colors.primary} size={14} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
