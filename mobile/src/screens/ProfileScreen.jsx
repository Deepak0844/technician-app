import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetMeQuery,
  useLogoutMutation,
  useUpdateMeMutation,
} from "@services/api/authApi";
import { useLazyGetJobsQuery } from "@services/api/jobApi";
import { clearCredentials, updateUser } from "@store/slices/authSlice";
import StorageUtils from "@utils/storageUtils";
import { LinearGradient } from "expo-linear-gradient";
import {
  LogOut,
  ArrowLeft,
  Bell,
  Receipt,
  Check,
  X,
  Edit3,
  Download,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Calendar,
  ChevronRight,
} from "lucide-react-native";
import { exportJobsToCSV } from "@utils/exportUtils";
import { formatDate } from "@utils/formatUtils";
import { useNavigation } from "@react-navigation/native";
import useTheme from "@hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";
import Avatar from "../components/Avatar";

// Dimensions imported for potential future use
Dimensions.get("window");

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const cachedUser = useSelector((state) => state.auth.user);
  const { data: meResponse, isLoading } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [triggerExport] = useLazyGetJobsQuery();
  const user = React.useMemo(
    () => meResponse?.data ?? cachedUser ?? {},
    [meResponse?.data, cachedUser],
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [editedCompanyName, setEditedCompanyName] = React.useState("");
  const [editedEmail, setEditedEmail] = React.useState("");
  const [editedAddress, setEditedAddress] = React.useState("");

  React.useEffect(() => {
    if (user && !isEditing) {
      setEditedName(user.name || "");
      setEditedCompanyName(user.companyName || "");
      setEditedEmail(user.email || "");
      setEditedAddress(user.address || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSave() {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      const resp = await updateMe({
        name: editedName.trim(),
        companyName: editedCompanyName.trim(),
        email: editedEmail.trim(),
        address: editedAddress.trim(),
      }).unwrap();
      if (resp?.data) {
        dispatch(updateUser(resp.data));
      }
      setIsEditing(false);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setEditedName(user.name || "");
    setEditedCompanyName(user.companyName || "");
    setEditedEmail(user.email || "");
    setEditedAddress(user.address || "");
  }

  async function handleLogout() {
    await logout().catch(() => {});
    await StorageUtils.clearToken();
    dispatch(clearCredentials());
  }

  async function handleExportData() {
    Alert.alert(
      "Export Data",
      "This will generate a CSV file of all your jobs and earnings history. Would you like to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              const result = await triggerExport({ pageSize: 1000 }).unwrap();
              if (result?.data) {
                await exportJobsToCSV(result.data);
              }
            } catch (_err) {
              Alert.alert(
                "Export Failed",
                "Could not fetch job data for export.",
              );
            }
          },
        },
      ],
    );
  }

  if (isLoading && !cachedUser) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top", "bottom"]}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft color={colors.textPrimary} size={20} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          My Profile
        </Text>
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={s.headerBtn}
          activeOpacity={0.7}
        >
          <Edit3 color={colors.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Hero Banner ────────────────────────────────────── */}
        <LinearGradient
          colors={["#1a0533", "#2d1b69", "#1e3a5f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroBanner}
        >
          {/* Decorative circles */}
          <View
            style={[
              s.heroCircle,
              { width: 160, height: 160, top: -50, right: -40, opacity: 0.06 },
            ]}
          />
          <View
            style={[
              s.heroCircle,
              {
                width: 100,
                height: 100,
                bottom: -30,
                left: -20,
                opacity: 0.05,
              },
            ]}
          />

          <Avatar
            name={user.name || user.phone}
            uri={user.avatar}
            size={80}
            style={{ borderWidth: 3, borderColor: "rgba(255,255,255,0.25)" }}
          />
          <Text style={s.heroName}>{user.name || "Technician"}</Text>
          <View style={s.heroPill}>
            <Phone size={11} color={colors.secondary} />
            <Text style={[s.heroPillText, { color: colors.secondary }]}>
              {user.phone}
            </Text>
          </View>
          {user.companyName ? (
            <View
              style={[
                s.heroPill,
                { marginTop: 6, backgroundColor: "rgba(255,255,255,0.06)" },
              ]}
            >
              <Building2 size={11} color="rgba(255,255,255,0.55)" />
              <Text
                style={[s.heroPillText, { color: "rgba(255,255,255,0.55)" }]}
              >
                {user.companyName}
              </Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={s.body}>
          {/* ── Member Since Badge ─────────────────────────────── */}
          <View
            style={[
              s.memberBadge,
              {
                backgroundColor: colors.bgCardAlt,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View
              style={[
                s.memberBadgeIcon,
                {
                  backgroundColor: colors.primaryBg,
                  borderColor: colors.primaryBorder,
                },
              ]}
            >
              <Calendar size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.memberBadgeLabel, { color: colors.textMuted }]}>
                Member Since
              </Text>
              <Text style={[s.memberBadgeValue, { color: colors.textPrimary }]}>
                {user.createdAt ? formatDate(user.createdAt) : "—"}
              </Text>
            </View>
          </View>

          {/* ── Invoice Details Card ───────────────────────────── */}
          <View
            style={[
              s.invoiceCard,
              {
                backgroundColor: colors.bgCardAlt,
                borderColor: colors.borderLight,
                borderLeftColor: colors.secondary,
              },
            ]}
          >
            <View
              style={[
                s.invoiceCardHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Receipt size={13} color={colors.secondary} />
              <Text
                style={[s.invoiceCardHeaderText, { color: colors.secondary }]}
              >
                Invoice Details
              </Text>
              <Text style={[s.invoiceCardHint, { color: colors.textDisabled }]}>
                {" "}
                · shown on PDF invoices
              </Text>
            </View>
            {/* Email */}
            <View
              style={[s.invoiceField, { borderBottomColor: colors.border }]}
            >
              <View style={s.invoiceFieldTop}>
                <Mail size={13} color={colors.textMuted} />
                <Text
                  style={[s.invoiceFieldLabel, { color: colors.textMuted }]}
                >
                  Email
                </Text>
              </View>
              <Text
                style={[
                  s.invoiceFieldValue,
                  {
                    color: user.email
                      ? colors.textPrimary
                      : colors.textDisabled,
                  },
                ]}
              >
                {user.email || "Not set"}
              </Text>
            </View>
            {/* Address */}
            <View style={[s.invoiceField, { borderBottomWidth: 0 }]}>
              <View style={s.invoiceFieldTop}>
                <MapPin size={13} color={colors.textMuted} />
                <Text
                  style={[s.invoiceFieldLabel, { color: colors.textMuted }]}
                >
                  Address
                </Text>
              </View>
              <Text
                style={[
                  s.invoiceFieldValue,
                  {
                    color: user.address
                      ? colors.textPrimary
                      : colors.textDisabled,
                  },
                ]}
              >
                {user.address || "Not set"}
              </Text>
            </View>
          </View>

          {/* ── App Settings Card ──────────────────────────────── */}
          <SectionCard colors={colors}>
            <SettingsRow
              icon={<Bell size={16} color={colors.secondary} />}
              iconBg={colors.secondaryBg}
              iconBorder={colors.secondaryBorder}
              title="Notification Reminders"
              subtitle="Check system status"
              onPress={() => navigation.navigate("Reminders")}
              colors={colors}
            />
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <ThemeToggle />
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon={<Download size={16} color={colors.primary} />}
              iconBg={colors.primaryBg}
              iconBorder={colors.primaryBorder}
              title="Export Business Data"
              subtitle="Download history as CSV"
              onPress={handleExportData}
              colors={colors}
              last
            />
          </SectionCard>

          {/* ── Logout ─────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            disabled={isLoggingOut}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={[colors.dangerGradientStart, colors.dangerGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.logoutBtn}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <LogOut color="#fff" size={16} style={{ marginRight: 10 }} />
                  <Text style={s.logoutText}>Log Out</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Edit Modal ─────────────────────────────────────── */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
        >
          <View style={{ flex: 1 }} />
            <View
              style={[
                s.modalSheet,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              {/* Modal Header */}
              <View
                style={[s.modalHeader, { borderBottomColor: colors.border }]}
              >
                <TouchableOpacity
                  onPress={handleCancel}
                  style={s.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <X size={20} color={colors.danger} />
                </TouchableOpacity>
                <Text style={[s.modalTitle, { color: colors.textPrimary }]}>
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isUpdating}
                  style={[s.modalSaveBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Check size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              >
                {/* Avatar preview */}
                <View style={{ alignItems: "center", marginBottom: 24 }}>
                  <Avatar
                    name={editedName || user.phone}
                    uri={user.avatar}
                    size={72}
                    style={{
                      borderWidth: 3,
                      borderColor: colors.primary + "44",
                    }}
                  />
                </View>

                <EditField
                  label="Full Name"
                  value={editedName}
                  onChange={setEditedName}
                  placeholder="Your name"
                  icon={<User size={15} color={colors.textMuted} />}
                  colors={colors}
                />
                <EditField
                  label="Company Name"
                  value={editedCompanyName}
                  onChange={setEditedCompanyName}
                  placeholder="e.g. Acme Repairs"
                  icon={<Building2 size={15} color={colors.textMuted} />}
                  colors={colors}
                />
                <EditField
                  label="Email"
                  value={editedEmail}
                  onChange={setEditedEmail}
                  placeholder="you@example.com"
                  icon={<Mail size={15} color={colors.textMuted} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  colors={colors}
                />
                <EditField
                  label="Address"
                  value={editedAddress}
                  onChange={setEditedAddress}
                  placeholder="Shop / business address"
                  icon={<MapPin size={15} color={colors.textMuted} />}
                  multiline
                  colors={colors}
                />

                {/* Save button inside scroll */}
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isUpdating}
                  activeOpacity={0.85}
                  style={[
                    s.modalFullSaveBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Check
                        size={16}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={s.modalFullSaveText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── Sub-components ────────────────────────────────────────── */

function SectionCard({ children, accentColor, colors }) {
  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.bgCardAlt,
          borderColor: colors.borderLight,
          borderLeftColor: accentColor || colors.borderLight,
          borderLeftWidth: accentColor ? 4 : 1,
        },
      ]}
    >
      {children}
    </View>
  );
}

function SettingsRow({
  icon,
  iconBg,
  iconBorder,
  title,
  subtitle,
  onPress,
  colors,
  last,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[s.settingsRow, !last && { marginBottom: 4 }]}
    >
      <View
        style={[
          s.settingsIcon,
          { backgroundColor: iconBg, borderColor: iconBorder },
        ]}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.settingsTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[s.settingsSubtitle, { color: colors.textDisabled }]}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={16} color={colors.textFaint} />
    </TouchableOpacity>
  );
}

function EditField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  keyboardType,
  autoCapitalize,
  multiline,
  colors,
  autoFocus,
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[s.editLabel, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          s.editInputWrapper,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.borderStrong,
            alignItems: multiline ? "flex-start" : "center",
          },
        ]}
      >
        <View style={{ opacity: 0.7, marginTop: multiline ? 12 : 0 }}>
          {icon}
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "sentences"}
          multiline={multiline}
          autoFocus={autoFocus}
          style={[
            s.editInput,
            {
              color: colors.textPrimary,
              minHeight: multiline ? 72 : 44,
              textAlignVertical: multiline ? "top" : "center",
            },
          ]}
        />
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 10 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  heroBanner: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  heroCircle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "#fff",
  },
  heroName: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "Space Grotesk",
    textAlign: "center",
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroPillText: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  body: {
    padding: 16,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  cardHint: {
    fontSize: 11,
    fontFamily: "Inter",
    lineHeight: 16,
    paddingHorizontal: 14,
    marginBottom: 6,
    marginTop: -2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.44,
    gap: 7,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Space Grotesk",
    fontWeight: "700",
    flex: 0.56,
    textAlign: "right",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  settingsTitle: {
    fontSize: 13,
    fontFamily: "Inter",
    fontWeight: "600",
  },
  settingsSubtitle: {
    fontSize: 11,
    fontFamily: "Inter",
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
    marginVertical: 0,
    opacity: 0.4,
  },
  logoutBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontFamily: "Space Grotesk",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  // Member Since badge
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  memberBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memberBadgeLabel: {
    fontSize: 11,
    fontFamily: "Inter",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  memberBadgeValue: {
    fontSize: 15,
    fontFamily: "Space Grotesk",
    fontWeight: "700",
  },
  // Invoice card
  invoiceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: "hidden",
  },
  invoiceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 6,
  },
  invoiceCardHeaderText: {
    fontSize: 11,
    fontFamily: "Space Grotesk",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  invoiceCardHint: {
    fontSize: 11,
    fontFamily: "Inter",
  },
  invoiceField: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  invoiceFieldTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  invoiceFieldLabel: {
    fontSize: 11,
    fontFamily: "Inter",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  invoiceFieldValue: {
    fontSize: 14,
    fontFamily: "Space Grotesk",
    fontWeight: "600",
    paddingLeft: 19,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  modalSaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  editLabel: {
    fontSize: 11,
    fontFamily: "Inter",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  editInputWrapper: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 2,
    gap: 10,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter",
    fontWeight: "500",
    paddingVertical: 10,
  },
  modalFullSaveBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalFullSaveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    letterSpacing: 0.5,
  },
});
