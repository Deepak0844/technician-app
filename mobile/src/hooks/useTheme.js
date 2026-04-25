import { useSelector } from "react-redux";
import { PALETTES } from "@constants/colors";

/**
 * useTheme — access the active color palette anywhere.
 *
 * Usage:
 *   const { colors, mode, palette } = useTheme();
 *   <View style={{ backgroundColor: colors.bgPrimary }} />
 */
export default function useTheme() {
  const mode = useSelector((state) => state.theme.mode);
  const palette = useSelector((state) => state.theme.palette);
  const colors = PALETTES[palette]?.[mode] ?? PALETTES.purple.dark;
  return { colors, mode, palette };
}
