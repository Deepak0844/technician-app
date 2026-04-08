import React from "react";
import { ScrollView, View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, User, Phone, MapPin, Wrench, Clock, FileText, CheckCircle2, MoreVertical, Edit2, ShieldCheck } from "lucide-react-native";
import { useGetJobByIdQuery } from "../services/api/jobApi";
import OfflineBanner from "../components/OfflineBanner";
import { formatCurrency } from "../utils/formatUtils";

export default function JobDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { job: initialJob } = route.params ?? {};

  const { data: jobResponse, isLoading } = useGetJobByIdQuery(initialJob?._id, { skip: !initialJob?._id });
  
  const job = jobResponse?.data || initialJob;

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-[#000000] items-center justify-center">
        <Text className="text-[#ffffff]">No job data provided.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#000000] items-center justify-center">
        <ActivityIndicator color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  const isCompleted = job.status === "completed";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <OfflineBanner />
      
      {/* Top Header */}
      <LinearGradient 
        colors={['rgba(0,0,0,0.95)', 'rgba(14,14,14,0.95)']} 
        className="w-full flex-row items-center justify-between px-4 h-14 z-50 border-b border-white/5"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 active:scale-95" activeOpacity={0.7}>
          <ArrowLeft color="#8B5CF6" size={20} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold tracking-tighter text-[#8B5CF6]">Job Details</Text>
        <TouchableOpacity className="p-2 active:scale-95" activeOpacity={0.7}>
          <MoreVertical color="#8B5CF6" size={20} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Job Header Card */}
        <View className="bg-[#1a1919]/40 rounded-3xl p-6 border border-white/10 mb-6 overflow-hidden relative">
          <View className="absolute -top-12 -right-12 w-32 h-32 bg-[#c899ff]/10 rounded-full" />
          
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#81ecff] text-[10px] font-bold uppercase tracking-widest mb-1">
                Job ID: #{job?._id ? job._id.slice(-6).toUpperCase() : "..."}
              </Text>
              <Text style={{ fontFamily: 'Space Grotesk' }} className="text-2xl font-bold text-[#ffffff]">{job?.applianceType || "General Service"}</Text>
            </View>
            <View className="flex-row items-center gap-2">
               <View className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
               <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                 {job?.status || "Pending"}
               </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mb-2">
            <Clock color="#a3a3a3" size={14} />
            <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-xs">
              {job?.serviceDate ? new Date(job.serviceDate).toLocaleString() : "Date not set"}
            </Text>
          </View>

          <View className="h-[1px] bg-white/5 w-full my-4" />

          <View className="flex-row justify-between items-center">
             <View>
               <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-[10px] uppercase tracking-widest mb-1">Amount</Text>
               <Text style={{ fontFamily: 'Space Grotesk' }} className="text-xl font-bold text-[#c899ff]">{formatCurrency(job?.amount)}</Text>
             </View>
          </View>
        </View>

        {/* Customer Details Section */}
        <View className="mb-6">
           <Text style={{ fontFamily: 'Space Grotesk' }} className="text-sm font-bold text-[#ffffff] mb-4 tracking-tight">Customer Details</Text>
            <TouchableOpacity 
              onPress={() => {
                const customerId = job?.customerId?._id || job?.customerId;
                if (customerId) {
                  navigation.navigate("CustomerDetails", { customerId });
                }
              }}
              activeOpacity={0.7}
              className="bg-[#1a1919]/40 rounded-2xl p-5 border border-white/5"
            >
               <View className="flex-row items-center gap-4 mb-4">
                  <View className="w-10 h-10 rounded-full bg-[#c899ff]/10 items-center justify-center border border-[#c899ff]/20">
                     <User color="#c899ff" size={20} />
                  </View>
                  <View>
                     <Text style={{ fontFamily: 'Inter' }} className="text-[#ffffff] font-bold text-sm">
                       {job?.customerId?.name || job?.customerName || "Unknown Customer"}
                     </Text>
                     <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-xs">Regular Client</Text>
                  </View>
               </View>

              <TouchableOpacity className="flex-row items-center gap-3 mb-4">
                 <Phone color="#81ecff" size={16} />
                  <Text style={{ fontFamily: 'Inter' }} className="text-[#e5e5e5] text-sm">
                    {job?.customerId?.phone || job?.customerPhone || "N/A"}
                  </Text>
              </TouchableOpacity>

              <View className="flex-row items-start gap-3">
                 <MapPin color="#a3a3a3" size={16} className="mt-0.5" />
                 <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-sm flex-1 leading-5">
                    Job Location Details will appear here. No address stored for this job locally.
                 </Text>
              </View>
            </TouchableOpacity>
        </View>

        {/* Job Details Section */}
        <View className="mb-6">
           <Text style={{ fontFamily: 'Space Grotesk' }} className="text-sm font-bold text-[#ffffff] mb-4 tracking-tight">Job Details</Text>
           <View className="bg-[#1a1919]/40 rounded-2xl p-5 border border-white/5">
              <View className="flex-row items-start gap-4 mb-6">
                 <View className="w-10 h-10 rounded-full bg-[#81ecff]/10 items-center justify-center border border-[#81ecff]/20">
                    <Wrench color="#81ecff" size={20} />
                 </View>
                 <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-[10px] uppercase tracking-widest mb-1">Issue</Text>
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#ffffff] text-sm leading-6">{job?.issue || "None specified"}</Text>
                 </View>
              </View>

              <View className="flex-row items-start gap-4">
                 <View className="w-10 h-10 rounded-full bg-[#10b981]/10 items-center justify-center border border-[#10b981]/20">
                    <CheckCircle2 color="#10b981" size={20} />
                 </View>
                 <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-[10px] uppercase tracking-widest mb-1">Resolution</Text>
                    <Text style={{ fontFamily: 'Inter' }} className="text-[#ffffff] text-sm leading-6">{job?.serviceDone || "No resolution details provided yet."}</Text>
                 </View>
              </View>

              <View className="flex-row items-start gap-4 mt-6">
                <View className="w-10 h-10 rounded-full bg-[#81ecff]/10 items-center justify-center border border-[#81ecff]/20">
                  <ShieldCheck color="#81ecff" size={20} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-[10px] uppercase tracking-widest mb-1">Warranty</Text>
                  <Text style={{ fontFamily: 'Inter' }} className="text-[#ffffff] text-sm leading-6">{job?.warranty || "No warranty specified."}</Text>
                </View>
              </View>
            </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-4">
           <TouchableOpacity 
             onPress={() => navigation.navigate("InvoicePreview", { job })}
             activeOpacity={0.8}
             className="flex-1 rounded-xl overflow-hidden"
             style={{ shadowColor: '#c899ff', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } }}
           >
              <LinearGradient 
                colors={['#c899ff', '#9c3dff']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
                className="flex-1 flex-row items-center justify-center gap-2 py-4"
              >
                <FileText color="#ffffff" size={20} />
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#ffffff] font-bold uppercase tracking-widest text-xs">View Invoice</Text>
              </LinearGradient>
           </TouchableOpacity>

           <TouchableOpacity 
             onPress={() => navigation.navigate("AddJob", { job })}
             activeOpacity={0.7}
             className="bg-[#1a1919] border border-white/10 h-14 px-6 rounded-xl items-center justify-center flex-row gap-2"
           >
             <Edit2 color="#81ecff" size={20} />
             <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#81ecff] font-bold uppercase tracking-widest text-xs text-center">Edit</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
