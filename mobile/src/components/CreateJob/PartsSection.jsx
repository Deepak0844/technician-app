import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Plus, Trash2, ShoppingCart } from "lucide-react-native";
import useTheme from "@hooks/useTheme";

const PartsSection = ({ parts, setParts }) => {
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);

  // New Part State
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [partPrice, setPartPrice] = useState("");
  const [partWarranty, setPartWarranty] = useState("");
  const [editingPartId, setEditingPartId] = useState(null);

  const handleAddPart = () => {
    if (!partName.trim() || !partPrice.trim()) return;

    if (editingPartId) {
      setParts(
        parts.map((p) =>
          (p._id || p.id) === editingPartId
            ? {
                ...p,
                name: partName.trim(),
                quantity: parseInt(partQty) || 1,
                price: parseFloat(partPrice) || 0,
                warranty: partWarranty.trim(),
              }
            : p,
        ),
      );
    } else {
      const newPart = {
        id: Date.now().toString(),
        name: partName.trim(),
        quantity: parseInt(partQty) || 1,
        price: parseFloat(partPrice) || 0,
        warranty: partWarranty.trim(),
      };
      setParts([...parts, newPart]);
    }

    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setEditingPartId(null);
    setPartName("");
    setPartQty("1");
    setPartPrice("");
    setPartWarranty("");
  };

  const removePart = (id) => {
    setParts(parts.filter((p) => (p._id || p.id) !== id));
  };

  const handleEditPart = (part) => {
    setEditingPartId(part._id || part.id);
    setPartName(part.name);
    setPartQty(part.quantity?.toString() || "1");
    setPartPrice(part.price?.toString() || "");
    setPartWarranty(part.warranty || "");
    setShowAddModal(true);
  };

  const partsTotal = parts.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <View
      style={{
        marginBottom: 32,
        borderRadius: 16,
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: colors.bgCard,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 10,
              fontWeight: "700",
              color: colors.secondary,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Spare Parts
          </Text>
          <ShoppingCart size={12} color={colors.secondary} />
        </View>
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 12,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          ₹{partsTotal.toFixed(2)}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {parts.map((part, index) => {
          const partId = part._id || part.id || `temp-${index}`;
          return (
            <View
              key={partId}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.bgCard,
                padding: 12,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => handleEditPart(part)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  {part.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                    marginTop: 2,
                  }}
                >
                  Qty: {part.quantity} • ₹{part.price} each{" "}
                  {part.warranty ? `• ${part.warranty}` : ""}
                </Text>
              </TouchableOpacity>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  ₹{(part.price * part.quantity).toFixed(0)}
                </Text>
                <TouchableOpacity
                  onPress={() => removePart(partId)}
                  hitSlop={10}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 12,
            borderRadius: 10,
            borderStyle: "dashed",
            borderWidth: 1.5,
            borderColor: colors.secondary,
            marginTop: 8,
          }}
        >
          <Plus size={16} color={colors.secondary} />
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 10,
              fontWeight: "700",
              color: colors.secondary,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Add Spare Part
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Part Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        {/*
         * Centered-dialog KAV pattern:
         * KAV fills the screen, a Pressable backdrop covers it (absolute) for tap-to-dismiss,
         * and the card sits in the centre. KAV shifts the card up with padding when the keyboard
         * appears so no field is ever hidden.
         */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={styles.modalOverlay}
        >
          {/* Dim backdrop — tap to dismiss */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />

          {/* Card — absorbs touch so it does NOT dismiss */}
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          >
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 18,
                fontWeight: "700",
                color: colors.textPrimary,
                marginBottom: 20,
              }}
            >
              {editingPartId ? "Edit Spare Part" : "Add Spare Part"}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: 16 }}>
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.textDisabled,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 8,
                    }}
                  >
                    Part Name
                  </Text>
                  <TextInput
                    placeholder="e.g. 50MFD Capacitor"
                    placeholderTextColor={colors.placeholderText}
                    value={partName}
                    onChangeText={setPartName}
                    style={{
                      backgroundColor: colors.bgInput,
                      borderRadius: 10,
                      padding: 12,
                      fontFamily: "Inter",
                      fontSize: 14,
                      color: colors.textPrimary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 9,
                        fontWeight: "700",
                        color: colors.textDisabled,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        marginBottom: 8,
                      }}
                    >
                      Quantity
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={partQty}
                      onChangeText={setPartQty}
                      style={{
                        backgroundColor: colors.bgInput,
                        borderRadius: 10,
                        padding: 12,
                        fontFamily: "Space Grotesk",
                        fontSize: 14,
                        color: colors.textPrimary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 9,
                        fontWeight: "700",
                        color: colors.textDisabled,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        marginBottom: 8,
                      }}
                    >
                      Price (Per Unit)
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={colors.placeholderText}
                      value={partPrice}
                      onChangeText={setPartPrice}
                      style={{
                        backgroundColor: colors.bgInput,
                        borderRadius: 10,
                        padding: 12,
                        fontFamily: "Space Grotesk",
                        fontSize: 14,
                        color: colors.textPrimary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.textDisabled,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 8,
                    }}
                  >
                    Warranty (Optional)
                  </Text>
                  <TextInput
                    placeholder="e.g. 6 Months"
                    placeholderTextColor={colors.placeholderText}
                    value={partWarranty}
                    onChangeText={setPartWarranty}
                    style={{
                      backgroundColor: colors.bgInput,
                      borderRadius: 10,
                      padding: 12,
                      fontFamily: "Inter",
                      fontSize: 14,
                      color: colors.textPrimary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddPart}
                style={{
                  backgroundColor: colors.secondary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 32,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: "#fff",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  {editingPartId ? "Save Changes" : "Add to Job"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default PartsSection;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    maxHeight: "85%",
  },
});

