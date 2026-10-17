import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import CustomClockPicker from "@components/CreateJob/CustomClockPicker";
import {
  combineDateAndTime,
  formatDate,
  getLocalDateString,
} from "@utils/formatUtils";

// Same allowance as the server for a device clock running slightly ahead
const FUTURE_TOLERANCE_MS = 15 * 60 * 1000;

const toTimeString = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/**
 * Bottom sheet to change only a job's service date and time (used for locked
 * completed + paid jobs, so no reopen is needed). A completed job can't be
 * moved to a future date.
 *
 * @param {{ visible: boolean, onClose: () => void, serviceDate: string,
 *           isCompleted: boolean, saving: boolean,
 *           onSave: (isoDate: string) => void }} props
 */
const ChangeServiceDateModal = ({
  visible,
  onClose,
  serviceDate,
  isCompleted,
  saving,
  onSave,
}) => {
  const { colors } = useTheme();
  const [day, setDay] = useState(new Date());
  const [time, setTime] = useState("12:00 PM");
  const [showTimePicker, setShowTimePicker] = useState(false);
  // The calendar only reads `current` when it mounts, so remount it on open
  const [calendarKey, setCalendarKey] = useState(0);

  // Start from the job's current date and time each time the sheet opens
  useEffect(() => {
    if (!visible) return;
    const current = new Date(serviceDate);
    if (Number.isNaN(current.getTime())) return;
    setDay(current);
    setTime(toTimeString(current));
    setCalendarKey((k) => k + 1);
  }, [visible, serviceDate]);

  const handleSave = () => {
    const next = combineDateAndTime(day, time);
    if (!next) {
      Alert.alert("Error", "Select a valid service date.");
      return;
    }
    if (isCompleted && next.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      Alert.alert(
        "Error",
        "A completed job can't have a service date in the future.",
      );
      return;
    }
    onSave(next.toISOString());
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable
          onPress={onClose}
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
              paddingBottom: 40,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <Text
              style={{
                fontFamily: "Space Grotesk",
                color: colors.textPrimary,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              Change Date
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: colors.textMuted,
                marginBottom: 16,
              }}
            >
              Only the date and time change. Status and payment stay as they
              are.
            </Text>

            <Calendar
              key={calendarKey}
              current={getLocalDateString(day)}
              maxDate={isCompleted ? getLocalDateString(new Date()) : undefined}
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
                arrowColor: colors.primary,
              }}
              // Local midnight of the picked day (not UTC)
              onDayPress={(d) => setDay(new Date(d.year, d.month - 1, d.day))}
              markedDates={{ [getLocalDateString(day)]: { selected: true } }}
            />

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bgInput,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Clock size={16} color={colors.secondary} />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  {formatDate(day)} · {time}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                CHANGE TIME
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
              style={{
                marginTop: 16,
                height: 52,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primary,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color={colors.bgPrimary} />
              ) : (
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontWeight: "800",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: colors.bgPrimary,
                  }}
                >
                  Save Date
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <CustomClockPicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedTime={time}
        onSelectTime={setTime}
      />
    </>
  );
};

export default ChangeServiceDateModal;
