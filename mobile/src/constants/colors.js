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
    primary: "#7ab8d4",
    primaryDeep: "#4a8fad",
    primaryMuted: "#0d2233",
    primaryBg: "rgba(122,184,212,0.10)",
    primaryBgStrong: "rgba(122,184,212,0.18)",
    primaryBorder: "rgba(122,184,212,0.14)",
    primaryBorderStrong: "rgba(122,184,212,0.26)",
    secondary: "#6ec8b8",
    secondaryBg: "rgba(110,200,184,0.10)",
    secondaryBorder: "rgba(110,200,184,0.18)",
    indigo: "#5a9fc0",
    indigoAlt: "#3d7d9a",
    tabActive: "#6ec8b8",
    tabShadow: "#4a8fad",
    gradientPrimary: ["#7ab8d4", "#4a8fad"],
    spinnerColor: "#7ab8d4",
    refreshColor: "#7ab8d4",
  },
  light: {
    primary: "#2e7da0",
    primaryDeep: "#1d5f7a",
    primaryMuted: "#deeef5",
    primaryBg: "rgba(46,125,160,0.08)",
    primaryBgStrong: "rgba(46,125,160,0.14)",
    primaryBorder: "rgba(46,125,160,0.18)",
    primaryBorderStrong: "rgba(46,125,160,0.28)",
    secondary: "#2e8c72",
    secondaryBg: "rgba(46,140,114,0.10)",
    secondaryBorder: "rgba(46,140,114,0.18)",
    indigo: "#1d5f7a",
    indigoAlt: "#164a5e",
    tabActive: "#2e7da0",
    tabShadow: "#1d5f7a",
    gradientPrimary: ["#3a8fb5", "#1d5f7a"],
    spinnerColor: "#2e7da0",
    refreshColor: "#2e7da0",
  },
};

const AmberAccents = {
  dark: {
    primary: "#d4a847",
    primaryDeep: "#b8872a",
    primaryMuted: "#2e1f05",
    primaryBg: "rgba(212,168,71,0.10)",
    primaryBgStrong: "rgba(212,168,71,0.18)",
    primaryBorder: "rgba(212,168,71,0.14)",
    primaryBorderStrong: "rgba(212,168,71,0.26)",
    secondary: "#7abcce",
    secondaryBg: "rgba(122,188,206,0.10)",
    secondaryBorder: "rgba(122,188,206,0.18)",
    indigo: "#c49a38",
    indigoAlt: "#b8872a",
    tabActive: "#7abcce",
    tabShadow: "#b8872a",
    gradientPrimary: ["#d4a847", "#b8872a"],
    spinnerColor: "#d4a847",
    refreshColor: "#d4a847",
  },
  light: {
    primary: "#b07d1a",
    primaryDeep: "#8a5f10",
    primaryMuted: "#faf0d7",
    primaryBg: "rgba(176,125,26,0.08)",
    primaryBgStrong: "rgba(176,125,26,0.14)",
    primaryBorder: "rgba(176,125,26,0.18)",
    primaryBorderStrong: "rgba(176,125,26,0.28)",
    secondary: "#2e7a8c",
    secondaryBg: "rgba(46,122,140,0.10)",
    secondaryBorder: "rgba(46,122,140,0.18)",
    indigo: "#8a5f10",
    indigoAlt: "#6b4a0d",
    tabActive: "#b07d1a",
    tabShadow: "#8a5f10",
    gradientPrimary: ["#c48f22", "#8a5f10"],
    spinnerColor: "#b07d1a",
    refreshColor: "#b07d1a",
  },
};

const TealAccents = {
  dark: {
    primary: "#5abfaa",
    primaryDeep: "#3a9b86",
    primaryMuted: "#0d2420",
    primaryBg: "rgba(90,191,170,0.10)",
    primaryBgStrong: "rgba(90,191,170,0.18)",
    primaryBorder: "rgba(90,191,170,0.14)",
    primaryBorderStrong: "rgba(90,191,170,0.26)",
    secondary: "#c47a8e",
    secondaryBg: "rgba(196,122,142,0.10)",
    secondaryBorder: "rgba(196,122,142,0.18)",
    indigo: "#45a892",
    indigoAlt: "#3a9b86",
    tabActive: "#c47a8e",
    tabShadow: "#3a9b86",
    gradientPrimary: ["#5abfaa", "#3a9b86"],
    spinnerColor: "#5abfaa",
    refreshColor: "#5abfaa",
  },
  light: {
    primary: "#1f857a",
    primaryDeep: "#166560",
    primaryMuted: "#d4f0ec",
    primaryBg: "rgba(31,133,122,0.08)",
    primaryBgStrong: "rgba(31,133,122,0.14)",
    primaryBorder: "rgba(31,133,122,0.18)",
    primaryBorderStrong: "rgba(31,133,122,0.28)",
    secondary: "#a0415a",
    secondaryBg: "rgba(160,65,90,0.10)",
    secondaryBorder: "rgba(160,65,90,0.18)",
    indigo: "#166560",
    indigoAlt: "#124f4b",
    tabActive: "#1f857a",
    tabShadow: "#166560",
    gradientPrimary: ["#259e92", "#166560"],
    spinnerColor: "#1f857a",
    refreshColor: "#1f857a",
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
    darkColor: "#7ab8d4",
    lightColor: "#3a8fb5",
    darkColor2: "#4a8fad",
    lightColor2: "#1d5f7a",
  },
  {
    key: "amber",
    label: "Amber",
    darkColor: "#d4a847",
    lightColor: "#c48f22",
    darkColor2: "#b8872a",
    lightColor2: "#8a5f10",
  },
  {
    key: "teal",
    label: "Teal & Rose",
    darkColor: "#5abfaa",
    lightColor: "#259e92",
    darkColor2: "#3a9b86",
    lightColor2: "#166560",
  },
];

// ─── Backward-compat aliases (used by AppNavigator before useTheme() migration) ─
export const DarkColors = PALETTES.purple.dark;
export const LightColors = PALETTES.purple.light;
