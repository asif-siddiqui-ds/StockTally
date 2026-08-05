// import React, { useCallback, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   RefreshControl,
//   Platform,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import { useFocusEffect, useRouter } from "expo-router";
// import {
//   getStockMovements,
//   StockMovement,
//   StockMovementType,
// } from "@/lib/storage";
// import ScreenWrapper from "@/components/ScreenWrapper";

// let DateTimePickerModal: any = null;

// if (Platform.OS !== "web") {
//   try {
//     DateTimePickerModal =
//       require("react-native-modal-datetime-picker").default;
//   } catch {
//     console.warn("DateTimePickerModal not available");
//   }
// }

// type DateRangeFilter = "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

// export default function StockActivityLogScreen() {
//   const router = useRouter();

//   const [movements, setMovements] = useState<StockMovement[]>([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const [selectedProduct, setSelectedProduct] = useState("ALL");
//   const [selectedSource, setSelectedSource] = useState("ALL");
//   const [typeFilter, setTypeFilter] = useState<"ALL" | StockMovementType>("ALL");

//   const [dateRange, setDateRange] = useState<DateRangeFilter>("ALL");
//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   const loadMovements = async () => {
//     const data = await getStockMovements();

//     const sorted = [...data].sort(
//       (a, b) =>
//         new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
//     );

//     setMovements(sorted);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadMovements();
//     }, [])
//   );

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadMovements();
//     setRefreshing(false);
//   };

//   const startOfDay = (d: Date) =>
//     new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

//   const endOfDay = (d: Date) =>
//     new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

//   const weekRange = (ref: Date) => {
//     const weekStartsOn = 1;
//     const d = new Date(ref);
//     const diff = (d.getDay() - weekStartsOn + 7) % 7;

//     const from = startOfDay(
//       new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
//     );

//     const to = endOfDay(
//       new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6)
//     );

//     return { from, to };
//   };

//   const monthRange = (ref: Date) => {
//     const from = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);

//     const to = new Date(
//       ref.getFullYear(),
//       ref.getMonth() + 1,
//       0,
//       23,
//       59,
//       59,
//       999
//     );

//     return { from, to };
//   };

//   const getDateRange = () => {
//     const today = new Date();

//     if (dateRange === "DAILY") {
//       return { from: startOfDay(today), to: endOfDay(today) };
//     }

//     if (dateRange === "WEEKLY") {
//       return weekRange(today);
//     }

//     if (dateRange === "MONTHLY") {
//       return monthRange(today);
//     }

//     if (dateRange === "CUSTOM") {
//       return {
//         from: startOfDay(startDate),
//         to: endOfDay(endDate),
//       };
//     }

//     return { from: null, to: null };
//   };

//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     }).format(date);
//   };

//   const productOptions = useMemo(() => {
//     const uniqueProducts = Array.from(
//       new Set(movements.map((m) => m.itemName).filter(Boolean))
//     ).sort();

//     return [
//       { label: "All Products", value: "ALL" },
//       ...uniqueProducts.map((name) => ({
//         label: name,
//         value: name,
//       })),
//     ];
//   }, [movements]);

//   const sourceOptions = useMemo(() => {
//     const uniqueSources = Array.from(
//       new Set(movements.map((m) => m.sourceLabel).filter(Boolean))
//     ).sort();

//     return [
//       { label: "All Sources", value: "ALL" },
//       ...uniqueSources.map((source) => ({
//         label: source,
//         value: source,
//       })),
//     ];
//   }, [movements]);

//   const filteredMovements = useMemo(() => {
//     const { from, to } = getDateRange();

//     return movements.filter((m) => {
//       const movementDate = new Date(m.dateTime);

//       const matchesProduct =
//         selectedProduct === "ALL" || m.itemName === selectedProduct;

//       const matchesSource =
//         selectedSource === "ALL" || m.sourceLabel === selectedSource;

//       const matchesType = typeFilter === "ALL" || m.type === typeFilter;

//       const matchesDate =
//         !from || !to
//           ? true
//           : movementDate.getTime() >= from.getTime() &&
//             movementDate.getTime() <= to.getTime();

//       return matchesProduct && matchesSource && matchesType && matchesDate;
//     });
//   }, [
//     movements,
//     selectedProduct,
//     selectedSource,
//     typeFilter,
//     dateRange,
//     startDate,
//     endDate,
//   ]);

//   const totals = useMemo(() => {
//     const totalIn = filteredMovements
//       .filter((m) => m.type === "IN")
//       .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

//     const totalOut = filteredMovements
//       .filter((m) => m.type === "OUT")
//       .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

//     const noChange = filteredMovements
//       .filter((m) => m.type === "NO_CHANGE")
//       .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

//     return {
//       totalIn,
//       totalOut,
//       noChange,
//       netMovement: totalIn - totalOut,
//     };
//   }, [filteredMovements]);

//   const clearFilters = () => {
//     setSelectedProduct("ALL");
//     setSelectedSource("ALL");
//     setTypeFilter("ALL");
//     setDateRange("ALL");
//     setStartDate(new Date());
//     setEndDate(new Date());
//   };

//   return (
//     <ScreenWrapper scroll backgroundColor="#f4f6f9">
//       <View style={styles.container}>
//         <Text style={styles.title}>Stock Activity Log</Text>

//         <View style={styles.filterBox}>
//           <Text style={styles.filterLabel}>Product</Text>
//           <Dropdown
//             style={styles.dropdown}
//             data={productOptions}
//             labelField="label"
//             valueField="value"
//             placeholder="Select product"
//             search
//             searchPlaceholder="Search product..."
//             value={selectedProduct}
//             onChange={(item) => setSelectedProduct(item.value)}
//           />

//           {/* <Text style={styles.filterLabel}>Source</Text>
//           <Dropdown
//             style={styles.dropdown}
//             data={sourceOptions}
//             labelField="label"
//             valueField="value"
//             placeholder="Select source"
//             search
//             searchPlaceholder="Search source..."
//             value={selectedSource}
//             onChange={(item) => setSelectedSource(item.value)}
//           /> */}

//           <Text style={styles.filterLabel}>Movement Type</Text>
//           <View style={styles.typeRow}>
//             {["ALL", "IN", "OUT", "NO_CHANGE"].map((type) => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   styles.typeButton,
//                   typeFilter === type && styles.activeTypeButton,
//                 ]}
//                 onPress={() => setTypeFilter(type as "ALL" | StockMovementType)}
//               >
//                 <Text
//                   style={[
//                     styles.typeText,
//                     typeFilter === type && styles.activeTypeText,
//                   ]}
//                 >
//                   {type === "NO_CHANGE" ? "NO CHANGE" : type}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={styles.filterLabel}>Date Range</Text>
//           <View style={styles.typeRow}>
//             {["ALL", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"].map((range) => (
//               <TouchableOpacity
//                 key={range}
//                 style={[
//                   styles.typeButton,
//                   dateRange === range && styles.activeTypeButton,
//                 ]}
//                 onPress={() => setDateRange(range as DateRangeFilter)}
//               >
//                 <Text
//                   style={[
//                     styles.typeText,
//                     dateRange === range && styles.activeTypeText,
//                   ]}
//                 >
//                   {range}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {dateRange === "CUSTOM" && DateTimePickerModal && (
//             <View style={styles.dateRangeRow}>
//               <TouchableOpacity
//                 style={styles.dateColumn}
//                 onPress={() => setShowStartPicker(true)}
//               >
//                 <Text style={styles.dateBtn}>Start</Text>
//                 <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dateColumn}
//                 onPress={() => setShowEndPicker(true)}
//               >
//                 <Text style={styles.dateBtn}>End</Text>
//                 <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
//               </TouchableOpacity>

//               <DateTimePickerModal
//                 isVisible={showStartPicker}
//                 mode="date"
//                 onConfirm={(date: Date) => {
//                   setShowStartPicker(false);
//                   setStartDate(date);
//                 }}
//                 onCancel={() => setShowStartPicker(false)}
//               />

//               <DateTimePickerModal
//                 isVisible={showEndPicker}
//                 mode="date"
//                 onConfirm={(date: Date) => {
//                   setShowEndPicker(false);
//                   setEndDate(date);
//                 }}
//                 onCancel={() => setShowEndPicker(false)}
//               />
//             </View>
//           )}

//           <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
//             <Text style={styles.clearButtonText}>Clear Filters</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.summaryRow}>
//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryLabel}>Total IN</Text>
//             <Text style={styles.inValue}>{totals.totalIn}</Text>
//           </View>

//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryLabel}>Total OUT</Text>
//             <Text style={styles.outValue}>{totals.totalOut}</Text>
//           </View>

//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryLabel}>Net</Text>
//             <Text style={styles.summaryValue}>{totals.netMovement}</Text>
//           </View>

//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryLabel}>No Change</Text>
//             <Text style={styles.noChangeValue}>{totals.noChange}</Text>
//           </View>
//         </View>

//         <ScrollView horizontal showsHorizontalScrollIndicator>
//           <View>
//             <View style={styles.headerRow}>
//               <Text style={[styles.headerCell, styles.dateCell]}>Date/Time</Text>
//               <Text style={[styles.headerCell, styles.itemCell]}>Item</Text>
//               <Text style={[styles.headerCell, styles.typeCell]}>IN/OUT</Text>
//               <Text style={[styles.headerCell, styles.qtyCell]}>Qty</Text>
//               <Text style={[styles.headerCell, styles.sourceCell]}>Source</Text>
//               <Text style={[styles.headerCell, styles.balanceCell]}>
//                 Balance
//               </Text>
//             </View>

//             <ScrollView
//               refreshControl={
//                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//               }
//             >
//               {filteredMovements.map((m) => (
//                 <View key={m.id} style={styles.row}>
//                   <Text style={[styles.cell, styles.dateCell]}>
//                     {new Date(m.dateTime).toLocaleString("en-GB")}
//                   </Text>

//                   <Text style={[styles.cell, styles.itemCell]} numberOfLines={2}>
//                     {m.itemName}
//                   </Text>

//                   <Text
//                     style={[
//                       styles.cell,
//                       styles.typeCell,
//                       m.type === "IN"
//                         ? styles.inText
//                         : m.type === "OUT"
//                         ? styles.outText
//                         : styles.noChangeText,
//                     ]}
//                   >
//                     {m.type === "NO_CHANGE" ? "NO CHANGE" : m.type}
//                   </Text>

//                   <Text style={[styles.cell, styles.qtyCell]}>{m.quantity}</Text>

//                   <Text style={[styles.cell, styles.sourceCell]} numberOfLines={2}>
//                     {m.sourceLabel}
//                   </Text>

//                   <Text style={[styles.cell, styles.balanceCell]}>
//                     {m.balanceAfter}
//                   </Text>
//                 </View>
//               ))}

//               {filteredMovements.length === 0 && (
//                 <Text style={styles.emptyText}>No stock movement found.</Text>
//               )}
//             </ScrollView>
//           </View>
//         </ScrollView>

//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Text style={styles.backText}>Back</Text>
//         </TouchableOpacity>
//       </View>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 14,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1b263b",
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   filterBox: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 14,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   filterLabel: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: "#1b263b",
//     marginBottom: 6,
//     marginTop: 6,
//   },
//   dropdown: {
//     height: 48,
//     backgroundColor: "#f1f3f5",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     marginBottom: 8,
//   },
//   typeRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginTop: 4,
//   },
//   typeButton: {
//     backgroundColor: "#e9ecef",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   activeTypeButton: {
//     backgroundColor: "#1b263b",
//   },
//   typeText: {
//     color: "#333",
//     fontWeight: "600",
//     fontSize: 12,
//   },
//   activeTypeText: {
//     color: "#fff",
//   },
//   dateRangeRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 10,
//     marginBottom: 4,
//   },
//   dateColumn: {
//     flex: 1,
//     backgroundColor: "#f1f3f5",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   dateBtn: {
//     color: "#2563eb",
//     fontWeight: "800",
//   },
//   dateValue: {
//     color: "#111827",
//     marginTop: 4,
//     fontWeight: "600",
//   },
//   clearButton: {
//     marginTop: 10,
//     backgroundColor: "#dfe6e9",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   clearButtonText: {
//     fontWeight: "700",
//     color: "#1b263b",
//   },
//   summaryRow: {
//     flexDirection: "row",
//     gap: 8,
//     marginBottom: 12,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 10,
//     alignItems: "center",
//     elevation: 2,
//   },
//   summaryLabel: {
//     fontSize: 11,
//     color: "#555",
//     textAlign: "center",
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1b263b",
//   },
//   inValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#2e7d32",
//   },
//   outValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#c62828",
//   },
//   noChangeValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#f57c00",
//   },
//   headerRow: {
//     flexDirection: "row",
//     backgroundColor: "#1b263b",
//     paddingVertical: 10,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   row: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e5e5",
//   },
//   headerCell: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 13,
//     paddingHorizontal: 8,
//   },
//   cell: {
//     color: "#222",
//     fontSize: 13,
//     paddingHorizontal: 8,
//   },
//   dateCell: {
//     width: 165,
//   },
//   itemCell: {
//     width: 145,
//     fontWeight: "600",
//   },
//   typeCell: {
//     width: 105,
//   },
//   qtyCell: {
//     width: 70,
//   },
//   sourceCell: {
//     width: 240,
//   },
//   balanceCell: {
//     width: 95,
//   },
//   inText: {
//     color: "#2e7d32",
//     fontWeight: "bold",
//   },
//   outText: {
//     color: "#c62828",
//     fontWeight: "bold",
//   },
//   noChangeText: {
//     color: "#f57c00",
//     fontWeight: "bold",
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 30,
//     color: "#666",
//     fontSize: 15,
//   },
//   backButton: {
//     backgroundColor: "#1b263b",
//     padding: 14,
//     borderRadius: 12,
//     marginTop: 12,
//     alignItems: "center",
//   },
//   backText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockMovements,
  StockMovement,
  StockMovementType,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

let DateTimePickerModal: any = null;

if (Platform.OS !== "web") {
  try {
    DateTimePickerModal =
      require("react-native-modal-datetime-picker").default;
  } catch {
    console.warn("DateTimePickerModal not available");
  }
}

type DateRangeFilter =
  | "ALL"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "CUSTOM";

const FIXED_TABLE_WIDTH = 270;
const SCROLLABLE_TABLE_WIDTH = 510;
const ROW_HEIGHT = 68;

export default function StockActivityLogScreen() {
  const router = useRouter();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [typeFilter, setTypeFilter] =
    useState<"ALL" | StockMovementType>("ALL");

  const [dateRange, setDateRange] =
    useState<DateRangeFilter>("ALL");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [hasScrolledHorizontally, setHasScrolledHorizontally] =
    useState(false);

  const leftScrollRef = useRef<ScrollView>(null);
  const rightScrollRef = useRef<ScrollView>(null);
  const syncingScroll = useRef(false);

  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: -10,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    if (!hasScrolledHorizontally) {
      animation.start();
    }

    return () => animation.stop();
  }, [arrowAnim, hasScrolledHorizontally]);

  const loadMovements = useCallback(async () => {
    try {
      const data = await getStockMovements();

      const sorted = [...(data || [])].sort(
        (a, b) =>
          new Date(b.dateTime).getTime() -
          new Date(a.dateTime).getTime()
      );

      setMovements(sorted);
    } catch (error) {
      console.error("Failed to load stock movements:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMovements();
    }, [loadMovements])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadMovements();
    } finally {
      setRefreshing(false);
    }
  };

  const startOfDay = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    );

  const endOfDay = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );

  const weekRange = (referenceDate: Date) => {
    const weekStartsOn = 1;
    const date = new Date(referenceDate);
    const difference =
      (date.getDay() - weekStartsOn + 7) % 7;

    const from = startOfDay(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - difference
      )
    );

    const to = endOfDay(
      new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate() + 6
      )
    );

    return { from, to };
  };

  const monthRange = (referenceDate: Date) => {
    const from = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    const to = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return { from, to };
  };

  const getDateRange = () => {
    const today = new Date();

    if (dateRange === "DAILY") {
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
    }

    if (dateRange === "WEEKLY") {
      return weekRange(today);
    }

    if (dateRange === "MONTHLY") {
      return monthRange(today);
    }

    if (dateRange === "CUSTOM") {
      return {
        from: startOfDay(startDate),
        to: endOfDay(endDate),
      };
    }

    return { from: null, to: null };
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);

  const formatMovementDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return {
        date: "Invalid date",
        time: "",
      };
    }

    return {
      date: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date),
    };
  };

  const productOptions = useMemo(() => {
    const uniqueProducts = Array.from(
      new Set(
        movements.map((movement) => movement.itemName).filter(Boolean)
      )
    ).sort();

    return [
      { label: "All Products", value: "ALL" },
      ...uniqueProducts.map((name) => ({
        label: name,
        value: name,
      })),
    ];
  }, [movements]);

  const filteredMovements = useMemo(() => {
    const { from, to } = getDateRange();

    return movements.filter((movement) => {
      const movementDate = new Date(movement.dateTime);

      const matchesProduct =
        selectedProduct === "ALL" ||
        movement.itemName === selectedProduct;

      const matchesType =
        typeFilter === "ALL" || movement.type === typeFilter;

      const matchesDate =
        !from || !to
          ? true
          : movementDate.getTime() >= from.getTime() &&
            movementDate.getTime() <= to.getTime();

      return matchesProduct && matchesType && matchesDate;
    });
  }, [
    movements,
    selectedProduct,
    typeFilter,
    dateRange,
    startDate,
    endDate,
  ]);

  const totals = useMemo(() => {
    const totalIn = filteredMovements
      .filter((movement) => movement.type === "IN")
      .reduce(
        (sum, movement) =>
          sum + Number(movement.quantity || 0),
        0
      );

    const totalOut = filteredMovements
      .filter((movement) => movement.type === "OUT")
      .reduce(
        (sum, movement) =>
          sum + Number(movement.quantity || 0),
        0
      );

    const noChange = filteredMovements
      .filter((movement) => movement.type === "NO_CHANGE")
      .reduce(
        (sum, movement) =>
          sum + Number(movement.quantity || 0),
        0
      );

    return {
      totalIn,
      totalOut,
      noChange,
      netMovement: totalIn - totalOut,
    };
  }, [filteredMovements]);

  const clearFilters = () => {
    setSelectedProduct("ALL");
    setTypeFilter("ALL");
    setDateRange("ALL");
    setStartDate(new Date());
    setEndDate(new Date());
  };

  const syncVerticalScroll = (
    source: "left" | "right",
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (syncingScroll.current) return;

    syncingScroll.current = true;
    const y = event.nativeEvent.contentOffset.y;

    if (source === "left") {
      rightScrollRef.current?.scrollTo({
        y,
        animated: false,
      });
    } else {
      leftScrollRef.current?.scrollTo({
        y,
        animated: false,
      });
    }

    requestAnimationFrame(() => {
      syncingScroll.current = false;
    });
  };

  const movementTypeTextStyle = (type: StockMovementType) => {
    if (type === "IN") return styles.inText;
    if (type === "OUT") return styles.outText;
    return styles.noChangeText;
  };

  const movementTypeLabel = (type: StockMovementType) =>
    type === "NO_CHANGE" ? "NO CHANGE" : type;

  return (
    <ScreenWrapper scroll backgroundColor="#f4f6f9">
      <View style={styles.container}>
        <Text style={styles.title}>Stock Activity Log</Text>

        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>Product</Text>

          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={productOptions}
            labelField="label"
            valueField="value"
            placeholder="Select product"
            search
            searchPlaceholder="Search product..."
            value={selectedProduct}
            onChange={(item) =>
              setSelectedProduct(item.value)
            }
          />

          <Text style={styles.filterLabel}>
            Movement Type
          </Text>

          <View style={styles.typeRow}>
            {["ALL", "IN", "OUT", "NO_CHANGE"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    typeFilter === type &&
                      styles.activeTypeButton,
                  ]}
                  onPress={() =>
                    setTypeFilter(
                      type as "ALL" | StockMovementType
                    )
                  }
                >
                  <Text
                    style={[
                      styles.typeText,
                      typeFilter === type &&
                        styles.activeTypeText,
                    ]}
                  >
                    {type === "NO_CHANGE"
                      ? "NO CHANGE"
                      : type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text style={styles.filterLabel}>Date Range</Text>

          <View style={styles.typeRow}>
            {[
              "ALL",
              "DAILY",
              "WEEKLY",
              "MONTHLY",
              "CUSTOM",
            ].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.typeButton,
                  dateRange === range &&
                    styles.activeTypeButton,
                ]}
                onPress={() =>
                  setDateRange(range as DateRangeFilter)
                }
              >
                <Text
                  style={[
                    styles.typeText,
                    dateRange === range &&
                      styles.activeTypeText,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {dateRange === "CUSTOM" &&
            DateTimePickerModal && (
              <View style={styles.dateRangeRow}>
                <TouchableOpacity
                  style={styles.dateColumn}
                  onPress={() =>
                    setShowStartPicker(true)
                  }
                >
                  <Text style={styles.dateBtn}>Start</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(startDate)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateColumn}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.dateBtn}>End</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(endDate)}
                  </Text>
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showStartPicker}
                  mode="date"
                  onConfirm={(date: Date) => {
                    setShowStartPicker(false);
                    setStartDate(date);
                  }}
                  onCancel={() =>
                    setShowStartPicker(false)
                  }
                />

                <DateTimePickerModal
                  isVisible={showEndPicker}
                  mode="date"
                  onConfirm={(date: Date) => {
                    setShowEndPicker(false);
                    setEndDate(date);
                  }}
                  onCancel={() =>
                    setShowEndPicker(false)
                  }
                />
              </View>
            )}

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearButtonText}>
              Clear Filters
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total IN</Text>
            <Text style={styles.inValue}>
              {totals.totalIn}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total OUT</Text>
            <Text style={styles.outValue}>
              {totals.totalOut}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={styles.summaryValue}>
              {totals.netMovement}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              No Change
            </Text>
            <Text style={styles.noChangeValue}>
              {totals.noChange}
            </Text>
          </View>
        </View>

        <View style={styles.swipeHintRow}>
          <Text style={styles.swipeHintText}>
            Date and item stay fixed
          </Text>

          <View style={styles.swipeHintAction}>
            <Text style={styles.swipeHintText}>
              Swipe left to view more
            </Text>

            <Animated.Text
              style={[
                styles.swipeHintArrow,
                {
                  transform: [
                    {
                      translateX: arrowAnim,
                    },
                  ],
                  opacity: hasScrolledHorizontally ? 0 : 1,
                },
              ]}
            >
              ⇠
            </Animated.Text>
          </View>
        </View>

        <View style={styles.tableShell}>
          <View
            style={[
              styles.fixedTable,
              { width: FIXED_TABLE_WIDTH },
            ]}
          >
            <View style={styles.fixedHeaderRow}>
              <Text
                style={[
                  styles.headerCell,
                  styles.dateCell,
                ]}
              >
                Date / Time
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.itemCell,
                ]}
              >
                Item
              </Text>
            </View>

            <ScrollView
              ref={leftScrollRef}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(event) =>
                syncVerticalScroll("left", event)
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            >
              {filteredMovements.map((movement) => (
                <View
                  key={`fixed-${movement.id}`}
                  style={styles.row}
                >
                  <View
                    style={[
                      styles.cell,
                      styles.dateCell,
                      styles.dateTimeCell,
                    ]}
                  >
                    <Text
                      style={styles.dateLine}
                      numberOfLines={1}
                    >
                      {formatMovementDate(
                        movement.dateTime
                      ).date}
                    </Text>

                    <Text
                      style={styles.timeLine}
                      numberOfLines={1}
                    >
                      {formatMovementDate(
                        movement.dateTime
                      ).time}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.cell,
                      styles.itemCell,
                    ]}
                    numberOfLines={2}
                  >
                    {movement.itemName}
                  </Text>
                </View>
              ))}

              {filteredMovements.length === 0 && (
                <View style={styles.emptyFixedRow}>
                  <Text style={styles.emptyText}>
                    No stock movement found.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.scrollableTableWrapper}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator
              scrollEventThrottle={16}
              onScroll={(event) => {
                if (
                  event.nativeEvent.contentOffset.x > 8 &&
                  !hasScrolledHorizontally
                ) {
                  setHasScrolledHorizontally(true);
                }
              }}
            >
              <View
                style={{
                  width: SCROLLABLE_TABLE_WIDTH,
                }}
              >
                <View style={styles.scrollHeaderRow}>
                  <Text
                    style={[
                      styles.headerCell,
                      styles.typeCell,
                    ]}
                  >
                    IN/OUT
                  </Text>

                  <Text
                    style={[
                      styles.headerCell,
                      styles.qtyCell,
                    ]}
                  >
                    Qty
                  </Text>

                  <Text
                    style={[
                      styles.headerCell,
                      styles.sourceCell,
                    ]}
                  >
                    Source
                  </Text>

                  <Text
                    style={[
                      styles.headerCell,
                      styles.balanceCell,
                    ]}
                  >
                    Balance
                  </Text>
                </View>

                <ScrollView
                  ref={rightScrollRef}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScroll={(event) =>
                    syncVerticalScroll("right", event)
                  }
                >
                  {filteredMovements.map((movement) => (
                    <View
                      key={`scroll-${movement.id}`}
                      style={styles.row}
                    >
                      <Text
                        style={[
                          styles.cell,
                          styles.typeCell,
                          movementTypeTextStyle(
                            movement.type
                          ),
                        ]}
                      >
                        {movementTypeLabel(
                          movement.type
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.cell,
                          styles.qtyCell,
                        ]}
                      >
                        {movement.quantity}
                      </Text>

                      <Text
                        style={[
                          styles.cell,
                          styles.sourceCell,
                        ]}
                        numberOfLines={2}
                      >
                        {movement.sourceLabel}
                      </Text>

                      <Text
                        style={[
                          styles.cell,
                          styles.balanceCell,
                        ]}
                      >
                        {movement.balanceAfter}
                      </Text>
                    </View>
                  ))}

                  {filteredMovements.length === 0 && (
                    <View style={styles.emptyScrollableRow} />
                  )}
                </ScrollView>
              </View>
            </ScrollView>

            {!hasScrolledHorizontally && (
              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(244,246,249,0)",
                  "rgba(244,246,249,0.96)",
                ]}
                style={styles.edgeFade}
              >
                <Animated.Text
                  style={[
                    styles.edgeArrow,
                    {
                      transform: [
                        {
                          translateX: arrowAnim,
                        },
                      ],
                    },
                  ]}
                >
                  ⇠
                </Animated.Text>
              </LinearGradient>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1b263b",
    textAlign: "center",
    marginBottom: 12,
  },

  filterBox: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1b263b",
    marginBottom: 6,
    marginTop: 6,
  },

  dropdown: {
    height: 48,
    backgroundColor: "#f1f3f5",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  dropdownContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },

  dropdownPlaceholder: {
    color: "#6b7280",
    fontSize: 14,
  },

  dropdownSelectedText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },

  dropdownItemText: {
    color: "#111827",
    fontSize: 14,
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },

  typeButton: {
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  activeTypeButton: {
    backgroundColor: "#1b263b",
  },

  typeText: {
    color: "#333333",
    fontWeight: "600",
    fontSize: 12,
  },

  activeTypeText: {
    color: "#ffffff",
  },

  dateRangeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },

  dateColumn: {
    flex: 1,
    backgroundColor: "#f1f3f5",
    borderWidth: 1,
    borderColor: "#dddddd",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  dateBtn: {
    color: "#2563eb",
    fontWeight: "800",
  },

  dateValue: {
    color: "#111827",
    marginTop: 4,
    fontWeight: "600",
  },

  clearButton: {
    marginTop: 10,
    backgroundColor: "#dfe6e9",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  clearButtonText: {
    fontWeight: "700",
    color: "#1b263b",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },

  summaryLabel: {
    fontSize: 11,
    color: "#555555",
    textAlign: "center",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1b263b",
  },

  inValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  outValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c62828",
  },

  noChangeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f57c00",
  },

  swipeHintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
    paddingHorizontal: 3,
  },

  swipeHintAction: {
    flexDirection: "row",
    alignItems: "center",
  },

  swipeHintText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },

  swipeHintArrow: {
    color: "#1b263b",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 8,
  },

  tableShell: {
    flexDirection: "row",
    minHeight: 280,
    maxHeight: 520,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d8dee7",
    elevation: 2,
  },

  fixedTable: {
    backgroundColor: "#ffffff",
    borderRightWidth: 2,
    borderRightColor: "#94a3b8",
    zIndex: 3,
  },

  scrollableTableWrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#ffffff",
  },

  fixedHeaderRow: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "#1b263b",
    alignItems: "center",
  },

  scrollHeaderRow: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "#1b263b",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    minHeight: ROW_HEIGHT,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },

  headerCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
    paddingHorizontal: 8,
  },

  cell: {
    color: "#222222",
    fontSize: 13,
    paddingHorizontal: 8,
  },

  dateCell: {
    width: 125,
  },

  dateTimeCell: {
    justifyContent: "center",
  },

  dateLine: {
    color: "#222222",
    fontSize: 12,
    fontWeight: "700",
  },

  timeLine: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  itemCell: {
    width: 145,
    fontWeight: "600",
  },

  typeCell: {
    width: 105,
  },

  qtyCell: {
    width: 70,
  },

  sourceCell: {
    width: 240,
  },

  balanceCell: {
    width: 95,
  },

  inText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },

  outText: {
    color: "#c62828",
    fontWeight: "bold",
  },

  noChangeText: {
    color: "#f57c00",
    fontWeight: "bold",
  },

  edgeFade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
  },

  edgeArrow: {
    color: "#1b263b",
    fontSize: 24,
    fontWeight: "900",
  },

  emptyFixedRow: {
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  emptyScrollableRow: {
    minHeight: 160,
  },

  emptyText: {
    textAlign: "center",
    color: "#666666",
    fontSize: 14,
  },

  backButton: {
    backgroundColor: "#1b263b",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },

  backText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
