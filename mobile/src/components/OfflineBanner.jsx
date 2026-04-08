import React from "react";
import useNetworkStatus from "../hooks/useNetworkStatus";

// Gluestack Primitives
import { Box } from "./ui/box";
import { Text } from "./ui/text";

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  if (isConnected === null || isConnected === true) return null;
  
  return (
    <Box className="bg-obsidian-900/90 py-2.5 px-4 items-center w-full z-50 border-b-[0.5px] border-amber-500/40 backdrop-blur-lg shadow-glow-dark">
      <Text className="text-amber-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">
        📡 Offline / Viewing Cached Data
      </Text>
    </Box>
  );
}
