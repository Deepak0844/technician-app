import { useSelector } from "react-redux";
import { DarkColors, LightColors } from "@constants/colors";

/**
 * useTheme — access the active color palette anywhere.
 *
 * Usage:
 *   const { colors, mode } = useTheme();
 *   <View style={{ backgroundColor: colors.bgPrimary }} />
 */
export default function useTheme() {
  const mode = useSelector((state) => state.theme.mode);
  const colors = mode === "dark" ? DarkColors : LightColors;
  return { colors, mode };
}
