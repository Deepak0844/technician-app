/**
 * Centralized Color Design Tokens
 *
 * This is the SINGLE SOURCE OF TRUTH for all colors in the app.
 * To change any color globally, update it here — it propagates everywhere automatically.
 *
 * Usage in screens/components:
 *   const { colors } = useTheme();
 *   <View style={{ backgroundColor: colors.bgPrimary }} />
 */

// ─── Dark Theme ──────────────────────────────────────────────────────────────
export const DarkColors = {
  // Brand / Primary accent (purple)
  primary: '#c899ff',
  primaryDeep: '#9c3dff',
  primaryMuted: '#6d31a3',
  primaryBg: 'rgba(200,153,255,0.10)',
  primaryBgStrong: 'rgba(190,134,255,0.2)',
  primaryBorder: 'rgba(200,153,255,0.15)',
  primaryBorderStrong: 'rgba(200,153,255,0.3)',

  // Secondary accent (cyan)
  secondary: '#81ecff',
  secondaryBg: 'rgba(129,236,255,0.10)',
  secondaryBorder: 'rgba(129,236,255,0.20)',

  // Brand indigo (logo / header)
  indigo: '#8B5CF6',
  indigoAlt: '#6366f1',

  // Status colors
  success: '#10b981',
  successBg: 'rgba(16,185,129,0.10)',
  successBorder: 'rgba(16,185,129,0.20)',

  warning: '#ffca28',
  warningBg: 'rgba(255,202,40,0.10)',
  warningBorder: 'rgba(255,202,40,0.20)',
  warningIcon: '#f59e0b',

  danger: '#ff6e84',
  dangerBg: 'rgba(255,110,132,0.10)',
  dangerBorder: 'rgba(255,110,132,0.20)',
  dangerGradientStart: 'rgba(255,69,58,0.85)',
  dangerGradientEnd: 'rgba(176,0,32,0.95)',

  // Backgrounds
  bgPrimary: '#000000',
  bgSecondary: '#0e0e0e',
  bgCard: '#1a1919',
  bgCardAlt: 'rgba(26,25,25,0.4)',
  bgInput: '#131313',
  bgSurface: 'rgba(255,255,255,0.03)',
  bgInputDeep: '#353535',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#e5e5e5',
  textMuted: '#a3a3a3',
  textDisabled: '#737373',
  textFaint: '#52525b',
  textSubtle: '#9d8b9b',

  // Borders
  border: 'rgba(255,255,255,0.05)',
  borderMuted: 'rgba(73,72,71,0.2)',
  borderLight: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.15)',
  borderInput: 'rgba(255,255,255,0.1)',

  // Navigation / Tab bar
  navBackground: '#000000',
  navCard: '#000000',
  navBorder: 'rgba(73,72,71,0.2)',
  tabBar: 'rgba(0,0,0,0.9)',
  tabBarBorder: 'rgba(255,255,255,0.05)',
  tabActive: '#81ecff',
  tabInactive: '#a3a3a3',
  tabShadow: '#8f00ff',

  // Gradients (arrays for LinearGradient)
  gradientPrimary: ['#c899ff', '#9c3dff'],
  gradientCard: ['#1a1919', '#0e0e0e'],
  gradientHeader: ['rgba(0,0,0,0.9)', 'rgba(14,14,14,0.95)'],
  gradientHeaderOverlay: ['rgba(0,0,0,0.8)', 'transparent'],
  gradientDivider: ['transparent', 'rgba(73,72,71,0.4)', 'transparent'],

  // Misc
  spinnerColor: '#c899ff',
  refreshColor: '#c899ff',
  placeholderText: 'rgba(255,255,255,0.5)',
};

// ─── Light Theme ─────────────────────────────────────────────────────────────
export const LightColors = {
  // Brand / Primary accent (purple — slightly deeper for contrast on white)
  primary: '#7c3aed',
  primaryDeep: '#5b21b6',
  primaryMuted: '#ede9fe',
  primaryBg: 'rgba(124,58,237,0.08)',
  primaryBgStrong: 'rgba(124,58,237,0.15)',
  primaryBorder: 'rgba(124,58,237,0.20)',
  primaryBorderStrong: 'rgba(124,58,237,0.30)',

  // Secondary accent (teal/cyan — deeper for light bg)
  secondary: '#0891b2',
  secondaryBg: 'rgba(8,145,178,0.10)',
  secondaryBorder: 'rgba(8,145,178,0.20)',

  // Brand indigo
  indigo: '#4f46e5',
  indigoAlt: '#4338ca',

  // Status colors
  success: '#059669',
  successBg: 'rgba(5,150,105,0.10)',
  successBorder: 'rgba(5,150,105,0.20)',

  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.10)',
  warningBorder: 'rgba(217,119,6,0.20)',
  warningIcon: '#b45309',

  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.10)',
  dangerBorder: 'rgba(220,38,38,0.20)',
  dangerGradientStart: 'rgba(239,68,68,0.90)',
  dangerGradientEnd: 'rgba(185,28,28,0.95)',

  // Backgrounds
  bgPrimary: '#ffffff',
  bgSecondary: '#f3f4f6',
  bgCard: '#ffffff',
  bgCardAlt: 'rgba(255,255,255,0.9)',
  bgInput: '#f9fafb',
  bgSurface: 'rgba(0,0,0,0.03)',
  bgInputDeep: '#f1f5f9',

  // Text
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textDisabled: '#9ca3af',
  textFaint: '#d1d5db',
  textSubtle: '#6b7280',

  // Borders
  border: 'rgba(0,0,0,0.06)',
  borderMuted: 'rgba(0,0,0,0.10)',
  borderLight: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.15)',
  borderInput: 'rgba(0,0,0,0.12)',

  // Navigation / Tab bar
  navBackground: '#ffffff',
  navCard: '#ffffff',
  navBorder: 'rgba(0,0,0,0.10)',
  tabBar: 'rgba(255,255,255,0.95)',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  tabActive: '#0891b2',
  tabInactive: '#6b7280',
  tabShadow: '#7c3aed',

  // Gradients (arrays for LinearGradient)
  gradientPrimary: ['#7c3aed', '#5b21b6'],
  gradientCard: ['#ffffff', '#f3f4f6'],
  gradientHeader: ['rgba(255,255,255,0.98)', 'rgba(243,244,246,0.98)'],
  gradientHeaderOverlay: ['rgba(255,255,255,0.95)', 'transparent'],
  gradientDivider: ['transparent', 'rgba(0,0,0,0.15)', 'transparent'],

  // Misc
  spinnerColor: '#7c3aed',
  refreshColor: '#7c3aed',
  placeholderText: 'rgba(0,0,0,0.35)',
};
