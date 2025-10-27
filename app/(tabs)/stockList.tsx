// import { Entypo } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
// import { StockItem, deleteStockItem, getStockItems } from '../../../lib/storage';
// import ScreenWrapper from '../../../components/ScreenWrapper';

// export default function StockIndex() {
//   const [items, setItems] = useState<StockItem[]>([]);
//   const router = useRouter();

//   // Load Stock Items from storage when the screen is focused
//   useFocusEffect(
//     useCallback(() => {
//       const loadItems = async () => {
//         try {
//           const data = await getStockItems();
//           setItems(data);
//         } catch (error) {
//           console.error('Error loading stock items:', error);
//         }
//       };
//       loadItems();
//     }, [])
//   );

//   // Handle item removal
// //   const handleRemove = async (id: string) => {
// //     try {
// //       const updatedItems = items.filter(item => item.id !== id);
      
// //       // If saveStockItems expects an array, it should work as is
// //     //   await saveStockItems(updatedItems);
  
// //       // If saveStockItems expects a single item, you need to loop
// //       // Uncomment the code below if it is for individual items
      
// //       for (const item of updatedItems) {
// //         await saveStockItems(item);
// //       }
      
// //       setItems(updatedItems);
// //       Alert.alert("Item Deleted Successfully");
// //     } catch (error) {
// //       console.error('Failed to delete item:', error);
// //       Alert.alert("Failed to Delete Item");
// //     }
// //   };

//   const handleRemove = async (id: string) => {
//     Alert.alert(
//       "Delete Confirmation",
//       "Are you sure you want to delete this sale item?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             const deletedItem = items.find((item) => item.id === id);
            
//             await deleteStockItem(id);
//             setItems(items.filter((item) => item.id !== id));
//           }
//         },
//       ]
//     );
//   };
  

//   // Render header for the list
//   const renderHeader = () => (
//     <View style={[styles.row, styles.header]}>
//       <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Category</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Item</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Qty.</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1 }]} />
//     </View>
//   );

//   // Render each item in the list
//   const renderItem = ({ item }: { item: StockItem }) => (
//     <View style={styles.row}>
//       <Text style={[styles.cell, { flex: 1 }]}>{item.category}</Text>
//       <Text style={[styles.cell, { flex: 1 }]}>{item.name}</Text>
//       <Text style={[styles.cell, { flex: 0.5 }]}>{item.quantity}</Text>

//       <View style={{ flex: 0.5, alignItems: 'center' }}>
//         <MenuProvider>
//           <Menu>
//             <MenuTrigger>
//               <Entypo name="dots-three-vertical" size={20} color="gray" />
//             </MenuTrigger>
//             <MenuOptions
//               customStyles={{
//                 optionsContainer: {
//                   padding: 8,
//                   borderRadius: 8,
//                   backgroundColor: '#fff',
//                   shadowColor: '#000',
//                   shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.25,
//                   shadowRadius: 4,
//                   elevation: 5,
//                   zIndex: 9999,
//                 },
//                 optionWrapper: {
//                   paddingVertical: 10,
//                   paddingHorizontal: 12,
//                 },
//                 optionText: {
//                   fontSize: 16,
//                 },
//               }}
//             >
//               <MenuOption onSelect={() => router.push(`../screens/stock/${item.id}`)}>
//                 <Text>Edit</Text>
//               </MenuOption>
//               <MenuOption onSelect={() => handleRemove(item.id)}>
//                 <Text style={{ color: 'red' }}>Delete</Text>
//               </MenuOption>
//             </MenuOptions>
//           </Menu>
//         </MenuProvider>
//       </View>
//     </View>
//   );

//   // Main render
//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Stock Items</Text>
//       {renderHeader()}
//       <FlatList
//         data={items}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       />
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => router.push('./add')}
//       >
//         <Text style={styles.addButtonText}>+ Add Stock</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     alignItems: 'center',
//   },
//   cell: {
//     fontSize: 16,
//     paddingHorizontal: 4,
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
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// import { Entypo } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//   Alert,
//   FlatList,
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
// import ScreenWrapper from '../../components/ScreenWrapper';
// import {
//   StockItem,
//   deleteStockItem,
//   getStockItems
// } from '../../lib/storage';

// export default function StockItemsScreen() {
//   const [items, setItems] = useState<StockItem[]>([]);
//   const router = useRouter();

//   /**
//    * 🔄 Load Stock Items from Appwrite
//    */
//   useFocusEffect(
//     useCallback(() => {
//       const loadItems = async () => {
//         try {
//           const allItems = await getStockItems();
//           setItems(allItems);
//         } catch (error) {
//           Alert.alert("Error", "Failed to load stock items.");
//         }
//       };
//       loadItems();
//     }, [])
//   );

//   /**
//    * ❌ Handle Delete
//    */
//   const handleDelete = async (id: string) => {
//     Alert.alert(
//       "Delete Confirmation",
//       "Are you sure you want to delete this stock item?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             await deleteStockItem(id);
//             setItems(items.filter((item) => item.id !== id));
//           },
//         },
//       ]
//     );
//   };

//   /**
//    * 🔄 Render Header Row
//    */
//   const renderHeader = () => (
//     <View style={[styles.row, styles.header]}>
//       <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Category</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Item</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Qty.</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]} />
//     </View>
//   );

//   /**
//    * 🔄 Render Each Stock Item
//    */
//   const renderItem = ({ item }: { item: StockItem }) => (
//     <View style={styles.row}>
//       <Text style={[styles.cell, { flex: 2 }]}>{item.category}</Text>
//       <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
//       <Text style={[styles.cell, { flex: 1 }]}>{item.quantity}</Text>

//       <View style={[styles.cell, { flex: 0.5, alignItems: 'center' }]}>
     
//           <Menu>
//             <MenuTrigger>
//               <Entypo name="dots-three-vertical" size={20} color="gray" />
//             </MenuTrigger>
//             <MenuOptions
//               customStyles={{
//                 optionsContainer: {
//                   padding: 8,
//                   borderRadius: 8,
//                   backgroundColor: '#fff',
//                   shadowColor: '#000',
//                   shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.25,
//                   shadowRadius: 4,
//                   elevation: 5,
//                 },
//                 optionWrapper: {
//                   paddingVertical: 10,
//                   paddingHorizontal: 12,
//                 },
//                 optionText: {
//                   fontSize: 16,
//                 },
//               }}
//             >
//               <MenuOption onSelect={() => router.push(`../screens/stock/${item.id}`)}>
//                 <Text>Edit</Text>
//               </MenuOption>
//               <MenuOption onSelect={() => handleDelete(item.id)}>
//                 <Text style={{ color: 'red' }}>Delete</Text>
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
//       <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
//         <TouchableOpacity style={styles.addButton} onPress={() => router.push('../screens/stock/add')}>
//           <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Stock</Text>
//         </TouchableOpacity>
//       </View>
      
//       <FlatList
//         data={items}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={<Text>No stock items available</Text>}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       />
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
//   // addButton: {
//   //   backgroundColor: '#007bff',
//   //   paddingVertical: 12,
//   //   paddingHorizontal: 20,
//   //   borderRadius: 6,
//   //   alignItems: 'center',
//   //   marginTop: 16,
//   // },
//   addButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   addButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 30,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     alignSelf: 'flex-end',
//    margin: 10,
//   }
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
} from "../../lib/storage";

type StockWithReturns = StockItem & { totalReturned: number };

export default function StockItemsScreen() {
  const [items, setItems] = useState<StockWithReturns[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockWithReturns[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
  const cardColor = colorScheme === "dark" ? "#1e1e1e" : "#fff";
  const inputBg = colorScheme === "dark" ? "#1c1c1c" : "#fff";

  // 🔄 Load Stock + Returns
  useFocusEffect(
    useCallback(() => {
      const loadItems = async () => {
        try {
          const allStock = await getStockItems();
          const allReturns = await getReturnItems();

          const stockWithReturns: StockWithReturns[] = allStock.map((s) => {
            const totalReturned = allReturns
              .filter((r) => r.stockItemId === s.id)
              .reduce((sum, r) => sum + r.quantity, 0);
            return { ...s, totalReturned };
          });

          setItems(stockWithReturns);
          setFilteredItems(stockWithReturns);
        } catch (error) {
          Alert.alert("Error", "Failed to load stock items.");
        }
      };
      loadItems();
    }, [])
  );

  // 🔍 Filter by Name or Category
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredItems(items);
      return;
    }

    const lower = text.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
    setFilteredItems(filtered);
  };

  // 🧭 Navigate to Edit Screen
  const handleEdit = (id: string) => {
    router.push(`/screens/stock/${id}`);
  };

  // 🗑️ Delete Item
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
          setFilteredItems(updated);
        },
      },
    ]);
  };

  // ✅ Render Each Stock Card
  const renderItem = ({ item }: { item: StockWithReturns }) => (
    <TouchableOpacity
      onPress={() => handleEdit(item.id)}
      activeOpacity={0.9}
      style={styles.cardShadow}
    >
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={{ color: "#d9534f", fontWeight: "700" }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, { color: textColor }]}>📦 Category:</Text>
          <Text style={[styles.cardValue, { color: textColor }]}>
            {item.category || "N/A"}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, { color: textColor }]}>📊 Quantity:</Text>
          <Text style={[styles.cardValue, { color: textColor }]}>{item.quantity}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, { color: textColor }]}>↩️ Returns:</Text>
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

  return (
    
    <ScreenWrapper>
      <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
      {/* ✅ Gradient Header → Add Stock Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push("/screens/stock/add")}
      >
        <LinearGradient
          colors={["#1c4f1fff", "#479d4bff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          <Text style={styles.headerTitle}>+ Add Stock</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 🔍 Search Bar */}
      <View style={[styles.searchContainer]}>
        <TextInput
          placeholder="Search by name or category..."
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          value={searchQuery}
          onChangeText={handleSearch}
          style={[
            styles.searchInput,
            { color: textColor, backgroundColor: inputBg },
          ]}
        />
      </View>

      {/* ✅ Stock List */}
      <View style={[styles.container]}>
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
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 15 }}
        />
      </View>
      </LinearGradient>
    </ScreenWrapper>
    
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  headerContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  container: {
    flex: 1,
    paddingTop: 5,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
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
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
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
  },
});

