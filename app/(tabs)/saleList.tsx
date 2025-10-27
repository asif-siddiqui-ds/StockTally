// import { Entypo } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import { AppwriteException } from 'appwrite';
// import * as FileSystem from 'expo-file-system';
// import * as IntentLauncher from 'expo-intent-launcher';
// import * as Print from 'expo-print';
// import { useRouter } from 'expo-router';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   Alert,
//   FlatList,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import {
//   Menu,
//   MenuOption,
//   MenuOptions,
//   MenuTrigger
// } from 'react-native-popup-menu';
// import { account } from '../../appwrite';
// import ScreenWrapper from '../../components/ScreenWrapper';
// import {
//   SaleItem,
//   deleteSaleItem,
//   getSaleItems,
//   getStockItems,
//   updateStockItem
// } from '../../lib/storage';

// export default function SaleItemsScreen() {
//   const [items, setItems] = useState<SaleItem[]>([]);
//   const router = useRouter();

//   /**
//    * 🔐 Check User Session
//    */
//   const checkSession = async () => {
//     try {
//       const user = await account.get();
//       console.log("User is logged in:", user);
//     } catch (error) {
//       console.log("User is not logged in. Redirecting to login.");
//       router.push('../(auth)/LoginScreen');
//     }
//   };

//   useEffect(() => {
//     checkSession();
//   }, []);

//   /**
//    * 🔄 Load Items from Appwrite
//    */
//   useFocusEffect(
//     useCallback(() => {
//       const loadItems = async () => {
//         try {
//           const allItems = await getSaleItems();
//           setItems(allItems);
//         } catch (error) {
//           if (error instanceof AppwriteException && error.code === 401) {
//             Alert.alert("Session Expired", "Please log in again.");
//             router.push('/screens/LoginScreen');
//           }
//         }
//       };
//       loadItems();
//     }, [])
//   );

//   /**
//    * ❌ Handle Delete and Stock Update
//    */
//   const handleDelete = async (id: string) => {
//     Alert.alert(
//       "Delete Confirmation",
//       "Are you sure you want to delete this sale item?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             const deletedItem = items.find((item) => item.id === id);
//             if (deletedItem) {
//               const stockItems = await getStockItems();
//               const stockIndex = stockItems.findIndex(
//                 (s) => s.name === deletedItem.name
//               );

//               if (stockIndex !== -1) {
//                 stockItems[stockIndex].quantity += deletedItem.quantity;
//                 await updateStockItem(stockItems[stockIndex]);
//               }
//               await deleteSaleItem(id);
//               setItems(items.filter((item) => item.id !== id));
//             }
//           },
//         },
//       ]
//     );
//   };

//   /**
//    * 📄 Handle Print and Save as PDF
//    */
//   const handlePrint = async (item: SaleItem) => {
//     try {
//       const html = `
//       <html>
//         <body>
//           <h1>Sale Invoice</h1>
//           <p><strong>Buyer Name:</strong> ${item.buyerName}</p>
//           <p><strong>Item Name:</strong> ${item.name}</p>
//           <p><strong>Quantity:</strong> ${item.quantity}</p>
//           <p><strong>Price:</strong> £${item.price}</p>
//           <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
//         </body>
//       </html>
//       `;

//       const { uri } = await Print.printToFileAsync({ html });

//       const fileUri = `${FileSystem.documentDirectory}SaleInvoice_${item.id}.pdf`;
//       await FileSystem.moveAsync({
//         from: uri,
//         to: fileUri,
//       });

//       if (Platform.OS === 'android') {
//         await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
//           data: fileUri,
//           flags: 1,
//         });
//       } else {
//         Alert.alert('Sharing not supported on iOS for this method');
//       }
//     } catch (error) {
//       Alert.alert("Failed to Print", (error as Error).message);
//     }
//   };

//   /**
//    * 🔄 Render Header Row
//    */
//   const renderHeader = () => (
//     <View style={[styles.row, styles.header]}>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Item</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Qty.</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Buyer</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Price</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 0.3 }]} />
//     </View>
//   );

//   /**
//    * 🔄 Render Each Sale Item
//    */
//   const renderItem = ({ item }: { item: SaleItem }) => (
//     <View style={styles.row}>
//       <Text style={[styles.cell, { flex: 1.5 }]}>{item.name}</Text>
//       <Text style={[styles.cell, { flex: 1 }]}>{item.quantity}</Text>
//       <Text style={[styles.cell, { flex: 1.5 }]}>{item.buyerName}</Text>
//       <Text style={[styles.cell, { flex: 1 }]}>£{item.price}</Text>
//       <View style={[styles.badge, item.paid ? styles.paid : styles.notPaid]}>
//         <Text style={styles.badgeText}>{item.paid ? "Paid" : "Not Paid"}</Text>
//       </View>

//       <View style={[styles.cell, { flex: 0.5, alignItems: 'center' }]}>
   
//           <Menu>
//             <MenuTrigger>
//               <Entypo name="dots-three-vertical" size={20} color="gray" />
//             </MenuTrigger>
//             <MenuOptions
//               customStyles={{
//               optionsContainer: {
//                 padding: 8,
//                 borderRadius: 8,
//                 backgroundColor: '#fff',
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.25,
//                 shadowRadius: 4,
//                 elevation: 5,
//               },
//               optionWrapper: {
//                 paddingVertical: 10,
//                 paddingHorizontal: 12,
//               },
//               optionText: {
//                 fontSize: 16,
//               },
//               }}
//             >                                       
//               <MenuOption onSelect={() => router.push(`../screens/sales/${item.id}`)}>
//                 <Text>Edit</Text>
//               </MenuOption>
//               <MenuOption onSelect={() => handleDelete(item.id)}>
//                 <Text style={{ color: 'red' }}>Delete</Text>
//               </MenuOption>
//               <MenuOption onSelect={() => handlePrint(item)}>
//                 <Text style={{ color: 'blue' }}>Print</Text>
//               </MenuOption>
//             </MenuOptions>
//           </Menu>
    
//       </View>
//     </View>
//   );

//   /**
//    * ✅ Render Main Content
//    */
//   return (
//     <ScreenWrapper>
//       <FlatList
//         data={items}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={<Text>No sale items available</Text>}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       />
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => router.push('../screens/sales/record')}
//       >
//         <Text style={styles.addButtonText}>+ Record Sale</Text>
//       </TouchableOpacity>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     alignItems: 'center',
//   },
//   cell: {
//     fontSize: 16,
//     paddingHorizontal: 2,
//     textAlign: 'left',
//   },
//   header: {
//     backgroundColor: '#f7f7f7',
//     borderBottomWidth: 2,
//     borderColor: '#ccc',
//     paddingVertical: 10,
//   },
//   headerCell: {
//     fontWeight: 'bold',
//   },
//   addButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//    badge: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 5,
//   },
//   paid: {
//     backgroundColor: '#4CAF50',
//   },
//   notPaid: {
//     backgroundColor: '#F44336',
//   },
//   badgeText: {
//     color: 'white',
//     fontSize: 14,
//   },
// });

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getSaleItems } from '@/lib/storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//   FlatList,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const SaleList = () => {
//   const [saleItems, setSaleItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'notPaid'>('all');
//   const router = useRouter();
//   const [sortField, setSortField] = useState<'date' | 'name' | 'quantity' | 'price' | 'paid' | null>(null);
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');



//   const fetchSales = async () => {
//     try {
//       const items = await getSaleItems();
//       console.log('🔄 Refetched Sale Items:', items);
//       setSaleItems(items);
//       setFilteredItems(items);
//     } catch (error) {
//       console.error('❌ Error fetching sales:', error);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchSales();
//     }, [])
//   );
//   // useEffect(() => {
//   //   const fetchSales = async () => {
//   //     const items = await getSaleItems();
//   //     setSaleItems(items);
//   //     setFilteredItems(items);
//   //   };
//   //   fetchSales();
//   // }, []);

//   const handleSearch = (term: string) => {
//     setSearchTerm(term);
//     if (term.length > 0) {
//       const filtered = saleItems.filter(
//         (item) =>
//           item.name.toLowerCase().includes(term.toLowerCase()) ||
//           item.buyerName.toLowerCase().includes(term.toLowerCase())
//       );
//       setFilteredItems(filtered);
//     } else {
//       setFilteredItems(saleItems);
//     }
//   };

//   const handleFilter = (status: 'all' | 'paid' | 'notPaid') => {
//     setFilterPaid(status);
//     if (status === 'all') {
//       setFilteredItems(saleItems);
//     } else {
//       const filtered = saleItems.filter(item => 
//         status === 'paid' ? item.paid : !item.paid
//       );
//       setFilteredItems(filtered);
//     }
//   };

//   const sortItems = (field: typeof sortField) => {
//   let newOrder = sortOrder;
//   if (field === sortField) {
//     newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
//     setSortOrder(newOrder);
//   } else {
//     setSortField(field);
//     newOrder = 'desc';
//     setSortOrder('desc');
//   }

//   const sorted = [...filteredItems].sort((a, b) => {
//     let aVal = a[field];
//     let bVal = b[field];

//     // Convert date to actual Date object for comparison
//     if (field === 'date') {
//       aVal = new Date(aVal);
//       bVal = new Date(bVal);
//     }

//     if (aVal < bVal) return newOrder === 'asc' ? -1 : 1;
//     if (aVal > bVal) return newOrder === 'asc' ? 1 : -1;
//     return 0;
//   });

//   setFilteredItems(sorted);
// };


//   const handleEdit = (id: string) => {
//     router.push(`../screens/sales/${id}`);
//   };

//   const renderItem = ({ item }: { item: any }) => (
//     <TouchableOpacity onPress={() => handleEdit(item.id)}>
//       <View style={styles.row}>
//         <Text style={styles.datecell}>
//           {(() => {
//               const d = new Date(item.date);
//               const day = String(d.getDate()).padStart(2, '0');
//               const month = String(d.getMonth() + 1).padStart(2, '0');
//               const year = String(d.getFullYear()).slice(-2);
//             return `${day}/${month}/${year}`;
//           })()}
//         </Text>
//         <Text style={styles.itemcell}>{item.name}</Text>
//         <Text style={styles.cell}>{item.quantity}</Text>
//         {/* <Text style={styles.cell}>{item.buyerName}</Text> */}
//         <Text style={styles.cell}>£{item.price.toFixed(2)}</Text>
//         <Text style={[styles.cell, item.paid ? styles.paid : styles.notPaid]}>
//           {item.paid ? 'Paid' : 'Not Paid'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={styles.container}>
//         <TouchableOpacity
//           style={styles.recordButton}
//           onPress={() => router.push('../../screens/sales/record')}
//         >
//           <Text style={styles.recordButtonText}>+ Record Sale</Text>
//         </TouchableOpacity>
//         {/* <Text style={styles.title}>📋 Sale List</Text> */}

//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search by Item or Buyer"
//           value={searchTerm}
//           onChangeText={handleSearch}
//         />

//         <View style={styles.filterContainer}>
//           <TouchableOpacity
//             style={[styles.filterButton, filterPaid === 'all' && styles.activeFilter]}
//             onPress={() => handleFilter('all')}
//           >
//             <Text style={styles.filterText}>All</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.filterButton, filterPaid === 'paid' && styles.activeFilter]}
//             onPress={() => handleFilter('paid')}
//           >
//             <Text style={styles.filterText}>Paid</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.filterButton, filterPaid === 'notPaid' && styles.activeFilter]}
//             onPress={() => handleFilter('notPaid')}
//           >
//             <Text style={styles.filterText}>Not Paid</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.header}>
//           <TouchableOpacity style={styles.dateheaderCell} onPress={() => sortItems('date')}>
//             <Text style={styles.headerText}>Date</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.itemheaderCell} onPress={() => sortItems('name')}>
//             <Text style={styles.headerText}>Item</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerCell} onPress={() => sortItems('quantity')}>
//             <Text style={styles.headerText}>Qty.</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerCell} onPress={() => sortItems('price')}>
//             <Text style={styles.headerText}>Price</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerCell} onPress={() => sortItems('paid')}>
//             <Text style={styles.headerText}>Status</Text>
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={filteredItems}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id}
//           ListEmptyComponent={<Text style={styles.noData}>No sales recorded.</Text>}
//           contentContainerStyle={{ paddingBottom: 80 }}
//         />

        
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   title: {
//     marginTop: 20,
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//     textAlign: 'left',
//   },
//   searchInput: {
//     height: 40,
//     marginTop: 70,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//   },
//   filterContainer: {
//     marginTop: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   filterButton: {
//     flex: 1,
//     marginHorizontal: 5,
//     paddingVertical: 8,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 5,
//   },
//   activeFilter: {
//     backgroundColor: '#4CAF50',
//   },
//   filterText: {
//     textAlign: 'center',
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     backgroundColor: '#4CAF50',
//     paddingVertical: 10,
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   headerCell: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//     textAlign: 'center',
//   },
//   dateheaderCell: {
//     flex: .9,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//     textAlign: 'center',
//   },
//   itemheaderCell: {
//     flex: 1.5,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//     textAlign: 'left',
//   },
//   headerText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//     textAlign: 'center',
//   },
//   row: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 2,
//     borderRadius: 6,
//   },
//   cell: {
//     flex: 1,
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   itemcell: {
//     flex: 1,
//     fontSize: 14,
//     textAlign: 'left',
//   },
//   datecell: {
//     flex: 1.3,
//     fontSize: 14,
//     marginLeft: 10,
//     textAlign: 'left',
//   },
 
//   paid: {
//     backgroundColor: '#4CAF50',
//     color: '#ffffff',
//     paddingVertical: 4,
//     borderRadius: 4,
//     textAlign: 'center',
//   },
//   notPaid: {
//     backgroundColor: '#FF6347',
//     color: '#ffffff',
//     paddingVertical: 4,
//     borderRadius: 4,
//     textAlign: 'center',
//   },
//   noData: {
//     textAlign: 'center',
//     marginVertical: 20,
//     fontSize: 16,
//     color: '#777',
//   },
//   recordButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     backgroundColor: '#007BFF',
//     borderRadius: 30,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     elevation: 2,
//   },
//   recordButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//     fontWeight: '600',
//   },
// });

// export default SaleList;

import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import { getSaleItems } from "@/lib/storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Divider, Menu, PaperProvider } from "react-native-paper";

const SaleListScreen = () => {
  const [saleItems, setSaleItems] = React.useState<any[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterPaid, setFilterPaid] = React.useState<"all" | "paid" | "notPaid">("all");
  const [sortField, setSortField] = React.useState<"date" | "name" | "quantity" | "price">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [menuVisible, setMenuVisible] = React.useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
  const cardBg = colorScheme === "dark" ? "#1e1e1e" : "#fff";
  const borderColor = colorScheme === "dark" ? "#333" : "#ddd";

  // 🧭 Fetch sales on focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchSales = async () => {
        try {
          const items = await getSaleItems();
          setSaleItems(items);
        } catch (e) {
          console.error("❌ Fetch error:", e);
        }
      };
      fetchSales();
    }, [])
  );

  // 🔁 Filter + sort automatically
  React.useEffect(() => {
    let data = [...saleItems];

    // search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.buyerName.toLowerCase().includes(q)
      );
    }

    // filter
    if (filterPaid !== "all") {
      data = data.filter((it) => (filterPaid === "paid" ? it.paid : !it.paid));
    }

    // sort
    data.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      if (sortField === "date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredItems(data);
  }, [saleItems, searchTerm, filterPaid, sortField, sortOrder]);

  // Handlers
  const handleSearch = (t: string) => setSearchTerm(t);
  const handleFilter = (s: "all" | "paid" | "notPaid") => setFilterPaid(s);

  const handleSort = (field: typeof sortField) => {
    setMenuVisible(false);
    if (field === sortField) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEdit = (id: string) => router.push(`../screens/sales/${id}`);

  // Card layout
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleEdit(item.id)} activeOpacity={0.9}>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.dateText, { color: textColor }]}>
            {(() => {
              const d = new Date(item.date);
              return `${String(d.getDate()).padStart(2, "0")}/${String(
                d.getMonth() + 1
              ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
            })()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              item.paid ? styles.paidBadge : styles.unpaidBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {item.paid ? "Paid" : "Not Paid"}
            </Text>
          </View>
        </View>
        <View style={styles.cardBottomRow}>
          <Text style={[styles.itemText, { color: textColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.qtyText, { color: textColor }]}>
            Qty: {item.quantity}
          </Text>
          <Text style={[styles.priceText, { color: textColor }]}>
            £{item.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <ScreenWrapper>
        <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
        
        <SafeAreaView style={[styles.container]}>
          {/* Gradient header */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("../../screens/sales/record")}
          >
            <LinearGradient
              colors={["#093e0bff", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerContainer}
            >
              <Text style={styles.headerTitle}>+ Record Sale</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Search */}
          <TextInput
            style={[
              styles.searchInput,
              { color: textColor, borderColor, backgroundColor: cardBg },
            ]}
            placeholder="Search by Item or Buyer"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            value={searchTerm}
            onChangeText={handleSearch}
          />

          {/* Paid Filter */}
          <View style={styles.filterContainer}>
            {["all", "paid", "notPaid"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterButton,
                  filterPaid === s && styles.activeFilter,
                ]}
                onPress={() => handleFilter(s as any)}
              >
                <Text style={styles.filterText}>
                  {s === "all" ? "All" : s === "paid" ? "Paid" : "Not Paid"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort bar with icon */}
          <LinearGradient
            colors={["#4CAF50", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sortBar}
          >
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuAnchor}
                >
                  <MaterialCommunityIcons name="sort" size={26} color="#fff" />
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: "#2E7D32" }}
            >
              <Menu.Item
                title="Date"
                titleStyle={styles.menuItemText}
                onPress={() => handleSort("date")}
              />
              <Divider />
              <Menu.Item
                title="Item"
                titleStyle={styles.menuItemText}
                onPress={() => handleSort("name")}
              />
              <Divider />
              <Menu.Item
                title="Quantity"
                titleStyle={styles.menuItemText}
                onPress={() => handleSort("quantity")}
              />
              <Divider />
              <Menu.Item
                title="Price"
                titleStyle={styles.menuItemText}
                onPress={() => handleSort("price")}
              />
            </Menu>

            <Text style={styles.sortText}>
              {sortField.charAt(0).toUpperCase() + sortField.slice(1)}{" "}
              ({sortOrder === "asc" ? "↑" : "↓"})
            </Text>
          </LinearGradient>

          {/* List */}
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <ThemedText style={styles.noData}>No sales recorded.</ThemedText>
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </SafeAreaView>
        </LinearGradient>
      </ScreenWrapper>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  headerContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  searchInput: {
    height: 45,
    margin: 15,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: "#8bc34a",
    borderRadius: 6,
  },
  activeFilter: { backgroundColor: "#2E7D32" },
  filterText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  sortBar: {
    marginHorizontal: 10,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  menuAnchor: {
    padding: 5,
  },
  menuItemText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  sortText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dateText: { fontSize: 14, fontWeight: "500" },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  paidBadge: { backgroundColor: "#4CAF50" },
  unpaidBadge: { backgroundColor: "#FF6347" },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: { flex: 2.5, fontSize: 15, fontWeight: "600" },
  qtyText: { flex: 1, fontSize: 14, textAlign: "center" },
  priceText: {
    flex: 1.2,
    fontSize: 15,
    textAlign: "right",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
    color: "#777",
  },
});

export default SaleListScreen;
