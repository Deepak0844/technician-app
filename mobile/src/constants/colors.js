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
    primary: "#bf5fff",
    primaryDeep: "#8b00e6",
    primaryMuted: "#5a1a7a",
    primaryBg: "rgba(191,95,255,0.12)",
    primaryBgStrong: "rgba(191,95,255,0.22)",
    primaryBorder: "rgba(191,95,255,0.18)",
    primaryBorderStrong: "rgba(191,95,255,0.35)",
    secondary: "#00d4ff",
    secondaryBg: "rgba(0,212,255,0.10)",
    secondaryBorder: "rgba(0,212,255,0.22)",
    indigo: "#9933ff",
    indigoAlt: "#7700cc",
    tabActive: "#00d4ff",
    tabShadow: "#8b00e6",
    gradientPrimary: ["#bf5fff", "#8b00e6"],
    spinnerColor: "#bf5fff",
    refreshColor: "#bf5fff",
  },
  light: {
    primary: "#7700dd",
    primaryDeep: "#5500aa",
    primaryMuted: "#f0e6ff",
    primaryBg: "rgba(119,0,221,0.08)",
    primaryBgStrong: "rgba(119,0,221,0.15)",
    primaryBorder: "rgba(119,0,221,0.22)",
    primaryBorderStrong: "rgba(119,0,221,0.35)",
    secondary: "#0077bb",
    secondaryBg: "rgba(0,119,187,0.10)",
    secondaryBorder: "rgba(0,119,187,0.22)",
    indigo: "#6600cc",
    indigoAlt: "#5500aa",
    tabActive: "#0077bb",
    tabShadow: "#7700dd",
    gradientPrimary: ["#8800ee", "#5500aa"],
    spinnerColor: "#7700dd",
    refreshColor: "#7700dd",
  },
};

const OceanAccents = {
  dark: {
    primary: "#2b9fff",
    primaryDeep: "#006ee6",
    primaryMuted: "#002244",
    primaryBg: "rgba(43,159,255,0.12)",
    primaryBgStrong: "rgba(43,159,255,0.22)",
    primaryBorder: "rgba(43,159,255,0.18)",
    primaryBorderStrong: "rgba(43,159,255,0.35)",
    secondary: "#00e5aa",
    secondaryBg: "rgba(0,229,170,0.10)",
    secondaryBorder: "rgba(0,229,170,0.22)",
    indigo: "#006ee6",
    indigoAlt: "#0055cc",
    tabActive: "#00e5aa",
    tabShadow: "#006ee6",
    gradientPrimary: ["#2b9fff", "#006ee6"],
    spinnerColor: "#2b9fff",
    refreshColor: "#2b9fff",
  },
  light: {
    primary: "#0055dd",
    primaryDeep: "#0033bb",
    primaryMuted: "#ddeeff",
    primaryBg: "rgba(0,85,221,0.08)",
    primaryBgStrong: "rgba(0,85,221,0.15)",
    primaryBorder: "rgba(0,85,221,0.22)",
    primaryBorderStrong: "rgba(0,85,221,0.35)",
    secondary: "#009966",
    secondaryBg: "rgba(0,153,102,0.10)",
    secondaryBorder: "rgba(0,153,102,0.22)",
    indigo: "#0044cc",
    indigoAlt: "#0033bb",
    tabActive: "#0055dd",
    tabShadow: "#0033bb",
    gradientPrimary: ["#0066ff", "#0033bb"],
    spinnerColor: "#0055dd",
    refreshColor: "#0055dd",
  },
};

const AmberAccents = {
  dark: {
    primary: "#ff9900",
    primaryDeep: "#dd5500",
    primaryMuted: "#3d1a00",
    primaryBg: "rgba(255,153,0,0.12)",
    primaryBgStrong: "rgba(255,153,0,0.22)",
    primaryBorder: "rgba(255,153,0,0.18)",
    primaryBorderStrong: "rgba(255,153,0,0.35)",
    secondary: "#00bbff",
    secondaryBg: "rgba(0,187,255,0.10)",
    secondaryBorder: "rgba(0,187,255,0.22)",
    indigo: "#ee7700",
    indigoAlt: "#cc5500",
    tabActive: "#00bbff",
    tabShadow: "#dd5500",
    gradientPrimary: ["#ff9900", "#dd5500"],
    spinnerColor: "#ff9900",
    refreshColor: "#ff9900",
  },
  light: {
    primary: "#cc5500",
    primaryDeep: "#aa3300",
    primaryMuted: "#fff0dd",
    primaryBg: "rgba(204,85,0,0.08)",
    primaryBgStrong: "rgba(204,85,0,0.15)",
    primaryBorder: "rgba(204,85,0,0.22)",
    primaryBorderStrong: "rgba(204,85,0,0.35)",
    secondary: "#007799",
    secondaryBg: "rgba(0,119,153,0.10)",
    secondaryBorder: "rgba(0,119,153,0.22)",
    indigo: "#bb4400",
    indigoAlt: "#993300",
    tabActive: "#cc5500",
    tabShadow: "#aa3300",
    gradientPrimary: ["#ee6600", "#aa3300"],
    spinnerColor: "#cc5500",
    refreshColor: "#cc5500",
  },
};

const TealAccents = {
  dark: {
    primary: "#00c896",
    primaryDeep: "#009970",
    primaryMuted: "#002a20",
    primaryBg: "rgba(0,255,221,0.10)",
    primaryBgStrong: "rgba(0,255,221,0.20)",
    primaryBorder: "rgba(0,255,221,0.18)",
    primaryBorderStrong: "rgba(0,255,221,0.35)",
    secondary: "#ff3366",
    secondaryBg: "rgba(255,51,102,0.10)",
    secondaryBorder: "rgba(255,51,102,0.22)",
    indigo: "#00ccaa",
    indigoAlt: "#00aa88",
    tabActive: "#ff3366",
    tabShadow: "#00aa88",
    gradientPrimary: ["#00ffdd", "#00ccaa"],
    spinnerColor: "#00ffdd",
    refreshColor: "#00ffdd",
  },
  light: {
    primary: "#00998a",
    primaryDeep: "#007066",
    primaryMuted: "#ccfff8",
    primaryBg: "rgba(0,153,138,0.08)",
    primaryBgStrong: "rgba(0,153,138,0.15)",
    primaryBorder: "rgba(0,153,138,0.22)",
    primaryBorderStrong: "rgba(0,153,138,0.35)",
    secondary: "#cc0044",
    secondaryBg: "rgba(204,0,68,0.10)",
    secondaryBorder: "rgba(204,0,68,0.22)",
    indigo: "#008877",
    indigoAlt: "#006655",
    tabActive: "#00998a",
    tabShadow: "#007066",
    gradientPrimary: ["#00cc99", "#007066"],
    spinnerColor: "#00998a",
    refreshColor: "#00998a",
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
    darkColor: "#bf5fff",
    lightColor: "#8800ee",
    darkColor2: "#8b00e6",
    lightColor2: "#5500aa",
  },
  {
    key: "ocean",
    label: "Ocean Blue",
    darkColor: "#2b9fff",
    lightColor: "#0066ff",
    darkColor2: "#006ee6",
    lightColor2: "#0033bb",
  },
  {
    key: "amber",
    label: "Amber",
    darkColor: "#ff9900",
    lightColor: "#ee6600",
    darkColor2: "#dd5500",
    lightColor2: "#aa3300",
  },
  {
    key: "teal",
    label: "Teal & Rose",
    darkColor: "#00c896",
    lightColor: "#009977",
    darkColor2: "#009970",
    lightColor2: "#005544",
  },
];

// ─── Backward-compat aliases (used by AppNavigator before useTheme() migration) ─
export const DarkColors = PALETTES.purple.dark;
export const LightColors = PALETTES.purple.light;
