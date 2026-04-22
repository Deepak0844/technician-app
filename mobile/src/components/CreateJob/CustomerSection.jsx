import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Users, X, Phone, MapPin, Search } from "lucide-react-native";
import useTheme from "@hooks/useTheme";

const CustomerSection = ({
  selectedCustomer,
  setSelectedCustomer,
  topRecent,
  onSearchPress,
  selectedLocation,
  onSelectLocation,
  onAddLocationPress,
}) => {
  const { colors } = useTheme();

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
          Customer Details
        </Text>
        <Users size={12} color={colors.secondary} />
      </View>

      <View style={{ padding: 20 }}>
        {!selectedCustomer ? (
          <View>
            <TouchableOpacity
              onPress={onSearchPress}
              style={{
                paddingVertical: 32,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.secondaryBorder,
                borderRadius: 12,
                backgroundColor: colors.secondaryBg,
                marginBottom: 16,
              }}
            >
              <Search size={20} color={colors.secondary} />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.secondary,
                  fontSize: 10,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 4,
                  marginTop: 8,
                }}
              >
                Search Customers
              </Text>
            </TouchableOpacity>

            {topRecent.length > 0 && (
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    fontSize: 7,
                    textTransform: "uppercase",
                    fontWeight: "700",
                    letterSpacing: 4,
                    marginBottom: 12,
                    marginLeft: 4,
                  }}
                >
                  Recent Customers
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {topRecent.map((c) => (
                    <TouchableOpacity
                      key={c._id}
                      onPress={() => setSelectedCustomer(c)}
                      style={{
                        marginRight: 8,
                        backgroundColor: colors.bgCard,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 80,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Space Grotesk",
                          color: colors.textPrimary,
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        {c.name?.split(" ")[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.secondaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: colors.secondaryBorder,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 18,
                    fontWeight: "800",
                    color: colors.secondary,
                  }}
                >
                  {selectedCustomer.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {selectedCustomer.name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.secondaryBg,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colors.secondaryBorder,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.secondary,
                        fontSize: 9,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Verified
                    </Text>
                  </View>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Phone size={10} color={colors.secondary} />
                  <Text
                    style={{
                      fontFamily: "Inter",
                      color: colors.textDisabled,
                      fontSize: 10,
                      textTransform: "uppercase",
                      fontWeight: "700",
                    }}
                  >
                    PHONE: {selectedCustomer.phone}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedCustomer(null)}
              style={{
                backgroundColor: colors.bgCard,
                padding: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <X size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Location Picker Sub-section */}
      {selectedCustomer && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                color: colors.textDisabled,
                fontSize: 8,
                textTransform: "uppercase",
                fontWeight: "700",
                letterSpacing: 4,
                marginLeft: 4,
              }}
            >
              Service At
            </Text>
            <TouchableOpacity onPress={onAddLocationPress}>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: colors.primary,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                + ADD LOCATION
              </Text>
            </TouchableOpacity>
          </View>

          {selectedCustomer.locations?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedCustomer.locations.map((loc) => {
                const locId = loc._id || loc.id;
                const selId = selectedLocation?._id || selectedLocation?.id;
                const isSelected =
                  locId && selId
                    ? locId === selId
                    : selectedLocation?.address === loc.address;
                return (
                  <TouchableOpacity
                    key={loc._id || loc.id || loc.address}
                    onPress={() => onSelectLocation(loc)}
                    style={{
                      marginRight: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: isSelected
                        ? colors.primaryBg
                        : colors.bgCard,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                  >
                    <MapPin
                      size={10}
                      color={isSelected ? colors.primary : colors.textDisabled}
                    />
                    <Text
                      style={{
                        fontFamily: "Space Grotesk",
                        color: isSelected
                          ? colors.textPrimary
                          : colors.textDisabled,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {loc.label || "Site"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text
              style={{
                fontFamily: "Inter",
                color: colors.textMuted,
                fontSize: 10,
                fontStyle: "italic",
                marginLeft: 4,
              }}
            >
              No locations saved for this customer.
            </Text>
          )}

          {selectedLocation && selectedCustomer.locations?.length > 0 && (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: colors.bgCard,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderMuted,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  color: colors.textMuted,
                  fontSize: 10,
                  lineHeight: 16,
                }}
              >
                {selectedLocation.address}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CustomerSection;
