// // app/screens/EditStockItem.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { LinearGradient } from 'expo-linear-gradient';
// import { router } from 'expo-router';
// import { useSearchParams } from 'expo-router/build/hooks'; // ✅ Correct import path
// import React, { useEffect, useState } from 'react';
// import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
// import { deleteStockItem, getStockItem, getStockItems, saveStockMovement, updateStockItem } from '../../../lib/storage';


// const EditStockItem: React.FC = () => {
//   const searchParams = useSearchParams();
//   const id = searchParams.get('id'); // ✅ Correct way to get the ID

//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState(0);
//   const [category, setCategory] = useState('');
//   const [costPrice, setCostPrice] = useState(0);
//   const [lowStockAlert, setLowStockAlert] = useState('');
//   const [idealStockLevel, setIdealStockLevel] = useState('');
//   const [supplierName, setSupplierName] = useState('');

//   const colorScheme = useColorScheme(); // ✅ detect dark/light mode
//   const textColor = colorScheme === 'dark' ? '#fff' : '#000'; // ✅ adapt text
//   const bgColor = colorScheme === 'dark' ? '#222' : '#fff'; // ✅ adapt field background


//   useEffect(() => {
//     if (!id) return;
    
//     const loadItem = async () => {
//       const items = await getStockItems();
//       const item = items.find((i) => i.id === id);
//       if (item) {
//         setName(item.name);
//         setQuantity(item.quantity);
//         setCategory(item.category);
//         setCostPrice(item.costPrice || 0);
//         setLowStockAlert(item.lowStockAlert ? String(item.lowStockAlert) : '');
//         setIdealStockLevel(item.idealStockLevel ? String(item.idealStockLevel) : '');
//         setSupplierName(item.supplierName || '');
//       }
//     };
//     loadItem();
//   }, [id]);

//   const handleUpdate = async () => {
//     if (!id) {
//       Alert.alert("Error", "Item ID is missing.");
//       return;
//     }

//     try {
//       const existingItem = await getStockItem(id as string);

//       if (!existingItem) {
//         Alert.alert("Error", "Stock item not found.");
//         return;
//       }

//       const oldQty = Number(existingItem.quantity || 0);
//       const newQty = Number(quantity || 0);
//       const difference = newQty - oldQty;

//       const response = await updateStockItem(id as string, {
//         name,
//         quantity: newQty,
//         category,
//         costPrice,
//         lowStockAlert: lowStockAlert ? Number(lowStockAlert) : undefined,
//         idealStockLevel: idealStockLevel ? Number(idealStockLevel) : undefined,
//         supplierName,
//       });

//       if (response) {
//         if (difference !== 0) {
//           await saveStockMovement({
//             stockItemId: existingItem.id,
//             itemName: name || existingItem.name,
//             type: difference > 0 ? "IN" : "OUT",
//             quantity: Math.abs(difference),
//             source: "ADJUSTMENT",
//             sourceLabel:
//               difference > 0
//                 ? "Stock updated - quantity increased"
//                 : "Stock updated - quantity decreased",
//             balanceAfter: newQty,
//             referenceId: existingItem.id,
//             referenceType: "ADJUSTMENT",
//             note: "Stock quantity changed from Edit Stock screen",
//           });
//         }

//         Alert.alert("Stock Item Updated Successfully");
//         router.back();
//       } else {
//         Alert.alert("Failed to Update Stock Item");
//       }
//     } catch (error: any) {
//       console.error("Failed to update stock item:", error);
//       Alert.alert("Error", error.message || "Failed to update stock item.");
//     }
//   };

//   const handleDelete = async () => {
//     if (!id) {
//       Alert.alert("Error", "Item ID is missing.");
//       return;
//     }

//     try {
//       const existingItem = await getStockItem(id as string);

//       if (!existingItem) {
//         Alert.alert("Error", "Stock item not found.");
//         return;
//       }

//       const deletedQty = Number(existingItem.quantity || 0);

//       await deleteStockItem(id as string);

//       if (deletedQty > 0) {
//         await saveStockMovement({
//           stockItemId: existingItem.id,
//           itemName: existingItem.name,
//           type: "OUT",
//           quantity: deletedQty,
//           source: "MANUAL_CORRECTION",
//           sourceLabel: "Stock item deleted",
//           balanceAfter: 0,
//           referenceId: existingItem.id,
//           referenceType: "STOCK",
//           note: "Stock item deleted from Edit Stock screen",
//         });
//       }

//       Alert.alert("Deleted", "Stock deleted.");
//       router.replace("/(tabs)/stockList");
//     } catch (error: any) {
//       console.error("Failed to delete stock item:", error);
//       Alert.alert("Error", error.message || "Failed to delete stock item.");
//     }
//   };
//   return (
//     <ScreenWrapper scroll backgroundColor="#0d1b2a">
//       <LinearGradient
//         colors={["#0d1b2a", "#1b263b", "#415a77"]}
//         style={styles.gradient}
//       >
//         <View style={styles.container}>
//           <View style={styles.card}>
//             <Text style={styles.title}>Edit Stock Item</Text>
//             <Text style={styles.subtitle}>
//               Update item details, stock levels and supplier information.
//             </Text>

//             {/* <Text style={styles.label}>Category</Text>
//             <TextInput
//               placeholder="Enter category"
//               placeholderTextColor="#94a3b8"
//               value={category}
//               onChangeText={setCategory}
//               style={styles.input}
//             />

//             <Text style={styles.label}>Item Name</Text>
//             <TextInput
//               placeholder="Enter item name"
//               placeholderTextColor="#94a3b8"
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//             /> */}

//             <View style={styles.row}>
//               <View style={styles.half}>
//                 <Text style={styles.label}>Quantity</Text>
//                 <TextInput
//                   placeholder="Qty"
//                   placeholderTextColor="#94a3b8"
//                   value={String(quantity)}
//                   keyboardType="number-pad"
//                   returnKeyType="done"
//                   onSubmitEditing={Keyboard.dismiss}
//                   onChangeText={(text) => setQuantity(Number(text) || 0)}
//                   style={styles.input}
//                 />
//               </View>

//               <View style={styles.half}>
//                 <Text style={styles.label}>Cost Price</Text>
//                 <TextInput
//                   placeholder="0.00"
//                   placeholderTextColor="#94a3b8"
//                   value={String(costPrice)}
//                   keyboardType="decimal-pad"
//                   returnKeyType="done"
//                   onSubmitEditing={Keyboard.dismiss}
//                   onChangeText={(text) => setCostPrice(Number(text) || 0)}
//                   style={styles.input}
//                 />
//               </View>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.half}>
//                 <Text style={styles.label}>Low Stock Alert</Text>
//                 <TextInput
//                   placeholder="Alert level"
//                   placeholderTextColor="#94a3b8"
//                   value={lowStockAlert}
//                   keyboardType="number-pad"
//                   returnKeyType="done"
//                   onSubmitEditing={Keyboard.dismiss}
//                   onChangeText={setLowStockAlert}
//                   style={styles.input}
//                 />
//               </View>

//               <View style={styles.half}>
//                 <Text style={styles.label}>Ideal Stock Level</Text>
//                 <TextInput
//                   placeholder="Ideal level"
//                   placeholderTextColor="#94a3b8"
//                   value={idealStockLevel}
//                   keyboardType="number-pad"
//                   returnKeyType="done"
//                   onSubmitEditing={Keyboard.dismiss}
//                   onChangeText={setIdealStockLevel}
//                   style={styles.input}
//                 />
//               </View>
//             </View>

//             <Text style={styles.label}>Supplier Name</Text>
//             <TextInput
//               placeholder="Enter supplier name"
//               placeholderTextColor="#94a3b8"
//               value={supplierName}
//               onChangeText={setSupplierName}
//               style={styles.input}
//             />

//             <View style={styles.buttonGroup}>
//               <TouchableOpacity style={styles.button} onPress={handleUpdate}>
//                 <LinearGradient
//                   colors={["#22c55e", "#15803d"]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={styles.gradientButton}
//                 >
//                   <Text style={styles.buttonText}>Update Stock</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.button} onPress={handleDelete}>
//                 <LinearGradient
//                   colors={["#ef4444", "#b91c1c"]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={styles.gradientButton}
//                 >
//                   <Text style={styles.buttonText}>Delete Item</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
     
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//     minHeight: "100%",
//   },

//   container: {
//     padding: 16,
//     paddingBottom: 140,
//   },

//   card: {
//     backgroundColor: "rgba(255,255,255,0.08)",
//     borderRadius: 22,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.12)",
//   },

//   keyboardView: {
//     flex: 1,
//   },

//   title: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "900",
//     textAlign: "center",
//     marginBottom: 6,
//   },

//   subtitle: {
//     color: "#cbd5e1",
//     fontSize: 13,
//     textAlign: "center",
//     marginBottom: 18,
//   },

//   label: {
//     fontSize: 14,
//     fontWeight: "800",
//     marginBottom: 6,
//     marginTop: 10,
//     color: "#e5e7eb",
//   },

//   input: {
//     height: 48,
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     borderColor: "rgba(255,255,255,0.22)",
//     backgroundColor: "rgba(255,255,255,0.95)",
//     color: "#111827",
//     fontSize: 15,
//     fontWeight: "600",
//   },

//   row: {
//     flexDirection: "row",
//     gap: 10,
//   },

//   half: {
//     flex: 1,
//   },

//   buttonGroup: {
//     marginTop: 24,
//     gap: 12,
//   },

//   button: {
//     width: "100%",
//     borderRadius: 14,
//     overflow: "hidden",
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },

//   gradientButton: {
//     paddingVertical: 15,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "900",
//   },
// });

// export default EditStockItem;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  deleteStockItem,
  getStockItem,
  saveStockMovement,
  updateStockItem,
} from "@/lib/storage";
import {
  getSupplierStockInRecords,
  migrateLegacySupplierStockInOnce,
} from "@/lib/supplierStockInStorage";
import { getActiveSuppliers } from "@/lib/supplierStorage";
import { getSupplierDisplayName, Supplier } from "@/types/supplier";
import { SupplierStockIn } from "@/types/supplierStockIn";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type SupplierOption = {
  label: string;
  value: string;
};

const NO_SUPPLIER = "__none__";

const EditStockItem: React.FC = () => {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const stockItemId = Array.isArray(id)
    ? id[0]
    : id;

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState(0);
  const [lowStockAlert, setLowStockAlert] =
    useState("");
  const [idealStockLevel, setIdealStockLevel] =
    useState("");

  const [suppliers, setSuppliers] = useState<
    Supplier[]
  >([]);
  const [selectedSupplierId, setSelectedSupplierId] =
    useState("");
  const [supplierName, setSupplierName] =
    useState("");

  const [purchaseRecords, setPurchaseRecords] =
    useState<SupplierStockIn[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supplierOptions = useMemo<
    SupplierOption[]
  >(
    () => [
      {
        label: "No Supplier",
        value: NO_SUPPLIER,
      },
      ...suppliers.map((supplier) => ({
        label: supplier.companyName?.trim() || "Unnamed supplier",
        value: supplier.id,
      })),
    ],
    [suppliers],
  );

  const unpaidDeliveries = useMemo(
    () =>
      purchaseRecords.filter(
        (record) =>
          record.paymentStatus === "unpaid",
      ),
    [purchaseRecords],
  );

  const outstandingAmount = useMemo(
    () =>
      unpaidDeliveries.reduce(
        (total, record) =>
          total +
          Number(record.totalCost || 0),
        0,
      ),
    [unpaidDeliveries],
  );

  const totalPurchased = useMemo(
    () =>
      purchaseRecords.reduce(
        (total, record) =>
          total +
          Number(record.totalCost || 0),
        0,
      ),
    [purchaseRecords],
  );

  const money = (value: number) =>
    `£${Number(value || 0).toFixed(2)}`;

  const loadItem = useCallback(async () => {
    if (!stockItemId) {
      Alert.alert(
        "Error",
        "Item ID is missing.",
      );
      router.back();
      return;
    }

    try {
      setLoading(true);

      await migrateLegacySupplierStockInOnce();

      const [
        item,
        supplierList,
        allPurchaseRecords,
      ] = await Promise.all([
        getStockItem(stockItemId),
        getActiveSuppliers(),
        getSupplierStockInRecords(),
      ]);

      if (!item) {
        Alert.alert(
          "Not Found",
          "Stock item could not be found.",
        );
        router.back();
        return;
      }

      setSuppliers(supplierList);

      setName(item.name || "");
      setQuantity(Number(item.quantity || 0));
      setCategory(item.category || "");
      setCostPrice(
        Number(item.costPrice || 0),
      );
      setLowStockAlert(
        item.lowStockAlert !== undefined &&
          item.lowStockAlert !== null
          ? String(item.lowStockAlert)
          : "",
      );
      setIdealStockLevel(
        item.idealStockLevel !== undefined &&
          item.idealStockLevel !== null
          ? String(item.idealStockLevel)
          : "",
      );

      const matchingSupplier =
        supplierList.find(
          (supplier) =>
            supplier.id === item.supplierId,
        ) ||
        supplierList.find(
          (supplier) =>
            getSupplierDisplayName(supplier).trim().toLowerCase() ===
            String(item.supplierName || "").trim().toLowerCase(),
        );

      setSelectedSupplierId(
        matchingSupplier?.id ||
          item.supplierId ||
          "",
      );

      setSupplierName(
        matchingSupplier?.companyName ||
          item.supplierName ||
          "",
      );

      setPurchaseRecords(
        allPurchaseRecords.filter(
          (record) =>
            record.stockItemId === item.id,
        ),
      );
    } catch (error: any) {
      console.error(
        "Failed to load stock item:",
        error,
      );

      Alert.alert(
        "Error",
        error.message ||
          "Failed to load stock item.",
      );
    } finally {
      setLoading(false);
    }
  }, [stockItemId]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleSupplierChange = (
    option: SupplierOption,
  ) => {
    if (option.value === NO_SUPPLIER) {
      setSelectedSupplierId("");
      setSupplierName("");
      return;
    }

    const selected = suppliers.find(
      (supplier) =>
        supplier.id === option.value,
    );

    setSelectedSupplierId(
      selected?.id || "",
    );

    setSupplierName(
      selected?.companyName || "",
    );
  };

  const handleUpdate = async () => {
    if (!stockItemId) {
      Alert.alert(
        "Error",
        "Item ID is missing.",
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      Alert.alert(
        "Missing Name",
        "Please enter the item name.",
      );
      return;
    }

    if (!trimmedCategory) {
      Alert.alert(
        "Missing Category",
        "Please enter a category.",
      );
      return;
    }

    if (quantity < 0) {
      Alert.alert(
        "Invalid Quantity",
        "Quantity cannot be negative.",
      );
      return;
    }

    if (costPrice < 0) {
      Alert.alert(
        "Invalid Cost Price",
        "Cost price cannot be negative.",
      );
      return;
    }

    try {
      setSaving(true);

      const existingItem =
        await getStockItem(stockItemId);

      if (!existingItem) {
        Alert.alert(
          "Error",
          "Stock item not found.",
        );
        return;
      }

      const oldQuantity = Number(
        existingItem.quantity || 0,
      );
      const newQuantity = Number(
        quantity || 0,
      );
      const difference =
        newQuantity - oldQuantity;

      const response =
        await updateStockItem(
          stockItemId,
          {
            name: trimmedName,
            quantity: newQuantity,
            category: trimmedCategory,
            costPrice: Number(
              costPrice || 0,
            ),
            lowStockAlert:
              lowStockAlert.trim()
                ? Number(lowStockAlert)
                : undefined,
            idealStockLevel:
              idealStockLevel.trim()
                ? Number(
                    idealStockLevel,
                  )
                : undefined,
            supplierId:
              selectedSupplierId ||
              undefined,
            supplierName:
              supplierName.trim(),
          },
        );

      if (!response) {
        Alert.alert(
          "Update Failed",
          "Failed to update stock item.",
        );
        return;
      }

      if (difference !== 0) {
        await saveStockMovement({
          stockItemId:
            existingItem.id,
          itemName:
            trimmedName ||
            existingItem.name,
          type:
            difference > 0
              ? "IN"
              : "OUT",
          quantity: Math.abs(
            difference,
          ),
          source: "ADJUSTMENT",
          sourceLabel:
            difference > 0
              ? "Stock updated - quantity increased"
              : "Stock updated - quantity decreased",
          balanceAfter: newQuantity,
          referenceId:
            existingItem.id,
          referenceType:
            "ADJUSTMENT",
          note:
            "Stock quantity changed from Edit Stock screen",
        });
      }

      Alert.alert(
        "Stock Updated",
        difference > 0
          ? "The stock balance was adjusted. No new supplier purchase or payment record was created."
          : "The stock item was updated successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.back(),
          },
        ],
      );
    } catch (error: any) {
      console.error(
        "Failed to update stock item:",
        error,
      );

      Alert.alert(
        "Error",
        error.message ||
          "Failed to update stock item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!stockItemId) {
      Alert.alert(
        "Error",
        "Item ID is missing.",
      );
      return;
    }

    Alert.alert(
      "Delete Stock Item?",
      "This removes the current stock item. Supplier purchase and payment history will remain for audit purposes.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const existingItem =
                await getStockItem(
                  stockItemId,
                );

              if (!existingItem) {
                Alert.alert(
                  "Error",
                  "Stock item not found.",
                );
                return;
              }

              const deletedQuantity =
                Number(
                  existingItem.quantity ||
                    0,
                );

              await deleteStockItem(
                stockItemId,
              );

              if (deletedQuantity > 0) {
                await saveStockMovement({
                  stockItemId:
                    existingItem.id,
                  itemName:
                    existingItem.name,
                  type: "OUT",
                  quantity:
                    deletedQuantity,
                  source:
                    "MANUAL_CORRECTION",
                  sourceLabel:
                    "Stock item deleted",
                  balanceAfter: 0,
                  referenceId:
                    existingItem.id,
                  referenceType:
                    "STOCK",
                  note:
                    "Stock item deleted from Edit Stock screen",
                });
              }

              Alert.alert(
                "Deleted",
                "Stock item deleted.",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      router.replace(
                        "/(tabs)/stockList",
                      ),
                  },
                ],
              );
            } catch (error: any) {
              console.error(
                "Failed to delete stock item:",
                error,
              );

              Alert.alert(
                "Error",
                error.message ||
                  "Failed to delete stock item.",
              );
            }
          },
        },
      ],
    );
  };

  const openSupplierPayments = () => {
    if (!selectedSupplierId) {
      Alert.alert(
        "Supplier Not Linked",
        "Select and save a supplier before opening its payment history.",
      );
      return;
    }

    router.push({
      pathname:
        "/screens/suppliers/view",
      params: {
        id: selectedSupplierId,
      },
    });
  };

  if (loading) {
    return (
      <ScreenWrapper
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#ffffff"
            />

            <Text style={styles.loadingText}>
              Loading stock item...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

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
          <View style={styles.card}>
            <Text style={styles.title}>
              Edit Stock Item
            </Text>

            <Text style={styles.subtitle}>
              Update product details and
              stock levels. Supplier payments
              are managed from the supplier
              account.
            </Text>

            <View
              style={[
                styles.paymentSummary,
                outstandingAmount > 0
                  ? styles.paymentDue
                  : styles.paymentClear,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.paymentSummaryLabel
                  }
                >
                  Supplier outstanding
                </Text>

                <Text
                  style={
                    styles.paymentSummaryDetail
                  }
                >
                  {unpaidDeliveries.length}{" "}
                  unpaid{" "}
                  {unpaidDeliveries.length ===
                  1
                    ? "delivery"
                    : "deliveries"}
                </Text>
              </View>

              <Text
                style={[
                  styles.paymentSummaryValue,
                  {
                    color:
                      outstandingAmount > 0
                        ? "#b91c1c"
                        : "#15803d",
                  },
                ]}
              >
                {money(
                  outstandingAmount,
                )}
              </Text>
            </View>

            <View
              style={
                styles.paymentMetaRow
              }
            >
              <Text
                style={
                  styles.paymentMetaText
                }
              >
                {purchaseRecords.length} total
                deliveries ·{" "}
                {money(totalPurchased)} purchased
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.managePaymentsButton
              }
              onPress={
                openSupplierPayments
              }
            >
              <Text
                style={
                  styles.managePaymentsText
                }
              >
                Manage Supplier Payments
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>
              Item Name
            </Text>

            <TextInput
              placeholder="Enter item name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>
              Category
            </Text>

            <TextInput
              placeholder="Enter category"
              placeholderTextColor="#94a3b8"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text
                  style={styles.label}
                >
                  Quantity
                </Text>

                <TextInput
                  placeholder="Qty"
                  placeholderTextColor="#94a3b8"
                  value={String(quantity)}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={
                    Keyboard.dismiss
                  }
                  onChangeText={(text) =>
                    setQuantity(
                      Number(text) || 0,
                    )
                  }
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text
                  style={styles.label}
                >
                  Cost Price
                </Text>

                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  value={String(costPrice)}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={
                    Keyboard.dismiss
                  }
                  onChangeText={(text) =>
                    setCostPrice(
                      Number(text) || 0,
                    )
                  }
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text
                  style={styles.label}
                >
                  Low Stock Alert
                </Text>

                <TextInput
                  placeholder="Alert level"
                  placeholderTextColor="#94a3b8"
                  value={lowStockAlert}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={
                    Keyboard.dismiss
                  }
                  onChangeText={
                    setLowStockAlert
                  }
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text
                  style={styles.label}
                >
                  Ideal Stock Level
                </Text>

                <TextInput
                  placeholder="Ideal level"
                  placeholderTextColor="#94a3b8"
                  value={idealStockLevel}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={
                    Keyboard.dismiss
                  }
                  onChangeText={
                    setIdealStockLevel
                  }
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>
              Supplier
            </Text>

            <Dropdown
              style={styles.dropdown}
              containerStyle={
                styles.dropdownContainer
              }
              selectedTextStyle={
                styles.selectedText
              }
              placeholderStyle={
                styles.placeholderText
              }
              itemTextStyle={
                styles.dropdownItemText
              }
              data={supplierOptions}
              labelField="label"
              valueField="value"
              placeholder="Select supplier"
              value={
                selectedSupplierId ||
                NO_SUPPLIER
              }
              onChange={
                handleSupplierChange
              }
              maxHeight={300}
            />

            <Text
              style={
                styles.supplierHelp
              }
            >
              Changing the supplier here only
              changes the supplier linked to
              this product. It does not move or
              rewrite earlier purchase and
              payment records.
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdate}
                disabled={saving}
              >
                <LinearGradient
                  colors={[
                    "#22c55e",
                    "#15803d",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={
                    styles.gradientButton
                  }
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#ffffff"
                    />
                  ) : (
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Update Stock
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleDelete}
                disabled={saving}
              >
                <LinearGradient
                  colors={[
                    "#ef4444",
                    "#b91c1c",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={
                    styles.gradientButton
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Delete Item
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: "100%",
  },

  container: {
    padding: 16,
    paddingBottom: 140,
  },

  loadingContainer: {
    flex: 1,
    minHeight: 500,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#cbd5e1",
    marginTop: 12,
  },

  card: {
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
  },

  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },

  paymentSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },

  paymentDue: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },

  paymentClear: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
  },

  paymentSummaryLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
  },

  paymentSummaryDetail: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 3,
  },

  paymentSummaryValue: {
    fontSize: 21,
    fontWeight: "900",
  },

  paymentMetaRow: {
    alignItems: "center",
    marginTop: 8,
  },

  paymentMetaText: {
    color: "#cbd5e1",
    fontSize: 12,
    textAlign: "center",
  },

  managePaymentsButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  managePaymentsText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 10,
    color: "#e5e7eb",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderColor:
      "rgba(255,255,255,0.22)",
    backgroundColor:
      "rgba(255,255,255,0.95)",
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderColor:
      "rgba(255,255,255,0.22)",
    backgroundColor:
      "rgba(255,255,255,0.95)",
  },

  dropdownContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },

  selectedText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },

  placeholderText: {
    color: "#64748b",
    fontSize: 15,
  },

  dropdownItemText: {
    color: "#111827",
    fontSize: 15,
  },

  supplierHelp: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },

  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },

  button: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  gradientButton: {
    minHeight: 52,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
});

export default EditStockItem;