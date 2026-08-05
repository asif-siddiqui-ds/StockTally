// // export default RecordReturnScreen;

// import ScreenWrapper from "@/components/ScreenWrapper";
// import {
//   getStockItems,
//   saveReturnItem,
//   saveReturnStockItem,
//   saveStockMovement,
//   updateStockQuantity,
// } from "@/lib/storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useColorScheme
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";

// const returnReasons = [
//   { label: "Damaged", value: "Damaged" },
//   { label: "Expired", value: "Expired" },
//   { label: "Faulty", value: "Faulty" },
//   { label: "Wrong Item", value: "Wrong Item" },
//   { label: "Customer Return", value: "Customer Return" },
//   { label: "Other", value: "Other" },
// ];

// const RecordReturnScreen: React.FC = () => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   const borderColor = isDark ? "#555" : "#ccc";

//   const [stockItems, setStockItems] = useState<any[]>([]);
//   const [selectedItemId, setSelectedItemId] = useState("");
//   const [quantity, setQuantity] = useState<number | "">("");
//   const [reason, setReason] = useState("");
//   const [customReason, setCustomReason] = useState("");

//   useEffect(() => {
//     const fetchStock = async () => {
//       const items = await getStockItems();
//       if (items) setStockItems(items);
//     };

//     fetchStock();
//   }, []);

//   const selectedItem = useMemo(
//     () => stockItems.find((item) => item.id === selectedItemId),
//     [stockItems, selectedItemId]
//   );

//   const finalReason = reason === "Other" ? customReason : reason;

//   const validate = () => {
//     if (!selectedItemId || quantity === "" || !finalReason.trim()) {
//       Alert.alert("Missing Details", "Please select item, quantity and reason.");
//       return false;
//     }

//     if (!selectedItem) {
//       Alert.alert("Error", "Selected stock item not found.");
//       return false;
//     }

//     if (Number(quantity) <= 0) {
//       Alert.alert("Invalid Quantity", "Quantity must be greater than 0.");
//       return false;
//     }

//     if (Number(quantity) > Number(selectedItem.quantity)) {
//       Alert.alert("Not Enough Stock", `Available stock: ${selectedItem.quantity}`);
//       return false;
//     }

//     return true;
//   };

//   const saveReturnOnly = async () => {
//     try {
//       const returnDate = new Date().toISOString();

//       const savedReturn = await saveReturnItem({
//         stockItemId: selectedItem.id,
//         name: selectedItem.name,
//         quantity: Number(quantity),
//         reason: finalReason,
//         status: "no_stock_change",
//         date: returnDate,
//       });

//       await saveStockMovement({
//         stockItemId: selectedItem.id,
//         itemName: selectedItem.name,
//         type: "NO_CHANGE",
//         quantity: Number(quantity),
//         source: "RETURN_TO_SUPPLIER",
//         sourceLabel: "Return recorded - no stock change",
//         balanceAfter: Number(selectedItem.quantity),
//         referenceId: savedReturn.id,
//         referenceType: "RETURN",
//         note: finalReason,
//       });

//       Alert.alert("Success", "Return recorded. Stock was not changed.");
//       router.replace("/(tabs)/returnsList");
//     } catch (error: any) {
//       console.error("Failed to save return:", error);
//       Alert.alert("Error", error.message || "Failed to save return.");
//     }
//   };

//   const increaseStock = async () => {
//     try {
//       const returnDate = new Date().toISOString();
//       const returnQty = Number(quantity);
//       const newBalance = Number(selectedItem.quantity) + returnQty;

//       await updateStockQuantity(selectedItem.id, newBalance);

//       const savedReturn = await saveReturnItem({
//         stockItemId: selectedItem.id,
//         name: selectedItem.name,
//         quantity: returnQty,
//         reason: finalReason,
//         status: "back_to_stock",
//         date: returnDate,
//       });

//       await saveStockMovement({
//         stockItemId: selectedItem.id,
//         itemName: selectedItem.name,
//         type: "IN",
//         quantity: returnQty,
//         source: "CUSTOMER_RETURN",
//         sourceLabel: "Customer return - added back to stock",
//         balanceAfter: newBalance,
//         referenceId: savedReturn.id,
//         referenceType: "RETURN",
//         note: finalReason,
//       });

//       Alert.alert("Success", "Return recorded and stock increased.");
//       router.replace("/(tabs)/returnsList");
//     } catch (error: any) {
//       console.error("Failed to increase stock:", error);
//       Alert.alert("Error", error.message || "Failed to increase stock.");
//     }
//   };

//   const decreaseStockAndAddToSupplierReturn = async () => {
//     try {
//       const returnDate = new Date().toISOString();
//       const returnQty = Number(quantity);
//       const newBalance = Number(selectedItem.quantity) - returnQty;

//       await updateStockQuantity(selectedItem.id, newBalance);

//       const savedReturn = await saveReturnItem({
//         stockItemId: selectedItem.id,
//         name: selectedItem.name,
//         quantity: returnQty,
//         reason: finalReason,
//         status: "pending_return",
//         date: returnDate,
//       });

//       await saveReturnStockItem({
//         returnItemId: savedReturn.id,
//         stockItemId: selectedItem.id,
//         name: selectedItem.name,
//         category: selectedItem.category,
//         quantity: returnQty,
//         reason: finalReason,
//         supplierName: selectedItem.supplierName || "",
//         date: returnDate,
//       });

//       await saveStockMovement({
//         stockItemId: selectedItem.id,
//         itemName: selectedItem.name,
//         type: "OUT",
//         quantity: returnQty,
//         source: "RETURN_TO_SUPPLIER",
//         sourceLabel: "Return to supplier - removed from stock",
//         balanceAfter: newBalance,
//         referenceId: savedReturn.id,
//         referenceType: "SUPPLIER_RETURN",
//         note: finalReason,
//       });

//       Alert.alert(
//         "Success",
//         "Item removed from stock and added to Supplier Return List."
//       );

//       router.replace("/screens/ReturnStockListScreen");
//     } catch (error: any) {
//       console.error("Failed to return stock to supplier:", error);
//       Alert.alert("Error", error.message || "Failed to process supplier return.");
//     }
//   };

//   const handleSave = async () => {
//     if (!validate()) return;

//     Alert.alert("Return Type", "What should happen to stock?", [
//       {
//         text: "No Stock Change",
//         onPress: saveReturnOnly,
//       },
//       {
//         text: "Back to Stock",
//         onPress: increaseStock,
//       },
//       {
//         text: "Return to Supplier",
//         style: "destructive",
//         onPress: decreaseStockAndAddToSupplierReturn,
//       },
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//     ]);
//   };

//   return (
//     <ScreenWrapper scroll>
//       {/* <SafeAreaView style={{ flex: 1 }}> */}
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContainer}>
//             <Text style={styles.title}>Record Return</Text>
//             <Text style={styles.subtitle}>
//               Choose whether the item goes back to stock or supplier return list.
//             </Text>

//             <Text style={styles.label}>Stock Item</Text>
//             <Dropdown
//               style={[styles.dropdown, { borderColor }]}
//               data={stockItems.map((item) => ({
//                 label: `${item.name} (${item.quantity} ${item.unit || "pcs"} in stock)`,
//                 value: item.id,
//               }))}
//               labelField="label"
//               valueField="value"
//               placeholder="Select Stock Item"
//               value={selectedItemId}
//               onChange={(item) => setSelectedItemId(item.value)}
//             />

//             {selectedItem && (
//               <View style={styles.itemInfoBox}>
//                 <Text style={styles.itemInfoTitle}>{selectedItem.name}</Text>
//                 <Text style={styles.itemInfoText}>
//                   Category: {selectedItem.category || "Uncategorised"}
//                 </Text>
//                 <Text style={styles.itemInfoText}>
//                   Available: {selectedItem.quantity} {selectedItem.unit || "pcs"}
//                 </Text>
//                 {selectedItem.supplierName ? (
//                   <Text style={styles.itemInfoText}>
//                     Supplier: {selectedItem.supplierName}
//                   </Text>
//                 ) : null}
//               </View>
//             )}

//             <Text style={styles.label}>Quantity</Text>
//             <TextInput
//               value={quantity === "" ? "" : String(quantity)}
//               onChangeText={(text) =>
//                 setQuantity(text === "" ? "" : Number(text) || 0)
//               }
//               keyboardType="numeric"
//               style={styles.input}
//               placeholder="Enter quantity"
//               placeholderTextColor="#777"
//             />

//             <Text style={styles.label}>Reason for Return</Text>
//             <Dropdown
//               style={[styles.dropdown, { borderColor }]}
//               data={returnReasons}
//               labelField="label"
//               valueField="value"
//               placeholder="Select reason"
//               value={reason}
//               onChange={(item) => {
//                 setReason(item.value);
//                 if (item.value !== "Other") setCustomReason("");
//               }}
//             />

//             {reason === "Other" && (
//               <TextInput
//                 value={customReason}
//                 onChangeText={setCustomReason}
//                 style={[styles.input, { height: 80 }]}
//                 placeholder="Enter custom reason"
//                 placeholderTextColor="#777"
//                 multiline
//               />
//             )}

//             <View style={styles.infoCard}>
//               <Text style={styles.infoTitle}>Return Options</Text>
//               <Text style={styles.infoText}>
//                 • Back to Stock = usable item returned
//               </Text>
//               <Text style={styles.infoText}>
//                 • Return to Supplier = damaged/faulty item removed from stock
//               </Text>
//               <Text style={styles.infoText}>
//                 • No Stock Change = record only
//               </Text>
//             </View>

//             <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
//               <LinearGradient
//                 colors={["#2563eb", "#1d4ed8"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.gradientButton}
//               >
//                 <Text style={styles.buttonText}>Continue</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       {/* </SafeAreaView> */}
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     padding: 20,
//     gap: 12,
//     marginBottom: 120,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "900",
//     color: "#111827",
//   },
//   subtitle: {
//     color: "#6b7280",
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   dropdown: {
//     height: 52,
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     backgroundColor: "#fff",
//   },
//   input: {
//     minHeight: 50,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     backgroundColor: "#fff",
//     fontSize: 16,
//   },
//   itemInfoBox: {
//     backgroundColor: "#eff6ff",
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#bfdbfe",
//   },
//   itemInfoTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: "#111827",
//     marginBottom: 4,
//   },
//   itemInfoText: {
//     color: "#374151",
//     marginTop: 2,
//     fontWeight: "600",
//   },
//   infoCard: {
//     backgroundColor: "#f9fafb",
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     marginTop: 6,
//   },
//   infoTitle: {
//     fontWeight: "900",
//     color: "#111827",
//     marginBottom: 6,
//   },
//   infoText: {
//     color: "#4b5563",
//     marginTop: 3,
//   },
//   gradientButton: {
//     borderRadius: 14,
//     paddingVertical: 15,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     fontSize: 17,
//     fontWeight: "900",
//     color: "#fff",
//   },
// });

// export default RecordReturnScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  saveReturnItem,
  saveReturnStockItem,
  saveStockMovement,
  StockItem,
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
  useColorScheme,
  View,
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

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchStock = async () => {
      try {
        const items = await getStockItems();

        if (mounted) {
          const sorted = [...items].sort((a, b) =>
            a.name.localeCompare(b.name),
          );

          setStockItems(sorted);
        }
      } catch (error: any) {
        console.error("Failed to load stock items:", error);

        if (mounted) {
          Alert.alert(
            "Error",
            error.message || "Could not load stock items.",
          );
        }
      }
    };

    fetchStock();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedItem = useMemo(
    () =>
      stockItems.find(
        (item) => item.id === selectedItemId,
      ) ?? null,
    [stockItems, selectedItemId],
  );

  const parsedQuantity = Number(quantity);

  const finalReason =
    reason === "Other"
      ? customReason.trim()
      : reason.trim();

  const unitCost = Number(selectedItem?.costPrice || 0);

  const returnValue =
    Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? parsedQuantity * unitCost
      : 0;

  const validateBasicDetails = (): boolean => {
    if (!selectedItemId) {
      Alert.alert(
        "Stock Item Required",
        "Please select a stock item.",
      );

      return false;
    }

    if (!selectedItem) {
      Alert.alert(
        "Error",
        "The selected stock item could not be found.",
      );

      return false;
    }

    if (!quantity.trim()) {
      Alert.alert(
        "Quantity Required",
        "Please enter the return quantity.",
      );

      return false;
    }

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      Alert.alert(
        "Invalid Quantity",
        "Quantity must be greater than zero.",
      );

      return false;
    }

    if (!finalReason) {
      Alert.alert(
        "Reason Required",
        "Please select or enter a reason for the return.",
      );

      return false;
    }

    return true;
  };

  const validateStockReduction = (): boolean => {
    if (!selectedItem) {
      return false;
    }

    if (parsedQuantity > Number(selectedItem.quantity || 0)) {
      Alert.alert(
        "Not Enough Stock",
        `Available stock: ${selectedItem.quantity} ${
          selectedItem.unit || "pcs"
        }`,
      );

      return false;
    }

    return true;
  };

  const saveReturnOnly = async () => {
    if (!selectedItem || saving) {
      return;
    }

    try {
      setSaving(true);

      const savedReturn = await saveReturnItem({
        stockItemId: selectedItem.id,
        name: selectedItem.name,
        quantity: parsedQuantity,
        reason: finalReason,
        status: "no_stock_change",

        supplierId: selectedItem.supplierId,
        supplierName: selectedItem.supplierName,

        synced: false,
        syncedAt: "",
      });

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "NO_CHANGE",
        quantity: parsedQuantity,
        source: "RETURN_TO_SUPPLIER",
        sourceLabel: "Return recorded - no stock change",
        balanceAfter: Number(selectedItem.quantity || 0),
        referenceId: savedReturn.id,
        referenceType: "RETURN",
        note: finalReason,
      });

      Alert.alert(
        "Success",
        "Return recorded. Stock was not changed.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/(tabs)/returnsList"),
          },
        ],
      );
    } catch (error: any) {
      console.error("Failed to save return:", error);

      Alert.alert(
        "Error",
        error.message || "Failed to save return.",
      );
    } finally {
      setSaving(false);
    }
  };

  const increaseStock = async () => {
    if (!selectedItem || saving) {
      return;
    }

    try {
      setSaving(true);

      const currentQuantity = Number(
        selectedItem.quantity || 0,
      );

      const newBalance =
        currentQuantity + parsedQuantity;

      const updatedStock = await updateStockQuantity(
        selectedItem.id,
        newBalance,
      );

      if (!updatedStock) {
        throw new Error(
          "The stock item could not be updated.",
        );
      }

      const savedReturn = await saveReturnItem({
        stockItemId: selectedItem.id,
        name: selectedItem.name,
        quantity: parsedQuantity,
        reason: finalReason,
        status: "back_to_stock",

        supplierId: selectedItem.supplierId,
        supplierName: selectedItem.supplierName,

        synced: false,
        syncedAt: "",
      });

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "IN",
        quantity: parsedQuantity,
        source: "CUSTOMER_RETURN",
        sourceLabel:
          "Customer return - added back to stock",
        balanceAfter: newBalance,
        referenceId: savedReturn.id,
        referenceType: "RETURN",
        note: finalReason,
      });

      Alert.alert(
        "Success",
        "Return recorded and stock increased.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/(tabs)/returnsList"),
          },
        ],
      );
    } catch (error: any) {
      console.error("Failed to increase stock:", error);

      Alert.alert(
        "Error",
        error.message || "Failed to increase stock.",
      );
    } finally {
      setSaving(false);
    }
  };

  const decreaseStockAndAddToSupplierReturn =
    async () => {
      if (!selectedItem || saving) {
        return;
      }

      if (!validateStockReduction()) {
        return;
      }

      const supplierName =
        selectedItem.supplierName?.trim() || "";

      if (!selectedItem.supplierId && !supplierName) {
        Alert.alert(
          "Supplier Required",
          "This stock item is not linked to a supplier. Edit the stock item and select or enter a supplier before returning it.",
        );

        return;
      }

      try {
        setSaving(true);

        const currentQuantity = Number(
          selectedItem.quantity || 0,
        );

        const newBalance =
          currentQuantity - parsedQuantity;

        const updatedStock = await updateStockQuantity(
          selectedItem.id,
          newBalance,
        );

        if (!updatedStock) {
          throw new Error(
            "The stock quantity could not be updated.",
          );
        }

        const savedReturn = await saveReturnItem({
          stockItemId: selectedItem.id,
          name: selectedItem.name,
          quantity: parsedQuantity,
          reason: finalReason,
          status: "pending_return",

          supplierId: selectedItem.supplierId,
          supplierName,

          synced: false,
          syncedAt: "",
        });

        await saveReturnStockItem({
          returnItemId: savedReturn.id,
          stockItemId: selectedItem.id,

          name: selectedItem.name,
          category: selectedItem.category,

          quantity: parsedQuantity,
          unit: selectedItem.unit || "pcs",

          reason: finalReason,

          supplierId: selectedItem.supplierId,
          supplierName,

          unitCost,
          returnValue,

          status: "pending_return",

          synced: false,
          syncedAt: "",
        });

        await saveStockMovement({
          stockItemId: selectedItem.id,
          itemName: selectedItem.name,
          type: "OUT",
          quantity: parsedQuantity,
          source: "RETURN_TO_SUPPLIER",
          sourceLabel:
            "Return to supplier - removed from stock",
          balanceAfter: newBalance,
          referenceId: savedReturn.id,
          referenceType: "SUPPLIER_RETURN",
          note: finalReason,
        });

        Alert.alert(
          "Success",
          "Item removed from stock and added to the Supplier Returns list.",
          [
            {
              text: "View Supplier Returns",
              onPress: () =>
                router.replace(
                  "/screens/ReturnStockListScreen",
                ),
            },
          ],
        );
      } catch (error: any) {
        console.error(
          "Failed to return stock to supplier:",
          error,
        );

        /*
         * The stock update occurs before the return records are saved.
         * Attempt to restore the original quantity if a later operation fails.
         */
        try {
          await updateStockQuantity(
            selectedItem.id,
            Number(selectedItem.quantity || 0),
          );
        } catch (rollbackError) {
          console.error(
            "Failed to restore stock after supplier return error:",
            rollbackError,
          );
        }

        Alert.alert(
          "Error",
          error.message ||
            "Failed to process supplier return.",
        );
      } finally {
        setSaving(false);
      }
    };

  const handleSave = () => {
    if (!validateBasicDetails() || saving) {
      return;
    }

    Alert.alert(
      "Return Type",
      "What should happen to the stock quantity?",
      [
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
          onPress:
            decreaseStockAndAddToSupplierReturn,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  return (
    <ScreenWrapper scroll>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Record Return</Text>

          <Text style={styles.subtitle}>
            Choose whether the item goes back into
            stock, is returned to its supplier or is
            recorded without changing stock.
          </Text>

          <Text style={styles.label}>Stock Item</Text>

          <Dropdown
            style={[
              styles.dropdown,
              { borderColor },
            ]}
            containerStyle={styles.dropdownContainer}
            data={stockItems.map((item) => ({
              label: `${item.name} (${item.quantity} ${
                item.unit || "pcs"
              } in stock)`,
              value: item.id,
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select Stock Item"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.dropdownItemText}
            value={selectedItemId}
            search
            searchPlaceholder="Search stock items..."
            onChange={(item) => {
              setSelectedItemId(item.value);
              setQuantity("");
            }}
          />

          {selectedItem ? (
            <View style={styles.itemInfoBox}>
              <Text style={styles.itemInfoTitle}>
                {selectedItem.name}
              </Text>

              <Text style={styles.itemInfoText}>
                Category:{" "}
                {selectedItem.category ||
                  "Uncategorised"}
              </Text>

              <Text style={styles.itemInfoText}>
                Available: {selectedItem.quantity}{" "}
                {selectedItem.unit || "pcs"}
              </Text>

              <Text style={styles.itemInfoText}>
                Supplier:{" "}
                {selectedItem.supplierName ||
                  "Not linked"}
              </Text>

              {unitCost > 0 ? (
                <Text style={styles.itemInfoText}>
                  Unit cost: £{unitCost.toFixed(2)}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.label}>Quantity</Text>

          <TextInput
            value={quantity}
            onChangeText={(text) => {
              const cleaned = text.replace(
                /[^0-9.]/g,
                "",
              );

              const decimalParts = cleaned.split(".");

              if (decimalParts.length > 2) {
                return;
              }

              setQuantity(cleaned);
            }}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              { borderColor },
            ]}
            placeholder="Enter quantity"
            placeholderTextColor="#777"
          />

          {selectedItem &&
          quantity.trim() &&
          parsedQuantity > 0 ? (
            <View style={styles.calculationBox}>
              <Text style={styles.calculationLabel}>
                Return quantity
              </Text>

              <Text style={styles.calculationValue}>
                {parsedQuantity}{" "}
                {selectedItem.unit || "pcs"}
              </Text>

              {unitCost > 0 ? (
                <>
                  <Text
                    style={styles.calculationLabel}
                  >
                    Estimated return value
                  </Text>

                  <Text
                    style={styles.returnValueText}
                  >
                    £{returnValue.toFixed(2)}
                  </Text>
                </>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.label}>
            Reason for Return
          </Text>

          <Dropdown
            style={[
              styles.dropdown,
              { borderColor },
            ]}
            containerStyle={styles.dropdownContainer}
            data={returnReasons}
            labelField="label"
            valueField="value"
            placeholder="Select reason"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.dropdownItemText}
            value={reason}
            onChange={(item) => {
              setReason(item.value);

              if (item.value !== "Other") {
                setCustomReason("");
              }
            }}
          />

          {reason === "Other" ? (
            <TextInput
              value={customReason}
              onChangeText={setCustomReason}
              style={[
                styles.input,
                styles.reasonInput,
                { borderColor },
              ]}
              placeholder="Enter custom reason"
              placeholderTextColor="#777"
              multiline
              textAlignVertical="top"
            />
          ) : null}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Return Options
            </Text>

            <Text style={styles.infoText}>
              • Back to Stock — a usable returned item
              is added to the available quantity.
            </Text>

            <Text style={styles.infoText}>
              • Return to Supplier — the item is removed
              from available stock and added to the
              supplier-return workflow.
            </Text>

            <Text style={styles.infoText}>
              • No Stock Change — records the return
              without changing the stock quantity.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
            style={saving && styles.disabledButton}
          >
            <LinearGradient
              colors={
                saving
                  ? ["#94a3b8", "#64748b"]
                  : ["#2563eb", "#1d4ed8"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? "Processing..."
                  : "Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  scrollContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 140,
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

  dropdownContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },

  placeholderStyle: {
    color: "#777",
    fontSize: 15,
  },

  selectedTextStyle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },

  dropdownItemText: {
    color: "#111827",
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#111827",
    fontSize: 16,
  },

  reasonInput: {
    minHeight: 90,
    paddingTop: 12,
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
    marginTop: 3,
    fontWeight: "600",
  },

  calculationBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },

  calculationLabel: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: "700",
  },

  calculationValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },

  returnValueText: {
    color: "#15803d",
    fontSize: 18,
    fontWeight: "900",
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
    marginTop: 5,
    lineHeight: 20,
  },

  gradientButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.75,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
  },
});

export default RecordReturnScreen;