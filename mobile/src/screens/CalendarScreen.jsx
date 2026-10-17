import React, { useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useGetJobsQuery } from "@services/api/jobApi";
import { RouteNames } from "@constants/routeNames";
import useTheme from "@hooks/useTheme";
import Avatar from "@components/Avatar";
import { getApplianceLabel, getLocalDateString } from "@utils/formatUtils";

// Gluestack Primitives
import { Text } from "@components/ui/text";

// Icons
import {
  MapPin,
  CheckCircle2,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { colors, mode, palette } = useTheme();
  const user = useSelector((state) => state.auth.user);

  const todayStr = getLocalDateString(new Date());

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentMonthStr, setCurrentMonthStr] = useState(
    todayStr.substring(0, 7),
  );

  const { monthStart, monthEnd } = useMemo(() => {
    const [year, month] = currentMonthStr.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { monthStart: start, monthEnd: end };
  }, [currentMonthStr]);

  const {
    data: jobsResponse,
    isLoading: loadingJobs,
    refetch,
  } = useGetJobsQuery({
    startDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString(),
    pageSize: 500,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const allJobs = useMemo(() => jobsResponse?.data || [], [jobsResponse]);

  const markedDates = useMemo(() => {
    const marks = {};
    allJobs.forEach((j) => {
      if (j.serviceDate) {
        try {
          const dateStr = getLocalDateString(new Date(j.serviceDate));
          marks[dateStr] = { marked: true, dotColor: colors.primary };
        } catch (_e) {}
      }
    });
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.bgPrimary,
      };
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.bgPrimary,
      };
    }
    if (todayStr !== selectedDate) {
      marks[todayStr] = { ...(marks[todayStr] || {}), today: true };
    }
    return marks;
  }, [allJobs, selectedDate, colors, todayStr]);

  const selectedDateJobs = useMemo(
    () =>
      allJobs.filter((j) => {
        if (!j.serviceDate) return false;
        try {
          return getLocalDateString(new Date(j.serviceDate)) === selectedDate;
        } catch {
          return false;
        }
      }),
    [allJobs, selectedDate],
  );

  const metrics = useMemo(() => {
    const total = selectedDateJobs.length;
    const completed = selectedDateJobs.filter(
      (j) => j.status === "completed",
    ).length;
    const cancelled = selectedDateJobs.filter(
      (j) => j.status === "cancelled",
    ).length;
    const remaining = total - completed - cancelled;
    return { total, remaining, completed };
  }, [selectedDateJobs]);

  const selectedDateLabel = new Date(
    selectedDate + "T00:00:00",
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingJobs}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
              colors={[colors.secondary]}
            />
          }
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fontWeight: "700",
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  marginBottom: 4,
                }}
              >
                Calendar
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 28,
                  fontWeight: "700",
                  lineHeight: 38,
                  color: colors.textPrimary,
                  includeFontPadding: false,
                }}
              >
                My Schedule
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate(RouteNames.PROFILE)}
              activeOpacity={0.7}
            >
              <Avatar name={user?.name} uri={user?.avatar} size={40} />
            </TouchableOpacity>
          </View>

          {/* Full Calendar — always visible */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 8,
              backgroundColor: colors.bgCard,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
              padding: 8,
            }}
          >
            <Calendar
              key={`${mode}-${palette}`}
              current={selectedDate}
              renderArrow={(direction) =>
                direction === "left" ? (
                  <ChevronLeft size={20} color={colors.primary} />
                ) : (
                  <ChevronRight size={20} color={colors.primary} />
                )
              }
              onDayPress={(day) => setSelectedDate(day.dateString)}
              onMonthChange={(month) =>
                setCurrentMonthStr(month.dateString.substring(0, 7))
              }
              markedDates={markedDates}
              hideExtraDays={false}
              firstDay={1}
              enableSwipeMonths={true}
              theme={{
                backgroundColor: colors.bgCard,
                calendarBackground: colors.bgCard,
                textSectionTitleColor: colors.textMuted,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.bgPrimary,
                todayTextColor: colors.secondary,
                todayBackgroundColor: colors.secondaryBg,
                dayTextColor: colors.textPrimary,
                textDisabledColor: colors.textDisabled,
                dotColor: colors.primary,
                selectedDotColor: colors.bgPrimary,
                arrowColor: colors.primary,
                monthTextColor: colors.textPrimary,
                textDayFontFamily: "Space Grotesk",
                textMonthFontFamily: "Space Grotesk",
                textDayHeaderFontFamily: "Inter",
                textDayFontWeight: "500",
                textMonthFontWeight: "700",
                textDayHeaderFontWeight: "600",
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 11,
              }}
            />
          </View>

          {/* Selected Day Summary */}
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  {selectedDateLabel}
                </Text>
                {selectedDate !== todayStr && (
                  <TouchableOpacity
                    onPress={() => setSelectedDate(todayStr)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 10,
                        color: colors.primary,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 3,
                        marginTop: 4,
                      }}
                    >
                      Go to Today
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Day stats */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: colors.bgCard,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    {metrics.total}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 9,
                      color: colors.textDisabled,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                    }}
                  >
                    Jobs
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: colors.bgCard,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.secondary,
                    }}
                  >
                    {metrics.remaining}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 9,
                      color: colors.textDisabled,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                    }}
                  >
                    Pending
                  </Text>
                </View>
              </View>
            </View>

            {/* Job List */}
            <View style={{ marginBottom: 32 }}>
              {selectedDateJobs.length === 0 ? (
                <View
                  style={{
                    paddingVertical: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.bgCard + "4D",
                    borderRadius: 24,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: colors.border,
                  }}
                >
                  <Clock
                    color={colors.primary}
                    size={40}
                    style={{ opacity: 0.3 }}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter",
                      color: colors.textDisabled,
                      fontWeight: "700",
                      letterSpacing: 4,
                      textTransform: "uppercase",
                      fontSize: 10,
                      marginTop: 12,
                    }}
                  >
                    No jobs scheduled
                  </Text>
                </View>
              ) : (
                selectedDateJobs.map((job) => {
                  const isCompleted = job.status === "completed";
                  const isInProgress = job.status === "in_progress";
                  const statusColor = isInProgress
                    ? colors.secondary
                    : job.status === "pending"
                      ? colors.warning
                      : job.status === "cancelled"
                        ? colors.danger
                        : colors.textMuted;

                  return (
                    <TouchableOpacity
                      key={job._id}
                      activeOpacity={0.9}
                      onPress={() =>
                        navigation.navigate(RouteNames.JOB_DETAILS, { job })
                      }
                      style={{
                        backgroundColor: colors.bgCard,
                        borderRadius: 24,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: isInProgress
                          ? colors.secondaryBorder
                          : colors.border,
                        opacity: isCompleted ? 0.65 : 1,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 10,
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text
                            style={{
                              fontFamily: "Space Grotesk",
                              fontSize: 16,
                              fontWeight: "700",
                              color: isCompleted
                                ? colors.textDisabled
                                : colors.textPrimary,
                              textDecorationLine: isCompleted
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {getApplianceLabel(job, { max: 2 })}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Inter",
                              fontSize: 11,
                              color: colors.textDisabled,
                              marginTop: 2,
                            }}
                          >
                            {job.customerId?.name ||
                              job.customerName ||
                              "Residential Client"}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              fontFamily: "Space Grotesk",
                              fontSize: 13,
                              fontWeight: "700",
                              color: isInProgress
                                ? colors.secondary
                                : colors.textPrimary,
                            }}
                          >
                            {formatTime(job.serviceDate)}
                          </Text>
                          <View
                            style={{
                              marginTop: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 999,
                              borderWidth: 1,
                              backgroundColor: statusColor + "1A",
                              borderColor: statusColor + "44",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Inter",
                                fontSize: 8,
                                fontWeight: "700",
                                letterSpacing: 3,
                                textTransform: "uppercase",
                                color: statusColor,
                              }}
                            >
                              {job.status?.replace("_", " ")}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2
                            size={12}
                            color={colors.primary}
                            style={{ opacity: 0.6 }}
                          />
                        ) : (
                          <MapPin
                            size={12}
                            color={colors.primary}
                            style={{ opacity: 0.6 }}
                          />
                        )}
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 12,
                            color: colors.textDisabled,
                            flex: 1,
                          }}
                          numberOfLines={1}
                        >
                          {isCompleted
                            ? "Completed"
                            : job.location?.address ||
                              (typeof job.location === "string"
                                ? job.location
                                : "Location pending")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <View
          style={{ position: "absolute", right: 24, bottom: 100, zIndex: 40 }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate(RouteNames.ADD_JOB, {
                initialDate: selectedDate,
                origin: "Calendar",
              })
            }
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: colors.primaryDeep,
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus color={colors.bgPrimary} size={28} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
