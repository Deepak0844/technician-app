import React from "react";
import { Modal, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { ExternalLink } from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import { Text } from "@components/ui/text";

/**
 * MapLinkModal — reusable modal for pasting a Google Maps link
 * and extracting coordinates from it.
 *
 * Props:
 *   visible      {boolean}              — controls Modal visibility
 *   mapsLink     {string}               — current text input value
 *   onChangeLink {(text: string) => void}
 *   onExtract    {(link: string) => void} — called with the raw link on confirm
 *   onClose      {() => void}
 */
export default function MapLinkModal({ visible, mapsLink, onChangeLink, onExtract, onClose }) {
  const { colors } = useTheme();

  function handleExtract() {
    if (!mapsLink?.trim()) {
      Alert.alert("Error", "Please paste a link first.");
      return;
    }
    onExtract(mapsLink);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.8)" }}
      >
        <View style={{ backgroundColor: colors.bgCard, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <ExternalLink size={22} color={colors.secondary} />
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
              Extract from Link
            </Text>
          </View>

          <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textDisabled, marginBottom: 20 }}>
            Paste a Google Maps link (e.g. from WhatsApp) to extract exact coordinates.
          </Text>

          <View style={{ backgroundColor: colors.bgInput, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 24 }}>
            <TextInput
              placeholder="Paste link here..."
              placeholderTextColor={colors.placeholderText}
              value={mapsLink}
              onChangeText={onChangeLink}
              autoFocus
              autoCapitalize="none"
              style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 14, minHeight: 80, textAlignVertical: "top" }}
              multiline
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ flex: 1, height: 48, borderRadius: 14, backgroundColor: colors.bgSurface, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "Inter", fontWeight: "700", color: colors.textDisabled }}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExtract}
              style={{ flex: 1, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "Inter", fontWeight: "700", color: "#fff" }}>EXTRACT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
