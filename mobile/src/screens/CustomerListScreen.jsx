import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useGetCustomersPagedInfiniteQuery } from "@services/api/customerApi";
import { RouteNames } from "@constants/routeNames";
import useTheme from "@hooks/useTheme";
import Avatar from "@components/Avatar";
import useDebounce from "@hooks/useDebounce";

// UI Primitives
import { Text } from "@components/ui/text";

// Icons
import {
  Search,
  UserPlus,
  Phone,
  MapPin,
  ChevronRight,
  Users,
  X,
} from "lucide-react-native";

// ─── Customer Card ─────────────────────────────────────────────────────────
function CustomerCard({ item, colors, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Accent stripe */}
      <View
        style={{
          width: 4,
          alignSelf: "stretch",
          backgroundColor: colors.primary,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />

      {/* Avatar */}
      <View style={{ paddingLeft: 14, paddingRight: 2 }}>
        <Avatar name={item.name} uri={item.avatar || item.imageUrl} size={44} />
      </View>

      {/* Info */}
      <View style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12 }}>
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 15,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: 5,
          }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Phone color={colors.textMuted} size={11} />
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {item.phone}
            </Text>
          </View>
          {item.address ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                flex: 1,
              }}
            >
              <MapPin color={colors.textMuted} size={11} />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 12,
                  color: colors.textMuted,
                }}
                numberOfLines={1}
              >
                {item.address}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Arrow */}
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.primaryBg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <ChevronRight color={colors.primary} size={15} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function CustomerListScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const techUser = useSelector((state) => state.auth.user);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const hasScrolledRef = useRef(false);

  const {
    data: customersData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetCustomersPagedInfiniteQuery({ q: debouncedQuery });

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [debouncedQuery]);

  const onRefresh = React.useCallback(() => {
    hasScrolledRef.current = false;
    refetch();
  }, [refetch]);

  const allCustomers = useMemo(
    () => customersData?.pages.flatMap((p) => p.data) ?? [],
    [customersData],
  );

  const totalCount = customersData?.pages?.[0]?.total ?? null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        edges={["top"]}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={colors.gradientHeader}
          style={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 14,
          }}
        >
          {/* Title row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 22,
                  fontWeight: "800",
                  color: colors.textPrimary,
                  lineHeight: 28,
                }}
              >
                Customers
              </Text>
              {totalCount != null && (
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    color: colors.textMuted,
                    marginTop: 1,
                  }}
                >
                  {totalCount} {totalCount === 1 ? "customer" : "customers"}
                </Text>
              )}
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate(RouteNames.CUSTOMER_SEARCH)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 4,
                }}
              >
                <UserPlus color="#fff" size={14} />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Add
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate(RouteNames.PROFILE)}
                activeOpacity={0.7}
              >
                <Avatar
                  size={36}
                  name={techUser?.name}
                  uri={techUser?.avatar || techUser?.imageUrl}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.bgInput,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.borderInput,
              paddingHorizontal: 14,
              height: 44,
              gap: 10,
            }}
          >
            <Search color={colors.textMuted} size={16} />
            <TextInput
              placeholder="Search by name or phone..."
              placeholderTextColor={colors.textDisabled}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontFamily: "Inter",
                fontSize: 14,
                paddingVertical: 0,
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                activeOpacity={0.7}
              >
                <X color={colors.textMuted} size={16} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* ── List ── */}
        {isLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={allCustomers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 100,
            }}
            onScrollBeginDrag={() => {
              hasScrolledRef.current = true;
            }}
            onEndReached={() => {
              if (
                hasScrolledRef.current &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={
                  isFetching && !isFetchingNextPage && !!customersData
                }
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <CustomerCard
                item={item}
                colors={colors}
                onPress={() =>
                  navigation.navigate(RouteNames.CUSTOMER_DETAILS, {
                    customerId: item._id,
                  })
                }
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 60 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: colors.primaryBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Users color={colors.primary} size={30} />
                </View>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.textPrimary,
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  {query ? "No results found" : "No customers yet"}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textMuted,
                    textAlign: "center",
                    fontSize: 13,
                    lineHeight: 20,
                    paddingHorizontal: 40,
                  }}
                >
                  {query
                    ? `No customers match "${query}"`
                    : "Tap 'Add' to import customers from your contacts."}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
