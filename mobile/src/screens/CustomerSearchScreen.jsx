import React, { useState, useEffect } from "react";
import { FlatList, TouchableOpacity, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetCustomersQuery, useUpsertCustomerMutation } from "../services/api/customerApi";
import useNetworkStatus from "../hooks/useNetworkStatus";
import * as Contacts from "expo-contacts";

// Gluestack Primitives
import { Box } from "../components/ui/box";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { Input, InputField } from "../components/ui/input";
import { Button, ButtonText } from "../components/ui/button";

export default function CustomerSearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onSelectCustomer } = route.params ?? {};
  const [query, setQuery] = useState("");
  const [deviceContacts, setDeviceContacts] = useState([]);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [upsertCustomer] = useUpsertCustomerMutation();
  const { isConnected } = useNetworkStatus();

  // 1. RTK Query
  const { data: customersResponse } = useGetCustomersQuery({ search: query });
  const localCustomers = customersResponse?.data || [];

  function handleSelect(customer) {
    if (onSelectCustomer) onSelectCustomer(customer);
    navigation.goBack();
  }

  async function selectDeviceContact(contact) {
    if (!contact.phoneNumbers?.length) {
      Alert.alert("No Number", "This contact doesn't have a phone number.");
      return;
    }
    const phone = contact.phoneNumbers[0].number.replace(/[\s\-]/g, "");

    if (isConnected) {
      try {
        const res = await upsertCustomer({ name: contact.name, phone }).unwrap();
        const serverCustomer = res?.data;
        if (onSelectCustomer && serverCustomer) onSelectCustomer(serverCustomer);
        navigation.goBack();
      } catch (_err) {
        Alert.alert("Error", "Failed to sync contact with server.");
      }
    } else {
      Alert.alert("Offline", "You must be online to add a customer.");
    }
  }

  // Auto-search contacts and request permission on mount
  useEffect(() => {
    const requestInitialPermission = async () => {
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== "granted") {
        await Contacts.requestPermissionsAsync();
      }
    };
    requestInitialPermission();

    if (query.length >= 2) {
      Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        name: query
      }).then(({ data }) => {
        setDeviceContacts(data.filter(c => c.phoneNumbers?.length).slice(0, 5));
      }).catch(() => { });
    } else {
      setDeviceContacts([]);
    }
  }, [query]);

  async function handlePickContact() {
    try {
      const { status: currentStatus } = await Contacts.getPermissionsAsync();
      let finalStatus = currentStatus;

      if (currentStatus !== "granted") {
        const { status } = await Contacts.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Permission Needed", "We need access to your contacts to pick customers. Please enable Contact permissions in your phone settings.");
        return;
      }

      try {
        const contact = await Contacts.presentContactPickerAsync();
        if (contact) {
          await selectDeviceContact(contact);
        }
      } catch (pickerError) {
        console.log("System picker failed, fetching manually:", pickerError);
        setIsFetchingAll(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          pageSize: 50,
        });
        setDeviceContacts(data.filter(c => c.phoneNumbers?.length));
        setIsFetchingAll(false);
        if (data.length === 0) {
          Alert.alert("No Contacts", "We couldn't find any contacts on your phone.");
        }
      }
    } catch (error) {
      console.log("Overall contact error:", error);
      Alert.alert("Error", "Access to contacts was denied or failed. Please check your phone settings.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      {/* Header Bar */}
      <View className="w-full flex-row items-center px-4 h-14 border-b border-white/5 bg-[#000000]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 active:scale-95" activeOpacity={0.7}>
          <ArrowLeft color="#81ecff" size={20} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold tracking-tighter text-[#81ecff]">Find or Add Customer</Text>
      </View>

      <Box style={{ flex: 1, backgroundColor: "#0e0e0e" }} className="p-6">
        <Heading size="2xl" className="text-white font-extrabold tracking-tight mb-6 mt-2 opacity-100 shadow-sm shadow-white/20">Find Customer</Heading>

        <Input variant="outline" size="xl" className="border-2 border-white/10 bg-[#1a1919] rounded-2xl mb-4 focus:border-[#81ecff]">
          <InputField
            placeholder="Search name or number..."
            placeholderTextColor="#a3a3a3"
            value={query}
            onChangeText={setQuery}
            autoFocus
            className="text-white font-medium px-4 tracking-wide"
          />
        </Input>

        <Button 
          variant="outline" 
          size="xl" 
          onPress={handlePickContact}
          disabled={isFetchingAll}
          className="border-2 border-[#81ecff]/30 bg-[#81ecff]/5 rounded-2xl mb-6 flex-row justify-center py-3 active:bg-[#81ecff]/20"
        >
          <ButtonText className="text-[#81ecff] font-extrabold tracking-wide">
            {isFetchingAll ? "Loading Contacts..." : "Pick from Contacts"}
          </ButtonText>
        </Button>

        <FlatList
          data={[...localCustomers, ...deviceContacts]}
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => item._id ? handleSelect(item) : selectDeviceContact(item)}>
              <Box className="bg-[#1a1919] rounded-2xl p-5 mb-4 border border-white/10 shadow-lg">
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ fontFamily: 'Inter' }} className="font-extrabold text-white text-base tracking-tight">{item.name}</Text>
                  {!item._id && <Text className="text-[9px] text-[#8B5CF6] font-bold uppercase tracking-widest bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">Phone Contact</Text>}
                </View>
                <Text style={{ fontFamily: 'Space Grotesk' }} className="text-[#81ecff] font-bold tracking-[0.1em]">
                  {item.phone || (item.phoneNumbers?.[0]?.number)}
                </Text>
              </Box>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-[#737373] text-center font-bold tracking-widest uppercase text-[10px] mb-2">No matching customers</Text>
              <Text className="text-[#525252] text-center text-xs px-10">Type a name in the search box to find contacts from your phone.</Text>
            </View>
          }
        />
      </Box>
    </SafeAreaView>
  );
}
