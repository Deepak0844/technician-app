import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Returns current network connection status.
 * isConnected starts as null until first NetInfo event.
 */
export default function useNetworkStatus() {
  // 3. Local state
  const [isConnected, setIsConnected] = useState(null);

  // 9. useEffect
  useEffect(function subscribeToNetworkChanges() {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  return { isConnected };
}
