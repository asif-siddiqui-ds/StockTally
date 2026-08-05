// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getStockItems, StockItem, updateStockItem } from '@/lib/storage';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { router } from 'expo-router';
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Modal,
//   RefreshControl,
//   SafeAreaView,
//   Share,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// type StockTakeRow = StockItem & {
//   countedQuantity: string;
//   difference: number;
//   checked: boolean;
// };

// interface AlertPromptButton {
//   text: string;
//   style?: 'cancel' | 'destructive' | 'default';
//   onPress?: (value?: string) => void;
// }

// const StockTakeScreen: React.FC = () => {
//   const [rows, setRows] = useState<StockTakeRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [scannerVisible, setScannerVisible] = useState(false);
//   const [scanned, setScanned] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();

//   const loadStock = useCallback(async () => {
//     try {
//       const stock = await getStockItems();

//       const prepared: StockTakeRow[] = stock
//         .map((item) => ({
//           ...item,
//           countedQuantity: String(item.quantity),
//           difference: 0,
//           checked: false,
//         }))
//         .sort((a, b) => a.name.localeCompare(b.name));

//       setRows(prepared);
//     } catch (error: any) {
//       console.error('Failed to load stock take:', error);
//       Alert.alert('Error', error.message || 'Could not load stock items.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadStock();
//   }, [loadStock]);

//   const stats = useMemo(() => {
//     const total = rows.length;
//     const checked = rows.filter((item) => item.checked).length;
//     const discrepancies = rows.filter((item) => item.difference !== 0).length;

//     return { total, checked, discrepancies };
//   }, [rows]);

//   const updateCountedQuantity = (id: string, text: string) => {
//     setRows((prev) =>
//       prev.map((item) => {
//         if (item.id !== id) return item;

//         const counted = Number(text) || 0;

//         return {
//           ...item,
//           countedQuantity: text,
//           difference: counted - item.quantity,
//           checked: true,
//         };
//       })
//     );
//   };

//   const markAsChecked = (id: string) => {
//     setRows((prev) =>
//       prev.map((item) => {
//         if (item.id !== id) return item;

//         const counted = Number(item.countedQuantity) || 0;

//         return {
//           ...item,
//           difference: counted - item.quantity,
//           checked: true,
//         };
//       })
//     );
//   };

//   const openScanner = async () => {
//     if (!permission?.granted) {
//       const result = await requestPermission();

//       if (!result.granted) {
//         Alert.alert('Camera Permission Required', 'Please allow camera access to scan barcodes.');
//         return;
//       }
//     }

//     setScanned(false);
//     setScannerVisible(true);
//   };

//   const handleBarcodeScanned = (code: string) => {
//     setScanned(true);
//     setScannerVisible(false);

//     const matched = rows.find(
//       (item) => String(item.barcode || '').trim() === code.trim()
//     );

//     setTimeout(() => {
//       if (!matched) {
//         Alert.alert('No Match Found', `No stock item found for barcode: ${code}`);
//         setScanned(false);
//         return;
//       }

//       Alert.prompt(
//         'Stock Count',
//         `${matched.name}\nExpected: ${matched.quantity} ${matched.unit || 'pcs'}\nEnter counted quantity:`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Save Count',
//             onPress: (value: any) => {
//               updateCountedQuantity(matched.id, value || String(matched.quantity));
//             },
//           },
//         ],
//         'plain-text',
//         String(matched.quantity),
//         'number-pad'
//       );

//       setScanned(false);
//     }, 400);
//   };

//   const completeStockTake = async () => {
//     const changedItems = rows.filter((item) => item.checked && item.difference !== 0);

//     if (changedItems.length === 0) {
//       Alert.alert('No Adjustments', 'No stock differences found.');
//       return;
//     }

//     Alert.alert(
//       'Complete Stock Take',
//       `${changedItems.length} item(s) will be adjusted to the counted quantity. Continue?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Complete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               for (const item of changedItems) {
//                 await updateStockItem(item.id, {
//                   quantity: Number(item.countedQuantity) || 0,
//                   category: item.category,
//                   barcode: item.barcode || '',
//                   unit: item.unit || 'pcs',
//                   costPrice: item.costPrice,
//                   lowStockAlert: item.lowStockAlert,
//                   idealStockLevel: item.idealStockLevel,
//                   supplierName: item.supplierName,
//                 });
//               }

//               Alert.alert('Success', 'Stock take completed and stock updated.');
//               router.replace('/(tabs)/stockList');
//             } catch (error: any) {
//               console.error('Stock take completion failed:', error);
//               Alert.alert('Error', error.message || 'Could not complete stock take.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const shareReport = async () => {
//     const discrepancies = rows.filter((item) => item.difference !== 0);

//     if (discrepancies.length === 0) {
//       Alert.alert('No Differences', 'There are no differences to share.');
//       return;
//     }

//     const message = [
//       'StockTally Stock Take Report',
//       '',
//       ...discrepancies.map((item, index) => {
//         const unit = item.unit || 'pcs';
//         const sign = item.difference > 0 ? '+' : '';

//         return `${index + 1}. ${item.name} | Expected: ${item.quantity} ${unit} | Counted: ${item.countedQuantity} ${unit} | Difference: ${sign}${item.difference} ${unit}`;
//       }),
//     ].join('\n');

//     await Share.share({ message });
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadStock();
//   };

//   const renderItem = ({ item }: { item: StockTakeRow }) => {
//     const unit = item.unit || 'pcs';
//     const hasDifference = item.difference !== 0;

//     return (
//       <View style={[styles.card, hasDifference && styles.diffCard]}>
//         <View style={styles.cardHeader}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.itemName}>{item.name}</Text>
//             <Text style={styles.category}>{item.category}</Text>
//           </View>

//           <View
//             style={[
//               styles.statusBadge,
//               item.checked ? styles.checkedBadge : styles.pendingBadge,
//             ]}
//           >
//             <Text style={styles.statusText}>{item.checked ? 'CHECKED' : 'PENDING'}</Text>
//           </View>
//         </View>

//         <View style={styles.expectedRow}>
//           <Text style={styles.expectedText}>
//             Expected: <Text style={styles.bold}>{item.quantity} {unit}</Text>
//           </Text>

//           {item.barcode ? <Text style={styles.barcodeText}>Barcode: {item.barcode}</Text> : null}
//         </View>

//         <Text style={styles.label}>Counted Quantity</Text>
//         <TextInput
//           value={item.countedQuantity}
//           onChangeText={(text) => updateCountedQuantity(item.id, text)}
//           keyboardType="numeric"
//           style={styles.input}
//           placeholder="Actual count"
//         />

//         <View style={styles.resultRow}>
//           <Text style={styles.diffLabel}>Difference</Text>
//           <Text
//             style={[
//               styles.diffValue,
//               item.difference < 0 && styles.negative,
//               item.difference > 0 && styles.positive,
//             ]}
//           >
//             {item.difference > 0 ? '+' : ''}
//             {item.difference} {unit}
//           </Text>
//         </View>

//         <TouchableOpacity style={styles.markButton} onPress={() => markAsChecked(item.id)}>
//           <Text style={styles.markButtonText}>Mark Checked</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <View style={styles.center}>
//           <ActivityIndicator size="large" />
//           <Text style={styles.loadingText}>Loading stock take...</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={{ flex: 1 }}>
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <View>
//               <Text style={styles.title}>Stock Take</Text>
//               <Text style={styles.subtitle}>
//                 {stats.checked}/{stats.total} checked • {stats.discrepancies} differences
//               </Text>
//             </View>
//           </View>

//           <View style={styles.actionRow}>
//             <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
//               <Text style={styles.actionText}>📷 Scan</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.shareButton} onPress={shareReport}>
//               <Text style={styles.actionText}>Share</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.completeButton} onPress={completeStockTake}>
//               <Text style={styles.actionText}>Complete</Text>
//             </TouchableOpacity>
//           </View>

//           {rows.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyIcon}>📦</Text>
//               <Text style={styles.emptyTitle}>No stock items found</Text>
//               <Text style={styles.emptyText}>
//                 Add stock items first before starting a stock take.
//               </Text>
//               <TouchableOpacity
//                 style={styles.primaryButton}
//                 onPress={() => router.push('/screens/stock/add')}
//               >
//                 <Text style={styles.primaryButtonText}>Add Stock Item</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <FlatList
//               data={rows}
//               keyExtractor={(item) => item.id}
//               renderItem={renderItem}
//               contentContainerStyle={styles.listContent}
//               refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//             />
//           )}
//         </View>

//         <Modal visible={scannerVisible} animationType="slide">
//           <View style={styles.scannerContainer}>
//             <CameraView
//               style={StyleSheet.absoluteFillObject}
//               facing="back"
//               barcodeScannerSettings={{
//                 barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
//               }}
//               onBarcodeScanned={
//                 scanned
//                   ? undefined
//                   : ({ data }) => {
//                       handleBarcodeScanned(data);
//                     }
//               }
//             />

//             <View style={styles.scannerOverlay}>
//               <Text style={styles.scannerTitle}>Scan item barcode</Text>
//               <View style={styles.scanBox} />

//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => {
//                   setScannerVisible(false);
//                   setScanned(false);
//                 }}
//               >
//                 <Text style={styles.closeButtonText}>Close Scanner</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 18,
//   },
//   header: {
//     marginBottom: 14,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '900',
//     color: '#111827',
//   },
//   subtitle: {
//     marginTop: 4,
//     color: '#6b7280',
//     fontWeight: '600',
//   },
//   actionRow: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 14,
//   },
//   scanButton: {
//     flex: 1,
//     backgroundColor: '#111827',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   shareButton: {
//     flex: 1,
//     backgroundColor: '#2563eb',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   completeButton: {
//     flex: 1,
//     backgroundColor: '#16a34a',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   actionText: {
//     color: '#fff',
//     fontWeight: '800',
//   },
//   listContent: {
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   diffCard: {
//     borderColor: '#fbbf24',
//     backgroundColor: '#fffbeb',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   itemName: {
//     fontSize: 18,
//     fontWeight: '900',
//     color: '#111827',
//   },
//   category: {
//     color: '#6b7280',
//     marginTop: 3,
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 999,
//   },
//   checkedBadge: {
//     backgroundColor: '#16a34a',
//   },
//   pendingBadge: {
//     backgroundColor: '#9ca3af',
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: '900',
//   },
//   expectedRow: {
//     marginBottom: 10,
//   },
//   expectedText: {
//     color: '#374151',
//     fontSize: 15,
//   },
//   bold: {
//     fontWeight: '900',
//   },
//   barcodeText: {
//     marginTop: 4,
//     color: '#6b7280',
//     fontSize: 12,
//   },
//   label: {
//     fontWeight: '800',
//     marginBottom: 6,
//     color: '#111827',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 16,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//   },
//   resultRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#f3f4f6',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   diffLabel: {
//     fontWeight: '800',
//     color: '#374151',
//   },
//   diffValue: {
//     fontWeight: '900',
//     color: '#111827',
//   },
//   negative: {
//     color: '#dc2626',
//   },
//   positive: {
//     color: '#16a34a',
//   },
//   markButton: {
//     backgroundColor: '#111827',
//     paddingVertical: 11,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   markButtonText: {
//     color: '#fff',
//     fontWeight: '900',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 22,
//   },
//   emptyIcon: {
//     fontSize: 48,
//     marginBottom: 14,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '900',
//     color: '#111827',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyText: {
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   primaryButton: {
//     backgroundColor: '#111827',
//     paddingHorizontal: 20,
//     paddingVertical: 13,
//     borderRadius: 12,
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontWeight: '900',
//   },
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#6b7280',
//   },
//   scannerContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   scannerOverlay: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   scannerTitle: {
//     color: '#fff',
//     fontSize: 22,
//     fontWeight: '900',
//     marginBottom: 24,
//   },
//   scanBox: {
//     width: 260,
//     height: 160,
//     borderWidth: 3,
//     borderColor: '#00e5ff',
//     borderRadius: 18,
//   },
//   closeButton: {
//     marginTop: 40,
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   closeButtonText: {
//     color: '#111',
//     fontSize: 16,
//     fontWeight: '900',
//   },
// });

// export default StockTakeScreen;


// app/screens/StockTakeScreen.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  StockItem,
  updateStockItem,
} from "@/lib/storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StockTakeRow = StockItem & {
  countedQuantity: string;
  difference: number;
  checked: boolean;
};

interface AlertPromptButton {
  text: string;
  style?: "cancel" | "destructive" | "default";
  onPress?: (value?: string) => void;
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const parseCountedQuantity = (value: string): number => {
  const normalisedValue = value
    .trim()
    .replace(",", ".");

  const parsed = Number(normalisedValue);

  return Number.isFinite(parsed) ? parsed : 0;
};

const cleanQuantityInput = (value: string): string =>
  value
    .replace(/[^0-9.,]/g, "")
    .replace(",", ".")
    .replace(/(\..*)\./g, "$1");

const StockTakeScreen: React.FC = () => {
  const [rows, setRows] = useState<StockTakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [scannerVisible, setScannerVisible] =
    useState(false);

  const [scanned, setScanned] = useState(false);

  const [permission, requestPermission] =
    useCameraPermissions();

  /*
   * Alert.prompt is only available on iOS.
   * Android uses this custom quantity prompt modal.
   */
  const [
    countPromptVisible,
    setCountPromptVisible,
  ] = useState(false);

  const [promptItem, setPromptItem] =
    useState<StockTakeRow | null>(null);

  const [promptQuantity, setPromptQuantity] =
    useState("");

  const loadStock = useCallback(async () => {
    try {
      const stock = await getStockItems();

      const prepared: StockTakeRow[] = (
        stock ?? []
      )
        .map((item) => ({
          ...item,
          countedQuantity: String(
            item.quantity ?? 0,
          ),
          difference: 0,
          checked: false,
        }))
        .sort((a, b) =>
          String(a.name ?? "").localeCompare(
            String(b.name ?? ""),
          ),
        );

      setRows(prepared);
    } catch (error) {
      console.error(
        "Failed to load stock take:",
        error,
      );

      Alert.alert(
        "Error",
        getErrorMessage(
          error,
          "Could not load stock items.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStock();
  }, [loadStock]);

  const stats = useMemo(() => {
    const total = rows.length;

    const checked = rows.filter(
      (item) => item.checked,
    ).length;

    const discrepancies = rows.filter(
      (item) =>
        item.checked &&
        item.difference !== 0,
    ).length;

    return {
      total,
      checked,
      discrepancies,
    };
  }, [rows]);

  const updateCountedQuantity = useCallback(
    (id: string, text: string) => {
      const cleanedText =
        cleanQuantityInput(text);

      setRows((currentRows) =>
        currentRows.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const counted =
            parseCountedQuantity(cleanedText);

          const expected = Number(
            item.quantity ?? 0,
          );

          return {
            ...item,
            countedQuantity: cleanedText,
            difference: counted - expected,
            checked: true,
          };
        }),
      );
    },
    [],
  );

  const markAsChecked = useCallback(
    (id: string) => {
      setRows((currentRows) =>
        currentRows.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const counted =
            parseCountedQuantity(
              item.countedQuantity,
            );

          const expected = Number(
            item.quantity ?? 0,
          );

          return {
            ...item,
            difference: counted - expected,
            checked: true,
          };
        }),
      );
    },
    [],
  );

  const openScanner = async () => {
    if (!permission?.granted) {
      const result =
        await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to scan barcodes.",
        );

        return;
      }
    }

    setScanned(false);
    setScannerVisible(true);
  };

  const closeCountPrompt = () => {
    setCountPromptVisible(false);
    setPromptItem(null);
    setPromptQuantity("");
  };

  const openAndroidCountPrompt = (
    item: StockTakeRow,
  ) => {
    setPromptItem(item);

    setPromptQuantity(
      item.countedQuantity ||
        String(item.quantity ?? 0),
    );

    setCountPromptVisible(true);
  };

  const savePromptCount = () => {
    if (!promptItem) {
      return;
    }

    const enteredValue =
      promptQuantity.trim();

    if (!enteredValue) {
      Alert.alert(
        "Invalid Quantity",
        "Enter a counted quantity.",
      );

      return;
    }

    const countedQuantity =
      parseCountedQuantity(enteredValue);

    if (
      !Number.isFinite(countedQuantity) ||
      countedQuantity < 0
    ) {
      Alert.alert(
        "Invalid Quantity",
        "Enter a valid counted quantity of zero or more.",
      );

      return;
    }

    updateCountedQuantity(
      promptItem.id,
      String(countedQuantity),
    );

    closeCountPrompt();
  };

  const showCountPrompt = (
    matchedItem: StockTakeRow,
  ) => {
    if (Platform.OS !== "ios") {
      openAndroidCountPrompt(matchedItem);
      return;
    }

    /*
     * The button array is created separately and typed
     * using AlertPromptButton.
     */
    const promptButtons: AlertPromptButton[] = [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          setScanned(false);
        },
      },
      {
        text: "Save Count",
        style: "default",
        onPress: (value?: string) => {
          const enteredValue =
            value?.trim() ||
            matchedItem.countedQuantity ||
            String(
              matchedItem.quantity ?? 0,
            );

          const countedQuantity =
            parseCountedQuantity(
              enteredValue,
            );

          if (
            !Number.isFinite(
              countedQuantity,
            ) ||
            countedQuantity < 0
          ) {
            Alert.alert(
              "Invalid Quantity",
              "Enter a valid counted quantity of zero or more.",
            );

            return;
          }

          updateCountedQuantity(
            matchedItem.id,
            String(countedQuantity),
          );

          setScanned(false);
        },
      },
    ];

    Alert.prompt(
      "Stock Count",
      `${matchedItem.name}\nExpected: ${
        matchedItem.quantity ?? 0
      } ${
        matchedItem.unit?.trim() ||
        "pcs"
      }\nEnter counted quantity:`,
      promptButtons,
      "plain-text",
      matchedItem.countedQuantity ||
        String(
          matchedItem.quantity ?? 0,
        ),
      "decimal-pad",
    );
  };

  const handleBarcodeScanned = (
    code: string,
  ) => {
    if (scanned) {
      return;
    }

    setScanned(true);
    setScannerVisible(false);

    const normalisedBarcode =
      code.trim();

    const matchedItem = rows.find(
      (item) =>
        String(
          item.barcode ?? "",
        ).trim() === normalisedBarcode,
    );

    setTimeout(() => {
      if (!matchedItem) {
        Alert.alert(
          "No Match Found",
          `No stock item was found for barcode: ${normalisedBarcode}`,
        );

        setScanned(false);
        return;
      }

      showCountPrompt(matchedItem);
    }, 350);
  };

  const completeStockTake = async () => {
    if (completing) {
      return;
    }

    const checkedItems = rows.filter(
      (item) => item.checked,
    );

    if (checkedItems.length === 0) {
      Alert.alert(
        "Nothing Checked",
        "Check at least one stock item before completing the stock take.",
      );

      return;
    }

    const changedItems =
      checkedItems.filter(
        (item) =>
          item.difference !== 0,
      );

    if (changedItems.length === 0) {
      Alert.alert(
        "No Adjustments",
        "All checked quantities match the current stock levels.",
      );

      return;
    }

    Alert.alert(
      "Complete Stock Take",
      `${changedItems.length} item${
        changedItems.length === 1
          ? ""
          : "s"
      } will be adjusted to the counted quantities. Continue?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          style: "destructive",
          onPress: async () => {
            try {
              setCompleting(true);

              for (const item of changedItems) {
                const countedQuantity =
                  parseCountedQuantity(
                    item.countedQuantity,
                  );

                await updateStockItem(
                  item.id,
                  {
                    quantity:
                      countedQuantity,
                    category:
                      item.category,
                    barcode:
                      item.barcode || "",
                    unit:
                      item.unit || "pcs",
                    costPrice:
                      item.costPrice,
                    lowStockAlert:
                      item.lowStockAlert,
                    idealStockLevel:
                      item.idealStockLevel,
                    supplierId:
                      item.supplierId ||
                      undefined,
                    supplierName:
                      item.supplierName ||
                      "",
                  },
                );
              }

              Alert.alert(
                "Success",
                "Stock take completed and stock quantities were updated.",
              );

              router.replace(
                "/(tabs)/stockList",
              );
            } catch (error) {
              console.error(
                "Stock take completion failed:",
                error,
              );

              Alert.alert(
                "Error",
                getErrorMessage(
                  error,
                  "Could not complete the stock take.",
                ),
              );
            } finally {
              setCompleting(false);
            }
          },
        },
      ],
    );
  };

  const shareReport = async () => {
    const discrepancies = rows.filter(
      (item) =>
        item.checked &&
        item.difference !== 0,
    );

    if (
      discrepancies.length === 0
    ) {
      Alert.alert(
        "No Differences",
        "There are no checked stock differences to share.",
      );

      return;
    }

    try {
      const message = [
        "StockTally Stock Take Report",
        "",
        ...discrepancies.map(
          (item, index) => {
            const unit =
              item.unit?.trim() ||
              "pcs";

            const differencePrefix =
              item.difference > 0
                ? "+"
                : "";

            return [
              `${index + 1}. ${
                item.name
              }`,
              `Expected: ${item.quantity} ${unit}`,
              `Counted: ${item.countedQuantity} ${unit}`,
              `Difference: ${differencePrefix}${item.difference} ${unit}`,
            ].join(" | ");
          },
        ),
      ].join("\n");

      await Share.share({
        message,
      });
    } catch (error) {
      console.error(
        "Failed to share stock take report:",
        error,
      );

      Alert.alert(
        "Share Failed",
        "The stock take report could not be shared.",
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStock();
  };

  const renderItem = ({
    item,
  }: {
    item: StockTakeRow;
  }) => {
    const unit =
      item.unit?.trim() || "pcs";

    const hasDifference =
      item.checked &&
      item.difference !== 0;

    return (
      <View
        style={[
          styles.card,
          hasDifference &&
            styles.diffCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={
              styles.cardTitleArea
            }
          >
            <Text
              style={styles.itemName}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            {item.category ? (
              <Text
                style={styles.category}
                numberOfLines={1}
              >
                {item.category}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.statusBadge,
              item.checked
                ? styles.checkedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text
              style={styles.statusText}
            >
              {item.checked
                ? "CHECKED"
                : "PENDING"}
            </Text>
          </View>
        </View>

        <View style={styles.expectedRow}>
          <Text style={styles.expectedText}>
            Expected:{" "}
            <Text style={styles.bold}>
              {item.quantity} {unit}
            </Text>
          </Text>

          {item.barcode ? (
            <Text
              style={styles.barcodeText}
            >
              Barcode: {item.barcode}
            </Text>
          ) : null}
        </View>

        <Text style={styles.label}>
          Counted Quantity
        </Text>

        <TextInput
          value={item.countedQuantity}
          onChangeText={(text) =>
            updateCountedQuantity(
              item.id,
              text,
            )
          }
          keyboardType="decimal-pad"
          returnKeyType="done"
          style={styles.input}
          placeholder="Actual count"
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.resultRow}>
          <Text style={styles.diffLabel}>
            Difference
          </Text>

          <Text
            style={[
              styles.diffValue,
              item.difference < 0 &&
                styles.negative,
              item.difference > 0 &&
                styles.positive,
            ]}
          >
            {item.difference > 0
              ? "+"
              : ""}
            {item.difference} {unit}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.markButton,
            item.checked &&
              styles.markButtonChecked,
          ]}
          onPress={() =>
            markAsChecked(item.id)
          }
        >
          <Text
            style={
              styles.markButtonText
            }
          >
            {item.checked
              ? "Checked"
              : "Mark Checked"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
          />

          <Text
            style={styles.loadingText}
          >
            Loading stock take...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Stock Take
            </Text>

            <Text style={styles.subtitle}>
              {stats.checked}/
              {stats.total} checked •{" "}
              {stats.discrepancies}{" "}
              differences
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={openScanner}
            >
              <Text
                style={styles.actionText}
              >
                📷 Scan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                void shareReport();
              }}
            >
              <Text
                style={styles.actionText}
              >
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.completeButton,
                completing &&
                  styles.disabledButton,
              ]}
              disabled={completing}
              onPress={() => {
                void completeStockTake();
              }}
            >
              {completing ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                <Text
                  style={
                    styles.actionText
                  }
                >
                  Complete
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {rows.length === 0 ? (
            <View
              style={
                styles.emptyContainer
              }
            >
              <Text
                style={styles.emptyIcon}
              >
                📦
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                No stock items found
              </Text>

              <Text
                style={styles.emptyText}
              >
                Add stock items before
                starting a stock take.
              </Text>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={() =>
                  router.push(
                    "/screens/stock/add",
                  )
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Add Stock Item
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) =>
                item.id
              }
              renderItem={renderItem}
              contentContainerStyle={
                styles.listContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
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
          visible={scannerVisible}
          animationType="slide"
          onRequestClose={() => {
            setScannerVisible(false);
            setScanned(false);
          }}
        >
          <View
            style={
              styles.scannerContainer
            }
          >
            <CameraView
              style={
                StyleSheet.absoluteFillObject
              }
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "code39",
                  "qr",
                ],
              }}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : ({ data }) =>
                      handleBarcodeScanned(
                        data,
                      )
              }
            />

            <View
              style={
                styles.scannerOverlay
              }
            >
              <Text
                style={
                  styles.scannerTitle
                }
              >
                Scan item barcode
              </Text>

              <View
                style={styles.scanBox}
              />

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={() => {
                  setScannerVisible(
                    false,
                  );
                  setScanned(false);
                }}
              >
                <Text
                  style={
                    styles.closeButtonText
                  }
                >
                  Close Scanner
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={
            countPromptVisible
          }
          transparent
          animationType="fade"
          onRequestClose={
            closeCountPrompt
          }
        >
          <KeyboardAvoidingView
            style={
              styles.promptOverlay
            }
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <View
              style={styles.promptCard}
            >
              <Text
                style={
                  styles.promptTitle
                }
              >
                Stock Count
              </Text>

              <Text
                style={
                  styles.promptItemName
                }
              >
                {promptItem?.name}
              </Text>

              <Text
                style={
                  styles.promptMessage
                }
              >
                Expected:{" "}
                {promptItem?.quantity ??
                  0}{" "}
                {promptItem?.unit?.trim() ||
                  "pcs"}
              </Text>

              <Text
                style={
                  styles.promptLabel
                }
              >
                Counted quantity
              </Text>

              <TextInput
                value={promptQuantity}
                onChangeText={(value) =>
                  setPromptQuantity(
                    cleanQuantityInput(
                      value,
                    ),
                  )
                }
                keyboardType="decimal-pad"
                returnKeyType="done"
                autoFocus
                selectTextOnFocus
                placeholder="Enter quantity"
                placeholderTextColor="#9ca3af"
                style={
                  styles.promptInput
                }
              />

              <View
                style={
                  styles.promptButtonRow
                }
              >
                <TouchableOpacity
                  style={
                    styles.promptCancelButton
                  }
                  onPress={
                    closeCountPrompt
                  }
                >
                  <Text
                    style={
                      styles.promptCancelText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.promptSaveButton
                  }
                  onPress={
                    savePromptCount
                  }
                >
                  <Text
                    style={
                      styles.promptSaveText
                    }
                  >
                    Save Count
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 18,
  },

  header: {
    marginBottom: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    color: "#6b7280",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  scanButton: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  shareButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  completeButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.65,
  },

  actionText: {
    color: "#ffffff",
    fontWeight: "800",
  },

  listContent: {
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  diffCard: {
    borderColor: "#fbbf24",
    backgroundColor: "#fffbeb",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitleArea: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  category: {
    color: "#6b7280",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  checkedBadge: {
    backgroundColor: "#16a34a",
  },

  pendingBadge: {
    backgroundColor: "#9ca3af",
  },

  statusText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },

  expectedRow: {
    marginBottom: 10,
  },

  expectedText: {
    color: "#374151",
    fontSize: 15,
  },

  bold: {
    fontWeight: "900",
  },

  barcodeText: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
  },

  label: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    color: "#111827",
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  diffLabel: {
    fontWeight: "800",
    color: "#374151",
  },

  diffValue: {
    fontWeight: "900",
    color: "#111827",
  },

  negative: {
    color: "#dc2626",
  },

  positive: {
    color: "#16a34a",
  },

  markButton: {
    backgroundColor: "#111827",
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },

  markButtonChecked: {
    backgroundColor: "#16a34a",
  },

  markButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
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
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  scannerOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  scannerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 24,
  },

  scanBox: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: "#00e5ff",
    borderRadius: 18,
  },

  closeButton: {
    marginTop: 40,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  closeButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
  },

  promptOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  promptCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
  },

  promptTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
  },

  promptItemName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },

  promptMessage: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 5,
  },

  promptLabel: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 7,
  },

  promptInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 11,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 17,
    backgroundColor: "#ffffff",
  },

  promptButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  promptCancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },

  promptSaveButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },

  promptCancelText: {
    color: "#111827",
    fontWeight: "900",
  },

  promptSaveText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});

export default StockTakeScreen;