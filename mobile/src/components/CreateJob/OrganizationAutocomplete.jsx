import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import useTheme from "@hooks/useTheme";
import useDebounce from "@hooks/useDebounce";
import { useGetRecentOrganizationsQuery } from "@services/api/jobApi";

const SEARCH_DEBOUNCE_MS = 250;
const MAX_NAME_LENGTH = 100;
const DROPDOWN_MAX_HEIGHT = 150;
const DROPDOWN_MIN_HEIGHT = 40;
const DROPDOWN_BOTTOM_GAP = 12;

/**
 * Organization name input with an autocomplete dropdown of the technician's
 * previously used organizations.
 *
 * The dropdown overlays the fields below it instead of pushing them down. On
 * Android, touches outside a parent's bounds are not delivered, so its height
 * is capped to the room left inside `containerHeight` and it scrolls
 * internally beyond that.
 */
const OrganizationAutocomplete = ({ name, onChangeName, containerHeight }) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [box, setBox] = useState({ y: 0, height: 0 });

  const query = useDebounce(name.trim(), SEARCH_DEBOUNCE_MS);
  const { data: response } = useGetRecentOrganizationsQuery(query || undefined);

  // Suggest only while typing: prefix match on the current text, hiding an
  // exact match. Filtering here as well keeps stale results from showing
  // while the debounced request is still in flight.
  const typed = name.trim().toLowerCase();
  const suggestions = typed
    ? (response?.data || []).filter((o) => {
        const candidate = o.name.toLowerCase();
        return candidate.startsWith(typed) && candidate !== typed;
      })
    : [];

  const maxHeight = Math.max(
    0,
    Math.min(
      DROPDOWN_MAX_HEIGHT,
      containerHeight - (box.y + box.height) - DROPDOWN_BOTTOM_GAP,
    ),
  );
  const showDropdown =
    focused && suggestions.length > 0 && maxHeight > DROPDOWN_MIN_HEIGHT;

  return (
    <View
      style={{ marginLeft: 34, marginBottom: 6, zIndex: 30, elevation: 8 }}
      onLayout={(e) => setBox(e.nativeEvent.layout)}
    >
      <TextInput
        value={name}
        onChangeText={onChangeName}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Enter organisation name"
        placeholderTextColor={colors.placeholderText}
        maxLength={MAX_NAME_LENGTH}
        style={{
          fontFamily: "Inter",
          fontSize: 14,
          color: colors.textPrimary,
          borderWidth: 1,
          borderColor: name.trim() ? colors.border : colors.danger,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />

      {showDropdown && (
        <View
          style={{
            position: "absolute",
            top: box.height + 4,
            left: 0,
            right: 0,
            zIndex: 40,
            elevation: 10,
            maxHeight,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.bgCard,
            overflow: "hidden",
          }}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {suggestions.map((o, index) => (
              <TouchableOpacity
                key={o.name}
                activeOpacity={0.7}
                onPress={() => {
                  onChangeName(o.name);
                  Keyboard.dismiss();
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 11,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    color: colors.textPrimary,
                  }}
                >
                  {o.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default OrganizationAutocomplete;
