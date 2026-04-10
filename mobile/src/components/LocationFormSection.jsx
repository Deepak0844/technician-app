import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { MapPin, Globe, Trash2, LocateFixed, ExternalLink } from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import useLocationCapture from "@hooks/useLocationCapture";
import MapLinkModal from "@components/MapLinkModal";
import { Text } from "@components/ui/text";

/**
 * LocationFormSection — a single editable location card used inside
 * CreateCustomerScreen (multi-location list) and AddJobScreen (add-location modal).
 *
 * Props:
 *   location        {{ id, label, address, latitude, longitude, isDefault }}
 *   onUpdate        (updates: Partial<location>) => void
 *   onRemove        () => void   — if undefined, the delete button is hidden
 *   showRemove      boolean      — show the trash icon (false when only 1 location)
 */
export default function LocationFormSection({ location, onUpdate, onRemove, showRemove }) {
  const { colors } = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const capture = useLocationCapture();

  async function handleCaptureGPS() {
    const coords = await capture.captureGPS();
    if (coords) {
      onUpdate({ latitude: coords.latitude, longitude: coords.longitude });
      Alert.alert("Success", "Captured current location!");
    }
  }

  function handleExtract(link) {
    const coords = capture.extractFromLink(link);
    if (coords) {
      onUpdate({ latitude: coords.latitude, longitude: coords.longitude });
      capture.closeLinkModal();
      Alert.alert("Success", "Coordinates extracted from link!");
    }
  }

  return (
    <View style={{ marginBottom: 20, backgroundColor: colors.bgCard, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
      {/* Card Header — label input + advanced toggle + delete */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.bgInput }}>
        <TextInput
          value={location.label}
          onChangeText={(val) => onUpdate({ label: val })}
          style={{ fontFamily: "Space Grotesk", color: colors.textPrimary, fontWeight: "700", fontSize: 13, flex: 1 }}
          placeholder="Location Label (e.g. Home)"
          placeholderTextColor={colors.placeholderText}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => setShowAdvanced((prev) => !prev)}>
            <Globe size={18} color={showAdvanced ? colors.primary : colors.textDisabled} />
          </TouchableOpacity>
          {showRemove && onRemove && (
            <TouchableOpacity onPress={onRemove}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Address textarea */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", minHeight: 80 }}>
          <MapPin size={18} color={colors.secondary} style={{ marginTop: 2 }} />
          <TextInput
            placeholder="Enter service address..."
            placeholderTextColor={colors.placeholderText}
            value={location.address}
            onChangeText={(val) => onUpdate({ address: val })}
            multiline
            style={{ flex: 1, marginLeft: 12, fontFamily: "Inter", color: colors.textPrimary, fontSize: 14, textAlignVertical: "top" }}
          />
        </View>

        {/* Advanced GPS section */}
        {showAdvanced && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 }}>
            <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 }}>
              GPS Pinpoint (Latitude / Longitude)
            </Text>

            {/* Manual lat/lng inputs */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                <TextInput
                  placeholder="Latitude"
                  placeholderTextColor={colors.placeholderText}
                  value={location.latitude?.toString() ?? ""}
                  onChangeText={(val) => onUpdate({ latitude: parseFloat(val) || null })}
                  keyboardType="decimal-pad"
                  style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 12 }}
                />
              </View>
              <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                <TextInput
                  placeholder="Longitude"
                  placeholderTextColor={colors.placeholderText}
                  value={location.longitude?.toString() ?? ""}
                  onChangeText={(val) => onUpdate({ longitude: parseFloat(val) || null })}
                  keyboardType="decimal-pad"
                  style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 12 }}
                />
              </View>
            </View>

            {/* GPS + Map link buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleCaptureGPS}
                disabled={capture.isFetching}
                style={{ flex: 1, backgroundColor: colors.primaryBg, height: 40, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.primaryBorder, opacity: capture.isFetching ? 0.6 : 1 }}
              >
                {capture.isFetching ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <LocateFixed size={14} color={colors.primary} />
                    <Text style={{ fontFamily: "Space Grotesk", color: colors.primary, fontSize: 11, fontWeight: "700" }}>USE GPS</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={capture.openLinkModal}
                style={{ flex: 1, backgroundColor: colors.secondaryBg, height: 40, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.secondaryBorder }}
              >
                <ExternalLink size={14} color={colors.secondary} />
                <Text style={{ fontFamily: "Space Grotesk", color: colors.secondary, fontSize: 11, fontWeight: "700" }}>MAP LINK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Map Link Modal — scoped to this card */}
      <MapLinkModal
        visible={capture.linkModalVisible}
        mapsLink={capture.mapsLink}
        onChangeLink={capture.setMapsLink}
        onExtract={handleExtract}
        onClose={capture.closeLinkModal}
      />
    </View>
  );
}
