// export default EditReturnScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  deleteReturnItem,
  deleteReturnStockItem,
  getReturnItems,
  getReturnStockItems,
  getStockItem,
  saveReturnStockItem,
  saveStockMovement,
  updateReturnItem,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";


type ReturnStatus =
  | "no_stock_change"
  | "back_to_stock"
  | "pending_return"
  | "returned_to_supplier";

const statusOptions = [
  { label: "No Stock Change", value: "no_stock_change" },
  { label: "Back to Stock", value: "back_to_stock" },
  { label: "Pending Return", value: "pending_return" },
  { label: "Returned to Supplier", value: "returned_to_supplier" },
];

const EditReturnScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [stockItemId, setStockItemId] = useState("");
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [status, setStatus] = useState<ReturnStatus>("no_stock_change");
  const [originalStatus, setOriginalStatus] = useState<ReturnStatus>("no_stock_change");
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === "dark" ? "#555" : "#ccc";

  useEffect(() => {
    if (!id) return;

    const loadItem = async () => {
      try {
        const returnItems = await getReturnItems();
        const returnItem = returnItems.find((i) => String(i.id) === String(id));

        if (returnItem) {
          const savedStatus =
            (returnItem.status as ReturnStatus) || "no_stock_change";

          setName(returnItem.name ?? "");
          setQuantity(Number(returnItem.quantity ?? 0));
          setReason(returnItem.reason ?? "");
          setDate(
            returnItem.date
              ? new Date(returnItem.date).toLocaleDateString("en-GB")
              : ""
          );
          setStockItemId(returnItem.stockItemId ?? "");
          setOriginalQuantity(Number(returnItem.quantity ?? 0));
          setStatus(savedStatus);
          setOriginalStatus(savedStatus);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Could not load return item.");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const statusLabel = useMemo(() => {
    return (
      statusOptions.find((option) => option.value === status)?.label ||
      "No Stock Change"
    );
  }, [status]);

  const quantityDiff = Number(quantity) - Number(originalQuantity);

  const syncSupplierReturnList = async (newStatus: ReturnStatus) => {
    const existingSupplierReturns = await getReturnStockItems();

    const existingSupplierReturn = existingSupplierReturns.find(
      (item) => item.returnItemId === String(id)
    );

    if (newStatus === "pending_return") {
      if (existingSupplierReturn) return;

      const stock = stockItemId ? await getStockItem(stockItemId) : null;

      await saveReturnStockItem({
        returnItemId: String(id),
        stockItemId,
        name,
        category: stock?.category || "",
        quantity,
        reason,
        supplierName: stock?.supplierName || "",
        syncedAt: "",
        synced: false,
      });

      return;
    }

    if (existingSupplierReturn) {
      await deleteReturnStockItem(existingSupplierReturn.id);
    }
  };

  const saveReturnRecord = async () => {
    await updateReturnItem(id as string, {
      name,
      quantity,
      reason,
      stockItemId,
      status,
    } as any);

    await syncSupplierReturnList(status);
  };

  const getCurrentBalance = async () => {
    if (!stockItemId) return 0;
    const stock = await getStockItem(stockItemId);
    return Number(stock?.quantity || 0);
  };

  const validate = () => {
    if (!id) {
      Alert.alert("Error", "Missing return ID.");
      return false;
    }

    if (!reason.trim()) {
      Alert.alert("Missing Reason", "Please enter a return reason.");
      return false;
    }

    if (quantity <= 0) {
      Alert.alert("Invalid Quantity", "Quantity must be greater than 0.");
      return false;
    }

    return true;
  };

  const handleSaveOnly = async () => {
    try {
      const balanceAfter = await getCurrentBalance();

      await saveReturnRecord();

      await saveStockMovement({
        stockItemId: stockItemId || "",
        itemName: name,
        type: "NO_CHANGE",
        quantity: Number(quantity),
        source: "CUSTOMER_RETURN",
        sourceLabel: "Return updated - no stock change",
        balanceAfter,
        referenceId: id as string,
        referenceType: "RETURN",
        note: `Return status updated to ${statusLabel}. Reason: ${reason}`,
      });

      Alert.alert("Updated", "Return record updated.");
      router.back();
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Could not update return.");
    }
  };

  const handleSaveAndAdjustStock = async () => {
    try {
      if (stockItemId && quantityDiff !== 0) {
        const stock = await getStockItem(stockItemId);

        if (stock) {
          const newQty = Number(stock.quantity) - Number(quantityDiff);

          if (newQty < 0) {
            Alert.alert(
              "Not Enough Stock",
              "This quantity change would make stock negative."
            );
            return;
          }

          await updateStockQuantity(stockItemId, newQty);

          await saveStockMovement({
            stockItemId,
            itemName: name || stock.name,
            type: quantityDiff > 0 ? "OUT" : "IN",
            quantity: Math.abs(Number(quantityDiff)),
            source: "CUSTOMER_RETURN",
            sourceLabel:
              quantityDiff > 0
                ? "Return updated - stock reduced"
                : "Return updated - stock added back",
            balanceAfter: newQty,
            referenceId: id as string,
            referenceType: "RETURN",
            note: `Return quantity changed from ${originalQuantity} to ${quantity}. Reason: ${reason}`,
          });
        }
      }

      await saveReturnRecord();

      Alert.alert("Updated", "Return updated and stock adjusted.");
      router.back();
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Could not update return.");
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const statusChanged = status !== originalStatus;
    const quantityChanged = quantityDiff !== 0;

    if (!quantityChanged && !statusChanged) {
      await saveReturnRecord();
      Alert.alert("Updated", "Return record updated.");
      router.back();
      return;
    }

    if (!quantityChanged && statusChanged) {
      Alert.alert(
        "Update Status?",
        `Status will change to "${statusLabel}". Stock quantity will not be changed.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Update",
            onPress: handleSaveOnly,
          },
        ]
      );
      return;
    }

    Alert.alert(
      "Quantity Changed",
      quantityDiff > 0
        ? `Return quantity increased by ${quantityDiff}. Do you want to reduce stock by ${quantityDiff} as well?`
        : `Return quantity decreased by ${Math.abs(
            quantityDiff
          )}. Do you want to add ${Math.abs(quantityDiff)} back to stock?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save Only",
          onPress: handleSaveOnly,
        },
        {
          text: "Save & Adjust Stock",
          onPress: handleSaveAndAdjustStock,
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Return",
      "This will delete the return history. Do you also want to restore stock?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Only",
          style: "destructive",
          onPress: async () => {
            try {
              const balanceAfter = await getCurrentBalance();

              await syncSupplierReturnList("no_stock_change");
              await deleteReturnItem(id as string);

              await saveStockMovement({
                stockItemId: stockItemId || "",
                itemName: name,
                type: "NO_CHANGE",
                quantity: Number(originalQuantity),
                source: "CUSTOMER_RETURN",
                sourceLabel: "Return deleted - no stock change",
                balanceAfter,
                referenceId: id as string,
                referenceType: "RETURN",
                note: "Return record deleted only",
              });

              Alert.alert("Deleted", "Return deleted.");
              router.back();
            } catch (error: any) {
              Alert.alert("Delete Failed", error.message || "Could not delete.");
            }
          },
        },
        {
          text: "Delete & Restore",
          style: "destructive",
          onPress: async () => {
            try {
              if (stockItemId) {
                const stock = await getStockItem(stockItemId);

                if (stock) {
                  const newQty =
                    Number(stock.quantity) + Number(originalQuantity);

                  await updateStockQuantity(stockItemId, newQty);

                  await saveStockMovement({
                    stockItemId,
                    itemName: name || stock.name,
                    type: "IN",
                    quantity: Number(originalQuantity),
                    source: "CUSTOMER_RETURN",
                    sourceLabel: "Return deleted - stock restored",
                    balanceAfter: newQty,
                    referenceId: id as string,
                    referenceType: "RETURN",
                    note: "Return deleted and stock restored",
                  });
                }
              }

              await syncSupplierReturnList("no_stock_change");
              await deleteReturnItem(id as string);

              Alert.alert("Deleted", "Return deleted and stock restored.");
              router.back();
            } catch (error: any) {
              Alert.alert("Delete Failed", error.message || "Could not delete.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenWrapper scroll>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading return...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Edit Return</Text>

          <Text style={styles.subtitle}>
            Update the return record and choose whether stock should also be
            adjusted.
          </Text>

          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={name}
            editable={false}
            placeholder="Item name"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          />

          {/* <Text style={styles.label}>Return Date</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={date}
            editable={false}
            placeholder="Return date"
          /> */}

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={String(quantity)}
            keyboardType="numeric"
            onChangeText={(val) => setQuantity(Number(val) || 0)}
            placeholder="Enter quantity"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          />

          {quantityDiff !== 0 && (
            <View style={styles.diffBox}>
              <Text style={styles.diffText}>
                Quantity changed by {quantityDiff > 0 ? "+" : ""}
                {quantityDiff}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Reason</Text>
          <TextInput
            style={[styles.input, styles.reasonInput]}
            value={reason}
            onChangeText={setReason}
            placeholder="Enter reason"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            multiline
          />

          <Text style={styles.label}>Return Status</Text>
          <Dropdown
            style={[styles.dropdown, { borderColor }]}
            data={statusOptions}
            labelField="label"
            valueField="value"
            placeholder="Select status"
            value={status}
            onChange={(item) => setStatus(item.value as ReturnStatus)}
            maxHeight={250}
            mode="modal"
          />

          <View
            style={[
              styles.statusPreview,
              status === "pending_return"
                ? styles.pendingBadge
                : status === "returned_to_supplier"
                ? styles.returnedBadge
                : status === "back_to_stock"
                ? styles.backToStockBadge
                : styles.noStockChangeBadge,
            ]}
          >
            <Text style={styles.statusPreviewText}>{statusLabel}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.buttonWrapper, { marginRight: 8 }]}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <LinearGradient
                colors={["#4CAF50", "#2E7D32"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Update</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonWrapper, { marginLeft: 8 }]}
              activeOpacity={0.85}
              onPress={handleDelete}
            >
              <LinearGradient
                colors={["#d9534f", "#c9302c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    gap: 12,
    marginBottom: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  reasonInput: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  diffBox: {
    backgroundColor: "#fffbeb",
    borderColor: "#fbbf24",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  diffText: {
    color: "#92400e",
    fontWeight: "900",
  },
  statusPreview: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPreviewText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  pendingBadge: {
    backgroundColor: "#f97316",
  },
  returnedBadge: {
    backgroundColor: "#6b7280",
  },
  backToStockBadge: {
    backgroundColor: "#2563eb",
  },
  noStockChangeBadge: {
    backgroundColor: "#16a34a",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  buttonWrapper: {
    flex: 1,
  },
  gradientButton: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },
});

export default EditReturnScreen;