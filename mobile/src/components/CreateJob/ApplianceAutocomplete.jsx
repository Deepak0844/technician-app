import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { X } from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import useDebounce from "@hooks/useDebounce";
import { useGetRecentAppliancesQuery } from "@services/api/jobApi";
import { ApplianceOptions } from "@constants/appConstants";

const SEARCH_DEBOUNCE_MS = 250;
const MAX_NAME_LENGTH = 100;
export const MAX_APPLIANCES = 10;
const MAX_SUGGESTIONS = 6;

// Shown for appliances the technician typed themselves (the preset "Other"
// keeps its own wrench)
const CUSTOM_EMOJI = "🔌";

const PRESET_BY_LOWER = new Map(
  ApplianceOptions.map((o) => [o.value.toLowerCase(), o]),
);

/**
 * Multi-select appliance input with an autocomplete list. Suggestions are the
 * names the technician used on past jobs plus the preset appliances. Chosen
 * appliances show as removable chips above the input; typing a new name and
 * adding it makes it a suggestion on future jobs.
 *
 * The list is part of the page flow (it pushes the fields below it down) and
 * shows at most MAX_SUGGESTIONS rows, so it never needs its own scrolling.
 * An overlay list inside the screen's ScrollView can't be scrolled reliably
 * on Android, and dragging the page dismisses the keyboard, which would close
 * it.
 *
 * @param {{ selected: Array<{ type: string, isCustom?: boolean }>,
 *           onChange: (next: Array) => void }} props
 */
const ApplianceAutocomplete = ({ selected, onChange }) => {
  const { colors } = useTheme();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const query = useDebounce(text.trim(), SEARCH_DEBOUNCE_MS);
  const { data: response } = useGetRecentAppliancesQuery(query || undefined);

  const typed = text.trim().toLowerCase();
  const chosen = new Set(selected.map((a) => a.type.toLowerCase()));
  const atLimit = selected.length >= MAX_APPLIANCES;

  // Names used on past jobs first (most relevant), then the remaining presets
  // so there is always something to pick with no history. Filtering here as
  // well keeps stale results from showing while the debounced request is
  // still in flight.
  const candidates = [];
  const seen = new Set();
  const push = (name, emoji) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ name, emoji });
  };
  (response?.data || []).forEach((o) =>
    push(o.name, PRESET_BY_LOWER.get(o.name.toLowerCase())?.emoji),
  );
  ApplianceOptions.forEach((o) => push(o.value, o.emoji));

  const suggestions = atLimit
    ? []
    : candidates
        .filter((c) => {
          const key = c.name.toLowerCase();
          return !chosen.has(key) && (!typed || key.startsWith(typed));
        })
        .slice(0, MAX_SUGGESTIONS);

  const addAppliance = (rawName) => {
    const name = rawName.trim();
    if (!name || atLimit) return;
    const preset = PRESET_BY_LOWER.get(name.toLowerCase());
    // A preset keeps its own spelling, so "ac" and "AC" are never two entries.
    const type = preset ? preset.value : name;
    if (chosen.has(type.toLowerCase())) {
      setText("");
      return;
    }
    onChange([...selected, { type, isCustom: !preset }]);
    setText("");
  };

  const removeAppliance = (type) =>
    onChange(selected.filter((a) => a.type !== type));

  // Stays open while there is typed text, even if the keyboard is dismissed by
  // dragging the page, so the list doesn't vanish while the user scrolls.
  const showList = (focused || text.length > 0) && suggestions.length > 0;

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
          marginLeft: 4,
          marginRight: 4,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          Device Type
        </Text>
        <Text
          style={{
            fontFamily: "Inter",
            color: atLimit ? colors.danger : colors.textDisabled,
            fontSize: 10,
            fontWeight: "700",
          }}
        >
          {selected.length}/{MAX_APPLIANCES}
        </Text>
      </View>

      {selected.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {selected.map((a) => {
            const emoji =
              PRESET_BY_LOWER.get(a.type.toLowerCase())?.emoji ?? CUSTOM_EMOJI;
            return (
              <TouchableOpacity
                key={a.type}
                activeOpacity={0.7}
                onPress={() => removeAppliance(a.type)}
                accessibilityLabel={`Remove ${a.type}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 8,
                  paddingLeft: 12,
                  paddingRight: 10,
                  borderRadius: 999,
                  backgroundColor: colors.primaryBg,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                }}
              >
                <Text style={{ fontSize: 14 }}>{emoji}</Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.primary,
                    maxWidth: 200,
                  }}
                >
                  {a.type}
                </Text>
                <X size={13} color={colors.primary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor:
              selected.length === 0 && !focused
                ? colors.danger
                : focused
                  ? colors.secondary
                  : colors.border,
            borderRadius: 12,
            backgroundColor: colors.bgCard,
            paddingHorizontal: 12,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => addAppliance(text)}
            blurOnSubmit={false}
            returnKeyType="done"
            editable={!atLimit}
            placeholder={
              atLimit
                ? `Maximum ${MAX_APPLIANCES} appliances`
                : selected.length === 0
                  ? "Select or type an appliance"
                  : "Add another appliance"
            }
            placeholderTextColor={colors.placeholderText}
            maxLength={MAX_NAME_LENGTH}
            style={{
              flex: 1,
              fontFamily: "Inter",
              fontSize: 14,
              color: colors.textPrimary,
              paddingVertical: 12,
            }}
          />
          {text.trim().length > 0 && !atLimit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => addAppliance(text)}
              style={{ paddingVertical: 6, paddingLeft: 12 }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 11,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: colors.primary,
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showList && (
          <View
            style={{
              marginTop: 6,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              backgroundColor: colors.bgCard,
              overflow: "hidden",
            }}
          >
            {suggestions.map((c, index) => (
              <TouchableOpacity
                key={c.name}
                activeOpacity={0.7}
                onPress={() => addAppliance(c.name)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 11,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, width: 22 }}>
                  {c.emoji ?? CUSTOM_EMOJI}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontFamily: "Inter",
                    fontSize: 14,
                    color: colors.textPrimary,
                  }}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default ApplianceAutocomplete;
