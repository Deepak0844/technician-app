import React, { useState } from "react";
import { FlatList, TouchableOpacity, View, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, UserPlus, Phone, MapPin, ChevronRight, User } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useGetCustomersQuery } from "../services/api/customerApi";
import { LinearGradient } from "expo-linear-gradient";

// Gluestack Primitives
import { Box } from "../components/ui/box";
import { Text } from "../components/ui/text";
import { Input, InputField } from "../components/ui/input";

export default function CustomerListScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  
  // RTK Query
  const { data: customersResponse, isLoading } = useGetCustomersQuery({ search: query });
  const customers = customersResponse?.data || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      {/* Top Header */}
      <LinearGradient 
        colors={['rgba(0,0,0,0.95)', 'rgba(14,14,14,0.95)']} 
        className="w-full flex-row items-center justify-between px-4 h-14 z-50 border-b border-white/5"
      >
        <View className="flex-row items-center gap-2">
           <User color="#8B5CF6" size={20} />
           <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold tracking-tighter text-[#8B5CF6]">Customers</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => navigation.navigate("CustomerSearch")}
            className="p-2 active:scale-95" 
            activeOpacity={0.7}
          >
            <UserPlus color="#81ecff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.7} 
            className="active:scale-95"
          >
             <View className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)] overflow-hidden bg-[#1a1919]">
                <Image 
                  source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn" }} 
                  className="w-full h-full object-cover" 
                />
             </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Box className="flex-1 px-4 py-4">
        {/* Search Bar */}
        <Input variant="outline" size="xl" className="border-2 border-white/10 bg-[#1a1919] rounded-2xl mb-6 focus:border-[#81ecff]">
          <View className="pl-4 justify-center">
            <Search color="#a3a3a3" size={18} />
          </View>
          <InputField
            placeholder="Search name or phone..."
            placeholderTextColor="#737373"
            value={query}
            onChangeText={setQuery}
            className="text-white font-medium px-2 tracking-wide"
          />
        </Input>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#8B5CF6" />
          </View>
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => navigation.navigate("CustomerDetails", { customerId: item._id })}
                activeOpacity={0.7}
                className="bg-[rgba(26,25,25,0.4)] p-5 rounded-2xl border border-white/5 mb-4 flex-row items-center"
              >
                {/* Avatar/Icon Area */}
                <View className="w-12 h-12 rounded-full bg-[#c899ff]/10 items-center justify-center border border-[#c899ff]/20 mr-4">
                  <User color="#c899ff" size={22} />
                </View>

                {/* Info Area */}
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#ffffff] font-bold text-base tracking-tight mb-1">
                    {item.name}
                  </Text>
                  
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <Phone color="#a3a3a3" size={12} />
                      <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-xs">
                        {item.phone}
                      </Text>
                    </View>
                    {item.address && (
                      <View className="flex-row items-center gap-1 flex-1">
                        <MapPin color="#a3a3a3" size={12} />
                        <Text style={{ fontFamily: 'Inter' }} className="text-[#a3a3a3] text-xs" numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Arrow */}
                <ChevronRight color="#404040" size={20} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Text style={{ fontFamily: 'Inter' }} className="text-[#737373] text-center font-bold tracking-widest uppercase text-[10px] mb-2">No customers found</Text>
                <Text style={{ fontFamily: 'Inter' }} className="text-[#525252] text-center text-xs px-10">Use the &apos;+&apos; icon above to add a new customer from your phone contacts.</Text>
              </View>
            }
          />
        )}
      </Box>
    </SafeAreaView>
  );
}
