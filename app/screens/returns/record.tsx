// export default RecordReturnScreen;

// import ScreenWrapper from "@/components/ScreenWrapper";
// import {
//   getStockItems,
//   saveReturnItem,
//   updateStockQuantity,
// } from "@/lib/storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";

// const RecordReturnScreen: React.FC = () => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const textColor = isDark ? '#fff' : '#333';
//   const bgColor = isDark ? '#1e1e1e' : '#f9f9f9';
//   const borderColor = isDark ? '#555' : '#ccc';

//   const [stockItems, setStockItems] = useState<any[]>([]);
//   const [selectedItemId, setSelectedItemId] = useState("");
//   const [quantity, setQuantity] = useState<number | "">("");
//   const [reason, setReason] = useState("");


//   // ✅ Fetch stock items
//   useEffect(() => {
//     const fetchStock = async () => {
//       const items = await getStockItems();
//       if (items) setStockItems(items);
//     };
//     fetchStock();
//   }, []);

//   // ✅ Save logic
//   const handleSave = async () => {
//     if (!selectedItemId || quantity === "" || !reason.trim()) {
//       Alert.alert("Error", "Please fill all fields before saving.");
//       return;
//     }

//     const stockItem = stockItems.find((item) => item.id === selectedItemId);
//     if (!stockItem) {
//       Alert.alert("Error", "Selected stock item not found.");
//       return;
//     }

//     if (quantity > stockItem.quantity) {
//       Alert.alert("Error", `Not enough stock. Available: ${stockItem.quantity}`);
//       return;
//     }

//     Alert.alert(
//       "Adjust Stock?",
//       "Do you want to adjust stock quantity for this return?",
//       [
//         {
//           text: "No",
//           style: "cancel",
//           onPress: async () => {
//             await saveReturnItem({
//               stockItemId: stockItem.id,
//               name: stockItem.name,
//               quantity,
//               reason,
//               date: new Date().toISOString(),
//             });
//             Alert.alert("Success", "Return recorded (stock unchanged).");
//             router.replace("/(tabs)/returnsList");
//           },
//         },
//         {
//           text: "Decrease",
//           onPress: async () => {
//             await updateStockQuantity(stockItem.id, stockItem.quantity - quantity);
//             await saveReturnItem({
//               stockItemId: stockItem.id,
//               name: stockItem.name,
//               quantity,
//               reason,
//               date: new Date().toISOString(),
//             });
//             Alert.alert("Success", "Return recorded and stock updated.");
//             router.replace("/(tabs)/returnsList");
//           },
//         },
//         {
//           text: "Increase",
//           onPress: async () => {
//             await updateStockQuantity(stockItem.id, stockItem.quantity + quantity);
//             await saveReturnItem({
//               stockItemId: stockItem.id,
//               name: stockItem.name,
//               quantity,
//               reason,
//               date: new Date().toISOString(),
//             });
//             Alert.alert("Success", "Return recorded and stock updated.");
//             router.replace("/(tabs)/returnsList");
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//            {/* 🧾 Stock Item Dropdown */}
//           <Dropdown
//             style={[styles.dropdown, { borderColor }]}
//             data={stockItems.map((item) => ({
//               label: `${item.name} (${item.quantity} in stock)`,
//               value: item.id,
//             }))}
//             labelField="label"
//             valueField="value"
//             placeholder="Select Stock Item"
//             value={selectedItemId}
//             onChange={(item) => {
//               setSelectedItemId(item.value);
//               const selectedItem = stockItems.find((s) => s.id === item.value);
              
//             }}
//           />
//           {/* ✅ Quantity Input */}
//           <Text style={[styles.label]}>Quantity</Text>
//           <TextInput
//             value={quantity === "" ? "" : String(quantity)}
//             onChangeText={(text) => setQuantity(text === "" ? "" : parseInt(text))}
//             keyboardType="numeric"
//             style={[styles.input]}
//             placeholder="Enter quantity"
//             placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
//           />

//           {/* ✅ Reason Input */}
//           <Text style={[styles.label]}>Reason for Return</Text>
//           <TextInput
//             value={reason}
//             onChangeText={setReason}
//             style={[
//               styles.input,
//               { height: 80 },
//             ]}
//             placeholder="Enter reason (e.g., Damaged, Returned)"
//             placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
//             multiline
//           />

//           {/* ✅ Save Button */}
//           <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
//             <LinearGradient
//               colors={["#4CAF50", "#2E7D32"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.gradientButton}
//             >
//               <Text style={styles.buttonText}>Save Return</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </ScrollView>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     padding: 20,
//     gap: 15,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   stockListContainer: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 10,
//     padding: 10,
//   },
//   stockItem: {
//     padding: 10,
//     borderRadius: 6,
//     marginBottom: 6,
//   },
//   stockItemSelected: {
//     backgroundColor: "#4CAF50",
//   },
//   input: {
//     height: 45,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//   },
//   gradientButton: {
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
//     dropdown: {
//     height: 50,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginBottom: 10,
//   },
// });

// export default RecordReturnScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  saveReturnItem,
  saveReturnStockItem,
  saveStockMovement,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const returnReasons = [
  { label: "Damaged", value: "Damaged" },
  { label: "Expired", value: "Expired" },
  { label: "Faulty", value: "Faulty" },
  { label: "Wrong Item", value: "Wrong Item" },
  { label: "Customer Return", value: "Customer Return" },
  { label: "Other", value: "Other" },
];

const RecordReturnScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const borderColor = isDark ? "#555" : "#ccc";

  const [stockItems, setStockItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    const fetchStock = async () => {
      const items = await getStockItems();
      if (items) setStockItems(items);
    };

    fetchStock();
  }, []);

  const selectedItem = useMemo(
    () => stockItems.find((item) => item.id === selectedItemId),
    [stockItems, selectedItemId]
  );

  const finalReason = reason === "Other" ? customReason : reason;

  const validate = () => {
    if (!selectedItemId || quantity === "" || !finalReason.trim()) {
      Alert.alert("Missing Details", "Please select item, quantity and reason.");
      return false;
    }

    if (!selectedItem) {
      Alert.alert("Error", "Selected stock item not found.");
      return false;
    }

    if (Number(quantity) <= 0) {
      Alert.alert("Invalid Quantity", "Quantity must be greater than 0.");
      return false;
    }

    if (Number(quantity) > Number(selectedItem.quantity)) {
      Alert.alert("Not Enough Stock", `Available stock: ${selectedItem.quantity}`);
      return false;
    }

    return true;
  };

  const saveReturnOnly = async () => {
    try {
      const returnDate = new Date().toISOString();

      const savedReturn = await saveReturnItem({
        stockItemId: selectedItem.id,
        name: selectedItem.name,
        quantity: Number(quantity),
        reason: finalReason,
        status: "no_stock_change",
        date: returnDate,
      });

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "NO_CHANGE",
        quantity: Number(quantity),
        source: "RETURN_TO_SUPPLIER",
        sourceLabel: "Return recorded - no stock change",
        balanceAfter: Number(selectedItem.quantity),
        referenceId: savedReturn.id,
        referenceType: "RETURN",
        note: finalReason,
      });

      Alert.alert("Success", "Return recorded. Stock was not changed.");
      router.replace("/(tabs)/returnsList");
    } catch (error: any) {
      console.error("Failed to save return:", error);
      Alert.alert("Error", error.message || "Failed to save return.");
    }
  };

  const increaseStock = async () => {
    try {
      const returnDate = new Date().toISOString();
      const returnQty = Number(quantity);
      const newBalance = Number(selectedItem.quantity) + returnQty;

      await updateStockQuantity(selectedItem.id, newBalance);

      const savedReturn = await saveReturnItem({
        stockItemId: selectedItem.id,
        name: selectedItem.name,
        quantity: returnQty,
        reason: finalReason,
        status: "back_to_stock",
        date: returnDate,
      });

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "IN",
        quantity: returnQty,
        source: "CUSTOMER_RETURN",
        sourceLabel: "Customer return - added back to stock",
        balanceAfter: newBalance,
        referenceId: savedReturn.id,
        referenceType: "RETURN",
        note: finalReason,
      });

      Alert.alert("Success", "Return recorded and stock increased.");
      router.replace("/(tabs)/returnsList");
    } catch (error: any) {
      console.error("Failed to increase stock:", error);
      Alert.alert("Error", error.message || "Failed to increase stock.");
    }
  };

  const decreaseStockAndAddToSupplierReturn = async () => {
    try {
      const returnDate = new Date().toISOString();
      const returnQty = Number(quantity);
      const newBalance = Number(selectedItem.quantity) - returnQty;

      await updateStockQuantity(selectedItem.id, newBalance);

      const savedReturn = await saveReturnItem({
        stockItemId: selectedItem.id,
        name: selectedItem.name,
        quantity: returnQty,
        reason: finalReason,
        status: "pending_return",
        date: returnDate,
      });

      await saveReturnStockItem({
        returnItemId: savedReturn.id,
        stockItemId: selectedItem.id,
        name: selectedItem.name,
        category: selectedItem.category,
        quantity: returnQty,
        reason: finalReason,
        supplierName: selectedItem.supplierName || "",
        date: returnDate,
      });

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "OUT",
        quantity: returnQty,
        source: "RETURN_TO_SUPPLIER",
        sourceLabel: "Return to supplier - removed from stock",
        balanceAfter: newBalance,
        referenceId: savedReturn.id,
        referenceType: "SUPPLIER_RETURN",
        note: finalReason,
      });

      Alert.alert(
        "Success",
        "Item removed from stock and added to Supplier Return List."
      );

      router.replace("/screens/ReturnStockListScreen");
    } catch (error: any) {
      console.error("Failed to return stock to supplier:", error);
      Alert.alert("Error", error.message || "Failed to process supplier return.");
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    Alert.alert("Return Type", "What should happen to stock?", [
      {
        text: "No Stock Change",
        onPress: saveReturnOnly,
      },
      {
        text: "Back to Stock",
        onPress: increaseStock,
      },
      {
        text: "Return to Supplier",
        style: "destructive",
        onPress: decreaseStockAndAddToSupplierReturn,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <ScreenWrapper scroll>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Record Return</Text>
            <Text style={styles.subtitle}>
              Choose whether the item goes back to stock or supplier return list.
            </Text>

            <Text style={styles.label}>Stock Item</Text>
            <Dropdown
              style={[styles.dropdown, { borderColor }]}
              data={stockItems.map((item) => ({
                label: `${item.name} (${item.quantity} ${item.unit || "pcs"} in stock)`,
                value: item.id,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Stock Item"
              value={selectedItemId}
              onChange={(item) => setSelectedItemId(item.value)}
            />

            {selectedItem && (
              <View style={styles.itemInfoBox}>
                <Text style={styles.itemInfoTitle}>{selectedItem.name}</Text>
                <Text style={styles.itemInfoText}>
                  Category: {selectedItem.category || "Uncategorised"}
                </Text>
                <Text style={styles.itemInfoText}>
                  Available: {selectedItem.quantity} {selectedItem.unit || "pcs"}
                </Text>
                {selectedItem.supplierName ? (
                  <Text style={styles.itemInfoText}>
                    Supplier: {selectedItem.supplierName}
                  </Text>
                ) : null}
              </View>
            )}

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={quantity === "" ? "" : String(quantity)}
              onChangeText={(text) =>
                setQuantity(text === "" ? "" : Number(text) || 0)
              }
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter quantity"
              placeholderTextColor="#777"
            />

            <Text style={styles.label}>Reason for Return</Text>
            <Dropdown
              style={[styles.dropdown, { borderColor }]}
              data={returnReasons}
              labelField="label"
              valueField="value"
              placeholder="Select reason"
              value={reason}
              onChange={(item) => {
                setReason(item.value);
                if (item.value !== "Other") setCustomReason("");
              }}
            />

            {reason === "Other" && (
              <TextInput
                value={customReason}
                onChangeText={setCustomReason}
                style={[styles.input, { height: 80 }]}
                placeholder="Enter custom reason"
                placeholderTextColor="#777"
                multiline
              />
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Return Options</Text>
              <Text style={styles.infoText}>
                • Back to Stock = usable item returned
              </Text>
              <Text style={styles.infoText}>
                • Return to Supplier = damaged/faulty item removed from stock
              </Text>
              <Text style={styles.infoText}>
                • No Stock Change = record only
              </Text>
            </View>

            <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      {/* </SafeAreaView> */}
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
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  itemInfoBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  itemInfoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  itemInfoText: {
    color: "#374151",
    marginTop: 2,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 6,
  },
  infoTitle: {
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  infoText: {
    color: "#4b5563",
    marginTop: 3,
  },
  gradientButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
  },
});

export default RecordReturnScreen;