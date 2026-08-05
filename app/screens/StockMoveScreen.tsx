 // export default StockMoveScreen;

// import ScreenWrapper from "@/components/ScreenWrapper";
// import {
//   getStockItems,
//   saveStockMovement,
//   updateStockQuantity,
// } from "@/lib/storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   LayoutAnimation,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   UIManager,
//   View,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";

// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// type StockItem = {
//   id: string;
//   name: string;
//   quantity: number | string;
//   unit?: string;
// };

// const StockMoveScreen = () => {
//   const [showConsumedForm, setShowConsumedForm] = useState(false);
//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [selectedStockId, setSelectedStockId] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     void loadStockItems();
//   }, []);

//   const loadStockItems = async () => {
//     try {
//       const items = await getStockItems();
//       setStockItems((items || []) as StockItem[]);
//     } catch (error) {
//       console.error("Failed to load stock items:", error);
//       Alert.alert("Error", "Unable to load stock items.");
//     }
//   };

//   const dropdownData = useMemo(
//     () =>
//       stockItems
//         .filter((item) => Number(item.quantity || 0) > 0)
//         .map((item) => ({
//           label: `${item.name} (${Number(item.quantity || 0)} ${
//             item.unit || "units"
//           } available)`,
//           value: item.id,
//         })),
//     [stockItems]
//   );

//   const toggleConsumedForm = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

//     setShowConsumedForm((current) => {
//       const nextValue = !current;

//       if (!nextValue) {
//         setSelectedStockId("");
//         setQuantity("");
//       }

//       return nextValue;
//     });
//   };

//   const handleSaveConsumed = async () => {
//     if (isSaving) return;

//     const selectedItem = stockItems.find(
//       (item) => item.id === selectedStockId
//     );
//     const consumedQty = Number(quantity);

//     if (!selectedItem) {
//       Alert.alert("Validation Error", "Please select a stock item.");
//       return;
//     }

//     if (!Number.isFinite(consumedQty) || consumedQty <= 0) {
//       Alert.alert("Validation Error", "Please enter a valid quantity.");
//       return;
//     }

//     const availableQuantity = Number(selectedItem.quantity || 0);

//     if (consumedQty > availableQuantity) {
//       Alert.alert(
//         "Validation Error",
//         `Only ${availableQuantity} ${
//           selectedItem.unit || "units"
//         } are currently available.`
//       );
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const newBalance = availableQuantity - consumedQty;

//       await updateStockQuantity(selectedItem.id, newBalance);

//       await saveStockMovement({
//         stockItemId: selectedItem.id,
//         itemName: selectedItem.name,
//         type: "OUT",
//         quantity: consumedQty,
//         source: "CONSUMED",
//         sourceLabel: "Consumed in-house",
//         balanceAfter: newBalance,
//         referenceId: selectedItem.id,
//         referenceType: "STOCK",
//         note: "Stock consumed in-house",
//       });

//       setSelectedStockId("");
//       setQuantity("");

//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setShowConsumedForm(false);

//       await loadStockItems();

//       Alert.alert("Success", "Consumed stock recorded successfully.");
//     } catch (error) {
//       console.error("Consumed stock error:", error);
//       Alert.alert("Error", "Failed to record consumed stock.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <ScreenWrapper scroll backgroundColor="#0d1b2a">
//       <LinearGradient
//         colors={["#0d1b2a", "#1b263b", "#415a77"]}
//         style={styles.gradient}
//       >
//         <View style={styles.container}>
//           <View style={styles.headerSection}>
//             <Text style={styles.title}>Stock Move</Text>

//             <Text style={styles.subtitle}>
//               Choose how you want to record stock going out.
//             </Text>
//           </View>

//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => router.push("/screens/sales/record")}
//           >
//             <LinearGradient
//               colors={["#2563eb", "#1d4ed8"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.optionCard}
//             >
//               <Text style={styles.icon}>⚡</Text>

//               <View style={styles.optionContent}>
//                 <Text style={styles.optionTitle}>Single / Quick Sale</Text>
//                 <Text style={styles.optionText}>
//                   Record a single sale and reduce stock immediately.
//                 </Text>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>

//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => router.push("/screens/BulkSaleScreen")}
//           >
//             <LinearGradient
//               colors={["#0f766e", "#14b8a6"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.optionCard}
//             >
//               <Text style={styles.icon}>📦</Text>

//               <View style={styles.optionContent}>
//                 <Text style={styles.optionTitle}>Bulk Sale</Text>
//                 <Text style={styles.optionText}>
//                   Enter multiple sold items together, ideal for end-of-day
//                   stock updates.
//                 </Text>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>

//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={toggleConsumedForm}
//           >
//             <LinearGradient
//               colors={["#7c2d12", "#ea580c"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.optionCard}
//             >
//               <Text style={styles.icon}>🏠</Text>

//               <View style={styles.optionContent}>
//                 <Text style={styles.optionTitle}>Consumed In-House</Text>
//                 <Text style={styles.optionText}>
//                   Reduce stock used internally by the business.
//                 </Text>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>

//           {showConsumedForm && (
//             <View style={styles.consumedForm}>
//               <Text style={styles.formTitle}>Record Consumed Stock</Text>

//               <Text style={styles.label}>Select Stock Item</Text>

//               <Dropdown
//                 style={styles.dropdown}
//                 containerStyle={styles.dropdownContainer}
//                 placeholderStyle={styles.placeholder}
//                 selectedTextStyle={styles.selectedText}
//                 itemTextStyle={styles.dropdownItemText}
//                 iconColor="#64748b"
//                 activeColor="#e2e8f0"
//                 data={dropdownData}
//                 labelField="label"
//                 valueField="value"
//                 placeholder={
//                   dropdownData.length > 0
//                     ? "Select item"
//                     : "No stock currently available"
//                 }
//                 value={selectedStockId}
//                 disable={dropdownData.length === 0}
//                 onChange={(item) => setSelectedStockId(item.value)}
//               />

//               <Text style={styles.label}>Quantity Consumed</Text>

//               <TextInput
//                 value={quantity}
//                 onChangeText={(value) =>
//                   setQuantity(value.replace(/[^0-9.]/g, ""))
//                 }
//                 keyboardType="decimal-pad"
//                 returnKeyType="done"
//                 blurOnSubmit={false}
//                 placeholder="Enter quantity"
//                 placeholderTextColor="#94a3b8"
//                 style={styles.input}
//               />

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 disabled={isSaving}
//                 onPress={handleSaveConsumed}
//               >
//                 <LinearGradient
//                   colors={
//                     isSaving
//                       ? ["#64748b", "#475569"]
//                       : ["#dc2626", "#991b1b"]
//                   }
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={styles.saveButton}
//                 >
//                   <Text style={styles.saveButtonText}>
//                     {isSaving ? "Saving..." : "Save Consumed Stock"}
//                   </Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           )}

//           <TouchableOpacity
//             activeOpacity={0.8}
//             style={styles.historyButton}
//             onPress={() => router.push("/screens/stock/viewStockOutScreen")}
//           >
//             <Text style={styles.historyText}>
//               View Sale / Stock Out History
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flexGrow: 1,
//   },

//   container: {
//     flexGrow: 1,
//     paddingHorizontal: 22,
//     paddingTop: 18,
//     paddingBottom: 28,
//   },

//   headerSection: {
//     marginBottom: 22,
//   },

//   title: {
//     color: "#ffffff",
//     fontSize: 32,
//     fontWeight: "900",
//     textAlign: "center",
//     marginBottom: 7,
//   },

//   subtitle: {
//     color: "#cbd5e1",
//     fontSize: 16,
//     textAlign: "center",
//     lineHeight: 22,
//   },

//   optionCard: {
//     minHeight: 104,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 18,
//     borderRadius: 20,
//     marginBottom: 14,
//     shadowColor: "#000000",
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 10,
//     elevation: 6,
//   },

//   icon: {
//     width: 50,
//     fontSize: 34,
//     marginRight: 12,
//     textAlign: "center",
//   },

//   optionContent: {
//     flex: 1,
//   },

//   optionTitle: {
//     color: "#ffffff",
//     fontSize: 20,
//     fontWeight: "900",
//     marginBottom: 5,
//   },

//   optionText: {
//     color: "#e0f2fe",
//     fontSize: 14,
//     lineHeight: 20,
//   },

//   consumedForm: {
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.22)",
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//   },

//   formTitle: {
//     color: "#ffffff",
//     fontSize: 18,
//     fontWeight: "900",
//     marginBottom: 14,
//   },

//   label: {
//     color: "#e5e7eb",
//     fontSize: 14,
//     fontWeight: "800",
//     marginBottom: 7,
//   },

//   dropdown: {
//     height: 50,
//     backgroundColor: "#ffffff",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     marginBottom: 14,
//   },

//   dropdownContainer: {
//     backgroundColor: "#ffffff",
//     borderColor: "#cbd5e1",
//     borderRadius: 12,
//     overflow: "hidden",
//   },

//   placeholder: {
//     color: "#64748b",
//     fontSize: 14,
//   },

//   selectedText: {
//     color: "#111827",
//     fontSize: 14,
//     fontWeight: "700",
//   },

//   dropdownItemText: {
//     color: "#111827",
//     fontSize: 14,
//   },

//   input: {
//     height: 50,
//     backgroundColor: "#ffffff",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     color: "#111827",
//     fontSize: 15,
//     marginBottom: 14,
//   },

//   saveButton: {
//     paddingVertical: 15,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   saveButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "900",
//   },

//   historyButton: {
//     marginTop: 4,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.25)",
//     paddingVertical: 15,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     alignItems: "center",
//   },

//   historyText: {
//     color: "#ffffff",
//     fontSize: 15,
//     fontWeight: "800",
//     textAlign: "center",
//   },
// });

// export default StockMoveScreen;


// app/screens/StockMoveScreen.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  saveStockMovement,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type StockItemOption = {
  id: string;
  name: string;
  quantity: number | string;
  unit?: string;
};

type DropdownOption = {
  label: string;
  value: string;
};

const StockMoveScreen: React.FC = () => {
  const [showConsumedForm, setShowConsumedForm] =
    useState(false);

  const [stockItems, setStockItems] = useState<
    StockItemOption[]
  >([]);

  const [selectedStockId, setSelectedStockId] =
    useState("");

  const [quantity, setQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStock, setIsLoadingStock] =
    useState(true);

  const loadStockItems = useCallback(async () => {
    try {
      setIsLoadingStock(true);

      const items = await getStockItems();

      setStockItems(
        (items ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })),
      );
    } catch (error) {
      console.error(
        "Failed to load stock items:",
        error,
      );

      Alert.alert(
        "Error",
        "Unable to load stock items.",
      );
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    void loadStockItems();
  }, [loadStockItems]);

  const dropdownData = useMemo<DropdownOption[]>(
    () =>
      stockItems
        .filter(
          (item) =>
            Number(item.quantity ?? 0) > 0,
        )
        .map((item) => {
          const availableQuantity = Number(
            item.quantity ?? 0,
          );

          const itemUnit =
            item.unit?.trim() || "units";

          return {
            label: `${item.name} (${availableQuantity} ${itemUnit} available)`,
            value: item.id,
          };
        }),
    [stockItems],
  );

  const selectedStockItem = useMemo(
    () =>
      stockItems.find(
        (item) => item.id === selectedStockId,
      ),
    [selectedStockId, stockItems],
  );

  const toggleConsumedForm = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );

    setShowConsumedForm((current) => {
      const nextValue = !current;

      if (!nextValue) {
        setSelectedStockId("");
        setQuantity("");
      }

      return nextValue;
    });
  };

  const resetConsumedForm = () => {
    setSelectedStockId("");
    setQuantity("");

    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );

    setShowConsumedForm(false);
  };

  const handleSaveConsumed = async () => {
    if (isSaving) {
      return;
    }

    const selectedItem = stockItems.find(
      (item) => item.id === selectedStockId,
    );

    const consumedQuantity = Number(quantity);

    if (!selectedItem) {
      Alert.alert(
        "Validation Error",
        "Please select a stock item.",
      );
      return;
    }

    if (
      !Number.isFinite(consumedQuantity) ||
      consumedQuantity <= 0
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid quantity greater than zero.",
      );
      return;
    }

    const availableQuantity = Number(
      selectedItem.quantity ?? 0,
    );

    if (consumedQuantity > availableQuantity) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${availableQuantity} ${
          selectedItem.unit?.trim() || "units"
        } are currently available.`,
      );
      return;
    }

    try {
      setIsSaving(true);

      const newBalance =
        availableQuantity - consumedQuantity;

      await updateStockQuantity(
        selectedItem.id,
        newBalance,
      );

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "OUT",
        quantity: consumedQuantity,

        // Valid StockMovementSource from lib/storage.ts
        source: "STOCK_USED",

        sourceLabel: "Consumed in-house",
        balanceAfter: newBalance,
        referenceId: selectedItem.id,
        referenceType: "STOCK",
        note: "Stock consumed internally by the business",
      });

      resetConsumedForm();

      await loadStockItems();

      Alert.alert(
        "Success",
        "Consumed stock recorded successfully.",
      );
    } catch (error) {
      console.error(
        "Consumed stock error:",
        error,
      );

      Alert.alert(
        "Error",
        "Failed to record consumed stock.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConsumedSubmit = () => {
    if (!selectedStockItem) {
      Alert.alert(
        "Validation Error",
        "Please select a stock item.",
      );
      return;
    }

    const consumedQuantity = Number(quantity);

    if (
      !Number.isFinite(consumedQuantity) ||
      consumedQuantity <= 0
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid quantity greater than zero.",
      );
      return;
    }

    const unit =
      selectedStockItem.unit?.trim() || "units";

    Alert.alert(
      "Confirm Stock Consumption",
      `Record ${consumedQuantity} ${unit} of ${selectedStockItem.name} as consumed in-house?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            void handleSaveConsumed();
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper
      scroll
      backgroundColor="#0d1b2a"
    >
      <LinearGradient
        colors={[
          "#0d1b2a",
          "#1b263b",
          "#415a77",
        ]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Stock Move
            </Text>

            <Text style={styles.subtitle}>
              Choose how you want to record stock
              going out.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push("/screens/sales/record")
            }
          >
            <LinearGradient
              colors={["#2563eb", "#1d4ed8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionCard}
            >
              <Text style={styles.icon}>⚡</Text>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Single / Quick Sale
                </Text>

                <Text style={styles.optionText}>
                  Record a single sale and reduce
                  stock immediately.
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push(
                "/screens/BulkSaleScreen",
              )
            }
          >
            <LinearGradient
              colors={["#0f766e", "#14b8a6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionCard}
            >
              <Text style={styles.icon}>📦</Text>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Bulk Sale
                </Text>

                <Text style={styles.optionText}>
                  Enter multiple sold items together,
                  ideal for end-of-day stock updates.
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleConsumedForm}
          >
            <LinearGradient
              colors={["#7c2d12", "#ea580c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionCard}
            >
              <Text style={styles.icon}>🏠</Text>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Consumed In-House
                </Text>

                <Text style={styles.optionText}>
                  Reduce stock used internally by the
                  business.
                </Text>
              </View>

              <Text style={styles.expandIcon}>
                {showConsumedForm ? "▲" : "▼"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {showConsumedForm ? (
            <View style={styles.consumedForm}>
              <View style={styles.formHeader}>
                <View style={styles.formHeaderText}>
                  <Text style={styles.formTitle}>
                    Record Consumed Stock
                  </Text>

                  <Text style={styles.formSubtitle}>
                    This reduces the selected
                    product&apos;s available quantity.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={toggleConsumedForm}
                  style={styles.closeFormButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close consumed stock form"
                >
                  <Text
                    style={
                      styles.closeFormButtonText
                    }
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>
                Select Stock Item
              </Text>

              <Dropdown
                style={styles.dropdown}
                containerStyle={
                  styles.dropdownContainer
                }
                placeholderStyle={styles.placeholder}
                selectedTextStyle={
                  styles.selectedText
                }
                itemTextStyle={
                  styles.dropdownItemText
                }
                iconColor="#64748b"
                activeColor="#e2e8f0"
                data={dropdownData}
                labelField="label"
                valueField="value"
                placeholder={
                  isLoadingStock
                    ? "Loading stock..."
                    : dropdownData.length > 0
                      ? "Select item"
                      : "No stock currently available"
                }
                value={selectedStockId}
                disable={
                  isLoadingStock ||
                  dropdownData.length === 0 ||
                  isSaving
                }
                onChange={(item) => {
                  setSelectedStockId(item.value);
                  setQuantity("");
                }}
              />

              {selectedStockItem ? (
                <View style={styles.stockSummary}>
                  <View
                    style={
                      styles.stockSummaryColumn
                    }
                  >
                    <Text
                      style={
                        styles.stockSummaryLabel
                      }
                    >
                      Available
                    </Text>

                    <Text
                      style={
                        styles.stockSummaryValue
                      }
                    >
                      {Number(
                        selectedStockItem.quantity ??
                          0,
                      )}{" "}
                      {selectedStockItem.unit?.trim() ||
                        "units"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.stockSummaryDivider
                    }
                  />

                  <View
                    style={
                      styles.stockSummaryColumn
                    }
                  >
                    <Text
                      style={
                        styles.stockSummaryLabel
                      }
                    >
                      Balance after
                    </Text>

                    <Text
                      style={
                        styles.stockSummaryValue
                      }
                    >
                      {Math.max(
                        Number(
                          selectedStockItem.quantity ??
                            0,
                        ) -
                          Math.max(
                            Number(quantity) || 0,
                            0,
                          ),
                        0,
                      )}{" "}
                      {selectedStockItem.unit?.trim() ||
                        "units"}
                    </Text>
                  </View>
                </View>
              ) : null}

              <Text style={styles.label}>
                Quantity Consumed
              </Text>

              <TextInput
                value={quantity}
                onChangeText={(value) => {
                  const cleanedValue = value
                    .replace(/[^0-9.]/g, "")
                    .replace(
                      /(\..*)\./g,
                      "$1",
                    );

                  setQuantity(cleanedValue);
                }}
                keyboardType="decimal-pad"
                returnKeyType="done"
                placeholder="Enter quantity"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                editable={!isSaving}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={
                  isSaving ||
                  !selectedStockId ||
                  !quantity.trim()
                }
                onPress={handleConsumedSubmit}
                style={
                  isSaving ||
                  !selectedStockId ||
                  !quantity.trim()
                    ? styles.disabledTouchable
                    : undefined
                }
              >
                <LinearGradient
                  colors={
                    isSaving
                      ? ["#64748b", "#475569"]
                      : ["#dc2626", "#991b1b"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButton}
                >
                  <Text
                    style={styles.saveButtonText}
                  >
                    {isSaving
                      ? "Saving..."
                      : "Save Consumed Stock"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.historyButton}
            onPress={() =>
              router.push(
                "/screens/stock/stockOutHistory",
              )
            }
          >
            <Text style={styles.historyText}>
              View Sale / Stock Out History
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexGrow: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
  },

  headerSection: {
    marginBottom: 22,
  },

  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 7,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  optionCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    elevation: 6,
  },

  icon: {
    width: 50,
    fontSize: 34,
    marginRight: 12,
    textAlign: "center",
  },

  expandIcon: {
    color: "#fed7aa",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 5,
  },

  optionText: {
    color: "#e0f2fe",
    fontSize: 14,
    lineHeight: 20,
  },

  consumedForm: {
    backgroundColor:
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.22)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  formHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  formTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  formSubtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  closeFormButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeFormButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },

  label: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 7,
  },

  dropdown: {
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  dropdownContainer: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 12,
    overflow: "hidden",
  },

  placeholder: {
    color: "#64748b",
    fontSize: 14,
  },

  selectedText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },

  dropdownItemText: {
    color: "#111827",
    fontSize: 14,
  },

  stockSummary: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor:
      "rgba(15,23,42,0.45)",
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  stockSummaryColumn: {
    flex: 1,
    alignItems: "center",
  },

  stockSummaryDivider: {
    width: 1,
    height: 34,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  stockSummaryLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },

  stockSummaryValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },

  input: {
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 15,
    marginBottom: 14,
  },

  saveButton: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  disabledTouchable: {
    opacity: 0.65,
  },

  historyButton: {
    marginTop: 4,
    backgroundColor:
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.25)",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
  },

  historyText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});

export default StockMoveScreen;