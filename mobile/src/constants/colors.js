/**
 * Centralized Color Design Tokens
 *
 * This is the SINGLE SOURCE OF TRUTH for all colors in the app.
 * Four palette options × two modes (dark / light).
 *
 * Usage in screens/components:
 *   const { colors } = useTheme();
 *   <View style={{ backgroundColor: colors.bgPrimary }} />
 */

// ─── Shared base tokens (same across all palettes, per mode) ─────────────────

const BaseDark = {
  success: "#10b981",
  successBg: "rgba(16,185,129,0.10)",
  successBorder: "rgba(16,185,129,0.20)",
  warning: "#ffca28",
  warningBg: "rgba(255,202,40,0.10)",
  warningBorder: "rgba(255,202,40,0.20)",
  warningIcon: "#f59e0b",
  danger: "#ff6e84",
  dangerBg: "rgba(255,110,132,0.10)",
  dangerBorder: "rgba(255,110,132,0.20)",
  dangerGradientStart: "rgba(255,69,58,0.85)",
  dangerGradientEnd: "rgba(176,0,32,0.95)",
  bgPrimary: "#000000",
  bgSecondary: "#0e0e0e",
  bgCard: "#1a1919",
  bgCardAlt: "rgba(26,25,25,0.4)",
  bgInput: "#131313",
  bgSurface: "rgba(255,255,255,0.03)",
  bgInputDeep: "#353535",
  textPrimary: "#ffffff",
  textSecondary: "#e5e5e5",
  textMuted: "#a3a3a3",
  textDisabled: "#737373",
  textFaint: "#52525b",
  textSubtle: "#9d8b9b",
  border: "rgba(255,255,255,0.05)",
  borderMuted: "rgba(73,72,71,0.2)",
  borderLight: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.15)",
  borderInput: "rgba(255,255,255,0.1)",
  navBackground: "#000000",
  navCard: "#000000",
  navBorder: "rgba(73,72,71,0.2)",
  tabBar: "rgba(0,0,0,0.9)",
  tabBarBorder: "rgba(255,255,255,0.05)",
  tabInactive: "#a3a3a3",
  gradientCard: ["#1a1919", "#0e0e0e"],
  gradientHeader: ["rgba(0,0,0,0.9)", "rgba(14,14,14,0.95)"],
  gradientHeaderOverlay: ["rgba(0,0,0,0.8)", "transparent"],
  gradientDivider: ["transparent", "rgba(73,72,71,0.4)", "transparent"],
  placeholderText: "rgba(255,255,255,0.5)",
};

const BaseLight = {
  success: "#059669",
  successBg: "rgba(5,150,105,0.10)",
  successBorder: "rgba(5,150,105,0.20)",
  warning: "#d97706",
  warningBg: "rgba(217,119,6,0.10)",
  warningBorder: "rgba(217,119,6,0.20)",
  warningIcon: "#b45309",
  danger: "#dc2626",
  dangerBg: "rgba(220,38,38,0.10)",
  dangerBorder: "rgba(220,38,38,0.20)",
  dangerGradientStart: "rgba(239,68,68,0.90)",
  dangerGradientEnd: "rgba(185,28,28,0.95)",
  bgPrimary: "#ffffff",
  bgSecondary: "#f3f4f6",
  bgCard: "#ffffff",
  bgCardAlt: "rgba(255,255,255,0.9)",
  bgInput: "#f9fafb",
  bgSurface: "rgba(0,0,0,0.03)",
  bgInputDeep: "#f1f5f9",
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMuted: "#6b7280",
  textDisabled: "#9ca3af",
  textFaint: "#d1d5db",
  textSubtle: "#6b7280",
  border: "rgba(0,0,0,0.06)",
  borderMuted: "rgba(0,0,0,0.10)",
  borderLight: "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.15)",
  borderInput: "rgba(0,0,0,0.12)",
  navBackground: "#ffffff",
  navCard: "#ffffff",
  navBorder: "rgba(0,0,0,0.10)",
  tabBar: "rgba(255,255,255,0.95)",
  tabBarBorder: "rgba(0,0,0,0.08)",
  tabInactive: "#6b7280",
  gradientCard: ["#ffffff", "#f3f4f6"],
  gradientHeader: ["rgba(255,255,255,0.98)", "rgba(243,244,246,0.98)"],
  gradientHeaderOverlay: ["rgba(255,255,255,0.95)", "transparent"],
  gradientDivider: ["transparent", "rgba(0,0,0,0.15)", "transparent"],
  placeholderText: "rgba(0,0,0,0.35)",
};

// ─── Palette accent tokens ────────────────────────────────────────────────────

const PurpleAccents = {
  dark: {
    primary: "#c899ff",
    primaryDeep: "#9c3dff",
    primaryMuted: "#6d31a3",
    primaryBg: "rgba(200,153,255,0.10)",
    primaryBgStrong: "rgba(190,134,255,0.20)",
    primaryBorder: "rgba(200,153,255,0.15)",
    primaryBorderStrong: "rgba(200,153,255,0.30)",
    secondary: "#81ecff",
    secondaryBg: "rgba(129,236,255,0.10)",
    secondaryBorder: "rgba(129,236,255,0.20)",
    indigo: "#8B5CF6",
    indigoAlt: "#6366f1",
    tabActive: "#81ecff",
    tabShadow: "#9c3dff",
    gradientPrimary: ["#c899ff", "#9c3dff"],
    spinnerColor: "#c899ff",
    refreshColor: "#c899ff",
  },
  light: {
    primary: "#7c3aed",
    primaryDeep: "#5b21b6",
    primaryMuted: "#ede9fe",
    primaryBg: "rgba(124,58,237,0.08)",
    primaryBgStrong: "rgba(124,58,237,0.15)",
    primaryBorder: "rgba(124,58,237,0.20)",
    primaryBorderStrong: "rgba(124,58,237,0.30)",
    secondary: "#0891b2",
    secondaryBg: "rgba(8,145,178,0.10)",
    secondaryBorder: "rgba(8,145,178,0.20)",
    indigo: "#4f46e5",
    indigoAlt: "#4338ca",
    tabActive: "#0891b2",
    tabShadow: "#7c3aed",
    gradientPrimary: ["#7c3aed", "#5b21b6"],
    spinnerColor: "#7c3aed",
    refreshColor: "#7c3aed",
  },
};

const OceanAccents = {
  dark: {
    primary: "#60c8ff",
    primaryDeep: "#2b9fff",
    primaryMuted: "#0a2a44",
    primaryBg: "rgba(96,200,255,0.10)",
    primaryBgStrong: "rgba(96,200,255,0.20)",
    primaryBorder: "rgba(96,200,255,0.15)",
    primaryBorderStrong: "rgba(96,200,255,0.30)",
    secondary: "#5effd4",
    secondaryBg: "rgba(94,255,212,0.10)",
    secondaryBorder: "rgba(94,255,212,0.20)",
    indigo: "#38bdf8",
    indigoAlt: "#0ea5e9",
    tabActive: "#5effd4",
    tabShadow: "#2b9fff",
    gradientPrimary: ["#60c8ff", "#2b9fff"],
    spinnerColor: "#60c8ff",
    refreshColor: "#60c8ff",
  },
  light: {
    primary: "#0284c7",
    primaryDeep: "#0369a1",
    primaryMuted: "#e0f2fe",
    primaryBg: "rgba(2,132,199,0.08)",
    primaryBgStrong: "rgba(2,132,199,0.15)",
    primaryBorder: "rgba(2,132,199,0.20)",
    primaryBorderStrong: "rgba(2,132,199,0.30)",
    secondary: "#059669",
    secondaryBg: "rgba(5,150,105,0.10)",
    secondaryBorder: "rgba(5,150,105,0.20)",
    indigo: "#0369a1",
    indigoAlt: "#075985",
    tabActive: "#0284c7",
    tabShadow: "#0369a1",
    gradientPrimary: ["#0ea5e9", "#0369a1"],
    spinnerColor: "#0284c7",
    refreshColor: "#0284c7",
  },
};

const AmberAccents = {
  dark: {
    primary: "#ffc93c",
    primaryDeep: "#ff9900",
    primaryMuted: "#3d2800",
    primaryBg: "rgba(255,201,60,0.10)",
    primaryBgStrong: "rgba(255,201,60,0.20)",
    primaryBorder: "rgba(255,201,60,0.15)",
    primaryBorderStrong: "rgba(255,201,60,0.30)",
    secondary: "#60d9f9",
    secondaryBg: "rgba(96,217,249,0.10)",
    secondaryBorder: "rgba(96,217,249,0.20)",
    indigo: "#ffb833",
    indigoAlt: "#ff9900",
    tabActive: "#60d9f9",
    tabShadow: "#ff9900",
    gradientPrimary: ["#ffc93c", "#ff9900"],
    spinnerColor: "#ffc93c",
    refreshColor: "#ffc93c",
  },
  light: {
    primary: "#d97706",
    primaryDeep: "#b45309",
    primaryMuted: "#fef3c7",
    primaryBg: "rgba(217,119,6,0.08)",
    primaryBgStrong: "rgba(217,119,6,0.15)",
    primaryBorder: "rgba(217,119,6,0.20)",
    primaryBorderStrong: "rgba(217,119,6,0.30)",
    secondary: "#0891b2",
    secondaryBg: "rgba(8,145,178,0.10)",
    secondaryBorder: "rgba(8,145,178,0.20)",
    indigo: "#b45309",
    indigoAlt: "#92400e",
    tabActive: "#d97706",
    tabShadow: "#b45309",
    gradientPrimary: ["#f59e0b", "#b45309"],
    spinnerColor: "#d97706",
    refreshColor: "#d97706",
  },
};

const TealAccents = {
  dark: {
    primary: "#4dffd8",
    primaryDeep: "#00c896",
    primaryMuted: "#002a20",
    primaryBg: "rgba(77,255,216,0.10)",
    primaryBgStrong: "rgba(77,255,216,0.20)",
    primaryBorder: "rgba(77,255,216,0.15)",
    primaryBorderStrong: "rgba(77,255,216,0.30)",
    secondary: "#ff6b9d",
    secondaryBg: "rgba(255,107,157,0.10)",
    secondaryBorder: "rgba(255,107,157,0.20)",
    indigo: "#2ee8c4",
    indigoAlt: "#00c8a0",
    tabActive: "#ff6b9d",
    tabShadow: "#00c896",
    gradientPrimary: ["#4dffd8", "#00c896"],
    spinnerColor: "#4dffd8",
    refreshColor: "#4dffd8",
  },
  light: {
    primary: "#0d9488",
    primaryDeep: "#0f766e",
    primaryMuted: "#ccfbf1",
    primaryBg: "rgba(13,148,136,0.08)",
    primaryBgStrong: "rgba(13,148,136,0.15)",
    primaryBorder: "rgba(13,148,136,0.20)",
    primaryBorderStrong: "rgba(13,148,136,0.30)",
    secondary: "#e11d48",
    secondaryBg: "rgba(225,29,72,0.10)",
    secondaryBorder: "rgba(225,29,72,0.20)",
    indigo: "#0f766e",
    indigoAlt: "#115e59",
    tabActive: "#0d9488",
    tabShadow: "#0f766e",
    gradientPrimary: ["#14b8a6", "#0f766e"],
    spinnerColor: "#0d9488",
    refreshColor: "#0d9488",
  },
};

// ─── PALETTES — the single export used by useTheme() ─────────────────────────
//
// PALETTES[paletteKey][mode] → full color object
//
// paletteKey: 'purple' | 'ocean' | 'amber' | 'teal'
// mode:       'dark'   | 'light'

export const PALETTES = {
  purple: {
    dark: { ...BaseDark, ...PurpleAccents.dark },
    light: { ...BaseLight, ...PurpleAccents.light },
  },
  ocean: {
    dark: { ...BaseDark, ...OceanAccents.dark },
    light: { ...BaseLight, ...OceanAccents.light },
  },
  amber: {
    dark: { ...BaseDark, ...AmberAccents.dark },
    light: { ...BaseLight, ...AmberAccents.light },
  },
  teal: {
    dark: { ...BaseDark, ...TealAccents.dark },
    light: { ...BaseLight, ...TealAccents.light },
  },
};

// ─── Palette metadata (for UI pickers) ───────────────────────────────────────
export const PALETTE_META = [
  {
    key: "purple",
    label: "Purple",
    darkColor: "#c899ff",
    lightColor: "#7c3aed",
    darkColor2: "#9c3dff",
    lightColor2: "#5b21b6",
  },
  {
    key: "ocean",
    label: "Ocean Blue",
    darkColor: "#60c8ff",
    lightColor: "#0ea5e9",
    darkColor2: "#2b9fff",
    lightColor2: "#0369a1",
  },
  {
    key: "amber",
    label: "Amber",
    darkColor: "#ffc93c",
    lightColor: "#f59e0b",
    darkColor2: "#ff9900",
    lightColor2: "#b45309",
  },
  {
    key: "teal",
    label: "Teal & Rose",
    darkColor: "#4dffd8",
    lightColor: "#14b8a6",
    darkColor2: "#00c896",
    lightColor2: "#0f766e",
  },
];

// ─── Backward-compat aliases (used by AppNavigator before useTheme() migration) ─
export const DarkColors = PALETTES.purple.dark;
export const LightColors = PALETTES.purple.light;
