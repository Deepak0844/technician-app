import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ScrollView, View, TouchableOpacity, Image, RefreshControl, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "react-native-calendars";
import OfflineBanner from "@components/OfflineBanner";
import { useNavigation } from "@react-navigation/native";
import { useGetJobsQuery } from "@services/api/jobApi";
import useTheme from "@hooks/useTheme";

// Gluestack Primitives
import { Text } from "@components/ui/text";

// Icons
import { Calendar as CalendarIcon, MapPin, CheckCircle2, Plus, Zap, Clock } from "lucide-react-native";

// Constants for Pixel-Perfect Layout
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = 56;
const ITEM_MARGIN = 8;
const SLOT_WIDTH = ITEM_WIDTH + ITEM_MARGIN; // 64

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  // State
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [currentMonthStr, setCurrentMonthStr] = useState(getLocalDateString(new Date()).substring(0, 7)); // "YYYY-MM"
  const [isMonthVisible, setIsMonthVisible] = useState(false);
  const flatListRef = useRef(null);

  const { monthStart, monthEnd } = useMemo(() => {
    const [year, month] = currentMonthStr.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { monthStart: start, monthEnd: end };
  }, [currentMonthStr]);

  // 1. RTK Query
  const { data: jobsResponse, isLoading: loadingJobs, refetch } = useGetJobsQuery({
    startDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString()
  });

  const onRefresh = useCallback(async () => {
    refetch();
  }, [refetch]);

  const allJobs = useMemo(() => jobsResponse?.data || [], [jobsResponse]);

  const markedDates = useMemo(() => {
    const marks = {};
    allJobs.forEach((j) => {
      if (j.serviceDate) {
        try {
          const dateStr = new Date(j.serviceDate).toISOString().split("T")[0];
          marks[dateStr] = { marked: true, dotColor: colors.primary };
        } catch (_e) { }
      }
    });
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: colors.primary, selectedTextColor: colors.bgPrimary };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: colors.primary, selectedTextColor: colors.bgPrimary };
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (todayStr !== selectedDate) {
      if (marks[todayStr]) marks[todayStr] = { ...marks[todayStr], today: true };
    }
    return marks;
  }, [allJobs, selectedDate, colors]);

  const selectedDateJobs = allJobs.filter((j) => {
    if (!j.serviceDate) return false;
    try {
      return new Date(j.serviceDate).toISOString().split("T")[0] === selectedDate;
    } catch {
      return false;
    }
  });

  const selectedDateObj = new Date(selectedDate);
  const selectedMonthName = selectedDateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Expanded dates for horizontal scroll (180 days range)
  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = -90; i <= 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = getLocalDateString(d);
      days.push({
        dateString: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: i === 0
      });
    }
    return days;
  }, []);

  const scrollToDate = useCallback((dateString, animated = true) => {
    const index = weekDays.findIndex(d => d.dateString === dateString);
    if (index !== -1 && flatListRef.current) {
      // Manual centering calculation for 100% precision:
      // We want to center the ITEM inside the viewport.
      // Offset = (Item-Slot-Position) - (Center of Screen) + (Half Item Width)
      const targetOffset = (index * SLOT_WIDTH) - (SCREEN_WIDTH / 2) + (ITEM_WIDTH / 2);

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: Math.max(0, targetOffset),
          animated,
        });
      }, 100);
    }
  }, [weekDays]);

  const handleSelectDate = useCallback((dateString) => {
    setSelectedDate(dateString);
    const monthStr = dateString.substring(0, 7);
    if (monthStr !== currentMonthStr) {
      setCurrentMonthStr(monthStr);
    }
    scrollToDate(dateString);
  }, [currentMonthStr, scrollToDate]);

  // Sync horizontal list with selectedDate (Fallback / Initial Mount)
  useEffect(() => {
    scrollToDate(selectedDate, true);
  }, [selectedDate, scrollToDate]);

  const goToToday = () => {
    const todayStr = getLocalDateString(new Date());
    handleSelectDate(todayStr);
    scrollToDate(todayStr);
  };

  // Command Center Metrics
  const metrics = useMemo(() => {
    const total = selectedDateJobs.length;
    const completed = selectedDateJobs.filter(j => j.status === 'completed').length;
    const cancelled = selectedDateJobs.filter(j => j.status === 'cancelled').length;
    const remaining = total - completed - cancelled;
    return { total, remaining, completed };
  }, [selectedDateJobs]);

  // Format time function
  const formatTime = (dateString, format = '24h') => {
    const opts = format === '12h'
      ? { hour: 'numeric', minute: '2-digit', hour12: true }
      : { hour: '2-digit', minute: '2-digit', hour12: false };
    return new Date(dateString).toLocaleTimeString("en-US", opts);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loadingJobs} onRefresh={onRefresh} tintColor={colors.secondary} colors={[colors.secondary]} />
          }
        >
          <OfflineBanner />

          {/* Header section */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
              <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 }}>Calendar</Text>
                <Text style={{ fontFamily: 'Space Grotesk', fontSize: 30, fontWeight: '700', color: colors.textPrimary }}>My Schedule</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setIsMonthVisible(!isMonthVisible)}
                  style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
                >
                  <CalendarIcon color={colors.primary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryBorder, overflow: 'hidden' }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn" }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <LinearGradient colors={colors.gradientCard} style={{ flex: 1, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', color: colors.textDisabled, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 4 }}>Jobs</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{metrics.total}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textFaint }}>total</Text>
                </View>
              </LinearGradient>

              <LinearGradient colors={colors.gradientCard} style={{ flex: 1, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', color: colors.textDisabled, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 4 }}>Pending</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: '700', color: colors.secondary }}>{metrics.remaining}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textFaint }}>to do</Text>
                </View>
                {metrics.remaining === 0 && metrics.total > 0 ? (
                  <View style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Zap size={10} color={colors.secondary} fill={colors.secondary} />
                  </View>
                ) : null}
              </LinearGradient>
            </View>
          </View>

          {/* Collapsible Full Calendar */}
          {isMonthVisible && (
            <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.bgCard, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16 }}>
              <Calendar
                current={selectedDate}
                onDayPress={(day) => { handleSelectDate(day.dateString); setIsMonthVisible(false); }}
                onMonthChange={(month) => setCurrentMonthStr(month.dateString.substring(0, 7))}
                markedDates={markedDates}
                hideExtraDays={true}
                firstDay={1}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: colors.textMuted,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: colors.bgPrimary,
                  todayTextColor: colors.secondary,
                  dayTextColor: colors.textPrimary,
                  textDisabledColor: colors.textDisabled,
                  dotColor: colors.primary,
                  selectedDotColor: colors.bgPrimary,
                  arrowColor: colors.primary,
                  monthTextColor: colors.textPrimary,
                  textDayFontFamily: 'Space Grotesk',
                  textMonthFontFamily: 'Space Grotesk',
                  textDayHeaderFontFamily: 'Inter',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 15,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 11
                }}
              />
            </View>
          )}

          {/* Horizontal Date Strip */}
          <View style={{ backgroundColor: colors.bgPrimary, paddingVertical: 16, paddingHorizontal: 16 }}>
            <FlatList
              ref={flatListRef}
              data={weekDays}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.dateString}
              getItemLayout={(data, index) => ({ length: SLOT_WIDTH, offset: SLOT_WIDTH * index, index })}
              initialScrollIndex={90}
              onScrollToIndexFailed={(info) => {
                flatListRef.current?.scrollToOffset({ offset: SLOT_WIDTH * info.index, animated: false });
              }}
              renderItem={({ item: day }) => {
                const isSelected = selectedDate === day.dateString;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectDate(day.dateString)}
                    style={{
                      width: ITEM_WIDTH, marginRight: ITEM_MARGIN, height: 80,
                      alignItems: 'center', justifyContent: 'center', borderRadius: 16,
                      borderWidth: 1,
                      backgroundColor: isSelected ? colors.primary : colors.bgCard,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 4, color: isSelected ? colors.bgPrimary : colors.textDisabled }}>
                      {day.dayName}
                    </Text>
                    <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: '700', color: isSelected ? colors.bgPrimary : colors.textPrimary }}>
                      {day.dayNum}
                    </Text>
                    {markedDates[day.dateString]?.marked && (
                      <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 4, backgroundColor: isSelected ? colors.bgPrimary + '80' : colors.primary }} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
              <View>
                <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{selectedMonthName}</Text>
                <TouchableOpacity onPress={goToToday} activeOpacity={0.7}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginTop: 4 }}>Go to Today</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Timeline Content */}
            <View style={{ position: 'relative', marginBottom: 96 }}>
              {selectedDateJobs.length > 0 ? (
                <LinearGradient
                  colors={[colors.primary + '40', 'transparent']}
                  style={{ position: 'absolute', left: 19, top: 16, bottom: 0, width: 1.5 }}
                />
              ) : null}

              {selectedDateJobs.length === 0 ? (
                <View style={{ paddingVertical: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard + '4D', borderRadius: 32, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border }}>
                  <Clock color={colors.primary} size={48} style={{ opacity: 0.2 }} />
                  <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontWeight: '700', letterSpacing: 4, textTransform: 'uppercase', fontSize: 10, marginTop: 16 }}>No jobs scheduled</Text>
                </View>
              ) : (
                selectedDateJobs.map((job) => {
                  const isCompleted = job.status === "completed";
                  const isInProgress = job.status === "in_progress";
                  const statusColor = isInProgress ? colors.secondary : job.status === 'pending' ? colors.warning : job.status === 'cancelled' ? colors.danger : colors.textMuted;

                  return (
                    <View key={job._id} style={{ position: 'relative', paddingLeft: 56, marginBottom: 48, opacity: isCompleted ? 0.6 : 1 }}>
                      {/* Timeline Indicator */}
                      <View style={{ position: 'absolute', left: 0, top: 24, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        {isCompleted ? (
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryBorder }}>
                            <CheckCircle2 color={colors.primary} size={12} />
                          </View>
                        ) : isInProgress ? (
                          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.secondaryBorder }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary }} />
                          </View>
                        ) : (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textDisabled, borderWidth: 1, borderColor: colors.textMuted }} />
                        )}
                      </View>

                      {/* Job Card */}
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("JobDetails", { job })}
                        style={{ backgroundColor: colors.bgCard, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: isInProgress ? colors.secondaryBorder : colors.border }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: '700', color: isCompleted ? colors.textDisabled : colors.textPrimary, marginBottom: 4, textDecorationLine: isCompleted ? 'line-through' : 'none' }}>
                              {job.applianceType}
                            </Text>
                            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textDisabled, textTransform: 'uppercase', letterSpacing: 4, fontWeight: '700' }}>
                              {job.customerId?.name || job.customerName || "Residential Client"}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: '700', color: isInProgress ? colors.secondary : colors.textPrimary }}>
                              {formatTime(job.serviceDate, '12h')}
                            </Text>
                            <View style={{ marginTop: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1, backgroundColor: statusColor + '1A', borderColor: statusColor + '33' }}>
                              <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: '700', letterSpacing: 4, textTransform: 'uppercase', color: statusColor }}>
                                {job.status?.replace('_', ' ')}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <MapPin color={colors.primary} size={12} style={{ opacity: 0.7 }} />
                          <Text style={{ fontFamily: 'Inter', fontSize: 12, color: colors.textDisabled }} numberOfLines={1}>
                            {job.location?.address || (typeof job.location === 'string' ? job.location : "Location pending")}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                          <TouchableOpacity
                            onPress={() => navigation.navigate("JobDetails", { job })}
                            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: isInProgress ? colors.secondary : isCompleted ? colors.bgSurface : colors.primary, borderWidth: isCompleted ? 1 : 0, borderColor: colors.border }}
                          >
                            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, color: isCompleted ? colors.textPrimary : colors.bgPrimary }}>
                              {isInProgress ? "Resume" : isCompleted ? "Revisit" : "Open"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

        </ScrollView>

        {/* Floating Action Button */}
        <View style={{ position: 'absolute', right: 24, bottom: 100, zIndex: 40 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("AddJob", { initialDate: selectedDate, origin: 'Calendar' })}
            style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', shadowColor: colors.primaryDeep, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus color={colors.bgPrimary} size={28} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
