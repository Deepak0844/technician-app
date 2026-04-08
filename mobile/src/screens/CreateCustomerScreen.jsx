import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, User, Phone, Mail, MapPin, Save, Zap } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Contacts from "expo-contacts";

// Custom
import useTheme from "@hooks/useTheme";
import { Text } from "@components/ui/text";
import { useUpsertCustomerMutation, useUpdateCustomerMutation } from "@services/api/customerApi";
import useNetworkStatus from "@hooks/useNetworkStatus";

export default function CreateCustomerScreen({ route }) {
  const navigation = useNavigation();
  const { onSelectCustomer, customer: editingCustomer } = route.params ?? {};
  const { colors } = useTheme();
  const { isConnected } = useNetworkStatus();
  const isEditing = !!editingCustomer;
  
  const [name, setName] = useState(editingCustomer?.name || "");
  const [phone, setPhone] = useState(editingCustomer?.phone || "");
  const [email, setEmail] = useState(editingCustomer?.email || "");
  const [address, setAddress] = useState(editingCustomer?.address || "");
  const [saveToPhone, setSaveToPhone] = useState(false);
  
  const [upsertCustomer, { isLoading: isCreating }] = useUpsertCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const isLoading = isCreating || isUpdating;

  const [focusedField, setFocusedField] = useState(null);

  async function handleAction() {
    if (!name.trim()) { Alert.alert("Error", "Name is required"); return; }
    if (!phone.trim()) { Alert.alert("Error", "Phone number is required"); return; }
    
    if (!isConnected) {
      Alert.alert("Offline", "You must be online to update customers.");
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
          address: address.trim()
        }).unwrap();
      } else {
        res = await upsertCustomer({ 
          name: name.trim(), 
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim()
        }).unwrap();
      }

      const serverCustomer = res?.data;

      if (saveToPhone) {
        try {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === 'granted') {
            await Contacts.addContactAsync({
              [Contacts.Fields.FirstName]: name.trim(),
              [Contacts.Fields.PhoneNumbers]: [{ number: phone.trim(), label: 'mobile' }],
              [Contacts.Fields.Emails]: email.trim() ? [{ email: email.trim(), label: 'work' }] : [],
              [Contacts.Fields.Addresses]: address.trim() ? [{ street: address.trim(), label: 'work' }] : [],
            });
          }
        } catch (contactErr) {
          console.warn("Failed to save to phone contacts:", contactErr);
        }
      }

      Alert.alert("Success", `Customer ${isEditing ? 'updated' : 'created'} successfully!`);
      if (onSelectCustomer && serverCustomer) {
        onSelectCustomer(serverCustomer);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} customer.`);
    }
  }

  const renderInput = (label, value, onChangeText, icon, placeholder, fieldKey, keyboardType = 'default') => {
    const isFocused = focusedField === fieldKey;
    return (
      <View style={{ marginBottom: 24 }}>
        <Text style={{ 
          fontFamily: 'Inter', 
          color: colors.textDisabled, 
          fontSize: 8, 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: 4, 
          marginBottom: 12, 
          marginLeft: 4 
        }}>
          {label}
        </Text>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 16, 
          height: 56,
          borderRadius: 16, 
          backgroundColor: colors.bgInput, 
          borderWidth: 1, 
          borderColor: isFocused ? colors.primary : colors.border 
        }}>
          {icon}
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.placeholderText}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocusedField(fieldKey)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            style={{ 
              flex: 1, 
              marginLeft: 12, 
              fontFamily: 'Inter', 
              color: colors.textPrimary, 
              fontSize: 14 
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      {/* Header */}
      <View style={{ 
        width: '100%', 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        height: 56, 
        backgroundColor: colors.bgPrimary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text style={{ 
          marginLeft: 8,
          fontFamily: 'Space Grotesk', 
          textTransform: 'uppercase', 
          letterSpacing: 2, 
          fontSize: 12, 
          color: colors.primary, 
          fontWeight: '700' 
        }}>{isEditing ? 'Edit' : 'New'} Customer</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {renderInput("Customer Name", name, setName, <User size={18} color={colors.secondary} />, "Full Name", "name")}
        {renderInput("Phone Number", phone, setPhone, <Phone size={18} color={colors.secondary} />, "+91 00000 00000", "phone", "phone-pad")}
        {renderInput("Email Address", email, setEmail, <Mail size={18} color={colors.secondary} />, "customer@example.com", "email", "email-address")}
        
        {/* Address Field (Multi-line) */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontFamily: 'Inter', 
            color: colors.textDisabled, 
            fontSize: 8, 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: 4, 
            marginBottom: 12, 
            marginLeft: 4 
          }}>
            Service Address
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            padding: 16, 
            minHeight: 100,
            borderRadius: 16, 
            backgroundColor: colors.bgInput, 
            borderWidth: 1, 
            borderColor: focusedField === 'address' ? colors.primary : colors.border 
          }}>
            <MapPin size={18} color={colors.secondary} style={{ marginTop: 2 }} />
            <TextInput
              placeholder="Enter customer's address..."
              placeholderTextColor={colors.placeholderText}
              value={address}
              onChangeText={setAddress}
              onFocus={() => setFocusedField('address')}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
              style={{ 
                flex: 1, 
                marginLeft: 12, 
                fontFamily: 'Inter', 
                color: colors.textPrimary, 
                fontSize: 14,
                textAlignVertical: 'top'
              }}
            />
          </View>
        </View>

        {/* Sync Toggle */}
        {!isEditing && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: colors.bgCard,
            padding: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 32
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', color: colors.textPrimary, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>Save to Contacts</Text>
              <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 10 }}>Add this customer to your phone's address book</Text>
            </View>
            <Switch
              value={saveToPhone}
              onValueChange={setSaveToPhone}
              trackColor={{ false: colors.bgSurface, true: colors.primary }}
              thumbColor={saveToPhone ? '#fff' : colors.textMuted}
            />
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity 
          onPress={handleAction}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={colors.gradientPrimary} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
            style={{ 
              height: 60, 
              borderRadius: 20, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ 
                  fontFamily: 'Space Grotesk', 
                  color: '#fff', 
                  fontWeight: '900', 
                  textTransform: 'uppercase', 
                  letterSpacing: 4,
                  fontSize: 12
                }}>{isEditing ? 'Save Changes' : 'Create Customer'}</Text>
                <Zap size={16} color="#fff" style={{ marginLeft: 12 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
