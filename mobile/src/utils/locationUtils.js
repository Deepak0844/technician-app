import { Linking, Alert } from "react-native";
import * as Location from "expo-location";

const LOCATION_TIMEOUT_MS = 12000; // 12 seconds max per attempt

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't resolve
 * within the given milliseconds.
 */
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Location request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Extracts latitude and longitude from a Google Maps URL.
 * Supports:
 *  - @lat,lng (e.g. @12.9716,77.5946 or @37,122)
 *  - q=lat,lng or query=lat,lng
 *  - ll=lat,lng
 */
export const extractCoordinatesFromLink = (link) => {
  if (!link) return null;

  // Pattern: @lat,lng — supports both integer and decimal coords
  const atMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return {
      latitude: parseFloat(atMatch[1]),
      longitude: parseFloat(atMatch[2]),
    };
  }

  // Pattern: q= or query= or ll= query params
  const paramMatch = link.match(/[?&](?:q(?:uery)?|ll)=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (paramMatch) {
    return {
      latitude: parseFloat(paramMatch[1]),
      longitude: parseFloat(paramMatch[2]),
    };
  }

  return null;
};

/**
 * Opens Google Maps directions for the given coordinates or address.
 */
export const openDirections = async (latitude, longitude, address) => {
  let url = "";

  if (latitude && longitude) {
    url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  } else if (address) {
    url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  } else {
    Alert.alert("Error", "No location data available for navigation.");
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Could not open Maps application.");
    }
  } catch {
    Alert.alert("Error", "An error occurred while opening navigation.");
  }
};

/**
 * Tries to get the device's current location with a multi-tier accuracy fallback.
 * Each tier has an enforced timeout via Promise.race so the spinner never hangs forever.
 *
 * Tier 1: Last known position (instant, if recent enough)
 * Tier 2: Balanced accuracy (good real-device result)
 * Tier 3: Low accuracy (faster fix, works in poorer signal)
 * Tier 4: Lowest accuracy / Passive (last resort)
 * Tier 5: Any last known (even stale)
 * Dev only: hardcoded fallback coords so development never blocks on GPS
 */
export const getCurrentLocation = async () => {
  try {
    // 1. Ensure location services are on
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        "GPS Disabled",
        "Location services are turned off. Please enable GPS in your device settings to capture coordinates.",
        [{ text: "OK" }]
      );
      return null;
    }

    // 2. Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location access is needed to auto-fill coordinates. Please enable it in your device settings."
      );
      return null;
    }

    // 3. Try last known position first — nearly instant
    let lastKnown = null;
    try {
      lastKnown = await Location.getLastKnownPositionAsync();
    } catch (_) {
      // Ignore — not all platforms return this
    }

    if (lastKnown && Date.now() - lastKnown.timestamp < 30000) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
      };
    }

    // 4. Tier 1: Balanced accuracy (best real-device result)
    try {
      const location = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        LOCATION_TIMEOUT_MS
      );
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (_) {
      // Fall through to next tier
    }

    // 5. Tier 2: Low accuracy (faster, weaker signal tolerance)
    try {
      const location = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
        8000
      );
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (_) {
      // Fall through to next tier
    }

    // 6. Tier 3: Lowest / Passive (last resort fresh attempt)
    try {
      const location = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }),
        6000
      );
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (_) {
      // Fall through
    }

    // 7. Final fallback: Use any stale last known position rather than nothing
    if (lastKnown) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
      };
    }

    // 8. Dev-only hardcoded fallback so development is never blocked
    if (__DEV__) {
      return { latitude: 19.076, longitude: 72.8777 };
    }

    throw new Error(
      "Could not determine your location. If you are using an emulator, please set a location via Extended Controls."
    );
  } catch (error) {
    Alert.alert("GPS Error", error.message || "Failed to fetch location.");
    return null;
  }
};
