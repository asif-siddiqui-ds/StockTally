// export default SaleList;

// import ScreenWrapper from "@/components/ScreenWrapper";
// import { ThemedText } from "@/components/ThemedText";
// import { getSaleItems } from "@/lib/storage";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useFocusEffect, useRouter } from "expo-router";
// import * as React from "react";
// import {
//   FlatList,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from "react-native";
// import { Divider, Menu, PaperProvider } from "react-native-paper";

// const SaleListScreen = () => {
//   const [saleItems, setSaleItems] = React.useState<any[]>([]);
//   const [filteredItems, setFilteredItems] = React.useState<any[]>([]);
//   const [searchTerm, setSearchTerm] = React.useState("");
//   const [filterPaid, setFilterPaid] = React.useState<"all" | "paid" | "notPaid">("all");
//   const [sortField, setSortField] = React.useState<"date" | "name" | "quantity" | "price">("date");
//   const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
//   const [menuVisible, setMenuVisible] = React.useState(false);

//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const textColor = colorScheme === "dark" ? "#fff" : "#000";
//   const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
//   const cardBg = colorScheme === "dark" ? "#1e1e1e" : "#fff";
//   const borderColor = colorScheme === "dark" ? "#333" : "#ddd";

//   // 🧭 Fetch sales on focus
//   useFocusEffect(
//     React.useCallback(() => {
//       const fetchSales = async () => {
//         try {
//           const items = await getSaleItems();
//           setSaleItems(items);
//         } catch (e) {
//           console.error("❌ Fetch error:", e);
//         }
//       };
//       fetchSales();
//     }, [])
//   );

//   // 🔁 Filter + sort automatically
//   React.useEffect(() => {
//     let data = [...saleItems];

//     // search
//     if (searchTerm.trim()) {
//       const q = searchTerm.toLowerCase();
//       data = data.filter(
//         (it) =>
//           it.name.toLowerCase().includes(q) ||
//           it.buyerName.toLowerCase().includes(q)
//       );
//     }

//     // filter
//     if (filterPaid !== "all") {
//       data = data.filter((it) => (filterPaid === "paid" ? it.paid : !it.paid));
//     }

//     // sort
//     data.sort((a, b) => {
//       let aVal: any = a[sortField];
//       let bVal: any = b[sortField];
//       if (sortField === "date") {
//         aVal = new Date(aVal).getTime();
//         bVal = new Date(bVal).getTime();
//       }
//       if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
//       if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
//       return 0;
//     });

//     setFilteredItems(data);
//   }, [saleItems, searchTerm, filterPaid, sortField, sortOrder]);

//   // Handlers
//   const handleSearch = (t: string) => setSearchTerm(t);
//   const handleFilter = (s: "all" | "paid" | "notPaid") => setFilterPaid(s);

//   const handleSort = (field: typeof sortField) => {
//     setMenuVisible(false);
//     if (field === sortField) {
//       setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
//     } else {
//       setSortField(field);
//       setSortOrder("asc");
//     }
//   };

//   const handleEdit = (id: string) => router.push(`../screens/sales/${id}`);

//   // Card layout
//   const renderItem = ({ item }: { item: any }) => (
//     <TouchableOpacity onPress={() => handleEdit(item.id)} activeOpacity={0.9}>
//       <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
//         <View style={styles.cardTopRow}>
//           <Text style={[styles.dateText, { color: textColor }]}>
//             {(() => {
//               const d = new Date(item.date);
//               return `${String(d.getDate()).padStart(2, "0")}/${String(
//                 d.getMonth() + 1
//               ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
//             })()}
//           </Text>
//           <View
//             style={[
//               styles.statusBadge,
//               item.paid ? styles.paidBadge : styles.unpaidBadge,
//             ]}
//           >
//             <Text style={styles.statusText}>
//               {item.paid ? "Paid" : "Not Paid"}
//             </Text>
//           </View>
//         </View>
//         <View style={styles.cardBottomRow}>
//           <Text style={[styles.itemText, { color: textColor }]} numberOfLines={1}>
//             {item.name}
//           </Text>
//           <Text style={[styles.qtyText, { color: textColor }]}>
//             Qty: {item.quantity}
//           </Text>
//           <Text style={[styles.priceText, { color: textColor }]}>
//             £{item.price.toFixed(2)}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <PaperProvider>
//       <ScreenWrapper>
//         <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
        
//         <SafeAreaView style={[styles.container]}>
//           {/* Gradient header */}
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => router.push("../../screens/sales/record")}
//           >
//             <LinearGradient
//               colors={["#093e0bff", "#2E7D32"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.headerContainer}
//             >
//               <Text style={styles.headerTitle}>+ Record Sale</Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Search */}
//           <TextInput
//             style={[
//               styles.searchInput,
//               { color: textColor, borderColor, backgroundColor: cardBg },
//             ]}
//             placeholder="Search by Item or Buyer"
//             placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
//             value={searchTerm}
//             onChangeText={handleSearch}
//           />

//           {/* Paid Filter */}
//           <View style={styles.filterContainer}>
//             {["all", "paid", "notPaid"].map((s) => (
//               <TouchableOpacity
//                 key={s}
//                 style={[
//                   styles.filterButton,
//                   filterPaid === s && styles.activeFilter,
//                 ]}
//                 onPress={() => handleFilter(s as any)}
//               >
//                 <Text style={styles.filterText}>
//                   {s === "all" ? "All" : s === "paid" ? "Paid" : "Not Paid"}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Sort bar with icon */}
//           <LinearGradient
//             colors={["#4CAF50", "#2E7D32"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.sortBar}
//           >
//             <Menu
//               visible={menuVisible}
//               onDismiss={() => setMenuVisible(false)}
//               anchor={
//                 <TouchableOpacity
//                   onPress={() => setMenuVisible(true)}
//                   style={styles.menuAnchor}
//                 >
//                   <MaterialCommunityIcons name="sort" size={26} color="#fff" />
//                 </TouchableOpacity>
//               }
//               contentStyle={{ backgroundColor: "#2E7D32" }}
//             >
//               <Menu.Item
//                 title="Date"
//                 titleStyle={styles.menuItemText}
//                 onPress={() => handleSort("date")}
//               />
//               <Divider />
//               <Menu.Item
//                 title="Item"
//                 titleStyle={styles.menuItemText}
//                 onPress={() => handleSort("name")}
//               />
//               <Divider />
//               <Menu.Item
//                 title="Quantity"
//                 titleStyle={styles.menuItemText}
//                 onPress={() => handleSort("quantity")}
//               />
//               <Divider />
//               <Menu.Item
//                 title="Price"
//                 titleStyle={styles.menuItemText}
//                 onPress={() => handleSort("price")}
//               />
//             </Menu>

//             <Text style={styles.sortText}>
//               {sortField.charAt(0).toUpperCase() + sortField.slice(1)}{" "}
//               ({sortOrder === "asc" ? "↑" : "↓"})
//             </Text>
//           </LinearGradient>

//           {/* List */}
//           <FlatList
//             data={filteredItems}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id}
//             ListEmptyComponent={
//               <ThemedText style={styles.noData}>No sales recorded.</ThemedText>
//             }
//             contentContainerStyle={{ paddingBottom: 80 }}
//           />
//         </SafeAreaView>
//         </LinearGradient>
//       </ScreenWrapper>
//     </PaperProvider>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   container: { flex: 1 },
//   headerContainer: {
//     paddingVertical: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//   },
//   headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
//   searchInput: {
//     height: 45,
//     margin: 15,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     fontSize: 16,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: 10,
//     marginBottom: 10,
//   },
//   filterButton: {
//     flex: 1,
//     marginHorizontal: 5,
//     paddingVertical: 8,
//     backgroundColor: "#8bc34a",
//     borderRadius: 6,
//   },
//   activeFilter: { backgroundColor: "#2E7D32" },
//   filterText: {
//     textAlign: "center",
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   sortBar: {
//     marginHorizontal: 10,
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   menuAnchor: {
//     padding: 5,
//   },
//   menuItemText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   sortText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   card: {
//     borderWidth: 1,
//     borderRadius: 12,
//     marginHorizontal: 10,
//     marginVertical: 6,
//     padding: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTopRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   dateText: { fontSize: 14, fontWeight: "500" },
//   statusBadge: {
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//   },
//   paidBadge: { backgroundColor: "#4CAF50" },
//   unpaidBadge: { backgroundColor: "#FF6347" },
//   statusText: { color: "#fff", fontSize: 13, fontWeight: "600" },
//   cardBottomRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   itemText: { flex: 2.5, fontSize: 15, fontWeight: "600" },
//   qtyText: { flex: 1, fontSize: 14, textAlign: "center" },
//   priceText: {
//     flex: 1.2,
//     fontSize: 15,
//     textAlign: "right",
//     fontWeight: "600",
//   },
//   noData: {
//     textAlign: "center",
//     marginVertical: 20,
//     fontSize: 16,
//     color: "#777",
//   },
// });

// export default SaleListScreen;

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getSaleItems } from '@/lib/storage';
// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   useColorScheme
// } from 'react-native';

// const SaleList = () => {
//   const [groupedSales, setGroupedSales] = useState<any[]>([]);
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const textColor = isDark ? '#fff' : '#333';

//   // 🧩 Group sales by buyer + date
//   const groupSales = (sales: any[]) => {
//     const groups: Record<string, any> = {};

//     sales.forEach((sale) => {
//       const dateKey = new Date(sale.date).toLocaleDateString();
//       const key = `${sale.buyerName}_${dateKey}`;

//       if (!groups[key]) {
//         groups[key] = {
//           buyerName: sale.buyerName,
//           date: dateKey,
//           paid: sale.paid,
//           items: [],
//         };
//       }
//       groups[key].items.push({
//         name: sale.name,
//         quantity: sale.quantity,
//         price: sale.price,
//       });
//     });

//     // calculate total per sale group
//     return Object.values(groups).map((sale: any) => ({
//       ...sale,
//       total: sale.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
//     }));
//   };

//   useEffect(() => {
//     const loadSales = async () => {
//       const sales = await getSaleItems();
//       const grouped = groupSales(sales);
//       setGroupedSales(grouped);
//     };
//     loadSales();
//   }, []);

//   return (
//     <ScreenWrapper>
//       <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
//         <SafeAreaView style={{ flex: 1 }}>
//           <ScrollView contentContainerStyle={styles.scrollContainer}>
//             <Text style={[styles.title, { color: textColor }]}>Recorded Sales</Text>

//             {groupedSales.length === 0 ? (
//               <Text style={{ color: textColor, textAlign: 'center', marginTop: 40 }}>
//                 No sales recorded yet.
//               </Text>
//             ) : (
//               groupedSales.map((sale, idx) => (
//                 <View key={idx} style={styles.card}>
//                   <View style={styles.cardHeader}>
//                     <Text style={styles.buyerName}>{sale.buyerName}</Text>
//                     <Text
//                       style={[
//                         styles.badge,
//                         { backgroundColor: sale.paid ? '#4CAF50' : '#F44336' },
//                       ]}
//                     >
//                       {sale.paid ? 'Paid' : 'Unpaid'}
//                     </Text>
//                   </View>

//                   <Text style={styles.dateText}>{sale.date}</Text>

//                   {/* 🧾 List all items */}
//                   {sale.items.map((item: any, i: number) => (
//                     <View key={i} style={styles.itemRow}>
//                       <Text style={[styles.itemText, { flex: 2 }]}>{item.name}</Text>
//                       <Text style={[styles.itemText, { flex: 1 }]}>
//                         {item.quantity} × £{item.price.toFixed(2)}
//                       </Text>
//                       <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>
//                         £{(item.quantity * item.price).toFixed(2)}
//                       </Text>
//                     </View>
//                   ))}

//                   {/* 💰 Total */}
//                   <View style={styles.totalRow}>
//                     <Text style={styles.totalLabel}>Total</Text>
//                     <Text style={styles.totalValue}>£{sale.total.toFixed(2)}</Text>
//                   </View>
//                 </View>
//               ))
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   scrollContainer: { padding: 20 },
//   title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
//   card: {
//     backgroundColor: 'rgba(255,255,255,0.25)',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   buyerName: { fontSize: 20, fontWeight: '700', color: '#fff' },
//   badge: {
//     color: '#fff',
//     fontWeight: '700',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#ddd',
//     marginTop: 4,
//     marginBottom: 10,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 4,
//   },
//   itemText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   totalRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//     paddingTop: 6,
//   },
//   totalLabel: { fontSize: 18, fontWeight: '700', color: '#fff' },
//   totalValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
// });

// export default SaleList;
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getSaleItems, saveAllSales, saveSaleItem } from '@/lib/storage';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useColorScheme,
// } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown';
// import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';


// const SaleList = () => {
//   const [allSales, setAllSales] = useState<any[]>([]);
//   const [filteredSales, setFilteredSales] = useState<any[]>([]);
//   const [filterValue, setFilterValue] = useState('All');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [searchQuery, setSearchQuery] = useState('');
//   const router = useRouter();

//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const textColor = isDark ? '#fff' : '#333';

//   // 🧩 Group sales by buyer + date
//   const groupSales = (sales: any[]) => {
//     const groups: Record<string, any> = {};
//     sales.forEach((sale) => {
//       const fullDate = new Date(sale.date);
//       const formattedDate = fullDate.toLocaleDateString();
//       const key = `${sale.buyerName}_${formattedDate}_${sale.paid}`;

//       if (!groups[key]) {
//         groups[key] = {
//           buyerName: sale.buyerName,
//           date: formattedDate,
//           paid: sale.paid,
//           timestamp: fullDate.getTime(),
//           items: [],
//         };
//       }
//       groups[key].items.push({
//         name: sale.name,
//         quantity: sale.quantity,
//         price: sale.price,
//       });
//     });

//     // ✅ total amount + total quantity of all items
//     return Object.values(groups).map((sale: any) => ({
//       ...sale,
//       total: sale.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
//       totalItems: sale.items.reduce((sum: number, i: any) => sum + i.quantity, 0), // ✅ total quantity
//     }));
//   };

//   const loadSales = async () => {
//     const sales = await getSaleItems();
//     const grouped = groupSales(sales);
//     setAllSales(grouped);
//     setFilteredSales(sortSales(grouped, sortOrder));
//   };

//   useEffect(() => {
//     loadSales();
//   }, []);

//   // 🔍 Search
//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     const q = query.toLowerCase();
//     const filtered = allSales.filter(
//       (s) =>
//         s.buyerName.toLowerCase().includes(q) ||
//         s.date.toLowerCase().includes(q)
//     );
//     setFilteredSales(sortSales(filtered, sortOrder));
//   };

//   // ⚙️ Filter Paid/Unpaid
//   const handleFilter = (value: string) => {
//     setFilterValue(value);
//     let filtered = allSales;
//     if (value === 'Paid') filtered = allSales.filter((s) => s.paid);
//     else if (value === 'Unpaid') filtered = allSales.filter((s) => !s.paid);
//     setFilteredSales(sortSales(filtered, sortOrder));
//   };

//   // 🔁 Sort by Date
//   const sortSales = (sales: any[], order: 'asc' | 'desc') => {
//     return [...sales].sort((a, b) =>
//       order === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
//     );
//   };

//   const handleSortChange = (order: 'asc' | 'desc') => {
//     setSortOrder(order);
//     setFilteredSales(sortSales(filteredSales, order));
//   };

//   // 📄 View Sale
//   const handleViewSale = (sale: any) => {
//     router.push({
//       pathname: '/screens/sales/viewSaleScreen',
//       params: {
//         buyerName: sale.buyerName,
//         date: sale.date,
//         paid: sale.paid,
//         total: sale.total,
//       },
//     });
//   };

//   // 🗑️ Delete Entire Sale
//   const handleDeleteSale = async (sale: any) => {
//     try {
//       const all = await getSaleItems();
//       const filtered = all.filter(
//         (i) =>
//           !(
//             i.buyerName === sale.buyerName &&
//             new Date(i.date).toLocaleDateString() === sale.date
//           )
//       );
//       await saveAllSales(filtered);
//       setFilteredSales((prev) =>
//         prev.filter(
//           (s) =>
//             !(
//               s.buyerName === sale.buyerName &&
//               s.date === sale.date
//             )
//         )
//       );
//       Alert.alert('Deleted', 'Sale has been removed.');
//     } catch (err) {
//       console.error('❌ Error deleting sale:', err);
//       Alert.alert('Error', 'Could not delete this sale.');
//     }
//   };

//   // 👆 Swipe-to-delete right action
//   const renderRightActions = (progress: any, dragX: any, sale: any) => {
//     const scale = dragX.interpolate({
//       inputRange: [-100, 0],
//       outputRange: [1, 0.8],
//       extrapolate: 'clamp',
//     });
//     return (
//       <Animated.View
//         style={[
//           styles.deleteActionContainer,
//           { transform: [{ scale }] },
//         ]}
//       >
//         <TouchableOpacity
//           style={styles.deleteActionButton}
//           onPress={() =>
//             Alert.alert(
//               'Delete Sale',
//               `Are you sure you want to delete this sale for ${sale.buyerName}?`,
//               [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                   text: 'Delete',
//                   style: 'destructive',
//                   onPress: () => handleDeleteSale(sale),
//                 },
//               ]
//             )
//           }
//         >
//           <Text style={styles.deleteActionText}>🗑️ Delete</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   };


//   return (
//     <ScreenWrapper>
//       <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
//         <SafeAreaView style={{ flex: 1 }}>
//           {/* 🧭 Header */}
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => router.push("../../screens/sales/record")}
//           >
//             <LinearGradient
//               colors={["#093e0bff", "#2E7D32"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.HeaderButton}
//             >
//             <Text style={styles.headerTitle}>+ Record Sale</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//           <View style={styles.headerContainer}>
//             {/* 1️⃣ Add Sale Button */}
             
//             {/* 2️⃣ Search Bar */}
//             <View style={styles.middleRow}>
//               <TextInput
//                 placeholder="Search by buyer or date"
//                 placeholderTextColor="#bbb"
//                 style={styles.searchInput}
//                 value={searchQuery}
//                 onChangeText={handleSearch}
//               />
//             </View>

//             {/* 3️⃣ Filters */}
//             <View style={styles.bottomRow}>
//               <View style={styles.dropdownWrapper}>
//                 <Dropdown
//                   style={styles.dropdown}
//                   placeholder="Paid / Unpaid"
//                   placeholderStyle={styles.dropdownPlaceholder}
//                   data={[
//                     { label: 'All', value: 'All' },
//                     { label: 'Paid', value: 'Paid' },
//                     { label: 'Unpaid', value: 'Unpaid' },
//                   ]}
//                   labelField="label"
//                   valueField="value"
//                   value={filterValue}
//                   onChange={(item) => handleFilter(item.value)}
//                   renderRightIcon={() => <Text style={styles.arrow}>⬇️</Text>}
//                 />
//               </View>

//               <View style={styles.dropdownWrapper}>
//                 <Dropdown
//                   style={styles.dropdown}
//                   placeholder="Sort"
//                   placeholderStyle={styles.dropdownPlaceholder}
//                   data={[
//                     { label: 'Newest', value: 'desc' },
//                     { label: 'Oldest', value: 'asc' },
//                   ]}
//                   labelField="label"
//                   valueField="value"
//                   value={sortOrder}
//                   onChange={(item) => handleSortChange(item.value)}
//                   renderRightIcon={() => <Text style={styles.arrow}>⬇️</Text>}
//                 />
//               </View>
//             </View>
//           </View>
//           {/* 📋 Sales List */}
//           <ScrollView contentContainerStyle={styles.scrollContainer}>
//             {filteredSales.length === 0 ? (
//               <Text style={{ color: textColor, textAlign: 'center', marginTop: 40 }}>
//                 No sales found.
//               </Text>
//             ) : (
//               filteredSales.map((sale, idx) => (
//                 <Swipeable
//                   key={idx}
//                   renderRightActions={(progress, dragX) =>
//                     renderRightActions(progress, dragX, sale)
//                   }
//                   overshootRight={false}
//                 >
//                   <TouchableOpacity
//                     style={styles.card}
//                     activeOpacity={0.8}
//                     onPress={() => handleViewSale(sale)}
//                   >
//                     <View style={styles.cardTop}>
//                       <Text style={styles.buyerName}>{sale.buyerName}</Text>
//                       <Text
//                         style={[
//                           styles.badge,
//                           {
//                             backgroundColor: sale.paid
//                               ? '#4CAF50'
//                               : '#F44336',
//                           },
//                         ]}
//                       >
//                         {sale.paid ? 'Paid' : 'Unpaid'}
//                       </Text>
//                     </View>

//                     <View style={styles.cardBottom}>
//                       <Text style={styles.date}>{sale.date}</Text>
//                       <Text style={styles.itemCount}>
//                         {sale.totalItems} items
//                       </Text>
//                       <Text style={styles.total}>
//                         £{sale.total.toFixed(2)}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 </Swipeable>
//               ))
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   scrollContainer: { padding: 20 },
//   card: {
//     backgroundColor: '#45556e', // ✅ darker grey for modern contrast
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },
//   cardTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   buyerName: { fontSize: 20, fontWeight: '700', color: '#fff' },
//   badge: {
//     color: '#fff',
//     fontWeight: '700',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 10,
//   },
//   cardBottom: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 6,
//   },
//   date: { color: '#ddd', fontSize: 14, flex: 1 },
//   itemCount: {
//     color: '#fff',
//     fontSize: 14,
//     textAlign: 'center',
//     flex: 1,
//     fontWeight: '600',
//   },
//   total: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//     flex: 1,
//     textAlign: 'right',
//     minWidth: 70,
//   },
//   headerContainer: {
//     padding: 12,
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderBottomWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//     backdropFilter: 'blur(10px)', // looks great on web/ios
//   },
//   HeaderButton: {
//     paddingVertical: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//   },
//   topRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginBottom: 10,
//   },
//   addButton: {
//     backgroundColor: '#2ecc71',
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 15,
//   },
//   middleRow: {
//     marginBottom: 10,
//   },
//   searchInput: {
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.3)',
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     color: '#fff',
//     height: 42,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//   },
//   bottomRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 10,
//   },
//   dropdownWrapper: {
//     flex: 1,
//     borderRadius: 20,
//     overflow: 'hidden',
//     backgroundColor: 'rgba(240, 233, 233, 0.93)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.25)',
//   },
//   dropdown: {
//     height: 42,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     color: '#fff',
//   },
//   dropdownPlaceholder: {
//     color: '#f1f1f1',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   arrow: {
//     fontSize: 12,
//     color: '#fff',
//     marginRight: 4,
//   },
//   headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

// });

// export default SaleList;

import ScreenWrapper from '@/components/ScreenWrapper';
import {
  getSaleItems,
  getStockItem,
  saveAllSales,
  updateStockQuantity
} from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  SlideInRight,
  SlideOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/* ────────────────────────────────
   🧱 SWIPEABLE SALE CARD COMPONENT
────────────────────────────────── */
const SaleCard = ({ sale, onView, onDelete, onToggle }: any) => {
  const translateX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (translateX.value < -100) {
        runOnJS(onDelete)(sale);
      } else if (translateX.value > 100) {
        runOnJS(onToggle)(sale);
      }
      translateX.value = withTiming(0);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={[styles.cardContainer, animatedStyle]}
      >
        <View style={styles.swipeBackground}>
          <View style={styles.bgLeft}>
            <Text style={styles.bgText}>
              {sale.paid ? 'Mark Unpaid' : 'Mark Paid'}
            </Text>
          </View>
          <View style={styles.bgRight}>
            <Text style={styles.bgText}>🗑️ Delete</Text>
          </View>
        </View>

        {/* Foreground Card */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => onView(sale)}
        >
          <View style={styles.cardTop}>
            <Text style={styles.buyerName}>{sale.buyerName}</Text>
            <Text
              style={[
                styles.badge,
                { backgroundColor: sale.paid ? '#4CAF50' : '#F44336' },
              ]}
            >
              {sale.paid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.date}>{new Date(sale.date).toLocaleDateString('en-GB')}</Text>
            <Text style={styles.itemCount}>{sale.totalItems} items</Text>
            <Text style={styles.total}>£{sale.total.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

/* ────────────────────────────────
   🧭 MAIN SALE LIST SCREEN
────────────────────────────────── */
const SaleList = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [filterValue, setFilterValue] = useState('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#fff' : '#333';



// 📥 Load + Group Sales
const loadSales = async () => {
  const sales = await getSaleItems();

  if (!sales || sales.length === 0) {
    setAllSales([]);
    setFilteredSales([]);
    return;
  }

  const grouped = groupSales(sales);
  const sorted = sortSales(grouped, sortOrder);
  setAllSales(sorted);
  setFilteredSales(sorted);
};

// 🧩 Group sales by buyer + date
const groupSales = (sales: any[]) => {
  const groups: Record<string, any> = {};

  sales.forEach((sale) => {
    // ✅ Parse ISO date safely
    let parsedDate = new Date(sale.date);
    if (isNaN(parsedDate.getTime())) {
      // fallback if somehow not valid
      parsedDate = new Date();
    }
    const formattedDate = parsedDate.toDateString(); // for display
    const timestamp = parsedDate.getTime();
    const key = `${sale.buyerName}_${formattedDate}_${sale.paid}`;

    if (!groups[key]) {
      groups[key] = {
        buyerName: sale.buyerName,
        date: formattedDate, // displayed version
        paid: sale.paid,
        timestamp,
        items: [],
      };
    }

    groups[key].items.push({
      name: sale.name,
      quantity: sale.quantity,
      price: sale.price,
    });
  });

  return Object.values(groups).map((group: any) => ({
    ...group,
    total: group.items.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    ),
    totalItems: group.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
  }));
};

  // 🔁 Sort by Date
  const sortSales = (sales: any[], order: 'asc' | 'desc') =>
    [...sales].sort((a, b) =>
      order === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );
  const handleSortChange = (order: 'asc' | 'desc') => { 
    setSortOrder(order);
    const reSorted = sortSales(filteredSales.length ? filteredSales : allSales, order);
    setFilteredSales(reSorted);
  };
// const handleSortChange = (order: 'asc' | 'desc') => { 
//   setSortOrder(order); setFilteredSales(sortSales(filteredSales, order)); 
// };

    // 🧭 Reload when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [sortOrder])
  );

  // 🔍 Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const q = query.toLowerCase();
    const filtered = allSales.filter(
      (s) =>
        s.buyerName.toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q)
    );
    setFilteredSales(sortSales(filtered, sortOrder));
  };

  // ⚙️ Filter Paid/Unpaid
  const handleFilter = (value: string) => {
    setFilterValue(value);
    let filtered = allSales;
    if (value === 'Paid') filtered = allSales.filter((s) => s.paid);
    else if (value === 'Unpaid') filtered = allSales.filter((s) => !s.paid);
    setFilteredSales(sortSales(filtered, sortOrder));
  };




  // ➕ Add Sale
  const handleAddRecord = () => router.push('/screens/sales/record');

  // 📄 View Sale
  const handleViewSale = (sale: any) => {
    router.push({
      pathname: '/screens/sales/viewSaleScreen',
      params: {
        buyerName: sale.buyerName,
        date: sale.date,
        paid: sale.paid,
        total: sale.total,
      },
    });
  };

  // 🗑️ Delete Sale
  const handleDeleteSale = async (sale: any) => {
    try {
      const allSales = await getSaleItems();

      // Find all items that belong to this sale (same buyer & date)
      const matchedSales = allSales.filter(
        (i) => i.buyerName === sale.buyerName && new Date(i.date).toDateString() === new Date(sale.date).toDateString()
      );

      if (matchedSales.length === 0) {
        Alert.alert("Not Found", "No sale items found to delete.");
        return;
      }

      console.log(`🧾 Found ${matchedSales.length} item(s) in this sale.`);

      // Restore stock
      const groupedByItem: Record<string, number> = {};
      for (const item of matchedSales) {
        groupedByItem[item.stockItemId] =
          (groupedByItem[item.stockItemId] || 0) + item.quantity;
      }

      for (const [stockItemId, totalSoldQty] of Object.entries(groupedByItem)) {
        try {
          const stockItem = await getStockItem(stockItemId);
          if (stockItem) {
            const newStockQty = stockItem.quantity + totalSoldQty;
            await updateStockQuantity(stockItemId, newStockQty);
          }
        } catch (err) {
          console.error(`Error restoring stock for ${stockItemId}:`, err);
        }
      }

      // Remove from storage
      const updatedSales = allSales.filter(
        (i) => !(i.buyerName === sale.buyerName && new Date(i.date).toDateString() === new Date(sale.date).toDateString())
      );
      await saveAllSales(updatedSales);

      // Update UI
      setFilteredSales((prev) =>
        prev.filter(
          (s) => !(s.buyerName === sale.buyerName && new Date(s.date).toDateString() === new Date(sale.date).toDateString())
        )
      );

      Alert.alert("Deleted", "Sale and all related items removed, stock restored.");
    } catch (err) {
      console.error("❌ Error deleting sale:", err);
      Alert.alert("Error", "Could not delete this sale.");
    }
  };

  // Confirm Delete
  const confirmDelete = (sale: any) => {
    Alert.alert(
      'Delete Sale',
      `Are you sure you want to delete this sale for ${sale.buyerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteSale(sale) },
      ]
    );
  };

  return (
    <GestureHandlerRootView>
      <ScreenWrapper>
        <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleAddRecord}>
              <LinearGradient
                colors={['#093e0bff', '#2E7D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.HeaderButton}
              >
                <Text style={styles.headerTitle}>+ Record Sale</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Search + Filters */}
            <View style={styles.headerContainer}>
              <TextInput
                placeholder="Search by buyer or date"
                placeholderTextColor="#bbb"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
              />

              <View style={styles.bottomRow}>
                <View style={styles.dropdownWrapper}>
                  <Dropdown
                    style={styles.dropdown}
                    placeholder="Paid / Unpaid"
                    placeholderStyle={styles.dropdownPlaceholder}
                    data={[
                      { label: 'All', value: 'All' },
                      { label: 'Paid', value: 'Paid' },
                      { label: 'Unpaid', value: 'Unpaid' },
                    ]}
                    labelField="label"
                    valueField="value"
                    value={filterValue}
                    onChange={(item) => handleFilter(item.value)}
                  />
                </View>

                <View style={styles.dropdownWrapper}>
                  <Dropdown
                    style={styles.dropdown}
                    placeholder="Sort"
                    placeholderStyle={styles.dropdownPlaceholder}
                    data={[
                      { label: 'Newest', value: 'desc' },
                      { label: 'Oldest', value: 'asc' },
                    ]}
                    labelField="label"
                    valueField="value"
                    value={sortOrder}
                    onChange={(item) => handleSortChange(item.value)}
                  />
                </View>
              </View>
            </View>

            {/* Sale Cards */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {filteredSales.length === 0 ? (
                <Text style={{ color: textColor, textAlign: 'center', marginTop: 40 }}>
                  No sales found.
                </Text>
              ) : (
                filteredSales.map((sale, idx) => (
                  <SaleCard
                    key={idx}
                    sale={sale}
                    onView={handleViewSale}
                    onDelete={confirmDelete}
                    // onToggle={handleTogglePaid}
                  />
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
};

/* ────────────────────────────────
   💅 STYLES
────────────────────────────────── */
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { padding: 20 },
  cardContainer: { position: 'relative', marginBottom: 20 },
  swipeBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
  },
  bgLeft: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: 'center',
    paddingLeft: 25,
  },
  bgRight: {
    flex: 1,
    backgroundColor: '#E53935',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 25,
  },
  bgText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#45556e', borderRadius: 16, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  buyerName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  badge: {
    color: '#fff',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  date: { color: '#ddd', fontSize: 14, flex: 1 },
  itemCount: { color: '#fff', fontSize: 14, flex: 1, textAlign: 'center', fontWeight: '600' },
  total: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'right' },
  headerContainer: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  HeaderButton: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    color: '#fff',
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 10,
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  dropdownWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(240,233,233,0.93)',
  },
  dropdown: { height: 42, paddingHorizontal: 12, borderRadius: 20 },
  dropdownPlaceholder: { color: '#333', fontWeight: '600', fontSize: 14 },
});

export default SaleList;
