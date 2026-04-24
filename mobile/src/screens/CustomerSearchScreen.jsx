import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  useGetCustomersQuery,
  useUpsertCustomerMutation,
} from "@services/api/customerApi";
import { RouteNames } from "@constants/routeNames";
import useTheme from "@hooks/useTheme";

// Gluestack Primitives
import { Box } from "@components/ui/box";
import { Heading } from "@components/ui/heading";
import { Text } from "@components/ui/text";
import { Input, InputField } from "@components/ui/input";
import { Button, ButtonText } from "@components/ui/button";

// Icons
import { ArrowLeft } from "lucide-react-native";

export default function CustomerSearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { onSelectCustomer } = route.params ?? {};
  const [query, setQuery] = useState("");
  const [deviceContacts, setDeviceContacts] = useState([]);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [upsertCustomer] = useUpsertCustomerMutation();

  // 1. RTK Query
  const { data: customersResponse } = useGetCustomersQuery({ q: query });
  const localCustomers = customersResponse?.data || [];

  function handleSelect(customer) {
    if (route.params?.fromScreen) {
      if (route.params?.fromScreenIsTab) {
        // AddJobScreen was the active Tab screen — navigate to TABS so we don't
        // push a duplicate Stack-level AddJobScreen on top of this screen.
        navigation.navigate(RouteNames.TABS, {
          screen: route.params.fromScreen,
          params: { selectedCustomer: customer },
        });
      } else {
        navigation.navigate(route.params.fromScreen, {
          selectedCustomer: customer,
        });
      }
    } else {
      if (onSelectCustomer) onSelectCustomer(customer);
      navigation.goBack();
    }
  }

  async function selectDeviceContact(contact) {
    if (!contact.phoneNumbers?.length) {
      Alert.alert("No Number", "This contact doesn't have a phone number.");
      return;
    }
    const rawPhone = contact.phoneNumbers[0].number;
    const phone = rawPhone
      .replace(/[^\d+]/g, "")
      .replace(/\+/g, (m, offset) => (offset === 0 ? m : ""));

    if (phone.replace("+", "").length < 7) {
      Alert.alert(
        "Invalid Number",
        `The phone number "${rawPhone}" could not be cleaned to a valid format. Please edit the contact first.`,
      );
      return;
    }

    setIsSyncing(true);
    try {
      const res = await upsertCustomer({
        name: contact.name,
        phone,
      }).unwrap();
      const serverCustomer = res?.data;
      if (route.params?.fromScreen) {
        if (route.params?.fromScreenIsTab) {
          navigation.navigate(RouteNames.TABS, {
            screen: route.params.fromScreen,
            params: { selectedCustomer: serverCustomer },
          });
        } else {
          navigation.navigate(route.params.fromScreen, {
            selectedCustomer: serverCustomer,
          });
        }
      } else {
        if (onSelectCustomer && serverCustomer)
          onSelectCustomer(serverCustomer);
        navigation.goBack();
      }
    } catch (err) {
      setIsSyncing(false);
      const message =
        err?.data?.message ||
        err?.data?.error ||
        "Failed to sync contact with server.";
      Alert.alert("Sync Failed", message);
    }
  }

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
        name: query,
      })
        .then(({ data }) => {
          setDeviceContacts(
            data.filter((c) => c.phoneNumbers?.length).slice(0, 5),
          );
        })
        .catch(() => {});
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
        Alert.alert(
          "Permission Needed",
          "We need access to your contacts to pick customers. Please enable Contact permissions in your phone settings.",
        );
        return;
      }

      try {
        const contact = await Contacts.presentContactPickerAsync();
        if (contact) {
          await selectDeviceContact(contact);
        }
      } catch {
        setIsFetchingAll(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          pageSize: 50,
        });
        setDeviceContacts(data.filter((c) => c.phoneNumbers?.length));
        setIsFetchingAll(false);
        if (data.length === 0) {
          Alert.alert(
            "No Contacts",
            "We couldn't find any contacts on your phone.",
          );
        }
      }
    } catch {
      Alert.alert(
        "Error",
        "Access to contacts was denied or failed. Please check your phone settings.",
      );
    }
  }

  return (
    <>
      {/* Syncing overlay */}
      <Modal
        visible={isSyncing}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
              gap: 16,
              minWidth: 180,
            }}
          >
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text
              style={{
                fontFamily: "Inter",
                fontWeight: "700",
                color: colors.textPrimary,
                fontSize: 14,
              }}
            >
              Saving contact...
            </Text>
          </View>
        </View>
      </Modal>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        edges={["top"]}
      >
        {/* Header Bar */}
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            height: 64,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.bgPrimary,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, marginRight: 8 }}
            activeOpacity={0.7}
          >
            <ArrowLeft color={colors.secondary} size={20} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: "700",
              color: colors.secondary,
              flex: 1,
            }}
          >
            Find or Add Customer
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(RouteNames.CREATE_CUSTOMER, {
                onSelectCustomer,
              })
            }
            style={{
              backgroundColor: colors.secondaryBg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.secondaryBorder,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                color: colors.secondary,
                fontSize: 10,
                fontWeight: "800",
                textTransform: "uppercase",
              }}
            >
              Manual
            </Text>
          </TouchableOpacity>
        </View>

        <Box
          style={{ flex: 1, backgroundColor: colors.bgSecondary, padding: 24 }}
        >
          <Heading
            size="2xl"
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: "800",
              color: colors.textPrimary,
              marginBottom: 24,
              marginTop: 8,
            }}
          >
            Find Customer
          </Heading>

          <Input
            variant="outline"
            size="xl"
            style={{
              borderWidth: 2,
              borderColor: colors.borderInput,
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <InputField
              placeholder="Search name or number..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={{
                color: colors.textPrimary,
                fontFamily: "Inter",
                paddingHorizontal: 16,
              }}
            />
          </Input>

          <Button
            variant="outline"
            onPress={handlePickContact}
            disabled={isFetchingAll || isSyncing}
            style={{
              borderWidth: 2,
              borderColor: colors.secondaryBorder,
              backgroundColor: colors.secondaryBg,
              borderRadius: 16,
              marginBottom: 24,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ButtonText
              style={{
                fontFamily: "Inter",
                fontWeight: "800",
                color: colors.secondary,
                textAlignVertical: "center",
              }}
            >
              {isFetchingAll ? "Loading Contacts..." : "Pick from Contacts"}
            </ButtonText>
          </Button>

          <FlatList
            data={[...localCustomers, ...deviceContacts]}
            keyExtractor={(item) => item._id || item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  item._id ? handleSelect(item) : selectDeviceContact(item)
                }
              >
                <Box
                  style={{
                    backgroundColor: colors.bgCard,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontWeight: "800",
                        fontSize: 16,
                        color: colors.textPrimary,
                      }}
                    >
                      {item.name}
                    </Text>
                    {!item._id && (
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          color: colors.indigo,
                          backgroundColor: colors.primaryBg,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                        }}
                      >
                        Phone Contact
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontWeight: "700",
                      color: colors.secondary,
                      letterSpacing: 1,
                    }}
                  >
                    {item.phone || item.phoneNumbers?.[0]?.number}
                  </Text>
                </Box>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    textAlign: "center",
                    fontWeight: "700",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    fontSize: 10,
                    marginBottom: 8,
                  }}
                >
                  No matching customers
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textFaint,
                    textAlign: "center",
                    fontSize: 12,
                    paddingHorizontal: 40,
                  }}
                >
                  Type a name in the search box to find contacts from your
                  phone.
                </Text>
              </View>
            }
          />
        </Box>
      </SafeAreaView>
    </>
  );
}
