import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, View, TouchableOpacity, Image, Text, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import useNetworkStatus from "../hooks/useNetworkStatus";
import OfflineBanner from "../components/OfflineBanner";
import { formatCurrency } from "../utils/formatUtils";

// Services
import { useGetDashboardSummaryQuery } from "../services/api/dashboardApi";

// Icons
import { Home, PlusCircle } from "lucide-react-native";

export default function DashboardScreen() {
  const navigation = useNavigation();
  
  // 1. RTK Query
  const { data: summaryResponse, isLoading: loadingSummary, refetch: refetchSummary } = useGetDashboardSummaryQuery();

  const onRefresh = React.useCallback(async () => {
    refetchSummary();
  }, [refetchSummary]);

  const { isConnected } = useNetworkStatus();
  
  const dashboardStats = summaryResponse?.data || { totalJobs: 0, monthlyEarnings: 0, totalEarnings: 0, earningsChange: 0, efficiency: 0, recentJobs: [] };
  const allJobs = dashboardStats.recentJobs || [];
  
  const monthlyEarnings = Number(dashboardStats?.monthlyEarnings ?? 0);
  const totalEarnings = Number(dashboardStats?.totalEarnings ?? 0);
  const earningsChange = Number(dashboardStats?.earningsChange ?? 0);
  const efficiency = Number(dashboardStats?.efficiency ?? 0);
  const totalJobs = Number(dashboardStats?.totalJobs ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e0e0e" }} edges={["top"]}>
      <OfflineBanner />
      
      {/* TopAppBar - flex positioned, not absolute */}
      <LinearGradient 
        colors={['rgba(0,0,0,0.9)', 'rgba(14,14,14,0.95)']} 
        className="w-full flex-row items-center justify-between px-4 h-14 z-50"
      >
        <TouchableOpacity className="flex-row items-center gap-2 active:scale-95 transition-transform" activeOpacity={0.7}>
          <Home color="#8B5CF6" size={20} />
          <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold tracking-tighter text-[#8B5CF6]">Technician Portal</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-4 active:scale-95 transition-transform" activeOpacity={0.7} onPress={() => navigation.navigate("Profile")}>
          <View className="w-8 h-8 rounded-full border border-[#c899ff]/20 bg-[#1a1919] overflow-hidden items-center justify-center">
             <Image 
               source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn" }} 
               className="w-full h-full object-cover" 
             />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-4 w-full max-w-lg mx-auto" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingSummary} onRefresh={onRefresh} tintColor="#c899ff" colors={["#c899ff"]} />
        }
      >
        {/* Greeting Section */}
        <View className="mb-4 mt-2">
          <Text className="font-headline text-sm font-bold tracking-tight text-[#ffffff] mb-1" style={{ fontFamily: 'Space Grotesk' }}>Welcome back</Text>
          <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] font-label text-sm tracking-wide">Status: {isConnected ? "Online" : "Connection Required"} • Session Active</Text>
        </View>

        {/* Summary Card (Bento Style) */}
        <View className="w-full bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[#c899ff]/10 mb-4 overflow-hidden relative">
          <View className="absolute -top-[10%] -right-[10%] w-32 h-32 bg-[#c899ff]/10 rounded-full" style={{ transform: [{ scale: 1.5 }], shadowColor: '#c899ff', shadowOpacity: 1, shadowRadius: 60 }} />
          <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] font-label text-xs uppercase tracking-widest mb-2 z-10">This Month Earnings</Text>
          <View className="flex-row items-baseline justify-between z-10">
            <View className="flex-row items-baseline gap-2">
              <Text className="font-headline text-lg font-bold text-[#c899ff]" style={{ fontFamily: 'Space Grotesk' }}>{formatCurrency(monthlyEarnings)}</Text>
              <Text className={`${earningsChange >= 0 ? 'text-[#81ecff]' : 'text-[#ff6e84]'} font-semibold text-xs`} style={{ fontFamily: 'Inter' }}>
                {earningsChange >= 0 ? `+${earningsChange}%` : `${earningsChange}%`}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[#a3a3a3] text-[10px] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Inter' }}>Total (All-time)</Text>
              <Text className="font-headline text-xs font-bold text-[#ffffff]" style={{ fontFamily: 'Space Grotesk' }}>{formatCurrency(totalEarnings)}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between mb-4">
          <View className="bg-[rgba(255,255,255,0.03)] p-5 rounded-xl border border-[#737373]/10 w-[48%]">
            <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] font-label text-xs uppercase tracking-widest mb-1">Total Jobs</Text>
            <Text className="font-headline text-lg font-bold text-[#ffffff]" style={{ fontFamily: 'Space Grotesk' }}>{totalJobs}</Text>
          </View>

          <View className="bg-[rgba(255,255,255,0.03)] p-5 rounded-xl border border-[#737373]/10 w-[48%] flex-col">
            <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] font-label text-xs uppercase tracking-widest mb-1">Efficiency</Text>
            <View className="flex-row items-baseline">
               <Text className="font-headline text-lg font-bold text-[#81ecff]" style={{ fontFamily: 'Space Grotesk' }}>{efficiency}</Text>
               <Text className="text-sm text-[#81ecff] font-bold" style={{ fontFamily: 'Space Grotesk' }}>%</Text>
            </View>
          </View>
        </View>

        {/* Action Banner Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddJob")}
          className="w-full h-14 rounded-xl overflow-hidden mb-10"
          style={{ shadowColor: '#9c3dff', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } }}
        >
          <LinearGradient 
            colors={['#c899ff', '#9c3dff']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }} 
            className="w-full h-full flex-row items-center justify-center gap-3 relative"
          >
            <PlusCircle color="#000000" size={24} />
            <Text className="text-[#ffffff] font-headline font-bold uppercase tracking-widest" style={{ fontFamily: 'Space Grotesk' }}>Add New Job</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Jobs Section */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-headline text-sm font-bold tracking-tight text-[#ffffff]" style={{ fontFamily: 'Space Grotesk' }}>Recent Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate("JobHistory")} activeOpacity={0.7}>
              <Text style={{ fontFamily: 'Inter' }} className="text-[#c899ff] text-sm cursor-pointer">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-4 relative">
            {allJobs.map((job) => (
              <TouchableOpacity 
                key={job._id} 
                activeOpacity={0.7} 
                onPress={() => navigation.navigate("JobDetails", { job })}
                className="bg-[rgba(255,255,255,0.03)] p-5 rounded-xl border border-white/5 flex-row items-center justify-between"
              >
                <View className="flex-col gap-1 flex-1 pr-4">
                  <Text className="text-[#ffffff] font-headline font-semibold text-sm" style={{ fontFamily: 'Space Grotesk' }} numberOfLines={1}>{job.customerName || job.customerId?.name || "Unknown"}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] text-xs">ID: #{job._id?.slice(-6).toUpperCase() || "NEW"}</Text>
                    <View className="w-1 h-1 rounded-full bg-[#737373]" />
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] text-xs" numberOfLines={1}>{job.applianceType || "General Service"}</Text>
                  </View>
                </View>

                <View className="flex-col items-end gap-2">
                  <Text className="font-headline font-bold text-[#c899ff]" style={{ fontFamily: 'Space Grotesk' }}>{formatCurrency(job.amount)}</Text>
                  <View className={`px-2 py-0.5 rounded-full border ${
                    job.status === 'completed' ? 'bg-[#81ecff]/10 border-[#81ecff]/20' : 
                    job.status === 'pending' ? 'bg-[#ffca28]/10 border-[#ffca28]/20' : 
                    job.status === 'cancelled' ? 'bg-[#ff6e84]/10 border-[#ff6e84]/20' :
                    'bg-[rgba(190,134,255,0.2)] border-[rgba(190,134,255,0.3)]'
                  }`}>
                    <Text style={{ fontFamily: 'Inter' }} className={`text-[8px] font-bold uppercase tracking-widest px-1 ${
                      job.status === 'completed' ? 'text-[#81ecff]' : 
                      job.status === 'pending' ? 'text-[#ffca28]' : 
                      job.status === 'cancelled' ? 'text-[#ff6e84]' :
                      'text-[#be86ff]'
                    }`}>
                      {job.status?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {allJobs.length === 0 && (
              <View className="p-5 items-center justify-center">
                 <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5]">No recent jobs found.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom padding */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
