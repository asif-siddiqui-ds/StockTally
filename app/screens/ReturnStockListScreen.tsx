// import ScreenWrapper from "@/components/ScreenWrapper";
// import {
//   deleteReturnStockItem,
//   getReturnStockItems,
//   ReturnStockItem,
//   updateReturnItem,
// } from "@/lib/storage";
// import { router } from "expo-router";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   RefreshControl,
//   Share,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const ReturnStockListScreen = () => {
//   const [items, setItems] = useState<ReturnStockItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const loadItems = useCallback(async () => {
//     try {
//       const data = await getReturnStockItems();

//       const sorted = [...data].sort(
//         (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//       );

//       setItems(sorted);
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error.message || "Could not load supplier return list."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadItems();
//   }, [loadItems]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadItems();
//   };

//   const markReturnedToSupplier = async (item: ReturnStockItem) => {
//     Alert.alert(
//         "Returned to Supplier?",
//         `${item.name} will be cleared from Supplier Return List. The return history will remain in Returns List.`,
//         [
//         { text: "Cancel", style: "cancel" },
//         {
//             text: "Confirm",
//             style: "destructive",
//             onPress: async () => {
//             try {
//                 await updateReturnItem(item.returnItemId, {
//                 status: "returned_to_supplier",
//                 });

//                 await deleteReturnStockItem(item.id);
//                 await loadItems();

//                 Alert.alert("Done", "Item marked as returned to supplier.");
//             } catch (error: any) {
//                 Alert.alert("Error", error.message || "Could not update return status.");
//             }
//             },
//         },
//         ]
//     );
// };

//   const shareList = async () => {
//     if (items.length === 0) {
//       Alert.alert(
//         "No Items",
//         "There are no items waiting to be returned to supplier."
//       );
//       return;
//     }

//     const message = [
//       "StockTally Supplier Return List",
//       "",
//       ...items.map((item, index) => {
//         return `${index + 1}. ${item.name}
//         Quantity: ${item.quantity}
//         Reason: ${item.reason}
//         Category: ${item.category || "Uncategorised"}
//         Supplier: ${item.supplierName || "Not added"}
//         Added: ${new Date(item.date).toLocaleDateString("en-GB")}`;
//       }),
//     ].join("\n\n");

//     await Share.share({ message });
//   };

//   const renderItem = ({ item }: { item: ReturnStockItem }) => {
//     return (
//       <View style={styles.card}>
//         <View style={styles.cardTop}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.itemName}>{item.name}</Text>
//             <Text style={styles.category}>
//               {item.category || "Uncategorised"}
//             </Text>
//           </View>

//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>TO RETURN</Text>
//           </View>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Quantity</Text>
//           <Text style={styles.value}>{item.quantity}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Reason</Text>
//           <Text style={styles.value}>{item.reason}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Supplier</Text>
//           <Text style={styles.value}>{item.supplierName || "Not added"}</Text>
//         </View>

//         <Text style={styles.date}>
//           Added: {new Date(item.date).toLocaleDateString("en-GB")}
//         </Text>

//         <TouchableOpacity
//           style={styles.returnedButton}
//           onPress={() => markReturnedToSupplier(item)}
//         >
//           <Text style={styles.returnedButtonText}>Returned to Supplier</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <View style={styles.center}>
//           <ActivityIndicator size="large" />
//           <Text style={styles.loadingText}>Loading supplier returns...</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.title}>Supplier Returns</Text>
//             <Text style={styles.subtitle}>
//               {items.length} item{items.length === 1 ? "" : "s"} waiting to be returned
//             </Text>
//           </View>

//           <TouchableOpacity style={styles.shareButton} onPress={shareList}>
//             <Text style={styles.shareText}>Share</Text>
//           </TouchableOpacity>
//         </View>

//         {items.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyIcon}>✅</Text>
//             <Text style={styles.emptyTitle}>No supplier returns</Text>
//             <Text style={styles.emptyText}>
//               Damaged, expired or faulty items marked for supplier return will appear here.
//             </Text>

//             <TouchableOpacity
//               style={styles.primaryButton}
//               onPress={() => router.push("/screens/returns/record")}
//             >
//               <Text style={styles.primaryButtonText}>Record Return</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={items}
//             keyExtractor={(item) => item.id}
//             renderItem={renderItem}
//             contentContainerStyle={styles.listContent}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//           />
//         )}
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 18,
//     backgroundColor: "#f8fafc",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 18,
//     gap: 12,
//   },
//   title: {
//     fontSize: 27,
//     fontWeight: "900",
//     color: "#111827",
//   },
//   subtitle: {
//     color: "#6b7280",
//     marginTop: 4,
//     fontWeight: "600",
//   },
//   shareButton: {
//     backgroundColor: "#2563eb",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 12,
//   },
//   shareText: {
//     color: "#fff",
//     fontWeight: "900",
//   },
//   listContent: {
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   cardTop: {
//     flexDirection: "row",
//     marginBottom: 12,
//     alignItems: "center",
//   },
//   itemName: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: "#111827",
//   },
//   category: {
//     color: "#6b7280",
//     marginTop: 3,
//     fontWeight: "600",
//   },
//   badge: {
//     backgroundColor: "#f97316",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 999,
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 11,
//     fontWeight: "900",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 5,
//     gap: 10,
//   },
//   label: {
//     color: "#6b7280",
//     fontWeight: "800",
//   },
//   value: {
//     color: "#111827",
//     fontWeight: "800",
//     maxWidth: "60%",
//     textAlign: "right",
//   },
//   date: {
//     color: "#6b7280",
//     marginTop: 10,
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   returnedButton: {
//     marginTop: 14,
//     backgroundColor: "#16a34a",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   returnedButtonText: {
//     color: "#fff",
//     fontWeight: "900",
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 24,
//   },
//   emptyIcon: {
//     fontSize: 48,
//     marginBottom: 14,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: "900",
//     color: "#111827",
//     marginBottom: 8,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   primaryButton: {
//     backgroundColor: "#111827",
//     paddingHorizontal: 18,
//     paddingVertical: 13,
//     borderRadius: 12,
//   },
//   primaryButtonText: {
//     color: "#fff",
//     fontWeight: "900",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#6b7280",
//     marginTop: 10,
//   },
// });

// export default ReturnStockListScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getReturnStockItems,
  getStockItem,
  ReturnItem,
  ReturnStatus,
  ReturnStockItem,
  saveStockMovement,
  updateReturnItem,
  updateReturnStockItem,
  updateStockQuantity,
} from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ReturnFilter =
  | "waiting"
  | "with_supplier"
  | "resolved"
  | "all";

const OPEN_SUPPLIER_RETURN_STATUSES: ReturnStatus[] = [
  "pending_return",
  "returned_to_supplier",
  "accepted",
];

const RESOLVED_SUPPLIER_RETURN_STATUSES: ReturnStatus[] = [
  "credited",
  "replaced",
  "rejected",
  "closed",
];

const ReturnStockListScreen = () => {
  const [items, setItems] = useState<ReturnStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] =
    useState<ReturnFilter>("waiting");

  const [selectedItem, setSelectedItem] =
    useState<ReturnStockItem | null>(null);

  const [
    replacementModalVisible,
    setReplacementModalVisible,
  ] = useState(false);

  const [
    replacementQuantity,
    setReplacementQuantity,
  ] = useState("");

  const [
    replacementReference,
    setReplacementReference,
  ] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const data = await getReturnStockItems();

      const normalised: ReturnStockItem[] = data.map(
        (item) => ({
          ...item,

          /*
           * Legacy ReturnStockItem records may not yet contain a status.
           * They were originally all records waiting to be returned.
           */
          status: item.status || "pending_return",

          unit: item.unit || "pcs",

          unitCost: Number(item.unitCost || 0),

          returnValue:
            item.returnValue !== undefined
              ? Number(item.returnValue)
              : Number(item.quantity || 0) *
                Number(item.unitCost || 0),
        }),
      );

      const sorted = [...normalised].sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );

      setItems(sorted);
    } catch (error: any) {
      console.error(
        "Failed to load supplier returns:",
        error,
      );

      Alert.alert(
        "Error",
        error.message ||
          "Could not load supplier return list.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
  };

  const filteredItems = useMemo(() => {
    switch (filter) {
      case "waiting":
        return items.filter(
          (item) => item.status === "pending_return",
        );

      case "with_supplier":
        return items.filter(
          (item) =>
            item.status === "returned_to_supplier" ||
            item.status === "accepted",
        );

      case "resolved":
        return items.filter((item) =>
          RESOLVED_SUPPLIER_RETURN_STATUSES.includes(
            item.status,
          ),
        );

      case "all":
      default:
        return items;
    }
  }, [filter, items]);

  const summary = useMemo(() => {
    const waitingItems = items.filter(
      (item) => item.status === "pending_return",
    );

    const withSupplierItems = items.filter(
      (item) =>
        item.status === "returned_to_supplier" ||
        item.status === "accepted",
    );

    const calculateQuantity = (
      returnItems: ReturnStockItem[],
    ) =>
      returnItems.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0,
      );

    const calculateValue = (
      returnItems: ReturnStockItem[],
    ) =>
      returnItems.reduce((total, item) => {
        const value =
          item.returnValue !== undefined
            ? Number(item.returnValue)
            : Number(item.quantity || 0) *
              Number(item.unitCost || 0);

        return total + value;
      }, 0);

    return {
      waitingCount: waitingItems.length,
      waitingQuantity:
        calculateQuantity(waitingItems),
      waitingValue: calculateValue(waitingItems),

      withSupplierCount: withSupplierItems.length,
      withSupplierQuantity:
        calculateQuantity(withSupplierItems),
      withSupplierValue:
        calculateValue(withSupplierItems),

      openCount: items.filter((item) =>
        OPEN_SUPPLIER_RETURN_STATUSES.includes(
          item.status,
        ),
      ).length,
    };
  }, [items]);

  const updateHistoryStatus = async (
    item: ReturnStockItem,
    status: ReturnStatus,
  ) => {
    if (!item.returnItemId) {
      return;
    }

    const returnUpdates: Partial<ReturnItem> = {
      status,
      synced: false,
      syncedAt: "",
    };

    await updateReturnItem(
      item.returnItemId,
      returnUpdates,
    );
  };

  const updateSupplierReturnStatus = async (
    item: ReturnStockItem,
    status: ReturnStatus,
    extraUpdates: Partial<ReturnStockItem> = {},
  ) => {
    const now = new Date().toISOString();

    await updateReturnStockItem(item.id, {
      ...extraUpdates,
      status,
      synced: false,
      syncedAt: "",
      resolvedAt:
        RESOLVED_SUPPLIER_RETURN_STATUSES.includes(
          status,
        )
          ? now
          : extraUpdates.resolvedAt,
    });

    await updateHistoryStatus(item, status);
  };

  const markReturnedToSupplier = (
    item: ReturnStockItem,
  ) => {
    Alert.alert(
      "Returned to Supplier?",
      `${item.name} will be marked as sent to ${
        item.supplierName || "the supplier"
      }. The record will remain in return history.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const now = new Date().toISOString();

              await updateSupplierReturnStatus(
                item,
                "returned_to_supplier",
                {
                  returnedAt: now,
                },
              );

              await loadItems();

              Alert.alert(
                "Done",
                "Item marked as returned to supplier.",
              );
            } catch (error: any) {
              console.error(
                "Failed to mark supplier return as sent:",
                error,
              );

              Alert.alert(
                "Error",
                error.message ||
                  "Could not update return status.",
              );
            }
          },
        },
      ],
    );
  };

  const markAccepted = (
    item: ReturnStockItem,
  ) => {
    Alert.alert(
      "Supplier Accepted Return?",
      `Confirm that ${
        item.supplierName || "the supplier"
      } accepted the return of ${item.name}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await updateSupplierReturnStatus(
                item,
                "accepted",
              );

              await loadItems();

              Alert.alert(
                "Updated",
                "Return marked as accepted by supplier.",
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message ||
                  "Could not update return status.",
              );
            }
          },
        },
      ],
    );
  };

  const markCredited = (
    item: ReturnStockItem,
  ) => {
    Alert.alert(
      "Credit Received?",
      `Confirm that credit has been received for ${item.name}. No credit amount will be stored.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await updateSupplierReturnStatus(
                item,
                "credited",
              );

              await loadItems();

              Alert.alert(
                "Credit Recorded",
                "Return marked as credited.",
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message ||
                  "Could not update return status.",
              );
            }
          },
        },
      ],
    );
  };

  const openReplacementModal = (
    item: ReturnStockItem,
  ) => {
    setSelectedItem(item);

    setReplacementQuantity(
      String(
        item.replacementQuantity ||
          item.quantity ||
          "",
      ),
    );

    setReplacementReference(
      item.replacementReference || "",
    );

    setReplacementModalVisible(true);
  };

  const closeReplacementModal = () => {
    setReplacementModalVisible(false);
    setSelectedItem(null);
    setReplacementQuantity("");
    setReplacementReference("");
  };

  const saveReplacementReceived = async () => {
    if (!selectedItem) {
      return;
    }

    const quantity = Number(replacementQuantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      Alert.alert(
        "Invalid Quantity",
        "Enter a valid replacement quantity greater than zero.",
      );

      return;
    }

    try {
      const stockItem = await getStockItem(
        selectedItem.stockItemId,
      );

      if (!stockItem) {
        Alert.alert(
          "Stock Item Not Found",
          "The original stock item could not be found, so the replacement cannot be added automatically.",
        );

        return;
      }

      const newBalance =
        Number(stockItem.quantity || 0) + quantity;

      await updateStockQuantity(
        stockItem.id,
        newBalance,
      );

      await saveStockMovement({
        stockItemId: stockItem.id,
        itemName: stockItem.name,
        type: "IN",
        quantity,
        source: "SUPPLIER_REPLACEMENT",
        sourceLabel:
          "Supplier replacement received",
        balanceAfter: newBalance,
        referenceId: selectedItem.id,
        referenceType: "SUPPLIER_RETURN",
        note:
          replacementReference.trim() ||
          "Replacement received from supplier",
      });

      await updateSupplierReturnStatus(
        selectedItem,
        "replaced",
        {
          replacementQuantity: quantity,
          replacementReference:
            replacementReference.trim() ||
            undefined,
        },
      );

      closeReplacementModal();
      await loadItems();

      Alert.alert(
        "Replacement Received",
        `${quantity} ${
          stockItem.unit || "pcs"
        } added back to stock.`,
      );
    } catch (error: any) {
      console.error(
        "Failed to record supplier replacement:",
        error,
      );

      Alert.alert(
        "Error",
        error.message ||
          "Could not record supplier replacement.",
      );
    }
  };

  const markRejected = (
    item: ReturnStockItem,
  ) => {
    Alert.alert(
      "Return Rejected?",
      `Confirm that ${
        item.supplierName || "the supplier"
      } rejected this return.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark Rejected",
          style: "destructive",
          onPress: async () => {
            try {
              await updateSupplierReturnStatus(
                item,
                "rejected",
              );

              await loadItems();

              Alert.alert(
                "Updated",
                "Return marked as rejected.",
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message ||
                  "Could not update return status.",
              );
            }
          },
        },
      ],
    );
  };

  const closeReturn = (
    item: ReturnStockItem,
  ) => {
    Alert.alert(
      "Close Return?",
      "This return will remain in history but will no longer be treated as outstanding.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Close Return",
          onPress: async () => {
            try {
              await updateSupplierReturnStatus(
                item,
                "closed",
              );

              await loadItems();

              Alert.alert(
                "Closed",
                "Supplier return has been closed.",
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message ||
                  "Could not close supplier return.",
              );
            }
          },
        },
      ],
    );
  };

  const showReturnActions = (
    item: ReturnStockItem,
  ) => {
    if (item.status === "pending_return") {
      markReturnedToSupplier(item);
      return;
    }

    if (
      item.status === "returned_to_supplier" ||
      item.status === "accepted"
    ) {
      Alert.alert(
        "Update Supplier Return",
        "Choose the latest status for this return.",
        [
          ...(item.status ===
          "returned_to_supplier"
            ? [
                {
                  text: "Supplier Accepted",
                  onPress: () =>
                    markAccepted(item),
                },
              ]
            : []),

          {
            text: "Credit Received",
            onPress: () => markCredited(item),
          },

          {
            text: "Replacement Received",
            onPress: () =>
              openReplacementModal(item),
          },

          {
            text: "Supplier Rejected",
            style: "destructive" as const,
            onPress: () => markRejected(item),
          },

          {
            text: "Close Return",
            onPress: () => closeReturn(item),
          },

          {
            text: "Cancel",
            style: "cancel" as const,
          },
        ],
      );

      return;
    }

    Alert.alert(
      "Return Status",
      `This return is currently marked as ${getStatusLabel(
        item.status,
      )}.`,
      [
        {
          text: "Close",
          style: "cancel",
        },
      ],
    );
  };

  const shareList = async () => {
    if (filteredItems.length === 0) {
      Alert.alert(
        "No Items",
        "There are no supplier returns in the selected category.",
      );

      return;
    }

    const message = [
      "StockTally Supplier Return List",
      "",
      ...filteredItems.map((item, index) => {
        const returnValue =
          item.returnValue !== undefined
            ? Number(item.returnValue)
            : Number(item.quantity || 0) *
              Number(item.unitCost || 0);

        return `${index + 1}. ${item.name}
Quantity: ${item.quantity} ${item.unit || "pcs"}
Reason: ${item.reason}
Category: ${item.category || "Uncategorised"}
Supplier: ${item.supplierName || "Not added"}
Status: ${getStatusLabel(item.status)}
Return value: £${returnValue.toFixed(2)}
Added: ${formatDate(item.date)}`;
      }),
    ].join("\n\n");

    try {
      await Share.share({ message });
    } catch (error: any) {
      Alert.alert(
        "Share Failed",
        error.message ||
          "Could not share supplier return list.",
      );
    }
  };

  const renderItem = ({
    item,
  }: {
    item: ReturnStockItem;
  }) => {
    const returnValue =
      item.returnValue !== undefined
        ? Number(item.returnValue)
        : Number(item.quantity || 0) *
          Number(item.unitCost || 0);

    const hasCostInformation =
      Number(item.unitCost || 0) > 0 ||
      Number(item.returnValue || 0) > 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardHeading}>
            <Text style={styles.itemName}>
              {item.name}
            </Text>

            <Text style={styles.category}>
              {item.category || "Uncategorised"}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              getBadgeStyle(item.status),
            ]}
          >
            <Text style={styles.badgeText}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <DetailRow
          label="Quantity"
          value={`${item.quantity} ${
            item.unit || "pcs"
          }`}
        />

        <DetailRow
          label="Reason"
          value={item.reason}
        />

        <DetailRow
          label="Supplier"
          value={
            item.supplierName || "Not added"
          }
        />

        {hasCostInformation ? (
          <>
            <DetailRow
              label="Unit cost"
              value={`£${Number(
                item.unitCost || 0,
              ).toFixed(2)}`}
            />

            <DetailRow
              label="Return value"
              value={`£${returnValue.toFixed(2)}`}
              highlighted
            />
          </>
        ) : null}

        {item.replacementQuantity ? (
          <DetailRow
            label="Replacement"
            value={`${item.replacementQuantity} ${
              item.unit || "pcs"
            }`}
            success
          />
        ) : null}

        {item.replacementReference ? (
          <DetailRow
            label="Replacement ref."
            value={item.replacementReference}
          />
        ) : null}

        <Text style={styles.date}>
          Added: {formatDate(item.date)}
        </Text>

        {item.returnedAt ? (
          <Text style={styles.date}>
            Sent: {formatDate(item.returnedAt)}
          </Text>
        ) : null}

        {item.resolvedAt ? (
          <Text style={styles.date}>
            Resolved:{" "}
            {formatDate(item.resolvedAt)}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.actionButton,
            item.status === "pending_return"
              ? styles.sendButton
              : OPEN_SUPPLIER_RETURN_STATUSES.includes(
                    item.status,
                  )
                ? styles.updateButton
                : styles.resolvedButton,
          ]}
          onPress={() =>
            showReturnActions(item)
          }
        >
          <Text style={styles.actionButtonText}>
            {getActionButtonLabel(item.status)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Loading supplier returns...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Supplier Returns
            </Text>

            <Text style={styles.subtitle}>
              {summary.openCount} outstanding return
              {summary.openCount === 1 ? "" : "s"}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.shareButton}
            onPress={shareList}
          >
            <Text style={styles.shareText}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              Waiting to send
            </Text>

            <Text style={styles.summaryNumber}>
              {summary.waitingCount}
            </Text>

            <Text style={styles.summarySmallText}>
              {summary.waitingQuantity} units
            </Text>

            <Text style={styles.summaryValue}>
              £{summary.waitingValue.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              With supplier
            </Text>

            <Text style={styles.summaryNumber}>
              {summary.withSupplierCount}
            </Text>

            <Text style={styles.summarySmallText}>
              {summary.withSupplierQuantity} units
            </Text>

            <Text style={styles.summaryValue}>
              £
              {summary.withSupplierValue.toFixed(
                2,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <FilterButton
            label="Waiting"
            active={filter === "waiting"}
            onPress={() => setFilter("waiting")}
          />

          <FilterButton
            label="With Supplier"
            active={
              filter === "with_supplier"
            }
            onPress={() =>
              setFilter("with_supplier")
            }
          />

          <FilterButton
            label="Resolved"
            active={filter === "resolved"}
            onPress={() =>
              setFilter("resolved")
            }
          />

          <FilterButton
            label="All"
            active={filter === "all"}
            onPress={() => setFilter("all")}
          />
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {filter === "resolved"
                ? "📦"
                : "✅"}
            </Text>

            <Text style={styles.emptyTitle}>
              {getEmptyTitle(filter)}
            </Text>

            <Text style={styles.emptyText}>
              {getEmptyMessage(filter)}
            </Text>

            {filter === "waiting" ||
            filter === "all" ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButton}
                onPress={() =>
                  router.push(
                    "/screens/returns/record",
                  )
                }
              >
                <Text
                  style={styles.primaryButtonText}
                >
                  Record Return
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.listContent
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        )}
      </View>

      <Modal
        visible={replacementModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReplacementModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Replacement Received
            </Text>

            <Text style={styles.modalSubtitle}>
              {selectedItem?.name}
            </Text>

            <Text style={styles.modalLabel}>
              Replacement quantity
            </Text>

            <TextInput
              value={replacementQuantity}
              onChangeText={
                setReplacementQuantity
              }
              keyboardType="decimal-pad"
              placeholder="Enter quantity"
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>
              Replacement reference
            </Text>

            <TextInput
              value={replacementReference}
              onChangeText={
                setReplacementReference
              }
              placeholder="Optional delivery or reference number"
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.modalCancelButton
                }
                onPress={
                  closeReplacementModal
                }
              >
                <Text
                  style={styles.modalCancelText}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.modalSaveButton}
                onPress={
                  saveReplacementReceived
                }
              >
                <Text
                  style={styles.modalSaveText}
                >
                  Add to Stock
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

interface FilterButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterButton = ({
  label,
  active,
  onPress,
}: FilterButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.filterButton,
        active && styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          active &&
            styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  highlighted?: boolean;
  success?: boolean;
}

const DetailRow = ({
  label,
  value,
  highlighted = false,
  success = false,
}: DetailRowProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <Text
        style={[
          styles.value,
          highlighted && styles.highlightedValue,
          success && styles.successValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const getStatusLabel = (
  status: ReturnStatus,
): string => {
  switch (status) {
    case "pending_return":
      return "Waiting to Send";

    case "returned_to_supplier":
      return "With Supplier";

    case "accepted":
      return "Accepted";

    case "credited":
      return "Credited";

    case "replaced":
      return "Replaced";

    case "rejected":
      return "Rejected";

    case "closed":
      return "Closed";

    case "back_to_stock":
      return "Back to Stock";

    case "no_stock_change":
      return "No Stock Change";

    default:
      return "Waiting to Send";
  }
};

const getBadgeStyle = (
  status: ReturnStatus,
) => {
  switch (status) {
    case "pending_return":
      return styles.pendingBadge;

    case "returned_to_supplier":
      return styles.withSupplierBadge;

    case "accepted":
      return styles.acceptedBadge;

    case "credited":
      return styles.creditedBadge;

    case "replaced":
      return styles.replacedBadge;

    case "rejected":
      return styles.rejectedBadge;

    case "closed":
      return styles.closedBadge;

    default:
      return styles.closedBadge;
  }
};

const getActionButtonLabel = (
  status: ReturnStatus,
): string => {
  switch (status) {
    case "pending_return":
      return "Returned to Supplier";

    case "returned_to_supplier":
    case "accepted":
      return "Update Return Status";

    default:
      return "View Status";
  }
};

const getEmptyTitle = (
  filter: ReturnFilter,
): string => {
  switch (filter) {
    case "waiting":
      return "Nothing waiting to send";

    case "with_supplier":
      return "No returns with suppliers";

    case "resolved":
      return "No resolved returns";

    case "all":
    default:
      return "No supplier returns";
  }
};

const getEmptyMessage = (
  filter: ReturnFilter,
): string => {
  switch (filter) {
    case "waiting":
      return "Items marked for return to a supplier will appear here.";

    case "with_supplier":
      return "Returns sent to suppliers will appear here until they are credited, replaced, rejected or closed.";

    case "resolved":
      return "Credited, replaced, rejected and closed returns will appear here.";

    case "all":
    default:
      return "Damaged, expired or faulty items marked for supplier return will appear here.";
  }
};

const formatDate = (
  date?: string,
): string => {
  if (!date) {
    return "Not recorded";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB");
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "600",
  },

  shareButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },

  shareText: {
    color: "#fff",
    fontWeight: "900",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 14,
  },

  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "800",
  },

  summaryNumber: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 5,
  },

  summarySmallText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  summaryValue: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 5,
  },

  filterRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 16,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: "#111827",
  },

  filterButtonText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },

  filterButtonTextActive: {
    color: "#fff",
  },

  listContent: {
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    gap: 10,
  },

  cardHeading: {
    flex: 1,
  },

  itemName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  category: {
    color: "#6b7280",
    marginTop: 3,
    fontWeight: "600",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: 130,
  },

  pendingBadge: {
    backgroundColor: "#f97316",
  },

  withSupplierBadge: {
    backgroundColor: "#2563eb",
  },

  acceptedBadge: {
    backgroundColor: "#7c3aed",
  },

  creditedBadge: {
    backgroundColor: "#16a34a",
  },

  replacedBadge: {
    backgroundColor: "#0f766e",
  },

  rejectedBadge: {
    backgroundColor: "#dc2626",
  },

  closedBadge: {
    backgroundColor: "#6b7280",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    gap: 10,
  },

  label: {
    color: "#6b7280",
    fontWeight: "800",
  },

  value: {
    color: "#111827",
    fontWeight: "800",
    maxWidth: "62%",
    textAlign: "right",
  },

  highlightedValue: {
    color: "#2563eb",
    fontWeight: "900",
  },

  successValue: {
    color: "#16a34a",
    fontWeight: "900",
  },

  date: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  actionButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  sendButton: {
    backgroundColor: "#16a34a",
  },

  updateButton: {
    backgroundColor: "#2563eb",
  },

  resolvedButton: {
    backgroundColor: "#6b7280",
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "900",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
  },

  modalSubtitle: {
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 16,
    fontWeight: "700",
  },

  modalLabel: {
    color: "#374151",
    fontWeight: "800",
    marginBottom: 6,
  },

  modalInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  modalCancelText: {
    color: "#374151",
    fontWeight: "900",
  },

  modalSaveButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  modalSaveText: {
    color: "#fff",
    fontWeight: "900",
  },
});

export default ReturnStockListScreen;