import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { ScrollView, Alert, View, TouchableOpacity, TextInput, ActivityIndicator, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { useCreateJobMutation, useUpdateJobMutation } from "../services/api/jobApi";
import NotificationUtils from "../utils/notificationUtils";
import { useGetCustomersQuery } from "../services/api/customerApi";
import OfflineBanner from "../components/OfflineBanner";
import { ApplianceTypes, JobStatuses } from "../constants/appConstants";
import { Calendar } from "react-native-calendars";

// Gluestack Primitives
import { Text } from "../components/ui/text";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <OfflineBanner />
      
      {/* TopAppBar - flex positioned, not absolute */}
      <View className="w-full z-50 bg-[rgba(0,0,0,0.95)] flex-row items-center justify-between px-6 h-14" style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(73,72,71,0.2)' }}>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full active:scale-95 duration-200" activeOpacity={0.7}>
            <ArrowLeft color="#c899ff" size={20} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Space Grotesk' }} className="uppercase tracking-wider text-xs text-[#c899ff] font-bold" numberOfLines={1}>{editingJob ? "Edit Job" : "Add New Job"}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 w-full max-w-lg mx-auto" showsVerticalScrollIndicator={false}>
        <View className="h-4" />
        
        {/* Section: Customer Identity */}
        <View className="mb-8 overflow-hidden rounded-2xl bg-[#131313] border border-white/5" style={{ shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20 }}>
          <View className="bg-[#1a1919] px-5 py-3 border-b border-white/5 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[10px] font-bold text-[#81ecff] tracking-widest uppercase">Customer Details</Text>
            <Users size={12} color="#81ecff" />
          </View>
          
          <View className="p-5">
            {!selectedCustomer ? (
              <View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("CustomerSearch", { onSelectCustomer: setSelectedCustomer })}
                  className="py-8 items-center justify-center border border-dashed border-[#81ecff]/20 rounded-xl bg-[#81ecff]/5 mb-4"
                >
                  <Search size={20} color="#81ecff" className="mb-2" />
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#81ecff] text-[10px] font-bold uppercase tracking-widest">Search Customers</Text>
                </TouchableOpacity>

                {topRecent.length > 0 && (
                  <View>
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[7px] uppercase font-bold tracking-widest mb-3 ml-1">Recent Customers</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                      {topRecent.map((c) => (
                        <TouchableOpacity 
                          key={c._id} 
                          onPress={() => setSelectedCustomer(c)}
                          className="mr-2 bg-[#1a1919] border border-white/5 px-4 py-2 rounded-xl items-center justify-center"
                          style={{ minWidth: 80 }}
                        >
                          <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white text-[10px] font-bold">{c.name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white text-lg font-bold">{selectedCustomer.name}</Text>
                    <View className="bg-[#81ecff]/20 px-2 py-0.5 rounded-full border border-[#81ecff]/30">
                       <Text className="text-[#81ecff] text-[7px] font-bold uppercase tracking-widest">Verified</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Phone size={10} color="#81ecff" />
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[10px] uppercase font-bold tracking-tighter">PHONE: {selectedCustomer.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedCustomer(null)}
                  className="bg-[#1a1919] p-2 rounded-full border border-white/5"
                >
                  <Search size={14} color="#adaaaa" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Section: Job Parameters */}
        <View className="mb-8 overflow-hidden rounded-2xl bg-[#131313] border border-white/5 shadow-2xl">
          <View className="bg-[#1a1919] px-5 py-3 border-b border-white/5 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[10px] font-bold text-[#c899ff] tracking-widest uppercase">Job Details</Text>
            <Settings size={12} color="#c899ff" />
          </View>

          <View className="p-5">
            {/* Appliance Selector */}
            <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[8px] font-bold uppercase tracking-widest mb-3 ml-1">Device Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6 overflow-visible">
              {ApplianceTypes.map((type) => {
                const isSelected = appliance === type;
                return (
                  <TouchableOpacity 
                    key={type} 
                    onPress={() => setAppliance(type)}
                    className={`mr-3 px-6 py-2.5 rounded-xl border items-center justify-center transition-all ${isSelected ? 'bg-[#c899ff]/20 border-[#c899ff]' : 'bg-[#1a1919] border-white/5'}`}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-[#737373]'}`}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Diagnostic Input */}
            <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[8px] font-bold uppercase tracking-widest mb-3 ml-1">Issue Reported</Text>
            <View className={`mb-6 p-4 rounded-xl bg-[#1a1919] border ${isFocusedIssue ? 'border-[#81ecff]' : 'border-white/5'}`}>
              <TextInput
                placeholder="Briefly describe the problem..."
                placeholderTextColor="#333"
                value={issue}
                onFocus={() => setIsFocusedIssue(true)}
                onBlur={() => setIsFocusedIssue(false)}
                onChangeText={setIssue}
                className="text-white text-xs leading-5"
                multiline
                numberOfLines={3}
                style={{ fontFamily: 'Inter', textAlignVertical: 'top' }}
              />
            </View>

            {/* Resolution Input */}
            <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[8px] font-bold uppercase tracking-widest mb-3 ml-1">Resolution / Work Done</Text>
            <View className={`mb-6 p-4 rounded-xl bg-[#1a1919] border ${isFocusedResolution ? 'border-[#10b981]' : 'border-white/5'}`}>
              <TextInput
                placeholder="Describe what was done to fix the issue..."
                placeholderTextColor="#333"
                value={serviceDone}
                onFocus={() => setIsFocusedResolution(true)}
                onBlur={() => setIsFocusedResolution(false)}
                onChangeText={setServiceDone}
                className="text-white text-xs leading-5"
                multiline
                numberOfLines={3}
                style={{ fontFamily: 'Inter', textAlignVertical: 'top' }}
              />
            </View>

            {/* Financial Protocol */}
            <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[8px] font-bold uppercase tracking-widest mb-3 ml-1">Service Fee</Text>
            <View className={`flex-row items-center p-4 rounded-xl bg-[#1a1919] border ${isFocusedAmount ? 'border-[#c899ff]' : 'border-white/5'}`}>
               <Text className="text-[#adaaaa] text-xs mr-2 font-bold uppercase" style={{ fontFamily: 'Space Grotesk' }}>Amt</Text>
               <TextInput
                 keyboardType="numeric"
                 placeholder="0.00"
                 placeholderTextColor="#333"
                 value={amount}
                 onFocus={() => setIsFocusedAmount(true)}
                 onBlur={() => setIsFocusedAmount(false)}
                 onChangeText={setAmount}
                 className="text-white text-lg font-bold flex-1"
                 style={{ fontFamily: 'Space Grotesk' }}
               />
               <Text className="text-[#c899ff] text-[10px] font-bold uppercase tracking-widest">INR</Text>
            </View>
          </View>
        </View>

        {/* Section: Warranty Protocol */}
        <View className="mb-8 overflow-hidden rounded-2xl bg-[#131313] border border-white/5">
          <View className="bg-[#1a1919] px-5 py-3 border-b border-white/5 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[10px] font-bold text-[#81ecff] tracking-widest uppercase">Service Warranty</Text>
            <ShieldCheck size={12} color="#81ecff" />
          </View>
          
          <View className="p-5">
            <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[8px] font-bold uppercase tracking-widest mb-3 ml-1">Selection Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
              {WarrantyPresets.map((p) => {
                const isSelected = !showCustomWarranty && warranty === p;
                return (
                  <TouchableOpacity 
                    key={p} 
                    onPress={() => {
                      setWarranty(p);
                      setShowCustomWarranty(false);
                    }}
                    className={`mr-3 px-5 py-2.5 rounded-xl border items-center justify-center ${isSelected ? 'bg-[#81ecff]/20 border-[#81ecff]' : 'bg-[#1a1919] border-white/5'}`}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-[#737373]'}`}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity 
                onPress={() => setShowCustomWarranty(true)}
                className={`px-5 py-2.5 rounded-xl border items-center justify-center ${showCustomWarranty ? 'bg-[#c899ff]/20 border-[#c899ff]' : 'bg-[#1a1919] border-white/5'}`}
              >
                <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[9px] font-bold uppercase tracking-wider ${showCustomWarranty ? 'text-white' : 'text-[#737373]'}`}>Custom</Text>
              </TouchableOpacity>
            </ScrollView>

            {showCustomWarranty && (
              <View className="mt-2 p-4 rounded-xl bg-[#1a1919] border border-[#c899ff]/30">
                 <TextInput
                   placeholder="Enter custom warranty terms..."
                   placeholderTextColor="#444"
                   value={customWarranty}
                   onChangeText={setCustomWarranty}
                   className="text-white text-xs"
                   style={{ fontFamily: 'Inter' }}
                 />
              </View>
            )}
          </View>
        </View>

        {/* Section: Operational Timeline */}
        <View className="mb-8 overflow-hidden rounded-2xl bg-[#131313] border border-white/5">
          <View className="bg-[#1a1919] px-5 py-3 border-b border-white/5 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[10px] font-bold text-[#81ecff] tracking-widest uppercase">Schedule & Status</Text>
            <Activity size={12} color="#81ecff" />
          </View>
          
          <View className="p-5">
            <View className="flex-row gap-4 mb-4">
              {/* Date Card */}
              <TouchableOpacity 
                onPress={() => setShowCalendar(true)}
                className="flex-1 bg-[#1a1919] p-4 rounded-xl border border-white/5 items-center"
                style={{ shadowColor: '#81ecff', shadowOpacity: 0.1, shadowRadius: 10 }}
              >
                <CalendarIcon size={16} color="#81ecff" className="mb-2" />
                <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[7px] uppercase font-bold tracking-widest mb-1">Service Date</Text>
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white text-[10px] font-bold uppercase">{serviceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
              </TouchableOpacity>

              {/* Time Card */}
              <TouchableOpacity 
                onPress={() => setShowTimePicker(true)}
                className="flex-1 bg-[#1a1919] p-4 rounded-xl border border-white/5 items-center"
                style={{ shadowColor: '#c899ff', shadowOpacity: 0.1, shadowRadius: 10 }}
              >
                <Clock size={16} color="#c899ff" className="mb-2" />
                <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[7px] uppercase font-bold tracking-widest mb-1">Time</Text>
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white text-[10px] font-bold uppercase">{selectedTime}</Text>
              </TouchableOpacity>
            </View>

            {/* Status Selector */}
            <TouchableOpacity 
              onPress={() => setShowStatusSheet(true)}
              className="flex-row items-center justify-between bg-[#1a1919] p-4 rounded-xl border border-white/5"
            >
              <View>
                <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-[7px] uppercase font-bold tracking-widest mb-1">Current Status</Text>
                <View className="flex-row items-center gap-2">
                  <View className={`w-1.5 h-1.5 rounded-full ${status === 'pending' ? 'bg-[#ffca28]' : status === 'in_progress' ? 'bg-[#81ecff]' : status === 'completed' ? 'bg-[#4caf50]' : 'bg-[#f44336]'}`} />
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white text-[10px] font-bold uppercase tracking-wider">{status.replace('_', ' ')}</Text>
                </View>
              </View>
              <ChevronDown size={12} color="#444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Action */}
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isSyncing}
          activeOpacity={0.8}
          className="mb-12 overflow-hidden rounded-2xl"
          style={{ shadowColor: '#c899ff', shadowOpacity: 0.4, shadowRadius: 30, elevation: 12 }}
        >
          <LinearGradient 
            colors={['#c899ff', '#81ecff']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
            className="py-5 items-center justify-center flex-row gap-3"
          >
            {isSyncing ? (
              <ActivityIndicator color="black" size="small" />
            ) : (
              <>
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-black font-black uppercase tracking-[0.2em] text-xs">
                  {editingJob ? "Save Changes" : "Create Job"}
                </Text>
                <Zap color="black" size={14} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        {/* Spacer for Bottom Tab Bar Overlap */}
        <View className="h-24" />
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#1a1919] p-6 pb-12 rounded-t-3xl border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white font-bold uppercase tracking-widest">Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text className="text-[#81ecff] font-bold">DONE</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              minDate={!editingJob ? new Date().toISOString().split('T')[0] : undefined}
              theme={{
                calendarBackground: '#1a1919',
                textSectionTitleColor: '#81ecff',
                selectedDayBackgroundColor: '#c899ff',
                selectedDayTextColor: '#000',
                todayTextColor: '#81ecff',
                dayTextColor: '#e5e5e5',
                textDisabledColor: '#444',
                monthTextColor: '#ffffff',
                indicatorColor: '#c899ff',
                arrowColor: '#c899ff',
              }}
              onDayPress={(day) => {
                setServiceDate(new Date(day.timestamp));
              }}
              markedDates={{
                [serviceDate.toISOString().split('T')[0]]: { selected: true }
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Radial Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#1a1919] p-6 pb-12 rounded-t-3xl border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white font-bold uppercase tracking-widest">Set Appointment Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text className="text-[#c899ff] font-bold">SET</Text>
              </TouchableOpacity>
            </View>

            <View className="items-center justify-center py-6">
               {/* Clock Face Toggle */}
               <View className="flex-row bg-[#131313] rounded-full p-1 mb-10 border border-white/5">
                  <TouchableOpacity 
                    onPress={() => setClockPickerMode("hour")}
                    className={`px-6 py-1.5 rounded-full ${clockPickerMode === "hour" ? 'bg-[#c899ff]/20' : ''}`}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[10px] uppercase font-bold ${clockPickerMode === "hour" ? 'text-white' : 'text-[#737373]'}`}>Hour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setClockPickerMode("minute")}
                    className={`px-6 py-1.5 rounded-full ${clockPickerMode === "minute" ? 'bg-[#81ecff]/20' : ''}`}
                  >
                    <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[10px] uppercase font-bold ${clockPickerMode === "minute" ? 'text-white' : 'text-[#737373]'}`}>Minute</Text>
                  </TouchableOpacity>
               </View>

               {/* Radial Clock Face */}
               <View className="w-64 h-64 items-center justify-center relative">
                  {/* AM/PM Toggle in Center */}
                  <View className="z-20 w-16 h-16 rounded-full bg-[#1a1919] items-center justify-center border border-white/10" style={{ shadowColor: '#c899ff', shadowOpacity: 0.1, shadowRadius: 20 }}>
                     <TouchableOpacity onPress={() => setSelectedTime(prev => {
                       const t = prev || "10:00 AM";
                       const [timePart] = t.split(' ');
                       return `${timePart || "10:00"} ${t.endsWith('AM') ? 'PM' : 'AM'}`;
                     })}>
                        <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#c899ff] text-xs font-bold">{(selectedTime || "10:00 AM").split(' ')[1]}</Text>
                     </TouchableOpacity>
                  </View>

                  {/* Selection Hand (Visual indicator) */}
                  {(() => {
                    const time = selectedTime || "10:00 AM";
                    const val = clockPickerMode === "hour" ? parseInt(time.split(':')[0]) : parseInt(time.split(':')[1].split(' ')[0]);
                    const angle = clockPickerMode === "hour" ? (val % 12) * 30 : val * 6;
                    return (
                      <View 
                        className="absolute bg-[#c899ff]/40 w-1 rounded-full" 
                        style={{ 
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
                        className={`absolute w-10 h-10 items-center justify-center rounded-full ${isSelected ? 'bg-[#c899ff] border-2 border-[#ffffff]/20' : 'bg-[#131313]'}`}
                        style={{ 
                          transform: [{ translateX: x }, { translateY: y }],
                          shadowColor: isSelected ? '#c899ff' : 'transparent',
                          shadowOpacity: 0.5,
                          shadowRadius: 10
                        }}
                      >
                        <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-xs font-bold ${isSelected ? 'text-black' : 'text-[#a3a3a3]'}`}>
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
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#1a1919] p-6 pb-12 rounded-t-3xl border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-white font-bold uppercase tracking-widest">Update Job Status</Text>
              <TouchableOpacity onPress={() => setShowStatusSheet(false)}>
                <ArrowLeft color="#737373" size={24} style={{ transform: [{ rotate: '-90deg'}] }} />
              </TouchableOpacity>
            </View>

            <View className="flex-col gap-3">
              {Object.entries(JobStatuses).map(([key, val]) => {
                const isSelected = status === val;
                const config = {
                  pending: { color: "#a3a3a3", icon: <Clock color="#a3a3a3" size={18} /> },
                  in_progress: { color: "#ff6e84", icon: <Zap color="#ff6e84" size={18} /> },
                  completed: { color: "#81ecff", icon: <CheckSquare color="#81ecff" size={18} /> },
                  cancelled: { color: "#737373", icon: <AlertCircle color="#737373" size={18} /> },
                }[val] || { color: "#a3a3a3", icon: <Settings2 color="#a3a3a3" size={18} /> };

                return (
                  <TouchableOpacity 
                    key={val}
                    onPress={() => {
                      setStatus(val);
                      setShowStatusSheet(false);
                    }}
                    className={`flex-row items-center gap-4 p-4 rounded-xl border transition-all ${isSelected ? 'bg-[rgba(255,255,255,0.05)] border-[#c899ff]/30' : 'bg-[#131313] border-white/5'}`}
                  >
                    {config.icon}
                    <Text style={{ fontFamily: 'Inter' }} className={`text-sm font-bold capitalize ${isSelected ? 'text-white' : 'text-[#737373]'}`}>{val.replace('_', ' ')}</Text>
                    {isSelected && <Zap color="#c899ff" size={14} className="ml-auto" />}
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
