import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { ScrollView, Alert, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { useGetCustomerByIdQuery, useUpdateCustomerMutation, useGetCustomersQuery } from "@services/api/customerApi";
import OfflineBanner from "@components/OfflineBanner";
import { ApplianceTypes, JobStatuses } from "@constants/appConstants";
import useTheme from "@hooks/useTheme";
import useLocationCapture from "@hooks/useLocationCapture";
import useJobSubmission from "@hooks/useJobSubmission";

// Modular Components
import CustomerSection from "@components/CreateJob/CustomerSection";
import JobDetailsForm from "@components/CreateJob/JobDetailsForm";
import WarrantySection from "@components/CreateJob/WarrantySection";
import TimelineSection from "@components/CreateJob/TimelineSection";
import StatusSelectionModal from "@components/CreateJob/StatusSelectionModal";
import PartsSection from "@components/CreateJob/PartsSection";
import AddJobModals from "@components/CreateJob/AddJobModals";
import { addDraft, updateDraft, removeDraft } from "../store/slices/draftSlice";

// Gluestack Primitives
import { Text } from "@components/ui/text";

// Icons
import { ArrowLeft, Zap } from "lucide-react-native";

export default function AddJobScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { job: editingJob, customer: initialCustomer, initialDate, origin, draftId } = route.params ?? {};
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);
  const drafts = useSelector((state) => state.draft.drafts);
  const [currentDraftId, setCurrentDraftId] = useState(draftId || null);
  
  // -- State --
  const [selectedCustomer, setSelectedCustomer] = useState(
    editingJob 
      ? { 
          _id: editingJob.customerId?._id || editingJob.customerId, 
          name: editingJob.customerId?.name || editingJob.customerName, 
          phone: editingJob.customerId?.phone || editingJob.customerPhone 
        } 
      : (initialCustomer || null)
  );

  React.useEffect(() => {
    if (!currentDraftId && !editingJob && (appliance || issue || amount || selectedCustomer)) {
      const data = {
        applianceType: appliance,
        issue,
        amount,
        selectedCustomer,
        lastSaved: new Date().toISOString()
      };
      const newId = uuidv4();
      dispatch(addDraft({ id: newId, data }));
      setCurrentDraftId(newId);
    } else if (currentDraftId) {
      const data = {
        applianceType: appliance,
        issue,
        amount,
        selectedCustomer,
        lastSaved: new Date().toISOString()
      };
      dispatch(updateDraft({ id: currentDraftId, data }));
    }
  }, [appliance, issue, amount, selectedCustomer, currentDraftId, editingJob, dispatch, drafts]);

  React.useEffect(() => {
    if (editingJob && !currentDraftId) {
      setAppliance(editingJob.applianceType || ApplianceTypes[0]);
      setIssue(editingJob.issue || "");
      
      const ptsTotal = (editingJob.partsUsed || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const diagFee = parseFloat(editingJob.diagnosticFee) || 0;
      const baseAmount = Math.max(0, (parseFloat(editingJob.amount) || 0) - ptsTotal - diagFee);
      setAmount(baseAmount > 0 ? baseAmount.toString() : "");
      
      setSelectedCustomer({
        _id: editingJob.customerId?._id || editingJob.customerId,
        name: editingJob.customerId?.name || editingJob.customerName,
        phone: editingJob.customerId?.phone || editingJob.customerPhone
      });
      
      setServiceDone(editingJob.serviceDone || "");
      setDiagnosticFee(editingJob.diagnosticFee?.toString() || "");
      setStatus(editingJob.status || JobStatuses.PENDING);
      if (editingJob.serviceDate) setServiceDate(new Date(editingJob.serviceDate));
      setWarranty(editingJob.warranty || "No Warranty");
      setPartsUsed(editingJob.partsUsed || []);
      if (editingJob.nextReminderDate) setNextReminderDate(new Date(editingJob.nextReminderDate));
      setSelectedLocation(editingJob.location || null);
      setPriority(editingJob.priority || "normal");
      setInternalNotes(editingJob.internalNotes || "");
      setIsPaid(editingJob.isPaid ?? false);
      setPaymentMethod(editingJob.paymentMethod || "cash");
      
      if (editingJob.serviceDate) {
        const d = new Date(editingJob.serviceDate);
        if (!isNaN(d.getTime())) {
          setSelectedTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
        }
      }
    }
  }, [editingJob, currentDraftId, dispatch]);

  const activeCustomerId = selectedCustomer?._id || selectedCustomer?.serverId;
  const { data: customerDetailsResponse } = useGetCustomerByIdQuery(activeCustomerId, {
    skip: !activeCustomerId || !!selectedCustomer?.locations,
  });

  React.useEffect(() => {
    if (customerDetailsResponse?.data && selectedCustomer && !selectedCustomer.locations) {
      setSelectedCustomer(prev => ({ ...prev, locations: customerDetailsResponse.data.locations }));
    }
  }, [customerDetailsResponse, selectedCustomer]);

  const [appliance, setAppliance] = useState(editingJob?.applianceType ?? ApplianceTypes[0]);
  const [issue, setIssue] = useState(editingJob?.issue ?? "");
  const [serviceDone, setServiceDone] = useState(editingJob?.serviceDone ?? "");
  const [diagnosticFee, setDiagnosticFee] = useState(editingJob?.diagnosticFee?.toString() ?? "");
  const [status, setStatus] = useState(editingJob?.status ?? JobStatuses.PENDING);
  const [serviceDate, setServiceDate] = useState(() => {
    if (editingJob?.serviceDate) return new Date(editingJob.serviceDate);
    if (initialDate) {
      const [y, m, d] = initialDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  const [warranty, setWarranty] = useState(editingJob?.warranty ?? "No Warranty");
  const [customWarranty, setCustomWarranty] = useState("");
  const [showCustomWarranty, setShowCustomWarranty] = useState(false);
  const [amount, setAmount] = useState(() => {
    if (editingJob) {
      const ptsTotal = (editingJob.partsUsed || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const diagFee = parseFloat(editingJob.diagnosticFee) || 0;
      const baseAmount = Math.max(0, (parseFloat(editingJob.amount) || 0) - ptsTotal - diagFee);
      return baseAmount > 0 ? baseAmount.toString() : "";
    }
    return "";
  });
  const [partsUsed, setPartsUsed] = useState(editingJob?.partsUsed ?? []);
  const [nextReminderDate, setNextReminderDate] = useState(editingJob?.nextReminderDate ? new Date(editingJob.nextReminderDate) : null);
  const [selectedLocation, setSelectedLocation] = useState(editingJob?.location || null);
  const [priority, setPriority] = useState(editingJob?.priority ?? "normal");
  const [internalNotes, setInternalNotes] = useState(editingJob?.internalNotes ?? "");
  const [isPaid, setIsPaid] = useState(editingJob?.isPaid ?? false);
  const [paymentMethod, setPaymentMethod] = useState(editingJob?.paymentMethod ?? "cash");

  // Time Sync
  let initialTime = "10:00 AM";
  if (editingJob?.serviceDate) {
    const d = new Date(editingJob.serviceDate);
    if (!isNaN(d.getTime())) {
      initialTime = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
  }
  const [selectedTime, setSelectedTime] = useState(initialTime);

  // Modal Visibility
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  // Add Location Flow State
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [newLocationLabel, setNewLocationLabel] = useState("");
  const [newLocationLat, setNewLocationLat] = useState(null);
  const [newLocationLng, setNewLocationLng] = useState(null);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const addLocationCapture = useLocationCapture();

  const [updateCustomer, { isLoading: isUpdatingCustomer }] = useUpdateCustomerMutation();

  const { submitJob, isSyncing } = useJobSubmission({
    userId,
    editingJob,
    onSuccess: () => {
      if (currentDraftId) dispatch(removeDraft(currentDraftId));
      handleFinish();
    }
  });

  // -- Auto-calculation for total amount --
  React.useEffect(() => {
    // If we have parts, the amount (Service Charge) + parts total = final amount
    // But since 'amount' is controlled by input, we might need to handle this carefully.
    // Let's assume 'amount' state IS the service charge, and we calculate a total.
    // However, the backend 'amount' field is the TOTAL.
    // For now, I'll leave the 'amount' field as the base service charge and add the parts on top during submission.
  }, [partsUsed]);

  // -- Draft Loading --
  React.useEffect(() => {
    if (draftId) {
      const draft = drafts.find(d => d.id === draftId);
      if (draft && draft.data) {
        const d = draft.data;
        // Map draft data to state
        setAppliance(d.applianceType || ApplianceTypes[0]);
        setIssue(d.issue || "");
        setServiceDone(d.serviceDone || "");
        setDiagnosticFee(d.diagnosticFee?.toString() || "");
        setAmount(d.amount?.toString() || "");
        setStatus(d.status || JobStatuses.PENDING);
        if (d.serviceDate) setServiceDate(new Date(d.serviceDate));
        setWarranty(d.warranty || "No Warranty");
        setSelectedLocation(d.location || null);
        setIsPaid(d.isPaid ?? false);
        setPaymentMethod(d.paymentMethod ?? "cash");
      }
    }
  }, [draftId]);

  // -- Auto-save logic --
  React.useEffect(() => {
    const hasData = issue.trim() || serviceDone.trim() || amount || (selectedCustomer && !editingJob);
    if (!hasData || editingJob) return;

    const timer = setInterval(() => {
      const draftPayload = {
        customerId: selectedCustomer?._id || selectedCustomer?.serverId,
        applianceType: appliance,
        issue: issue.trim(),
        serviceDone: serviceDone.trim(),
        diagnosticFee: parseFloat(diagnosticFee) || 0,
        amount: parseFloat(amount) || 0,
        status: status,
        serviceDate: serviceDate.toISOString(),
        warranty: showCustomWarranty ? customWarranty : warranty,
        location: selectedLocation,
        isPaid: isPaid,
        paymentMethod: paymentMethod
      };

      if (currentDraftId) {
        dispatch(updateDraft({
          id: currentDraftId,
          data: draftPayload,
          customerName: selectedCustomer?.name,
          applianceType: appliance
        }));
      } else {
        const newId = Date.now().toString();
        dispatch(addDraft({
          data: draftPayload,
          customerName: selectedCustomer?.name,
          applianceType: appliance
        }));
        setCurrentDraftId(newId);
      }
    }, 15000); // Auto-save every 15 seconds

    return () => clearInterval(timer);
  }, [issue, serviceDone, amount, selectedCustomer, currentDraftId, appliance, diagnosticFee, status, serviceDate, warranty, customWarranty, showCustomWarranty, selectedLocation, isPaid, paymentMethod]);

  // External Data
  const { data: customersResponse } = useGetCustomersQuery({ limit: 10 });
  const topRecent = (customersResponse?.data || []).slice(0, 3);

  // -- Logic Handlers --
  React.useEffect(() => {
    if (selectedCustomer && !editingJob) {
      const defaultLoc = selectedCustomer.locations?.find((l) => l.isDefault) || selectedCustomer.locations?.[0];
      setSelectedLocation(defaultLoc || null);
    }
  }, [selectedCustomer, editingJob]);

  const handleFinish = () => {
    if (origin === 'Calendar') {
      navigation.navigate("Calendar");
    } else {
      navigation.goBack();
    }
  };

  async function handleAddLocation() {
    if (!newLocationAddress.trim()) { Alert.alert("Error", "Address is required"); return; }
    const newLoc = {
      label: newLocationLabel.trim() || "Site",
      address: newLocationAddress.trim(),
      latitude: newLocationLat,
      longitude: newLocationLng,
      isDefault: (selectedCustomer?.locations?.length ?? 0) === 0,
    };

    try {
      if (saveToProfile && selectedCustomer) {
        const custId = selectedCustomer._id || selectedCustomer.serverId;
        if (custId) {
          await updateCustomer({
            id: custId,
            locations: [...(selectedCustomer.locations || []).map(({ _id: _l, ...rest }) => rest), newLoc],
          }).unwrap();
        }

        setSelectedCustomer((prev) => ({
          ...prev,
          locations: [...(prev.locations || []), newLoc],
        }));
      }

      setSelectedLocation(newLoc);
      setShowAddLocationModal(false);
      setNewLocationAddress("");
      setNewLocationLabel("");
      setNewLocationLat(null);
      setNewLocationLng(null);
      if (saveToProfile) Alert.alert("Success", "Location added successfully to customer.");
    } catch {
      Alert.alert("Error", "Failed to add location");
    }
  }

  const handleAddLocationGPS = (coords) => {
    setNewLocationLat(coords.latitude);
    setNewLocationLng(coords.longitude);
    Alert.alert("Success", "Captured current location!");
  };

  const handleAddLocationLinkExtract = (link) => {
    const coords = addLocationCapture.extractFromLink(link);
    if (coords) {
      setNewLocationLat(coords.latitude);
      setNewLocationLng(coords.longitude);
      addLocationCapture.closeLinkModal();
      Alert.alert("Success", "Coordinates extracted from link!");
    }
  };

  async function handleSubmit() {
    await submitJob({
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
      paymentMethod
    });
  }

  const handleSaveDraft = () => {
    const draftPayload = {
      customerId: selectedCustomer?._id || selectedCustomer?.serverId,
      applianceType: appliance,
      issue: issue.trim(),
      serviceDone: serviceDone.trim(),
      diagnosticFee: parseFloat(diagnosticFee) || 0,
      amount: parseFloat(amount) || 0,
      status: status,
      serviceDate: serviceDate.toISOString(),
      warranty: showCustomWarranty ? customWarranty : warranty,
      location: selectedLocation,
      priority: priority,
      internalNotes: internalNotes,
      isPaid: isPaid,
      paymentMethod: paymentMethod
    };

    if (currentDraftId) {
      dispatch(updateDraft({
        id: currentDraftId,
        data: draftPayload,
        customerName: selectedCustomer?.name,
        applianceType: appliance
      }));
      Alert.alert("Draft Updated", "Your changes have been saved locally.");
    } else {
      const newId = Date.now().toString();
      dispatch(addDraft({
        data: draftPayload,
        customerName: selectedCustomer?.name,
        applianceType: appliance
      }));
      setCurrentDraftId(newId);
      Alert.alert("Draft Saved", "This job is now saved in your local drafts.");
    }
  };

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
        
        {!editingJob && (
          <TouchableOpacity onPress={handleSaveDraft} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 9, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' }}>Save Draft</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 16 }} />
        
        <CustomerSection
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          topRecent={topRecent}
          onSearchPress={() => navigation.navigate("CustomerSearch", { onSelectCustomer: setSelectedCustomer })}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onAddLocationPress={() => setShowAddLocationModal(true)}
        />

        <JobDetailsForm
          appliance={appliance}
          setAppliance={setAppliance}
          issue={issue}
          setIssue={setIssue}
          serviceDone={serviceDone}
          setServiceDone={setServiceDone}
          diagnosticFee={diagnosticFee}
          setDiagnosticFee={setDiagnosticFee}
          amount={amount}
          setAmount={setAmount}
          priority={priority}
          setPriority={setPriority}
          internalNotes={internalNotes}
          setInternalNotes={setInternalNotes}
        />

        <PartsSection 
          parts={partsUsed}
          setParts={setPartsUsed}
        />

        <WarrantySection
          warranty={warranty}
          setWarranty={setWarranty}
          customWarranty={customWarranty}
          setCustomWarranty={setCustomWarranty}
          showCustomWarranty={showCustomWarranty}
          setShowCustomWarranty={setShowCustomWarranty}
        />

        <TimelineSection
          serviceDate={serviceDate}
          selectedTime={selectedTime}
          status={status}
          nextReminderDate={nextReminderDate}
          onDatePress={() => setShowCalendar(true)}
          onTimePress={() => setShowTimePicker(true)}
          onStatusPress={() => setShowStatusSheet(true)}
          onReminderPress={() => setShowReminderCalendar(true)}
          onClearReminder={() => setNextReminderDate(null)}
          isPaid={isPaid}
          setIsPaid={setIsPaid}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        {/* Submit Action */}
        <TouchableOpacity onPress={handleSubmit} disabled={isSyncing} activeOpacity={0.8} style={{ marginBottom: 48, overflow: 'hidden', borderRadius: 16, elevation: 12 }}>
          <LinearGradient colors={colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12 }}>
            {isSyncing ? (
              <ActivityIndicator color={colors.bgPrimary} size="small" />
            ) : (
              <>
                <Text style={{ fontFamily: 'Space Grotesk', color: colors.bgPrimary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 4, fontSize: 12 }}>{editingJob ? "Save Changes" : "Create Job"}</Text>
                <Zap color={colors.bgPrimary} size={14} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 96 }} />
      </ScrollView>

      <AddJobModals 
        colors={colors}
        showCalendar={showCalendar} setShowCalendar={setShowCalendar}
        serviceDate={serviceDate} setServiceDate={setServiceDate}
        showTimePicker={showTimePicker} setShowTimePicker={setShowTimePicker}
        selectedTime={selectedTime} setSelectedTime={setSelectedTime}
        showStatusSheet={showStatusSheet} setShowStatusSheet={setShowStatusSheet}
        status={status} setStatus={setStatus}
        showReminderCalendar={showReminderCalendar} setShowReminderCalendar={setShowReminderCalendar}
        nextReminderDate={nextReminderDate} setNextReminderDate={setNextReminderDate}
        showAddLocationModal={showAddLocationModal} setShowAddLocationModal={setShowAddLocationModal}
        newLocationLabel={newLocationLabel} setNewLocationLabel={setNewLocationLabel}
        newLocationAddress={newLocationAddress} setNewLocationAddress={setNewLocationAddress}
        newLocationLat={newLocationLat} setNewLocationLat={setNewLocationLat}
        newLocationLng={newLocationLng} setNewLocationLng={setNewLocationLng}
        saveToProfile={saveToProfile} setSaveToProfile={setSaveToProfile}
        handleAddLocation={handleAddLocation}
        isUpdatingCustomer={isUpdatingCustomer}
        addLocationCapture={addLocationCapture}
        handleAddLocationGPS={handleAddLocationGPS}
        handleAddLocationLinkExtract={handleAddLocationLinkExtract}
        editingJob={editingJob}
      />

    </SafeAreaView>
  );
}
