import React from "react";
import useNetworkStatus from "@hooks/useNetworkStatus";
import useTheme from "@hooks/useTheme";

// Gluestack Primitives
import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { colors } = useTheme();

  if (isConnected === null || isConnected === true) return null;

  return (
    <Box
      style={{
        backgroundColor: colors.bgCard,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        width: "100%",
        zIndex: 50,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.warningBorder,
      }}
    >
      <Text
        style={{
          color: colors.warning,
          fontSize: 10,
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: 2,
          fontFamily: "Inter",
        }}
      >
        📡 Offline / Viewing Cached Data
      </Text>
    </Box>
  );
}
