import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { FlatList, View , TouchableOpacity, RefreshControl, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Search } from "lucide-react-native";
import { useGetJobsQuery } from "../services/api/jobApi";
import OfflineBanner from "../components/OfflineBanner";
import { formatCurrency } from "../utils/formatUtils";

// Gluestack Primitives
import { Box } from "../components/ui/box";
import { HStack } from "../components/ui/hstack";
import { Text } from "../components/ui/text";
import { Input, InputField } from "../components/ui/input";

export default function JobHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [search, setSearch] = useState("");

  const { data: jobsResponse, isLoading: loadingJobs, refetch } = useGetJobsQuery({ 
    search, 
    customerId: route.params?.customerId 
  });
  
  const onRefresh = React.useCallback(async () => {
    refetch();
  }, [refetch]);

  const allJobs = jobsResponse?.data || [];
  const filtered = allJobs; // Search is handled by API params in this refactor, or client-side if needed.

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
    <Box className="flex-1 bg-[#000000]">
       <OfflineBanner />
       
       {/* TopAppBar - Added for consistency and to reduce empty space */}
        <LinearGradient 
          colors={['rgba(0,0,0,0.95)', 'rgba(14,14,14,0.95)']} 
          className="w-full flex-row items-center justify-between px-4 h-14 z-50 border-b border-white/5"
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 active:scale-95" activeOpacity={0.7}>
              <ArrowLeft color="#8B5CF6" size={20} />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold tracking-tighter text-[#8B5CF6]">
              {route.params?.customerId ? "Customer History" : "Job History"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.7} className="active:scale-95">
             <View className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)] overflow-hidden bg-[#1a1919]">
                <Image 
                  source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn" }} 
                  className="w-full h-full object-cover" 
                />
             </View>
          </TouchableOpacity>
        </LinearGradient>

       <Box className="flex-1 p-4 pb-0">
         <View className="mb-4">
            <Text style={{ fontFamily: 'Space Grotesk' }} className="text-2xl font-bold tracking-tight text-[#ffffff]">
              {route.params?.customerId ? "Service History" : "History"}
            </Text>
         </View>
        
        {/* Search Input matched to AddJob style */}
        <View className="flex-row items-center px-4 h-14 rounded-xl border-2 border-[rgba(255,255,255,0.1)] bg-[#131313] focus-within:border-[#81ecff] transition-colors duration-300 mb-6">
          <Search color="#e5e5e5" size={20} className="mr-3" />
          <Input variant="unstyled" className="flex-1 h-full">
            <InputField 
              placeholder="Search specific jobs..." 
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={search} 
              onChangeText={setSearch} 
              className="text-sm font-body text-[#ffffff] pb-1 w-full h-full bg-transparent border-0"
            />
          </Input>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          refreshControl={
            <RefreshControl refreshing={loadingJobs} onRefresh={onRefresh} tintColor="#8B5CF6" colors={["#8B5CF6"]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("JobDetails", { job: item })}>
              <Box 
                className="bg-[rgba(26,25,25,0.4)] rounded-xl p-4 mb-4 overflow-hidden"
                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderLeftWidth: 4, borderLeftColor: item.status === 'completed' ? '#81ecff' : '#ff6e84' }}
              >
                <HStack className="justify-between items-center mb-3">
                  <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold text-[#ffffff] tracking-wide" numberOfLines={1}>
                    {item.customerId?.name || item.customerName || "Customer"}
                  </Text>
                  <HStack space="sm" className="items-center">
                    <Text style={{ fontFamily: 'Space Grotesk' }} className={`text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'completed' ? 'text-[#81ecff]' : 
                      item.status === 'pending' ? 'text-[#ffca28]' : 
                      item.status === 'cancelled' ? 'text-[#ff6e84]' :
                      'text-[#be86ff]'
                    }`}>
                      {item.status?.replace('_', ' ')}
                    </Text>
                  </HStack>
                </HStack>
                
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-sm text-[#c899ff] font-bold tracking-wide mb-4">
                  {item.applianceType}
                  {item.issue ? <Text style={{ fontFamily: 'Inter' }} className="text-xs text-[#a3a3a3] font-medium"> • {item.issue}</Text> : null}
                </Text>
                
                <HStack className="justify-between items-center">
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-base font-bold text-[#ffffff]">{formatCurrency(item.amount)}</Text>
                  <Text style={{ fontFamily: 'Inter' }} className="text-[10px] text-[#e5e5e5] uppercase tracking-widest">#{item._id.substring(0,6).toUpperCase()}</Text>
                </HStack>
              </Box>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-center font-bold mt-10 tracking-widest uppercase text-xs">No jobs found</Text>}
        />
      </Box>
    </Box>
    </SafeAreaView>
  );
}
