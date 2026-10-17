import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { FileText } from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import InvoiceCheckRow from "@components/CreateJob/InvoiceCheckRow";
import OrganizationAutocomplete from "@components/CreateJob/OrganizationAutocomplete";

const MAX_ADDRESS_LENGTH = 300;

/**
 * Per-job choice of which Bill To details appear on the invoice.
 * Display-only: unchecking never changes the customer or job data.
 */
const InvoiceDisplaySection = ({
  invoiceDisplay,
  setInvoiceDisplay,
  organization,
  setOrganization,
  invoiceAddress,
  setInvoiceAddress,
  selectedCustomer,
  selectedLocation,
}) => {
  const { colors } = useTheme();
  const [bodyHeight, setBodyHeight] = useState(0);

  // The invoice must show who it is for: customer name or organization name
  const missingName =
    !invoiceDisplay.showCustomerName &&
    !(invoiceDisplay.showOrganization && organization.name.trim());

  const toggle = (key) =>
    setInvoiceDisplay((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View
      style={{
        marginBottom: 32,
        overflow: "hidden",
        borderRadius: 16,
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          backgroundColor: colors.bgCard,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 10,
            fontWeight: "700",
            color: colors.secondary,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Show on Invoice
        </Text>
        <FileText size={12} color={colors.secondary} />
      </View>

      <View
        style={{ paddingHorizontal: 20, paddingVertical: 10 }}
        onLayout={(e) => setBodyHeight(e.nativeEvent.layout.height)}
      >
        <InvoiceCheckRow
          label="Customer name"
          hint={selectedCustomer?.name}
          checked={invoiceDisplay.showCustomerName}
          onToggle={() => toggle("showCustomerName")}
        />
        <InvoiceCheckRow
          label="Customer phone"
          hint={selectedCustomer?.phone}
          checked={invoiceDisplay.showCustomerPhone}
          onToggle={() => toggle("showCustomerPhone")}
        />
        <InvoiceCheckRow
          label="Organisation name"
          checked={invoiceDisplay.showOrganization}
          onToggle={() => toggle("showOrganization")}
        />

        {invoiceDisplay.showOrganization && (
          <OrganizationAutocomplete
            name={organization.name}
            onChangeName={(name) => setOrganization({ name })}
            containerHeight={bodyHeight}
          />
        )}

        <InvoiceCheckRow
          label="Address"
          hint={selectedLocation?.address}
          checked={invoiceDisplay.showAddress}
          onToggle={() => toggle("showAddress")}
        />

        {invoiceDisplay.showAddress && (
          <View style={{ marginLeft: 34, marginBottom: 6 }}>
            <TextInput
              value={invoiceAddress}
              onChangeText={setInvoiceAddress}
              placeholder="Different address for invoice (optional)"
              placeholderTextColor={colors.placeholderText}
              multiline
              maxLength={MAX_ADDRESS_LENGTH}
              style={{
                fontFamily: "Inter",
                fontSize: 14,
                color: colors.textPrimary,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 60,
                textAlignVertical: "top",
              }}
            />
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 11,
                color: colors.textMuted,
                marginTop: 6,
              }}
            >
              Leave blank to use the service address.
            </Text>
          </View>
        )}

        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 11,
            color: missingName ? colors.danger : colors.textMuted,
            marginTop: 6,
            marginBottom: 6,
          }}
        >
          {missingName
            ? "Tick the customer name or the organisation name. One of them is required."
            : "Unchecked items are hidden on the invoice only. Customer name or organisation name is required."}
        </Text>
      </View>
    </View>
  );
};

export default InvoiceDisplaySection;
