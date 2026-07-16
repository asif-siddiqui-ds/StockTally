// import ScreenWrapper from "@/components/ScreenWrapper";
// import { useFocusEffect } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import React, { useCallback, useState } from "react";
// import {
//   Alert,
//   FlatList,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from "react-native";
// import {
//   deleteStockItem,
//   getReturnItems,
//   getStockItems,
//   StockItem,
// } from "../../lib/storage";

// type StockWithReturns = StockItem & { totalReturned: number };

// export default function StockItemsScreen() {
//   const [items, setItems] = useState<StockWithReturns[]>([]);
//   const [filteredItems, setFilteredItems] = useState<StockWithReturns[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const textColor = colorScheme === "dark" ? "#fff" : "#000";
//   const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
//   const cardColor = colorScheme === "dark" ? "#1e1e1e" : "#fff";
//   const inputBg = colorScheme === "dark" ? "#1c1c1c" : "#fff";

//   // 🔄 Load Stock + Returns
//   useFocusEffect(
//     useCallback(() => {
//       const loadItems = async () => {
//         try {
//           const allStock = await getStockItems();
//           const allReturns = await getReturnItems();

//           const stockWithReturns: StockWithReturns[] = allStock.map((s) => {
//             const totalReturned = allReturns
//               .filter((r) => r.stockItemId === s.id)
//               .reduce((sum, r) => sum + r.quantity, 0);
//             return { ...s, totalReturned };
//           });

//           setItems(stockWithReturns);
//           setFilteredItems(stockWithReturns);
//         } catch (error) {
//           Alert.alert("Error", "Failed to load stock items.");
//         }
//       };
//       loadItems();
//     }, [])
//   );

//   // 🔍 Filter by Name or Category
//   const handleSearch = (text: string) => {
//     setSearchQuery(text);
//     if (!text.trim()) {
//       setFilteredItems(items);
//       return;
//     }

//     const lower = text.toLowerCase();
//     const filtered = items.filter(
//       (item) =>
//         item.name.toLowerCase().includes(lower) ||
//         item.category.toLowerCase().includes(lower)
//     );
//     setFilteredItems(filtered);
//   };

//   // 🧭 Navigate to Edit Screen
//   const handleEdit = (id: string) => {
//     router.push(`/screens/stock/${id}`);
//   };

//   // 🗑️ Delete Item
//   const handleDelete = async (id: string) => {
//     Alert.alert("Delete Stock", "Are you sure you want to delete this item?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           await deleteStockItem(id);
//           const updated = items.filter((i) => i.id !== id);
//           setItems(updated);
//           setFilteredItems(updated);
//         },
//       },
//     ]);
//   };

//   // ✅ Render Each Stock Card
//   const renderItem = ({ item }: { item: StockWithReturns }) => (
//     <TouchableOpacity
//       onPress={() => handleEdit(item.id)}
//       activeOpacity={0.9}
//       style={styles.cardShadow}
//     >
//       <View style={[styles.card, { backgroundColor: cardColor }]}>
//         <View style={styles.cardHeader}>
//           <Text style={[styles.cardTitle, { color: textColor }]}>{item.name}</Text>
//           <TouchableOpacity onPress={() => handleDelete(item.id)}>
//             <Text style={{ color: "#d9534f", fontWeight: "700" }}>✕</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.cardRow}>
//           <Text style={[styles.cardLabel, { color: textColor }]}>📦 Category:</Text>
//           <Text style={[styles.cardValue, { color: textColor }]}>
//             {item.category || "N/A"}
//           </Text>
//         </View>

//         <View style={styles.cardRow}>
//           <Text style={[styles.cardLabel, { color: textColor }]}>📊 Quantity:</Text>
//           <Text style={[styles.cardValue, { color: textColor }]}>{item.quantity} {item.unit || "units"}</Text>
//         </View>

//         <View style={styles.cardRow}>
//           <Text style={[styles.cardLabel, { color: textColor }]}>↩️ Returns:</Text>
//           <Text
//             style={[
//               styles.cardValue,
//               { color: item.totalReturned > 0 ? "#E67E22" : textColor },
//             ]}
//           >
//             {item.totalReturned}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
    
//     <ScreenWrapper>
//      {/* ✅ Main Add Stock Button */}
//       <View style={styles.actionsWrapper}>
//         <TouchableOpacity
//           activeOpacity={0.9}
//           onPress={() => router.push("/screens/stock/add")}
//         >
//           <LinearGradient
//             colors={["#1c4f1f", "#47a04b"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.addStockButton}
//           >
//             <Text style={styles.addStockText}>+ Add Stock</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* ✅ Secondary Stock Tools */}
//       <View style={[styles.stockToolsRow, styles.actionsWrapper]}>
//         {/* LOW STOCK */}
//         <TouchableOpacity
//           activeOpacity={0.9}
//           style={{ flex: 1 }}
//           onPress={() => router.push("/screens/ReorderListScreen")}
//         >
//           <LinearGradient
//             colors={["#2563eb", "#1d4ed8"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.toolGradientButton}
//           >
//             <Text style={styles.toolIcon}>⚠️</Text>
//             <Text style={styles.toolGradientText}>Low Stock</Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         {/* STOCK COUNT */}
//         <TouchableOpacity
//           activeOpacity={0.9}
//           style={{ flex: 1 }}
//           onPress={() => router.push("/screens/StockTakeSessionScreen")}
//         >
//           <LinearGradient
//             colors={["#0f766e", "#14b8a6"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.toolGradientButton}
//           >
//             <Text style={styles.toolIcon}>📦</Text>
//             <Text style={styles.toolGradientText}>Stock Count</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* 🔍 Search Bar */}
//       <View style={[styles.searchContainer]}>
//         <TextInput
//           placeholder="Search by name or category..."
//           placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
//           value={searchQuery}
//           onChangeText={handleSearch}
//           style={[
//             styles.searchInput,
//             { color: textColor, backgroundColor: inputBg },
//           ]}
//         />
//       </View>

//       {/* ✅ Stock List */}
//       <View style={[styles.container]}>
//         <FlatList
//           data={filteredItems}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           ListEmptyComponent={
//             <Text
//               style={{
//                 textAlign: "center",
//                 color: textColor,
//                 marginTop: 30,
//                 fontSize: 16,
//               }}
//             >
//               No matching stock items found.
//             </Text>
//           }
//           contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 15 }}
//         />
//       </View>
//     </ScreenWrapper>
    
//   );
// }

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   headerContainer: {
//     paddingVertical: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "700",
//     textTransform: "uppercase",
//   },
//   container: {
//     flex: 1,
//     paddingTop: 5,
//   },
//   // searchContainer: {
//   //   padding: 10,
//   //   borderBottomWidth: 1,
//   //   borderColor: "#ddd",
//   // },
//   // searchInput: {
//   //   borderRadius: 8,
//   //   padding: 10,
//   //   fontSize: 16,
//   //   borderWidth: 1,
//   //   borderColor: "#ccc",
//   // },
//   cardShadow: {
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 4,
//     marginVertical: 8,
//   },
//   card: {
//     borderRadius: 10,
//     padding: 15,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   cardRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 3,
//   },
//   cardLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     width: 110,
//   },
//   cardValue: {
//     fontSize: 15,
//   },
//   actionsWrapper: {
//     paddingHorizontal: 16,
//     paddingTop: 14,
//     paddingBottom: 10,
//   },

//   addStockButton: {
//     paddingVertical: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 18,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.18,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 8,
//   },

//   addStockText: {
//     color: "#fff",
//     fontSize: 21,
//     fontWeight: "800",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },

//   stockToolsRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 12,
//   },

//   toolButton: {
//     flex: 1,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.22)",
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   toolIcon: {
//     fontSize: 22,
//     marginBottom: 4,
//   },

//   toolText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "800",
//   },
//   searchContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderColor: "rgba(255,255,255,0.18)",
//   },

//   searchInput: {
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//   },
//   toolGradientButton: {
//     paddingVertical: 10,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//   },

//   toolGradientText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "800",
//     marginTop: 4,
//   },
// });

import ScreenWrapper from "@/components/ScreenWrapper";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  deleteStockItem,
  getReturnItems,
  getStockItems,
  StockItem,
  updateStockItem,
} from "../../lib/storage";

type StockWithReturns = StockItem & {
  totalReturned: number;
  paid?: boolean;
};

type PaymentFilter = "All" | "Paid" | "Credit";

export default function StockItemsScreen() {
  const [items, setItems] = useState<StockWithReturns[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockWithReturns[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>("All");

  const router = useRouter();
  const colorScheme = useColorScheme();

  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const cardColor = colorScheme === "dark" ? "#1e1e1e" : "#fff";
  const inputBg = colorScheme === "dark" ? "#1c1c1c" : "#fff";

  const filterOptions: PaymentFilter[] = ["All", "Paid", "Credit"];

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const loadItems = async () => {
    try {
      const allStock = await getStockItems();
      const allReturns = await getReturnItems();

      const stockWithReturns: StockWithReturns[] = allStock.map((s) => {
        const totalReturned = allReturns
          .filter((r) => r.stockItemId === s.id)
          .reduce((sum, r) => sum + Number(r.quantity || 0), 0);

        return {
          ...s,
          totalReturned,
          paid: s.paid ?? true,
        };
      });

      setItems(stockWithReturns);
      applyFilters(stockWithReturns, searchQuery, activeFilter);
    } catch (error) {
      Alert.alert("Error", "Failed to load stock items.");
    }
  };

  const applyFilters = (
    baseItems: StockWithReturns[],
    query: string,
    filter: PaymentFilter
  ) => {
    const lower = query.toLowerCase();

    let filtered = baseItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        String(item.supplierName || "").toLowerCase().includes(lower)
    );

    if (filter === "Paid") {
      filtered = filtered.filter((item) => item.paid === true);
    }

    if (filter === "Credit") {
      filtered = filtered.filter((item) => item.paid === false);
    }

    setFilteredItems(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(items, text, activeFilter);
  };

  const handleFilterPress = (filter: PaymentFilter) => {
    setActiveFilter(filter);
    applyFilters(items, searchQuery, filter);
  };

  const handleEdit = (id: string) => {
    router.push(`/screens/stock/${id}`);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Stock", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteStockItem(id);
          const updated = items.filter((i) => i.id !== id);
          setItems(updated);
          applyFilters(updated, searchQuery, activeFilter);
        },
      },
    ]);
  };

  const handleTogglePaid = async (item: StockWithReturns) => {
    Alert.alert(
      "Update Payment Status",
      item.paid
        ? "Mark this stock item as Credit?"
        : "Mark this stock item as Paid?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            await updateStockItem(item.id, {
              quantity: item.quantity,
              category: item.category,
              barcode: item.barcode || "",
              unit: item.unit || "pcs",
              costPrice: item.costPrice,
              lowStockAlert: item.lowStockAlert || 0,
              idealStockLevel: item.idealStockLevel || 0,
              supplierName: item.supplierName || "",
              paid: !item.paid,
            });

            await loadItems();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: StockWithReturns }) => {
    const isPaid = item.paid ?? true;

    return (
      <TouchableOpacity
        onPress={() => handleEdit(item.id)}
        activeOpacity={0.9}
        style={styles.cardShadow}
      >
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: textColor }]}>
                {item.name}
              </Text>

              <TouchableOpacity
                onPress={() => handleTogglePaid(item)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.paymentBadge,
                    { backgroundColor: isPaid ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {isPaid ? "Paid" : "Credit"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: "#d9534f", fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              📦 Category:
            </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>
              {item.category || "N/A"}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              📊 Quantity:
            </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>
              {item.quantity} {item.unit || "units"}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              🏷️ Supplier:
            </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>
              {item.supplierName || "N/A"}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              ↩️ Returns:
            </Text>
            <Text
              style={[
                styles.cardValue,
                { color: item.totalReturned > 0 ? "#E67E22" : textColor },
              ]}
            >
              {item.totalReturned}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.actionsWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/screens/stock/add")}
        >
          <LinearGradient
            colors={["#1c4f1f", "#47a04b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addStockButton}
          >
            <Text style={styles.addStockText}>+ Add Stock</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={[styles.stockToolsRow, styles.actionsWrapper]}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{ flex: 1 }}
          onPress={() => router.push("/screens/ReorderListScreen")}
        >
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toolGradientButton}
          >
            <Text style={styles.toolIcon}>⚠️</Text>
            <Text style={styles.toolGradientText}>Low Stock</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={{ flex: 1 }}
          onPress={() => router.push("/screens/StockTakeSessionScreen")}
        >
          <LinearGradient
            colors={["#0f766e", "#14b8a6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toolGradientButton}
          >
            <Text style={styles.toolIcon}>📦</Text>
            <Text style={styles.toolGradientText}>Stock Count</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by name, category or supplier..."
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          value={searchQuery}
          onChangeText={handleSearch}
          style={[
            styles.searchInput,
            { color: textColor, backgroundColor: inputBg },
          ]}
        />

        <View style={styles.filterRow}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterPress(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: textColor,
                marginTop: 30,
                fontSize: 16,
              }}
            >
              No matching stock items found.
            </Text>
          }
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 15,
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
  },

  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 8,
  },

  card: {
    borderRadius: 10,
    padding: 15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  paymentBadge: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },

  cardLabel: {
    fontSize: 15,
    fontWeight: "600",
    width: 110,
  },

  cardValue: {
    fontSize: 15,
    flex: 1,
  },

  actionsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  addStockButton: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  addStockText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  stockToolsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  toolIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  toolGradientButton: {
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  toolGradientText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  searchInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  filterRow: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeFilterButton: {
    backgroundColor: "#2563eb",
  },

  filterText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#666",
    textTransform: "uppercase",
  },

  activeFilterText: {
    color: "#fff",
  },
});