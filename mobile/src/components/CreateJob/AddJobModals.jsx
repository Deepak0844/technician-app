import React from "react";
import { View, TouchableOpacity, Modal, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { Text } from "@components/ui/text";
import CustomClockPicker from "@components/CreateJob/CustomClockPicker";
import StatusSelectionModal from "./StatusSelectionModal";
import AddLocationModal from "@components/CreateJob/AddLocationModal";
import MapLinkModal from "@components/MapLinkModal";
import { JobStatuses } from "@constants/appConstants";

export default function AddJobModals({
  colors,
  isNewJob,
  showCalendar,
  setShowCalendar,
  serviceDate,
  setServiceDate,
  showTimePicker,
  setShowTimePicker,
  selectedTime,
  setSelectedTime,
  showStatusSheet,
  setShowStatusSheet,
  status,
  setStatus,
  isPaid,
  setIsPaid,
  showReminderCalendar,
  setShowReminderCalendar,
  nextReminderDate,
  setNextReminderDate,
  showAddLocationModal,
  setShowAddLocationModal,
  newLocationLabel,
  setNewLocationLabel,
  newLocationAddress,
  setNewLocationAddress,
  newLocationLat,
  setNewLocationLat,
  newLocationLng,
  setNewLocationLng,
  saveToProfile,
  setSaveToProfile,
  handleAddLocation,
  isUpdatingCustomer,
  addLocationCapture,
  handleAddLocationGPS,
  handleAddLocationLinkExtract,
  editingJob,
}) {
  return (
    <>
      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <Pressable
          onPress={() => setShowCalendar(false)}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <Pressable
            style={{
              backgroundColor: colors.bgCard,
              padding: 24,
              paddingBottom: 48,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.textPrimary,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Select Date
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={{ color: colors.secondary, fontWeight: "700" }}>
                  DONE
                </Text>
              </TouchableOpacity>
            </View>
            <Calendar
              minDate={
                !editingJob ? new Date().toISOString().split("T")[0] : undefined
              }
              theme={{
                calendarBackground: colors.bgCard,
                textSectionTitleColor: colors.secondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.bgPrimary,
                todayTextColor: colors.secondary,
                dayTextColor: colors.textPrimary,
                textDisabledColor: colors.textDisabled,
                monthTextColor: colors.textPrimary,
                indicatorColor: colors.primary,
                arrowColor: colors.primary,
              }}
              onDayPress={(day) => setServiceDate(new Date(day.timestamp))}
              markedDates={{
                [serviceDate.toISOString().split("T")[0]]: { selected: true },
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showReminderCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReminderCalendar(false)}
      >
        <Pressable
          onPress={() => setShowReminderCalendar(false)}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <Pressable
            style={{
              backgroundColor: colors.bgCard,
              padding: 24,
              paddingBottom: 48,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.textPrimary,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Service Reminder
              </Text>
              <TouchableOpacity onPress={() => setShowReminderCalendar(false)}>
                <Text style={{ color: colors.secondary, fontWeight: "700" }}>
                  DONE
                </Text>
              </TouchableOpacity>
            </View>
            <Calendar
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                calendarBackground: colors.bgCard,
                textSectionTitleColor: colors.secondary,
                selectedDayBackgroundColor: colors.secondary,
                selectedDayTextColor: colors.bgPrimary,
                todayTextColor: colors.primary,
                dayTextColor: colors.textSecondary,
                textDisabledColor: colors.textDisabled,
                monthTextColor: colors.textPrimary,
                indicatorColor: colors.secondary,
                arrowColor: colors.secondary,
              }}
              onDayPress={(day) => setNextReminderDate(new Date(day.timestamp))}
              markedDates={
                nextReminderDate
                  ? {
                      [nextReminderDate.toISOString().split("T")[0]]: {
                        selected: true,
                      },
                    }
                  : {}
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      <CustomClockPicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
      />

      <StatusSelectionModal
        visible={showStatusSheet}
        status={status}
        isNewJob={isNewJob}
        onClose={() => setShowStatusSheet(false)}
        onSelectStatus={(val) => {
          setStatus(val);
          setShowStatusSheet(false);
          if (isPaid && val !== JobStatuses.COMPLETED) {
            setIsPaid(false);
          }
        }}
      />

      <AddLocationModal
        visible={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        label={newLocationLabel}
        setLabel={setNewLocationLabel}
        address={newLocationAddress}
        setAddress={setNewLocationAddress}
        latitude={newLocationLat}
        setLatitude={setNewLocationLat}
        longitude={newLocationLng}
        setLongitude={setNewLocationLng}
        onSave={handleAddLocation}
        isSaving={isUpdatingCustomer}
        onCaptureGPS={() => addLocationCapture.captureGPS(handleAddLocationGPS)}
        onOpenLinkModal={addLocationCapture.openLinkModal}
        isCapturing={addLocationCapture.isFetching}
        saveToProfile={saveToProfile}
        setSaveToProfile={setSaveToProfile}
      />

      <MapLinkModal
        visible={addLocationCapture.linkModalVisible}
        mapsLink={addLocationCapture.mapsLink}
        onChangeLink={addLocationCapture.setMapsLink}
        onExtract={handleAddLocationLinkExtract}
        onClose={addLocationCapture.closeLinkModal}
      />
    </>
  );
}
