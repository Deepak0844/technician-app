import React, { useState } from "react";
import { FlatList, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useGetCustomersQuery } from "@services/api/customerApi";
import { RouteNames } from "@constants/routeNames";
import useTheme from "@hooks/useTheme";
import Avatar from "@components/Avatar";

// Gluestack Primitives
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";
import { Input, InputField } from "@components/ui/input";

// Icons
import { Search, UserPlus, Phone, MapPin, ChevronRight, User } from "lucide-react-native";

export default function CustomerListScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  // RTK Query
  const { data: customersResponse, isLoading } = useGetCustomersQuery({ search: query });
  const customers = customersResponse?.data || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      {/* Top Header */}
      <LinearGradient
        colors={colors.gradientHeader}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          height: 56,
          zIndex: 50,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <User color={colors.indigo} size={20} />
          <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.indigo }}>
            Customers
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(RouteNames.CUSTOMER_SEARCH)}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <UserPlus color={colors.secondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate(RouteNames.PROFILE)}
            activeOpacity={0.7}
          >
            <Avatar size={32} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Box style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Search Bar */}
        <Input
          variant="outline"
          size="xl"
          style={{
            borderWidth: 2,
            borderColor: colors.borderInput,
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ paddingLeft: 16, justifyContent: "center" }}>
            <Search color={colors.textMuted} size={18} />
          </View>
          <InputField
            placeholder="Search name or phone..."
            placeholderTextColor={colors.textDisabled}
            value={query}
            onChangeText={setQuery}
            style={{ color: colors.textPrimary, fontFamily: "Inter", paddingHorizontal: 8 }}
          />
        </Input>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.indigo} />
          </View>
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate(RouteNames.CUSTOMER_DETAILS, { customerId: item._id })}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.bgCardAlt,
                  padding: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Avatar */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primaryBg,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colors.primaryBorder,
                    marginRight: 16,
                  }}
                >
                  <User color={colors.primary} size={22} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 }}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Phone color={colors.textMuted} size={12} />
                      <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textMuted }}>
                        {item.phone}
                      </Text>
                    </View>
                    {item.address && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                        <MapPin color={colors.textMuted} size={12} />
                        <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <ChevronRight color={colors.textDisabled} size={20} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ fontFamily: "Inter", color: colors.textDisabled, textAlign: "center", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", fontSize: 10, marginBottom: 8 }}>
                  No customers found
                </Text>
                <Text style={{ fontFamily: "Inter", color: colors.textFaint, textAlign: "center", fontSize: 12, paddingHorizontal: 40 }}>
                  Use the &apos;+&apos; icon above to add a new customer from your phone contacts.
                </Text>
              </View>
            }
          />
        )}
      </Box>
    </SafeAreaView>
  );
}
