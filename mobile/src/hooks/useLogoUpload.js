import { useState } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { useUploadLogoMutation } from "@services/api/authApi";

const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function useLogoUpload() {
  const [uploadLogo, { isLoading }] = useUploadLogoMutation();
  const [isUploading, setIsUploading] = useState(false);

  async function requestCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take a photo.",
      );
      return false;
    }
    return true;
  }

  async function requestGalleryPermission() {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to pick an image.",
        );
        return false;
      }
    }
    return true;
  }

  async function launchPicker(source) {
    const options = { allowsEditing: true, aspect: [1, 1], quality: 0.9 };
    if (source === "camera") return ImagePicker.launchCameraAsync(options);
    return ImagePicker.launchImageLibraryAsync({
      ...options,
      mediaTypes: "images",
    });
  }

  function pickAndUpload() {
    Alert.alert("Company Logo", "Choose image source", [
      { text: "📷 Camera", onPress: () => handleSource("camera") },
      { text: "🖼 Gallery", onPress: () => handleSource("gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleSource(source) {
    try {
      const hasPermission =
        source === "camera"
          ? await requestCameraPermission()
          : await requestGalleryPermission();
      if (!hasPermission) return;

      const result = await launchPicker(source);
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > LOGO_MAX_BYTES) {
        Alert.alert("Image Too Large", "Please choose an image under 5 MB.");
        return;
      }

      setIsUploading(true);

      let uploadUri = asset.uri;
      try {
        const context = ImageManipulator.manipulate(asset.uri);
        context.resize({ width: 800 });
        const image = await context.renderAsync();
        const saved = await image.saveAsync({
          compress: 0.85,
          format: SaveFormat.JPEG,
        });
        uploadUri = saved.uri;
      } catch (manipErr) {
        if (__DEV__)
          console.warn(
            "[useLogoUpload] resize failed, using original:",
            manipErr,
          );
      }

      const formData = new FormData();
      formData.append("logo", {
        uri: uploadUri,
        name: "logo.jpg",
        type: "image/jpeg",
      });

      await uploadLogo(formData).unwrap();
    } catch (err) {
      if (__DEV__) console.error("[useLogoUpload] error:", JSON.stringify(err));
      const status = Number(err?.status ?? err?.data?.status);
      if (status === 413) {
        Alert.alert("Upload Failed", "Image must be 5 MB or smaller.");
      } else {
        Alert.alert(
          "Upload Failed",
          err?.data?.message ?? err?.message ?? "Could not upload logo.",
        );
      }
    } finally {
      setIsUploading(false);
    }
  }

  return { pickAndUpload, isUploading: isUploading || isLoading };
}
