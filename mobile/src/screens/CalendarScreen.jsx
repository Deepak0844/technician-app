import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ScrollView, View, TouchableOpacity, Image, RefreshControl, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "react-native-calendars";
import OfflineBanner from "../components/OfflineBanner";
import { useNavigation } from "@react-navigation/native";
import { useGetJobsQuery } from "../services/api/jobApi";

// Gluestack Primitives
import { Text } from "../components/ui/text";

// Icons
import { Calendar as CalendarIcon, MapPin, CheckCircle2, Plus, Zap, Clock } from "lucide-react-native";

// Constants for Pixel-Perfect Layout
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = 56;
const ITEM_MARGIN = 8;
const SLOT_WIDTH = ITEM_WIDTH + ITEM_MARGIN; // 64

export default function CalendarScreen() {
  const navigation = useNavigation();

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
    // Add dots for jobs
    allJobs.forEach((j) => {
      if (j.serviceDate) {
        try {
          const dateStr = new Date(j.serviceDate).toISOString().split("T")[0];
          marks[dateStr] = { marked: true, dotColor: '#c899ff' };
        } catch (_e) { }
      }
    });

    // Add selected styling
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#c899ff', selectedTextColor: '#000000' };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#c899ff', selectedTextColor: '#000000' };
    }

    // Add today styling if it isn't selected
    const todayStr = new Date().toISOString().split("T")[0];
    if (todayStr !== selectedDate) {
      if (marks[todayStr]) {
        marks[todayStr] = { ...marks[todayStr], today: true };
      }
    }
    return marks;
  }, [allJobs, selectedDate]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loadingJobs} onRefresh={onRefresh} tintColor="#81ecff" colors={["#81ecff"]} />
          }
        >
          <OfflineBanner />

          {/* Header section (Now Scrollable) */}
          <View className="px-5 pt-4 pb-4">
            <View className="flex-row justify-between items-end mb-6">
              <View>
                <Text style={{ fontFamily: 'Inter' }} className="text-[10px] font-bold text-[#c899ff] uppercase tracking-[3px] mb-1">Calendar</Text>
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-3xl font-bold text-white tracking-tighter">My Schedule</Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setIsMonthVisible(!isMonthVisible)}
                  className="w-10 h-10 rounded-2xl bg-[#1a1919] items-center justify-center border border-white/5 active:scale-95"
                >
                  <CalendarIcon color="#c899ff" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  className="w-10 h-10 rounded-2xl bg-[#1a1919] items-center justify-center border border-[#c899ff]/10 overflow-hidden active:scale-95"
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn" }}
                    className="w-full h-full object-cover"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <LinearGradient
                colors={['#1a1919', '#0e0e0e']}
                className="flex-1 rounded-[24px] p-4 border border-white/5"
              >
                <Text style={{ fontFamily: 'Inter' }} className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Jobs</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-2xl font-bold text-white">{metrics.total}</Text>
                  <Text style={{ fontFamily: 'Inter' }} className="text-[10px] text-white/30">total</Text>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={['#1a1919', '#0e0e0e']}
                className="flex-1 rounded-[24px] p-4 border border-white/5"
              >
                <Text style={{ fontFamily: 'Inter' }} className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Pending</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-2xl font-bold text-[#81ecff]">{metrics.remaining}</Text>
                  <Text style={{ fontFamily: 'Inter' }} className="text-[10px] text-white/30">to do</Text>
                </View>
                {metrics.remaining === 0 && metrics.total > 0 && (
                  <View className="absolute top-2 right-2">
                    <Zap size={10} color="#81ecff" fill="#81ecff" />
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>

          {/* Collapsible Full Calendar */}
          {isMonthVisible && (
            <View className="mx-4 mb-4 bg-[#131313] rounded-[32px] overflow-hidden border border-white/5 p-4 shadow-2xl">
              <Calendar
                current={selectedDate}
                onDayPress={(day) => {
                  handleSelectDate(day.dateString);
                  setIsMonthVisible(false);
                }}
                onMonthChange={(month) => setCurrentMonthStr(month.dateString.substring(0, 7))}
                markedDates={markedDates}
                hideExtraDays={true}
                firstDay={1}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#adaaaa',
                  selectedDayBackgroundColor: '#c899ff',
                  selectedDayTextColor: '#000000',
                  todayTextColor: '#81ecff',
                  dayTextColor: '#ffffff',
                  textDisabledColor: '#333333',
                  dotColor: '#c899ff',
                  selectedDotColor: '#000000',
                  arrowColor: '#c899ff',
                  monthTextColor: '#ffffff',
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

          {/* Horizontal Scroll - Sticky */}
          <View className="bg-[#000000] py-4 px-4">
            <FlatList
              ref={flatListRef}
              data={weekDays}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.dateString}
              getItemLayout={(data, index) => ({
                length: SLOT_WIDTH,
                offset: SLOT_WIDTH * index,
                index,
              })}
              initialScrollIndex={90} // Today
              onScrollToIndexFailed={(info) => {
                flatListRef.current?.scrollToOffset({ offset: SLOT_WIDTH * info.index, animated: false });
              }}
              renderItem={({ item: day }) => (
                <TouchableOpacity
                  onPress={() => handleSelectDate(day.dateString)}
                  className={`h-20 items-center justify-center rounded-2xl border ${selectedDate === day.dateString
                      ? 'bg-[#c899ff] border-[#c899ff]'
                      : 'bg-[#131313] border-white/5'
                    }`}
                  style={{ width: ITEM_WIDTH, marginRight: ITEM_MARGIN }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontFamily: 'Inter' }} className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${selectedDate === day.dateString ? 'text-black' : 'text-white/40'
                    }`}>
                    {day.dayName}
                  </Text>
                  <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-xl font-bold ${selectedDate === day.dateString ? 'text-black' : 'text-white'
                    }`}>
                    {day.dayNum}
                  </Text>
                  {markedDates[day.dateString]?.marked && (
                    <View className={`w-1 h-1 rounded-full mt-1 ${selectedDate === day.dateString ? 'bg-black/50' : 'bg-[#c899ff]'
                      }`} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          <View className="px-4">
            <View className="flex-row justify-between items-center mb-6 mt-4">
              <View>
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-xl font-bold text-[#ffffff] tracking-tight">{selectedMonthName}</Text>
                <TouchableOpacity onPress={goToToday} activeOpacity={0.7}>
                  <Text style={{ fontFamily: 'Inter' }} className="text-[10px] text-[#c899ff] font-bold uppercase tracking-widest mt-1">Go to Today</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Timeline Content */}
            <View className="relative mb-24">

              {/* Central Line Gradient */}
              {selectedDateJobs.length > 0 && (
                <LinearGradient
                  colors={['#c899ff40', 'transparent']}
                  className="absolute left-[19px] top-4 bottom-0 w-[1.5px]"
                />
              )}

              {selectedDateJobs.length === 0 ? (
                <View className="py-16 items-center justify-center bg-[#131313]/30 rounded-[32px] border border-dashed border-white/5">
                  <Clock color="#c899ff" size={48} className="mb-4 opacity-20" />
                  <Text style={{ fontFamily: 'Inter' }} className="text-white/40 font-bold tracking-widest uppercase text-[10px]">No jobs scheduled</Text>
                </View>
              ) : (
                selectedDateJobs.map((job, index) => {
                  const isCompleted = job.status === "completed";
                  const isInProgress = job.status === "in_progress";

                  return (
                    <View key={job._id} className={`relative pl-14 mb-12 ${isCompleted ? 'opacity-60' : ''}`}>

                      {/* Timeline Indicator */}
                      <View className="absolute left-0 top-6 w-10 h-10 items-center justify-center">
                        {isCompleted ? (
                          <View className="w-6 h-6 rounded-full bg-[#c899ff]/20 items-center justify-center border border-[#c899ff]/30">
                            <CheckCircle2 color="#c899ff" size={12} />
                          </View>
                        ) : isInProgress ? (
                          <View className="w-8 h-8 rounded-full bg-[#81ecff]/10 items-center justify-center border border-[#81ecff]/30 shadow-lg" style={{ shadowColor: '#81ecff', shadowRadius: 10, shadowOpacity: 0.3 }}>
                            <View className="w-2.5 h-2.5 rounded-full bg-[#81ecff]" />
                          </View>
                        ) : (
                          <View className="w-1.5 h-1.5 rounded-full bg-white/20 border border-white/40" />
                        )}
                      </View>

                      {/* Job Card */}
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("JobDetails", { job })}
                        className={`bg-[#131313] rounded-[28px] p-5 border ${isInProgress ? 'border-[#81ecff]/20' : 'border-white/5'
                          }`}
                        style={isInProgress ? { shadowColor: '#81ecff', shadowOpacity: 0.05, shadowRadius: 30, shadowOffset: { width: 0, height: 10 } } : {}}
                      >
                        <View className="flex-row justify-between items-start mb-4">
                          <View className="flex-1 pr-4">
                            <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-lg font-bold leading-tight mb-1 ${isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                              {job.applianceType}
                            </Text>
                            <Text style={{ fontFamily: 'Inter' }} className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                              {job.customerId?.name || job.customerName || "Residential Client"}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-sm font-bold ${isInProgress ? 'text-[#81ecff]' : 'text-white'}`}>
                              {formatTime(job.serviceDate, '12h')}
                            </Text>
                            <View className={`mt-2 px-2 py-0.5 rounded-full border ${job.status === 'in_progress' ? 'bg-[#81ecff]/10 border-[#81ecff]/20' :
                                job.status === 'pending' ? 'bg-[#ffca28]/10 border-[#ffca28]/20' :
                                  job.status === 'cancelled' ? 'bg-[#ff6e84]/10 border-[#ff6e84]/20' :
                                    'bg-white/5 border-white/10'
                              }`}>
                              <Text style={{ fontFamily: 'Inter' }} className={`text-[8px] font-bold tracking-widest uppercase ${job.status === 'in_progress' ? 'text-[#81ecff]' :
                                  job.status === 'pending' ? 'text-[#ffca28]' :
                                    job.status === 'cancelled' ? 'text-[#ff6e84]' :
                                      'text-white/60'
                                }`}>
                                {job.status?.replace('_', ' ')}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="flex-row items-center gap-2 mb-4">
                          <MapPin color="#c899ff" size={12} className="opacity-70" />
                          <Text style={{ fontFamily: 'Inter' }} className="text-xs text-white/60" numberOfLines={1}>
                            {job.location || "Location pending"}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-4 border-t border-white/5">
                          <View className="flex-row items-center -space-x-2">
                            <View className="w-7 h-7 rounded-full border border-black bg-[#1a1919] overflow-hidden items-center justify-center">
                              <Image source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmtrfeLv1ZFy2D6CiXlzpKJOTmxnvrZz0z5sk5oQPSJs9M-btsafSA1ifmL36Eq43pg0Ev8X4W2xLu8w9N0Ob6sbeBHseu3LsinJEsLbvnWoiT7-ufjVNNQxCIev0De7txRFgON6pnYLoaR-OF0XQ7V-WFnCpHlP80OIFw2SjmTeI83v_z2UPedFX7WJGxjM1fuW83a8PeX0mAFGY6ceLRoeBVj5eHGl68iXveJ7tqRgiT_KU23Oy0sbe0HuGRCMT5XAnZi3LI4WQG" }} className="w-full h-full object-cover" />
                            </View>
                            <View className="w-7 h-7 rounded-full border border-black bg-[#1a1919] items-center justify-center">
                              <Text style={{ fontFamily: 'Inter' }} className="text-[9px] font-bold text-white/60">+2</Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={() => navigation.navigate("JobDetails", { job })}
                            className={`px-4 py-2 rounded-xl active:scale-95 ${isInProgress ? 'bg-[#81ecff]' : isCompleted ? 'bg-white/5 border border-white/10' : 'bg-[#c899ff]'
                              }`}
                          >
                            <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[10px] font-bold uppercase tracking-widest ${isInProgress || !isCompleted ? 'text-black' : 'text-white'
                              }`}>
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

        {/* Floating Action Button - Positioned above the Bottom Tab Bar */}
        <View style={{ position: 'absolute', right: 24, bottom: 100, zIndex: 40 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("AddJob", { initialDate: selectedDate, origin: 'Calendar' })}
            className="w-14 h-14 rounded-2xl overflow-hidden active:scale-90 duration-200"
            style={{
              shadowColor: '#8f00ff',
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10
            }}
          >
            <LinearGradient
              colors={['#c899ff', '#9c3dff']}
              className="flex-1 items-center justify-center"
            >
              <Plus color="#000000" size={28} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
