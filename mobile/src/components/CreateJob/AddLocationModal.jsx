import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LocateFixed, ExternalLink } from 'lucide-react-native';
import useTheme from '@hooks/useTheme';

const AddLocationModal = ({
  visible,
  onClose,
  label,
  setLabel,
  address,
  setAddress,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  onSave,
  isSaving,
  onCaptureGPS,
  onOpenLinkModal,
  isCapturing,
  saveToProfile,
  setSaveToProfile
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
        <Pressable style={{ backgroundColor: colors.bgPrimary, padding: 24, paddingBottom: 48, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontFamily: "Space Grotesk", color: colors.textPrimary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 }}>Add Location</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.secondary, fontWeight: "700" }}>CANCEL</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Label (Optional)</Text>
          <View style={{ marginBottom: 20, paddingHorizontal: 16, height: 56, borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, justifyContent: "center" }}>
            <TextInput
              placeholder="e.g. Home, Office"
              placeholderTextColor={colors.placeholderText}
              value={label}
              onChangeText={setLabel}
              style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 14 }}
            />
          </View>

          <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Full Address</Text>
          <View style={{ marginBottom: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, minHeight: 100 }}>
            <TextInput
              placeholder="Enter complete address..."
              placeholderTextColor={colors.placeholderText}
              value={address}
              onChangeText={setAddress}
              multiline
              textAlignVertical="top"
              style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 14, flex: 1 }}
            />
          </View>

          <View style={{ marginBottom: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 }}>
            <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 }}>GPS Pinpoint (Latitude / Longitude)</Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                <TextInput
                  placeholder="Latitude"
                  placeholderTextColor={colors.placeholderText}
                  value={latitude?.toString() ?? ""}
                  onChangeText={(val) => setLatitude(parseFloat(val) || null)}
                  keyboardType="decimal-pad"
                  style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 12 }}
                />
              </View>
              <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                <TextInput
                  placeholder="Longitude"
                  placeholderTextColor={colors.placeholderText}
                  value={longitude?.toString() ?? ""}
                  onChangeText={(val) => setLongitude(parseFloat(val) || null)}
                  keyboardType="decimal-pad"
                  style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 12 }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
              <TouchableOpacity
                onPress={onCaptureGPS}
                disabled={isCapturing}
                style={{ flex: 1, backgroundColor: colors.primaryBg, height: 40, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.primaryBorder, opacity: isCapturing ? 0.6 : 1 }}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <LocateFixed size={14} color={colors.primary} />
                    <Text style={{ fontFamily: "Space Grotesk", color: colors.primary, fontSize: 11, fontWeight: "700" }}>USE GPS</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onOpenLinkModal}
                style={{ flex: 1, backgroundColor: colors.secondaryBg, height: 40, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.secondaryBorder }}
              >
                <ExternalLink size={14} color={colors.secondary} />
                <Text style={{ fontFamily: "Space Grotesk", color: colors.secondary, fontSize: 11, fontWeight: "700" }}>MAP LINK</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save to Profile Toggle */}
          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setSaveToProfile(!saveToProfile)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: saveToProfile ? colors.primaryBg : colors.bgSurface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: saveToProfile ? colors.primaryBorder : colors.border }}
            >
              <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: saveToProfile ? colors.primary : colors.textDisabled, backgroundColor: saveToProfile ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                {saveToProfile && <Text style={{ color: colors.bgPrimary, fontSize: 10, fontWeight: '900' }}>✓</Text>}
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: saveToProfile ? colors.primary : colors.textPrimary }}>Save to Customer Profile</Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted }}>Makes this address reusable for future jobs</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onSave}
            disabled={isSaving}
            style={{ paddingVertical: 16, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.bgPrimary} size="small" />
            ) : (
              <Text style={{ fontFamily: "Space Grotesk", color: colors.bgPrimary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 4 }}>Save Location</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AddLocationModal;
