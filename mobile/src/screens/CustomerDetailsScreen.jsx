import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

// Services
import { useGetCustomerByIdQuery } from "../services/api/customerApi";
import { useGetJobsByCustomerQuery } from "../services/api/jobApi";

// Gluestack Primitives
import { Text } from "../components/ui/text";

// Icons
import { ArrowLeft, MoreVertical, Phone, CalendarPlus, CheckCircle2, MapPin, Wrench, User } from "lucide-react-native";

export default function CustomerDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerId } = route.params;

  // RTK Query
  const { data: custResponse, isLoading: loadingCustomerApi, refetch: refetchCustomer } = useGetCustomerByIdQuery(customerId, { skip: !customerId });
  const { data: jobsResponse, isLoading: loadingJobsApi, refetch: refetchJobs } = useGetJobsByCustomerQuery(customerId, { skip: !customerId });
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCustomer(), refetchJobs()]);
    setRefreshing(false);
  }, [refetchCustomer, refetchJobs]);
  
  const rawCustomer = custResponse?.data;
  const customer = rawCustomer?.data ? rawCustomer.data : (rawCustomer || {});

  const rawJobs = jobsResponse?.data;
  let jobs = [];
  if (Array.isArray(rawJobs)) {
    jobs = rawJobs;
  } else if (rawJobs && Array.isArray(rawJobs.data)) {
    jobs = rawJobs.data;
  }
  
  const isLoading = loadingCustomerApi || loadingJobsApi;

  if (isLoading && !customer.name) {
    return (
      <View className="flex-1 bg-[#000000] items-center justify-center">
        <ActivityIndicator size="large" color="#c899ff" />
      </View>
    );
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      {/* TopAppBar - Kinetic Background Shift */}
      <View className="w-full z-50 bg-[#0e0e0e] flex-row items-center justify-between px-4 h-14">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full active:scale-95 duration-200" activeOpacity={0.7}>
            <ArrowLeft color="#c899ff" size={24} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Space Grotesk' }} className="font-bold text-sm text-[#ffffff] tracking-tight uppercase">Customer Profile</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-full active:scale-95 duration-200" activeOpacity={0.7}>
          <MoreVertical color="#adaaaa" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-4 max-w-2xl mx-auto w-full" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c899ff" colors={["#c899ff"]} />
        }
      >
        
        {/* Profile Section - Glassmorphism & Depth */}
        <View className="relative mb-8 w-full">
          <View className="bg-[#1a1919] p-5 rounded-[24px] relative overflow-hidden flex-col items-center gap-5" style={{ shadowColor: '#6d31a3', shadowOpacity: 0.08, shadowRadius: 40, shadowOffset: {width:0, height:20} }}>
            
            {/* Background Kinetic Accents */}
            <View className="absolute -top-20 -right-20 w-48 h-48 bg-[#c899ff]/10 rounded-full" />
            <View className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#6d31a3]/20 rounded-full" />
            
            <View className="flex-col items-center gap-4 relative z-10 w-full">
              {/* Profile Orb */}
              <View className="relative">
                <View className="w-20 h-20 rounded-full overflow-hidden border border-[#c899ff]/15 p-0.5 bg-[#131313] justify-center items-center">
                   {customer.imageUrl ? (
                     <Image source={{ uri: customer.imageUrl }} className="w-full h-full object-cover rounded-full" />
                   ) : (
                     <View className="w-full h-full bg-[#1a1919] rounded-full items-center justify-center">
                       <User color="#c899ff" size={32} />
                     </View>
                   )}
                </View>
                <View className="absolute bottom-0 right-0 bg-[#81ecff] p-1.5 rounded-full" style={{ shadowColor: '#00d4ec', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: {width:0,height:2}}}>
                  <CheckCircle2 color="#000000" size={12} />
                </View>
              </View>

              {/* Data Display */}
              <View className="flex-1 items-center w-full">
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-lg font-bold tracking-tight text-[#ffffff] mb-1 text-center">{customer.name || "Unknown Customer"}</Text>
                
                <View className="flex-row items-center justify-center gap-2 mb-2 w-full">
                  <Phone color="#81ecff" size={14} />
                  <Text style={{ fontFamily: 'Inter' }} className="text-[#adaaaa] text-sm">{customer.phone || "No phone provided"}</Text>
                </View>

                {!!customer.address && (
                   <View className="flex-row items-center justify-center gap-2 mb-3 w-full px-2">
                      <MapPin color="#adaaaa" size={14} />
                      <Text style={{ fontFamily: 'Inter' }} className="text-[#adaaaa] text-xs text-center leading-relaxed">{customer.address}</Text>
                   </View>
                )}

                {/* Status Badges - Rounded Full */}
                <View className="flex-row flex-wrap items-center justify-center gap-3 w-full">
                  <View className="bg-[#c899ff]/10 px-4 py-1 rounded-full flex-row items-center gap-2">
                    <Text style={{ fontFamily: 'Space Grotesk' }} className="font-bold text-[#c899ff] text-sm">{jobs.length}</Text>
                    <Text style={{ fontFamily: 'Inter' }} className="text-[9px] uppercase font-bold tracking-widest text-[#c899ff]/70">Jobs</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Matrix */}
            <View className="mt-2 flex-row w-full relative z-10 mx-auto">
              <TouchableOpacity 
                onPress={() => navigation.navigate("AddJob", { customer })}
                activeOpacity={0.8} 
                className="flex-1 rounded-[12px] overflow-hidden" 
                style={{ shadowColor: '#c899ff', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: {width:0, height:4}}}
              >
                <LinearGradient 
                  colors={['#c899ff', '#9c3dff']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }} 
                  className="flex-1 flex-row items-center justify-center gap-2 py-3 px-4"
                >
                  <CalendarPlus color="#000000" size={18} />
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#000000] font-bold tracking-widest uppercase text-xs">Add Job</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* Job History */}
        <View className="mb-10 w-full">
          <View className="flex-row items-center justify-between mb-6 px-2">
            <View className="flex-row items-center gap-3">
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-sm font-bold text-[#ffffff] uppercase tracking-widest">Job History</Text>
              <View className="w-2 h-2 rounded-full bg-[#81ecff]" style={{ shadowColor:'#81ecff', shadowOpacity:0.8, shadowRadius:12, shadowOffset:{width:0, height:0} }} />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: "JobHistory", params: { customerId } })} activeOpacity={0.7}>
              <Text style={{ fontFamily: 'Inter' }} className="text-[#c899ff] tracking-[0.2em] font-bold uppercase text-[10px]">View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading && jobs.length === 0 ? (
            <ActivityIndicator size="small" color="#00E5FF" className="mt-4" />
          ) : jobs.length === 0 ? (
            <View className="bg-[#131313] p-8 rounded-[24px] border border-dashed border-[#c899ff]/20 items-center justify-center">
              <View className="w-16 h-16 bg-[#c899ff]/10 rounded-full items-center justify-center mb-4">
                <CalendarPlus color="#c899ff" size={32} />
              </View>
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#ffffff] font-bold text-lg mb-2 text-center">No Jobs Found</Text>
              <Text style={{ fontFamily: 'Inter' }} className="text-[#adaaaa] text-sm text-center mb-6 px-4">This customer does not have any jobs yet.</Text>
              
              <TouchableOpacity 
                onPress={() => navigation.navigate("AddJob", { customer })}
                activeOpacity={0.7}
                className="bg-[#c899ff]/10 px-6 py-3 rounded-xl border border-[#c899ff]/20"
              >
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#c899ff] font-bold text-xs uppercase tracking-widest">Create First Job</Text>
              </TouchableOpacity>
            </View>

          ) : (
            <View className="flex-col w-full">
              {jobs.map((job) => {
                 const isCompleted = job.status === "completed";
                 
                 // Determine colors dynamically
                 const colorHex = isCompleted ? '#c899ff' : '#81ecff';
                 const bgClass = isCompleted ? 'bg-[#c899ff]/10' : 'bg-[#81ecff]/10';

                 return (
                  <TouchableOpacity 
                    key={job._id || Math.random().toString()} 
                    onPress={() => navigation.navigate("JobDetails", { job })}
                    activeOpacity={0.7} 
                    className="p-4 rounded-[20px] flex-row items-center justify-between bg-[#131313] mb-3 border border-white/5"
                    style={{ opacity: isCompleted ? 0.7 : 1 }}
                  >
                    <View className="flex-row items-center gap-4 flex-1">
                      <View className={`w-12 h-12 rounded-xl items-center justify-center ${bgClass}`}>
                         <Wrench color={colorHex} size={20} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Space Grotesk' }} className="font-bold text-[#ffffff] text-base" numberOfLines={1}>{job?.applianceType || "General Service"}</Text>
                        <Text style={{ fontFamily: 'Inter' }} className="text-xs text-[#adaaaa] mt-1" numberOfLines={1}>{formatDate(job?.serviceDate)} • #{job?._id ? job._id.substring(0,6).toUpperCase() : "..."}</Text>
                      </View>
                    </View>
                    
                    <View className="items-end gap-1.5 ml-2">
                      <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#ffffff] text-base font-bold">₹{job.amount || '0.00'}</Text>
                      <View className={`px-2 py-0.5 rounded border border-[#ffffff]/10 ${bgClass}`}>
                        <Text style={{ fontFamily: 'Inter', color: colorHex }} className="text-[9px] font-bold uppercase tracking-widest">{job.status}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                 );
              })}
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
