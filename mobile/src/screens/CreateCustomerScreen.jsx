import React, { useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Contacts from "expo-contacts";
import { ArrowLeft, User, Phone, Mail, MapPin, Zap, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Custom
import useTheme from "@hooks/useTheme";
import { Text } from "@components/ui/text";
import { useUpsertCustomerMutation, useUpdateCustomerMutation } from "@services/api/customerApi";
import useNetworkStatus from "@hooks/useNetworkStatus";
import LocationFormSection from "@components/LocationFormSection";

/** Generates a stable-enough local ID for new locations before server assignment. */
function generateLocalId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Builds a fresh blank location entry. */
function makeBlankLocation(index) {
  return {
    id: generateLocalId(),
    label: index === 0 ? "Primary" : `Site ${index + 1}`,
    address: "",
    latitude: null,
    longitude: null,
    isDefault: index === 0,
  };
}

export default function CreateCustomerScreen({ route }) {
  const navigation = useNavigation();
  const { onSelectCustomer, customer: editingCustomer } = route.params ?? {};
  const { colors } = useTheme();
  const { isConnected } = useNetworkStatus();
  const isEditing = !!editingCustomer;

  const [name, setName] = useState(editingCustomer?.name ?? "");
  const [phone, setPhone] = useState(editingCustomer?.phone ?? "");
  const [email, setEmail] = useState(editingCustomer?.email ?? "");
  const [focusedField, setFocusedField] = useState(null);

  // Locations — guard against old customers with no locations array
  const [locations, setLocations] = useState(() => {
    if (editingCustomer?.locations?.length > 0) {
      return editingCustomer.locations.map((loc) => ({ ...loc, id: generateLocalId() }));
    }
    // Old record: may have a top-level address string but no locations array
    return [
      {
        id: generateLocalId(),
        label: "Primary",
        address: editingCustomer?.address?.trim() ?? "",
        latitude: editingCustomer?.latitude ?? null,
        longitude: editingCustomer?.longitude ?? null,
        isDefault: true,
      },
    ];
  });

  const [saveToPhone, setSaveToPhone] = useState(false);

  const [upsertCustomer, { isLoading: isCreating }] = useUpsertCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const isLoading = isCreating || isUpdating;

  // -- Location helpers --

  function updateLocation(id, updates) {
    setLocations((prev) => prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc)));
  }

  function addLocation() {
    setLocations((prev) => [...prev, makeBlankLocation(prev.length)]);
  }

  function removeLocation(id) {
    if (locations.length <= 1) return;
    setLocations((prev) => {
      const filtered = prev.filter((loc) => loc.id !== id);
      // If the removed location was the default, promote the first remaining one
      const hasDefault = filtered.some((l) => l.isDefault);
      if (!hasDefault && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  }

  // -- Submit --

  async function handleAction() {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }
    if (!isConnected) {
      Alert.alert("Offline", "You must be online to update customers.");
      return;
    }

    // Strip the local React `id` key and skip entries with no address
    const sanitizedLocations = locations
      .map(({ id, ...rest }) => rest)
      .filter((loc) => loc.address?.trim());

    if (sanitizedLocations.length === 0) {
      Alert.alert("Error", "At least one location with an address is required.");
      return;
    }

    try {
      let res;
      if (isEditing) {
        res = await updateCustomer({
          id: editingCustomer._id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          locations: sanitizedLocations,
        }).unwrap();
      } else {
        res = await upsertCustomer({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          locations: sanitizedLocations,
        }).unwrap();
      }

      const serverCustomer = res?.data;

      if (saveToPhone) {
        try {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === "granted") {
            const primaryLocation = locations.find((l) => l.isDefault) || locations[0];
            await Contacts.addContactAsync({
              [Contacts.Fields.FirstName]: name.trim(),
              [Contacts.Fields.PhoneNumbers]: [{ number: phone.trim(), label: "mobile" }],
              [Contacts.Fields.Emails]: email.trim() ? [{ email: email.trim(), label: "work" }] : [],
              [Contacts.Fields.Addresses]: primaryLocation?.address
                ? [{ street: primaryLocation.address, label: "work" }]
                : [],
            });
          }
        } catch {
          // Silently ignore — contact save is a non-critical convenience feature
        }
      }

      Alert.alert("Success", `Customer ${isEditing ? "updated" : "created"} successfully!`);
      if (onSelectCustomer && serverCustomer) {
        onSelectCustomer(serverCustomer);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || `Failed to ${isEditing ? "update" : "create"} customer.`);
    }
  }

  // -- Render helpers --

  function renderInput(label, value, onChangeText, icon, placeholder, fieldKey, keyboardType = "default") {
    const isFocused = focusedField === fieldKey;
    return (
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>
          {label}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 56, borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: isFocused ? colors.primary : colors.border }}>
          {icon}
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.placeholderText}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocusedField(fieldKey)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            style={{ flex: 1, marginLeft: 12, fontFamily: "Inter", color: colors.textPrimary, fontSize: 14 }}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      {/* Header */}
      <View style={{ width: "100%", flexDirection: "row", alignItems: "center", paddingHorizontal: 24, height: 56, backgroundColor: colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, fontFamily: "Space Grotesk", textTransform: "uppercase", letterSpacing: 2, fontSize: 12, color: colors.primary, fontWeight: "700" }}>
          {isEditing ? "Edit" : "New"} Customer
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {renderInput("Customer Name", name, setName, <User size={18} color={colors.secondary} />, "Full Name", "name")}
        {renderInput("Phone Number", phone, setPhone, <Phone size={18} color={colors.secondary} />, "+91 00000 00000", "phone", "phone-pad")}
        {renderInput("Email Address", email, setEmail, <Mail size={18} color={colors.secondary} />, "customer@example.com", "email", "email-address")}

        {/* Locations Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ fontFamily: "Space Grotesk", color: colors.textDisabled, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 4, marginLeft: 4 }}>
              Service Locations
            </Text>
            <TouchableOpacity
              onPress={addLocation}
              style={{ backgroundColor: colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={{ fontFamily: "Inter", color: colors.primary, fontSize: 10, fontWeight: "700" }}>ADD NEW</Text>
            </TouchableOpacity>
          </View>

          {locations.map((loc) => (
            <LocationFormSection
              key={loc.id}
              location={loc}
              onUpdate={(updates) => updateLocation(loc.id, updates)}
              onRemove={() => removeLocation(loc.id)}
              showRemove={locations.length > 1}
            />
          ))}
        </View>

        {/* Save to Contacts toggle — create mode only */}
        {!isEditing && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.bgCard, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter", color: colors.textPrimary, fontWeight: "700", fontSize: 13, marginBottom: 4 }}>Save to Contacts</Text>
              <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 10 }}>Add this customer to your phone's address book</Text>
            </View>
            <Switch
              value={saveToPhone}
              onValueChange={setSaveToPhone}
              trackColor={{ false: colors.bgSurface, true: colors.primary }}
              thumbColor={saveToPhone ? "#fff" : colors.textMuted}
            />
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity onPress={handleAction} disabled={isLoading} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 60, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontFamily: "Space Grotesk", color: "#fff", fontWeight: "900", textTransform: "uppercase", letterSpacing: 4, fontSize: 12 }}>
                  {isEditing ? "Save Changes" : "Create Customer"}
                </Text>
                <Zap size={16} color="#fff" style={{ marginLeft: 12 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
