import React from "react";
import { Modal, Pressable, View, Text, TouchableOpacity } from "react-native";
import {
  ArrowLeft,
  Clock,
  Zap,
  CheckSquare,
  AlertCircle,
  Settings2,
} from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import { JobStatuses } from "@constants/appConstants";

const StatusSelectionModal = ({
  visible,
  onClose,
  status,
  onSelectStatus,
  isNewJob,
  allowCompletedForNew = false,
}) => {
  const { colors } = useTheme();

  // New jobs can only be PENDING or IN_PROGRESS, plus COMPLETED when the job
  // is back-dated (its service date is in the past).
  const allowedStatuses = isNewJob
    ? [
        JobStatuses.PENDING,
        JobStatuses.IN_PROGRESS,
        ...(allowCompletedForNew ? [JobStatuses.COMPLETED] : []),
      ]
    : Object.values(JobStatuses);

  return (
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
              Update Job Status
            </Text>
            <TouchableOpacity onPress={onClose}>
              <ArrowLeft
                color={colors.textDisabled}
                size={24}
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12 }}>
            {Object.entries(JobStatuses)
              .filter(([, val]) => allowedStatuses.includes(val))
              .map(([key, val]) => {
                const isSelected = status === val;
                const config = {
                  pending: {
                    color: colors.textMuted,
                    icon: <Clock color={colors.textMuted} size={18} />,
                  },
                  in_progress: {
                    color: colors.danger,
                    icon: <Zap color={colors.danger} size={18} />,
                  },
                  completed: {
                    color: colors.secondary,
                    icon: <CheckSquare color={colors.secondary} size={18} />,
                  },
                  cancelled: {
                    color: colors.textDisabled,
                    icon: <AlertCircle color={colors.textDisabled} size={18} />,
                  },
                }[val] || {
                  color: colors.textMuted,
                  icon: <Settings2 color={colors.textMuted} size={18} />,
                };

                return (
                  <TouchableOpacity
                    key={val}
                    onPress={() => onSelectStatus(val)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      backgroundColor: isSelected
                        ? colors.bgSurface
                        : colors.bgInput,
                      borderColor: isSelected
                        ? colors.primaryBorder
                        : colors.border,
                    }}
                  >
                    {config.icon}
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 14,
                        fontWeight: "700",
                        textTransform: "capitalize",
                        color: isSelected
                          ? colors.textPrimary
                          : colors.textDisabled,
                      }}
                    >
                      {val.replace("_", " ")}
                    </Text>
                    {isSelected && (
                      <Zap
                        color={colors.primary}
                        size={14}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default StatusSelectionModal;
