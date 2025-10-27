// import React, { useState, useCallback } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   StyleSheet,
//   SafeAreaView,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useFocusEffect } from '@react-navigation/native';
// import { getReturnItems, deleteReturnItem } from '@/lib/storage';
// import ScreenWrapper from '@/components/ScreenWrapper';

// export type ReturnItem = {
//   id: string;
//   name: string;
//   quantity: number;
//   reason: string;
//   date: string;
// };

// const ReturnListScreen: React.FC = () => {
//   const [returns, setReturns] = useState<ReturnItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const loadReturns = async () => {
//     try {
//       setLoading(true);
//       const data = await getReturnItems();
//       setReturns(data);
//     } catch (err) {
//       console.error('❌ Error loading returns:', err);
//       Alert.alert('Error', 'Failed to load returns.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔄 Refresh when screen is focused
//   useFocusEffect(
//     useCallback(() => {
//       loadReturns();
//     }, [])
//   );

//   // 🗑️ Delete handler
//   const handleDelete = (id: string) => {
//     Alert.alert('Confirm Delete', 'Are you sure you want to delete this return?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             await deleteReturnItem(id);
//             setReturns((prev) => prev.filter((r) => r.id !== id));
//             Alert.alert('Deleted', 'Return record deleted successfully.');
//           } catch (err) {
//             console.error('❌ Error deleting return:', err);
//             Alert.alert('Error', 'Failed to delete return.');
//           }
//         },
//       },
//     ]);
//   };

//   const handleEdit = (id: string) => {
//     router.push(`../screens/returns/${id}`);
//   };

//   const renderItem = ({ item }: { item: any }) => (
//       <TouchableOpacity onPress={() => handleEdit(item.id)}>
//         <View style={styles.row}>
//           <Text style={styles.datecell}>
//             {(() => {
//               const d = new Date(item.date);
//               const day = String(d.getDate()).padStart(2, '0');
//               const month = String(d.getMonth() + 1).padStart(2, '0');
//               const year = String(d.getFullYear()).slice(-2);
//               return `${day}/${month}/${year}`;
//             })()}
//           </Text>
//           <Text style={styles.cell}>{item.quantity}</Text>
//         </View>
//       </TouchableOpacity>
//     );

//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={styles.container}>
//         <TouchableOpacity
//           style={styles.recordButton}
//           onPress={() => router.push('../../screens/returns/record')}
//         >
//           <Text style={styles.recordButtonText}>+ Add Return</Text>
//         </TouchableOpacity>

        
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
//         </View>

//         <FlatList
//           data={returns}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id}
//           ListEmptyComponent={<Text style={styles.noData}>No return has recorded yet.</Text>}
//           contentContainerStyle={{ paddingBottom: 80 }}
//         />
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10 },
//   searchInput: {
//     height: 40,
//     marginTop: 70,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//     borderRadius: 8,
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
//     flex: 0.9,
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

// // export default ReturnListScreen;

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getReturnItems } from '@/lib/storage';
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

// // export type ReturnItem = {
// //   id: string;
// //   name: string;
// //   quantity: number;
// //   reason: string;
// //   date: string;
// // };


// export default function ReturnListScreen() {
//   const [items, setItems] = useState<[]>([]);
//   const router = useRouter();
 

//   /**
//    * 🔄 Load Stock Items from Appwrite
//    */
//   useFocusEffect(
//     useCallback(() => {
//       const loadItems = async () => {
//         try {
//           const allItems = await getReturnItems();
//           setItems(allItems);
//         } catch (error) {
//           Alert.alert("Error", "Failed to load return items.");
//         }
//       };
//       loadItems();
//     }, [])
//   );

//   /**
//    * ❌ Handle Delete
//    */
// //   const handleDelete = async (id: string) => {
// //   const returnItem = items.find((i) => i.id === id);
// //   if (!returnItem) return;

// //   Alert.alert(
// //     "Delete Return",
// //     `Do you want to restore ${returnItem.quantity} items back to stock when deleting this return?`,
// //     [
// //       { text: "Cancel", style: "cancel" },
// //       {
// //         text: "Delete Only",
// //         style: "destructive",
// //         onPress: async () => {
// //           await deleteReturnItem(id);
// //           setItems((prev) => prev.filter((i) => i.id !== id));
// //           Alert.alert("Deleted", "Return deleted (stock unchanged).");
// //         },
// //       },
// //       {
// //         text: "Delete & Restore",
// //         style: "destructive",
// //         onPress: async () => {
// //           try {
// //             // Restore stock if linked
// //             if (returnItem.stockItemId) {
// //               const stock = await getStockItem(returnItem.stockItemId);
// //               if (stock) {
// //                 const newQty = stock.quantity + returnItem.quantity;
// //                 await updateStockQuantity(returnItem.stockItemId, newQty);
// //               }
// //             }

// //             await deleteReturnItem(id);
// //             setItems((prev) => prev.filter((i) => i.id !== id));
// //             Alert.alert("Deleted", "Return deleted and stock restored.");
// //           } catch (err) {
// //             console.error("❌ Error restoring stock:", err);
// //             Alert.alert("Error", "Failed to restore stock.");
// //           }
// //         },
// //       },
// //     ]
// //   );
// // };
//   /**
//    * 🔄 Render Header Row
//    */
//   const renderHeader = () => (
//     <View style={[styles.row, styles.header]}>
//       <Text style={[styles.cell, styles.headerCell, { flex: .2 }]}></Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Date</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 2.5 }]}>Item</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Qty.</Text>
//       <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]} />
//     </View>
//   );
//   // const sortItems = (field: typeof sortField) => {
//   //   let newOrder = sortOrder;

//   //   if (field === sortField) {
//   //     newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
//   //     setSortOrder(newOrder);
//   //   } else {
//   //     setSortField(field);
//   //     newOrder = 'asc';
//   //     setSortOrder('asc');
//   //   }
//   // };

//   /**
//    * 🔄 Render Each Stock Item
//    */
//     const handleEdit = (id: string) => {
//       router.push(`../screens/returns/${id}`);
//     };
    
//     const renderItem = ({ item }: { item: any }) => (
//       <TouchableOpacity onPress={() => handleEdit(item.id)}>
//         <View style={styles.row}>
//           <Text style={[styles.cell, { flex: .2 }]}></Text>  
//           <Text style={styles.cell, { flex: 1.5 }}>
//                 {(() => {
//                   const d = new Date(item.date);
//                   const day = String(d.getDate()).padStart(2, '0');
//                   const month = String(d.getMonth() + 1).padStart(2, '0');
//                   const year = String(d.getFullYear()).slice(-2);
//                   return `${day}/${month}/${year}`;
//                 })()}
//           </Text>
//           <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
//           <Text style={[styles.cell, { flex: 1 }]}>{item.quantity}</Text>     
//         </View>
//       </TouchableOpacity>
//     );

//   /**
//    * ✅ Render Main Content
//    */
//   return (
//     <ScreenWrapper>
//       <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
//         <TouchableOpacity style={styles.addButton} onPress={() => router.push('../screens/returns/record')}>
//           <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Returns</Text>
//         </TouchableOpacity>
//       </View>
      
//       <FlatList
//         data={items}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={<Text>No return items available</Text>}
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
import { getReturnItems, ReturnItem } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function ReturnListScreen() {
  const [items, setItems] = useState<ReturnItem[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
  const cardColor = colorScheme === "dark" ? "#1e1e1e" : "#fff";

  // 🔄 Load Return Items
  useFocusEffect(
    useCallback(() => {
      const loadItems = async () => {
        try {
          const allItems = await getReturnItems();
          setItems(allItems);
        } catch (error) {
          Alert.alert("Error", "Failed to load return items.");
        }
      };
      loadItems();
    }, [])
  );

  // 🧭 Navigate to Edit
  const handleEdit = (id: string) => {
    router.push(`/screens/returns/${id}`);
  };

  // 📦 Render Each Return Card
  const renderItem = ({ item }: { item: ReturnItem }) => {
    const dateObj = new Date(item.date);
    const dateStr = `${dateObj.getDate().toString().padStart(2, "0")}/${(
      dateObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${dateObj.getFullYear().toString().slice(-2)}`;

    return (
      <TouchableOpacity
        onPress={() => handleEdit(item.id)}
        activeOpacity={0.9}
        style={styles.cardShadow}
      >
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>📅</Text>
            <Text style={[styles.cardText, { color: textColor }]}>{dateStr}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>📦</Text>
            <Text
              style={[
                styles.cardText,
                { color: textColor, fontWeight: "600", fontSize: 16 },
              ]}
            >
              {item.name}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>🔢</Text>
            <Text style={[styles.cardText, { color: textColor }]}>
              Quantity: {item.quantity}
            </Text>
          </View>

          {item.reason ? (
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: textColor }]}>💬</Text>
              <Text style={[styles.cardText, { color: textColor }]}>
                {item.reason}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
      
      {/* ✅ Gradient Header */}
      <TouchableOpacity
        onPress={() => router.push("/screens/returns/record")} > 
        <LinearGradient
          colors={["#135c16ff", "#2E7D32"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          <Text style={styles.headerTitle}>+ Add Returns</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={[styles.container]}>
        {/* ✅ List of Returns */}
        <FlatList
          data={items}
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
              No return items available.
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
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  container: {
    flex: 1,
    paddingTop: 10,
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
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  cardLabel: {
    width: 25,
    fontSize: 16,
  },
  cardText: {
    fontSize: 15,
    flexShrink: 1,
  },
  addButtonWrapper: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 30,
    overflow: "hidden",
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
