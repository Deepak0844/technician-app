import { useState } from "react";
import { Alert } from "react-native";
import { extractCoordinatesFromLink, getCurrentLocation } from "@utils/locationUtils";

/**
 * useLocationCapture — shared hook for GPS capture + map-link extraction.
 *
 * Usage:
 *   const capture = useLocationCapture();
 *   // GPS
 *   const coords = await capture.captureGPS();   // { latitude, longitude } | null
 *   // Map link modal
 *   capture.openLinkModal();
 *   // Retrieve extracted coords via onExtract callback passed to <MapLinkModal />
 */
export default function useLocationCapture() {
  const [isFetching, setIsFetching] = useState(false);
  const [mapsLink, setMapsLink] = useState("");
  const [linkModalVisible, setLinkModalVisible] = useState(false);

  async function captureGPS() {
    setIsFetching(true);
    try {
      const coords = await getCurrentLocation();
      return coords ?? null;
    } finally {
      setIsFetching(false);
    }
  }

  function extractFromLink(link) {
    if (!link?.trim()) return null;
    const coords = extractCoordinatesFromLink(link);
    if (!coords) {
      Alert.alert("Error", "Could not find coordinates in this link. Please try a long Google Maps URL.");
      return null;
    }
    return coords;
  }

  function openLinkModal() {
    setMapsLink("");
    setLinkModalVisible(true);
  }

  function closeLinkModal() {
    setMapsLink("");
    setLinkModalVisible(false);
  }

  return {
    isFetching,
    mapsLink,
    setMapsLink,
    linkModalVisible,
    captureGPS,
    extractFromLink,
    openLinkModal,
    closeLinkModal,
  };
}
