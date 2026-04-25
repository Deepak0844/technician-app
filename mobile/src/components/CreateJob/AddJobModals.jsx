import React from "react";
import { View, TouchableOpacity, Modal, Pressable } from "react-native";
import { getLocalDateString } from "@utils/formatUtils";
import { Calendar } from "react-native-calendars";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Text } from "@components/ui/text";
import CustomClockPicker from "@components/CreateJob/CustomClockPicker";
import AddLocationModal from "@components/CreateJob/AddLocationModal";
import MapLinkModal from "@components/MapLinkModal";

export default function AddJobModals({
  colors,
  showCalendar,
  setShowCalendar,
  serviceDate,
  setServiceDate,
  showTimePicker,
  setShowTimePicker,
  selectedTime,
  setSelectedTime,
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
              current={getLocalDateString(serviceDate)}
              renderArrow={(direction) =>
                direction === "left" ? (
                  <ChevronLeft size={20} color={colors.primary} />
                ) : (
                  <ChevronRight size={20} color={colors.primary} />
                )
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
                [getLocalDateString(serviceDate)]: { selected: true },
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
              minDate={getLocalDateString(new Date())}
              renderArrow={(direction) =>
                direction === "left" ? (
                  <ChevronLeft size={20} color={colors.secondary} />
                ) : (
                  <ChevronRight size={20} color={colors.secondary} />
                )
              }
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
                      [getLocalDateString(nextReminderDate)]: {
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
